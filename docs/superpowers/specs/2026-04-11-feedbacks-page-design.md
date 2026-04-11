# Feedbacks Page — Design Spec

**Date:** 2026-04-11  
**Status:** Approved

## Overview

Thêm trang `/feedbacks` vào navigation public của Hama Workshop. Trang này hiển thị ảnh thực tế của sản phẩm đã giao kèm quote từ khách hàng — dạng kết hợp showcase + testimonial. Admin quản lý nội dung và chọn layout preset qua `/admin/feedbacks`.

---

## Database

### Bảng mới: `feedbacks`

| Column | Type | Notes |
|--------|------|-------|
| `id` | int (PK, auto-increment) | |
| `customer_name` | text | Tên khách hàng |
| `quote` | text | Lời nhận xét ngắn |
| `image_url` | text | URL ảnh (upload lên R2/Supabase Storage) |
| `display_order` | int | Thứ tự hiển thị, default 0 |
| `is_active` | boolean | Bật/tắt hiển thị, default true |
| `created_at` | timestamp | Auto |

### Bảng mới: `site_settings`

Bảng key-value dùng chung cho cài đặt toàn site.

| Column | Type | Notes |
|--------|------|-------|
| `key` | text (PK) | Tên setting |
| `value` | text | Giá trị |

Seed data: `{ key: "feedbacks_layout", value: "grid" }`

---

## Route Structure

### Public
- **`/feedbacks`** — Server Component, fetch feedbacks + layout setting từ Supabase, render theo preset

### Admin
- **`/admin/feedbacks`** — Quản lý danh sách feedback + chọn layout preset

### Navigation
- Thêm `{ name: 'Feedbacks', href: '/feedbacks' }` vào `components/header.tsx` (trước "Liên hệ")
- Thêm link vào admin layout sidebar

---

## Admin UI (`/admin/feedbacks`)

### Section 1 — Layout Picker
- 3 button toggle: **Grid** | **Masonry** | **Slider**
- Mỗi button có icon minh họa layout nhỏ
- Khi chọn → auto-save vào `site_settings` (`feedbacks_layout`)

### Section 2 — Feedback Manager
- Danh sách feedback dạng card (giống `about-images-manager`)
- Mỗi card hiển thị: thumbnail ảnh + tên khách + quote + badge Active/Ẩn
- Nút "Thêm feedback" → form inline xuất hiện trên cùng
- Form fields: ảnh (upload file), tên khách, quote, thứ tự, bật/tắt
- Upload ảnh dùng cùng API pattern hiện tại (`/api/upload-*`)
- Drag-and-drop reorder dùng `@dnd-kit/sortable`
- Edit / Delete mỗi item

---

## Public UI (`/feedbacks`)

### Header
- Badge label + tiêu đề "Feedbacks" + mô tả ngắn (hardcoded)
- Style nhất quán với các trang khác (xem `about/page.tsx`)

### Layout Presets

**Grid** (default)
- 2 cột trên mobile, 3 cột trên desktop
- Card: ảnh trên, tên + quote dưới
- Bo góc, shadow nhẹ (pattern `tech-shadow` hiện tại)

**Masonry**
- CSS `columns` (không cần thư viện) — 2 cột mobile, 3 cột desktop
- Cards chiều cao tự nhiên theo tỉ lệ ảnh

**Slider**
- Dùng `components/ui/carousel.tsx` đã có sẵn (Radix/Embla)
- Mỗi slide: 1 card lớn, hiển thị ảnh + tên + quote
- Autoplay optional

### Lightbox
- Click ảnh bất kỳ → mở `Dialog` (Radix, đã có trong `components/ui/dialog.tsx`)
- Hiển thị ảnh lớn + tên khách + quote
- Close bằng X button hoặc click ngoài

---

## Dependencies

| Package | Dùng cho | Ghi chú |
|---------|----------|---------|
| `@dnd-kit/core` + `@dnd-kit/sortable` | Drag reorder trong admin | Cần install |
| `components/ui/carousel.tsx` | Slider layout | Đã có sẵn |
| `components/ui/dialog.tsx` | Lightbox | Đã có sẵn |

---

## Out of Scope

- Khách vãng lai tự submit feedback (chỉ admin đăng)
- Rating / số sao
- Filter hoặc search
- Pagination (hiển thị toàn bộ, dùng `is_active` để kiểm soát số lượng)
