# Cloudflare R2 Migration Design

**Date:** 2026-04-09  
**Status:** Approved  
**Goal:** Eliminate Supabase Cached Egress overuse (currently 395% of free quota) by migrating image storage to Cloudflare R2 (zero egress fees) and adding client-side image compression.

---

## Context

- Supabase Free Plan: 5 GB Cached Egress/month
- Current usage: 19.768 GB (395%) → services restricted
- Root causes:
  1. `images: { unoptimized: true }` — ảnh gốc served 1:1, không resize
  2. Không compress ảnh trước upload — ảnh có thể 3–5 MB/file
  3. `cacheControl: "3600"` — browser fetch lại mỗi giờ

---

## Approach

**Approach A — Migrate to Cloudflare R2 + Client-side Compression** (chosen)

- Dùng `@aws-sdk/client-s3` (R2 tương thích S3 API) thay Supabase Storage
- Compress ảnh bằng `browser-image-compression` trước khi upload
- Migration script chạy thủ công 1 lần: download Supabase → upload R2 → update DB
- Ảnh cũ trên Supabase giữ nguyên làm backup (không xóa)

---

## Architecture

### Upload Flow (new)

```
Admin chọn ảnh
  → browser-image-compression (max 800KB, 1200px, WebP)
  → lib/r2/storage.ts (AWS S3 SDK → Cloudflare R2)
  → URL: https://pub-xxx.r2.dev/product-images/xxx.webp
  → Lưu URL vào DB
```

### Migration Flow (chạy 1 lần, thủ công)

```
scripts/migrate-to-r2.ts
  → Đọc tất cả URLs từ DB (products.images + about_images.image_url)
  → Download từ Supabase CDN (fetch)
  → Upload lên R2 (giữ nguyên tên file)
  → Ghi ra scripts/migration-log.json (old URL → new URL)
  → Cập nhật URLs trong DB
  → In summary: bao nhiêu ảnh thành công / thất bại
```

### Serve Flow (sau migration)

```
Browser → R2 CDN (pub-xxx.r2.dev)
Cache-Control: public, max-age=31536000 (1 năm)
```

---

## Files Changed

| File | Action | Purpose |
|------|--------|---------|
| `lib/r2/storage.ts` | Create | R2 upload/delete (thay Supabase storage) |
| `lib/supabase/storage.ts` | Keep | Không xóa — dùng trong migration script |
| `components/admin/image-upload.tsx` | Modify | Thêm compression trước upload |
| `components/admin/single-image-upload.tsx` | Modify | Thêm compression trước upload |
| `app/api/upload-about-image/route.ts` | Modify | Dùng R2 thay Supabase storage |
| `next.config.mjs` | Modify | Bỏ `unoptimized: true`, thêm R2 + Supabase vào `remotePatterns` |
| `scripts/migrate-to-r2.ts` | Create | Migration script độc lập |

---

## Migration Script Detail

File: `scripts/migrate-to-r2.ts`  
Chạy: `npx ts-node scripts/migrate-to-r2.ts`

**Steps:**
1. Kết nối Supabase bằng `SUPABASE_SERVICE_ROLE_KEY`
2. Lấy tất cả image URLs:
   - `SELECT id, images FROM products`
   - `SELECT id, image_url FROM about_images`
3. Với mỗi URL:
   - Nếu đã có trong `migration-log.json` → skip (idempotent)
   - Download ảnh từ Supabase CDN via `fetch()`
   - Upload lên R2 với cùng tên file, `Cache-Control: public, max-age=31536000`
   - Ghi vào log
4. Cập nhật DB với URLs mới
5. In summary

**Safety:**
- Ảnh cũ trên Supabase không bị xóa
- Script idempotent — chạy lại an toàn nếu bị ngắt giữa chừng
- DB chỉ update sau khi toàn bộ upload hoàn tất

---

## Image Compression

**Library:** `browser-image-compression`

```
maxSizeMB: 0.8
maxWidthOrHeight: 1200
useWebWorker: true
fileType: "image/webp"
initialQuality: 0.85
```

**Applied in:**
- `components/admin/image-upload.tsx` — mỗi file trong upload loop
- `components/admin/single-image-upload.tsx` — file đơn
- About image: compress trong `single-image-upload.tsx` trước khi gửi lên API route

**Expected result:** JPEG 3MB → WebP ~200–400KB (~85% reduction)

---

## Environment Variables

### `.env.local` (app)

```env
R2_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=
NEXT_PUBLIC_R2_PUBLIC_URL=   # https://pub-xxx.r2.dev
```

### Migration script only

```env
SUPABASE_SERVICE_ROLE_KEY=   # Bypass RLS để update DB
```

---

## next.config.mjs Changes

Remove `unoptimized: true`. Add:

```js
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'pub-*.r2.dev' },
    { protocol: 'https', hostname: '*.supabase.co' }, // ảnh cũ chưa migrate
  ],
}
```

---

## Dependencies to Add

```bash
npm install @aws-sdk/client-s3 browser-image-compression
npm install -D ts-node @types/node   # for migration script
```

---

## Success Criteria

- [ ] Ảnh mới upload lên R2, URL dạng `pub-xxx.r2.dev`
- [ ] Ảnh được compress xuống < 1MB trước khi upload
- [ ] Migration script chạy thành công, tất cả URLs trong DB đổi sang R2
- [ ] Supabase Cached Egress tháng tới = ~0 GB
- [ ] Ảnh cũ vẫn còn trên Supabase Storage (backup)
