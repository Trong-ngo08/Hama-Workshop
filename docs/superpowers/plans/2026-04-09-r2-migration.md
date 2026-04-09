# Cloudflare R2 Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate image storage from Supabase to Cloudflare R2 with client-side compression to eliminate Supabase Cached Egress overuse (currently 395% of free quota).

**Architecture:** New uploads are compressed client-side then sent to Next.js API routes which upload to R2 using AWS S3 SDK. A separate migration script handles existing images — downloading from Supabase, uploading to R2, and updating DB URLs. Old Supabase images are kept as backup.

**Tech Stack:** `@aws-sdk/client-s3`, `browser-image-compression`, `tsx` (migration script runner), Cloudflare R2, Next.js API Routes

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/r2/storage.ts` | Create | R2 client, upload/delete/getUrl helpers |
| `app/api/upload-product-image/route.ts` | Create | Server-side product image upload to R2 |
| `app/api/upload-about-image/route.ts` | Modify | Switch from Supabase to R2 |
| `app/api/delete-image/route.ts` | Create | Server-side image deletion from R2 |
| `components/admin/image-upload.tsx` | Modify | Add compression, use API routes instead of Supabase client |
| `components/admin/single-image-upload.tsx` | Modify | Add compression, use API route |
| `next.config.mjs` | Modify | Remove `unoptimized: true`, add remotePatterns |
| `scripts/migrate-to-r2.ts` | Create | One-time migration script (run manually) |
| `.env.local` | Modify | Add R2 env vars |

---

### Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install runtime dependencies**

```bash
npm install @aws-sdk/client-s3 browser-image-compression
```

- [ ] **Step 2: Install dev dependency for migration script**

```bash
npm install -D tsx
```

- [ ] **Step 3: Verify installation**

```bash
npm list @aws-sdk/client-s3 browser-image-compression tsx
```

Expected: all three packages listed with version numbers.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add R2 and image compression dependencies"
```

---

### Task 2: Add R2 environment variables

**Files:**
- Modify: `.env.local`

- [ ] **Step 1: Add to `.env.local`**

Append these lines to `.env.local`:

```env
# Cloudflare R2
R2_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
R2_BUCKET_NAME=your_bucket_name
NEXT_PUBLIC_R2_PUBLIC_URL=https://pub-xxx.r2.dev

# Migration script only (Supabase service role bypasses RLS)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

How to get each value from Cloudflare Dashboard:
- `R2_ACCOUNT_ID` → top-right of any R2 page → "Account ID"
- `R2_ACCESS_KEY_ID` + `R2_SECRET_ACCESS_KEY` → R2 → "Manage R2 API Tokens" → Create Token (Object Read & Write for your bucket)
- `R2_BUCKET_NAME` → the bucket name you created in R2
- `NEXT_PUBLIC_R2_PUBLIC_URL` → R2 → your bucket → Settings → Public Access → enable it → copy the URL (format: `https://pub-xxx.r2.dev`)

How to get `SUPABASE_SERVICE_ROLE_KEY`:
- Supabase Dashboard → Project Settings → API → "service_role" key (secret, never expose to browser)

No commit — `.env.local` is gitignored.

---

### Task 3: Create `lib/r2/storage.ts`

**Files:**
- Create: `lib/r2/storage.ts`

- [ ] **Step 1: Create the file**

```typescript
import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"

const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

const BUCKET = process.env.R2_BUCKET_NAME!
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

export async function uploadToR2(
  body: Buffer | Uint8Array,
  key: string,
  contentType: string,
): Promise<string> {
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    }),
  )
  return `${PUBLIC_URL}/${key}`
}

export async function deleteFromR2(key: string): Promise<void> {
  await r2Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET,
      Key: key,
    }),
  )
}

export function getKeyFromR2Url(url: string): string {
  const base = PUBLIC_URL.endsWith("/") ? PUBLIC_URL : `${PUBLIC_URL}/`
  return url.replace(base, "")
}

export function isR2Url(url: string): boolean {
  return url.startsWith(PUBLIC_URL)
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/r2/storage.ts
git commit -m "feat: add Cloudflare R2 storage utility"
```

---

### Task 4: Create `/api/upload-product-image/route.ts`

**Files:**
- Create: `app/api/upload-product-image/route.ts`

- [ ] **Step 1: Create the file**

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = `product-images/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
    const buffer = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadToR2(buffer, fileName, file.type || "image/webp")

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/upload-product-image/route.ts
git commit -m "feat: add product image upload API route for R2"
```

---

### Task 5: Update `/api/upload-about-image/route.ts`

**Files:**
- Modify: `app/api/upload-about-image/route.ts`

- [ ] **Step 1: Replace file contents**

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = `about-images/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
    const buffer = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadToR2(buffer, fileName, file.type || "image/webp")

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/upload-about-image/route.ts
git commit -m "feat: migrate about image upload to R2"
```

---

### Task 6: Create `/api/delete-image/route.ts`

**Files:**
- Create: `app/api/delete-image/route.ts`

- [ ] **Step 1: Create the file**

```typescript
import { type NextRequest, NextResponse } from "next/server"
import { deleteFromR2, getKeyFromR2Url, isR2Url } from "@/lib/r2/storage"

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    if (!isR2Url(url)) {
      // Old Supabase URL — skip deletion (kept as backup on Supabase)
      return NextResponse.json({ ok: true })
    }

    const key = getKeyFromR2Url(url)
    await deleteFromR2(key)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/delete-image/route.ts
git commit -m "feat: add image delete API route for R2"
```

---

### Task 7: Update `components/admin/image-upload.tsx`

**Files:**
- Modify: `components/admin/image-upload.tsx`

- [ ] **Step 1: Replace the full file**

```typescript
"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, Star } from "lucide-react"
import Image from "next/image"
import imageCompression from "browser-image-compression"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  disabled?: boolean
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: "image/webp" as const,
  initialQuality: 0.85,
}

export function ImageUpload({ value = [], onChange, maxFiles = 5, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return

      setUploading(true)
      setUploadProgress(0)

      try {
        const uploadedUrls: string[] = []

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i]
          const compressed = await imageCompression(file, COMPRESSION_OPTIONS)

          const formData = new FormData()
          formData.append("file", compressed)

          const res = await fetch("/api/upload-product-image", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) throw new Error("Upload failed")

          const { publicUrl } = await res.json()
          uploadedUrls.push(publicUrl)
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        }

        const newUrls = [...value, ...uploadedUrls].slice(0, maxFiles)
        onChange(newUrls)
      } catch (error) {
        console.error("Upload error:", error)
        alert("Có lỗi xảy ra khi tải ảnh lên")
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [value, onChange, maxFiles, disabled],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: maxFiles - value.length,
    disabled: disabled || uploading,
  })

  const setAsMain = (urlToPromote: string) => {
    const newUrls = [urlToPromote, ...value.filter((url) => url !== urlToPromote)]
    onChange(newUrls)
  }

  const removeImage = async (urlToRemove: string) => {
    if (disabled) return

    try {
      await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToRemove }),
      })
      const newUrls = value.filter((url) => url !== urlToRemove)
      onChange(newUrls)
    } catch (error) {
      console.error("Delete error:", error)
      alert("Có lỗi xảy ra khi xóa ảnh")
    }
  }

  return (
    <div className="space-y-4">
      {value.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                ${disabled || uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  {isDragActive ? (
                    <p>Thả ảnh vào đây...</p>
                  ) : (
                    <div>
                      <p className="font-medium">Kéo thả ảnh hoặc click để chọn</p>
                      <p className="text-muted-foreground">
                        Hỗ trợ: JPG, PNG, WebP (tối đa {maxFiles - value.length} ảnh)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Đang tải lên...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <Card key={url} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {!disabled && (
                    <>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                        onClick={() => removeImage(url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          title="Đặt làm ảnh chính"
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                          onClick={() => setAsMain(url)}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                    </>
                  )}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Ảnh chính
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {value.length === 0 && !uploading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có ảnh nào được tải lên</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/image-upload.tsx
git commit -m "feat: add compression and R2 upload to ImageUpload component"
```

---

### Task 8: Update `components/admin/single-image-upload.tsx`

**Files:**
- Modify: `components/admin/single-image-upload.tsx`

- [ ] **Step 1: Replace the full file**

```typescript
"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import imageCompression from "browser-image-compression"

interface SingleImageUploadProps {
  value?: string
  onChange: (url: string | undefined) => void
  disabled?: boolean
  placeholder?: string
  uploadEndpoint?: string
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: "image/webp" as const,
  initialQuality: 0.85,
}

export function SingleImageUpload({
  value,
  onChange,
  disabled,
  placeholder = "Tải ảnh lên",
  uploadEndpoint = "/api/upload-about-image",
}: SingleImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled || acceptedFiles.length === 0) return

      const file = acceptedFiles[0]
      setUploading(true)
      setUploadProgress(0)

      try {
        const compressed = await imageCompression(file, COMPRESSION_OPTIONS)
        setUploadProgress(50)

        const formData = new FormData()
        formData.append("file", compressed)

        const res = await fetch(uploadEndpoint, {
          method: "POST",
          body: formData,
        })

        if (!res.ok) throw new Error("Upload failed")

        const { publicUrl } = await res.json()
        setUploadProgress(100)
        onChange(publicUrl)
      } catch (error) {
        console.error("Upload error:", error)
        alert("Có lỗi xảy ra khi tải ảnh lên")
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [onChange, disabled, uploadEndpoint],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: 1,
    disabled: disabled || uploading,
  })

  const removeImage = async () => {
    if (disabled || !value) return

    try {
      await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: value }),
      })
      onChange(undefined)
    } catch (error) {
      console.error("Delete error:", error)
      alert("Có lỗi xảy ra khi xóa ảnh")
    }
  }

  if (value && !uploading) {
    return (
      <Card className="relative group">
        <CardContent className="p-4">
          <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
            <Image src={value || "/placeholder.svg"} alt="Uploaded image" fill className="object-cover" />
            {!disabled && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={removeImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
            ${disabled || uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
          `}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-2">
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-sm">
              {isDragActive ? (
                <p>Thả ảnh vào đây...</p>
              ) : (
                <div>
                  <p className="font-medium">{placeholder}</p>
                  <p className="text-muted-foreground">Hỗ trợ: JPG, PNG, WebP</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {uploading && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Đang tải lên...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/single-image-upload.tsx
git commit -m "feat: add compression and R2 upload to SingleImageUpload component"
```

---

### Task 9: Update `next.config.mjs`

**Files:**
- Modify: `next.config.mjs`

- [ ] **Step 1: Replace file contents**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-*.r2.dev",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
}

export default nextConfig
```

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:3000 — site loads normally, existing Supabase images still display.

- [ ] **Step 3: Commit**

```bash
git add next.config.mjs
git commit -m "feat: configure Next.js image domains for R2 and Supabase"
```

---

### Task 10: Create `scripts/migrate-to-r2.ts`

**Files:**
- Create: `scripts/migrate-to-r2.ts`

- [ ] **Step 1: Create the file**

```typescript
import { createClient } from "@supabase/supabase-js"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import * as fs from "fs"
import * as path from "path"

// ─── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET_NAME!
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

const LOG_FILE = path.join(process.cwd(), "scripts", "migration-log.json")

// ─── Clients ─────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
})

// ─── Log helpers ─────────────────────────────────────────────────────────────
function loadLog(): Record<string, string> {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"))
  }
  return {}
}

function saveLog(log: Record<string, string>) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))
}

// ─── Migrate one image ────────────────────────────────────────────────────────
async function migrateImage(oldUrl: string, log: Record<string, string>): Promise<string> {
  if (log[oldUrl]) {
    console.log(`  SKIP (already migrated): ${oldUrl}`)
    return log[oldUrl]
  }

  // Derive R2 key from Supabase URL
  // https://xxx.supabase.co/storage/v1/object/public/product-images/file.jpg
  //   → product-images/file.jpg
  const urlObj = new URL(oldUrl)
  const pathParts = urlObj.pathname.split("/public/")
  const key = pathParts[1] ?? `product-images/${Date.now()}-${Math.random().toString(36).slice(2)}`

  const res = await fetch(oldUrl)
  if (!res.ok) throw new Error(`Failed to download ${oldUrl}: ${res.status}`)

  const contentType = res.headers.get("content-type") ?? "image/jpeg"
  const buffer = Buffer.from(await res.arrayBuffer())

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    }),
  )

  const newUrl = `${R2_PUBLIC_URL}/${key}`
  log[oldUrl] = newUrl
  saveLog(log)
  console.log(`  OK: ${key}`)
  return newUrl
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Hama Workshop: Supabase → R2 Migration ===\n")

  const log = loadLog()
  let success = 0
  let failed = 0

  // Products
  console.log("Fetching products...")
  const { data: products, error: pErr } = await supabase.from("products").select("id, images")
  if (pErr) throw new Error(`Failed to fetch products: ${pErr.message}`)

  for (const product of products ?? []) {
    const images: string[] = product.images ?? []
    if (images.length === 0) continue

    console.log(`\nProduct ${product.id} (${images.length} images)`)
    const newImages: string[] = []

    for (const url of images) {
      try {
        newImages.push(await migrateImage(url, log))
        success++
      } catch (err) {
        console.error(`  FAIL: ${url}`, err)
        newImages.push(url) // keep old URL on failure
        failed++
      }
    }

    await supabase.from("products").update({ images: newImages }).eq("id", product.id)
  }

  // About images
  console.log("\nFetching about_images...")
  const { data: aboutImages, error: aErr } = await supabase.from("about_images").select("id, image_url")
  if (aErr) throw new Error(`Failed to fetch about_images: ${aErr.message}`)

  for (const row of aboutImages ?? []) {
    if (!row.image_url) continue

    console.log(`\nAbout image ${row.id}`)
    try {
      const newUrl = await migrateImage(row.image_url, log)
      await supabase.from("about_images").update({ image_url: newUrl }).eq("id", row.id)
      success++
    } catch (err) {
      console.error(`  FAIL: ${row.image_url}`, err)
      failed++
    }
  }

  console.log(`\n=== Done: ${success} migrated, ${failed} failed ===`)
  console.log(`Log saved to: ${LOG_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
```

- [ ] **Step 2: Commit**

```bash
git add scripts/migrate-to-r2.ts
git commit -m "feat: add Supabase to R2 migration script"
```

---

### Task 11: Manual verification (new uploads)

- [ ] **Step 1: Ensure dev server is running**

```bash
npm run dev
```

- [ ] **Step 2: Test product image upload**

1. Go to http://localhost:3000/admin/products
2. Create or edit a product → upload a new image
3. After save, check the stored URL in the DB via Supabase Dashboard → Table Editor → products → images column
4. Expected: URL starts with `https://pub-xxx.r2.dev/product-images/`
5. Check Cloudflare R2 Dashboard → bucket → verify file appears

- [ ] **Step 3: Test about image upload**

1. Go to http://localhost:3000/admin/about-images
2. Upload a new image
3. Verify URL starts with `https://pub-xxx.r2.dev/about-images/`

- [ ] **Step 4: Test image delete**

1. Delete one of the newly uploaded (R2) images from a product
2. Verify it disappears from the UI
3. Verify it's gone from R2 bucket in Cloudflare Dashboard

- [ ] **Step 5: Production build check**

```bash
npm run build
```

Expected: build completes without errors.

---

### Task 12: Run migration for existing images (run when ready)

> **IMPORTANT:** Run this only when you're ready. It modifies URLs in the database. Existing Supabase images are NOT deleted (kept as backup).

- [ ] **Step 1: Verify all env vars are set**

Check `.env.local` has: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME`, `NEXT_PUBLIC_R2_PUBLIC_URL`

- [ ] **Step 2: Run the migration script**

```bash
npx tsx --env-file=.env.local scripts/migrate-to-r2.ts
```

- [ ] **Step 3: Review output and log**

Check `scripts/migration-log.json` — each old Supabase URL maps to a new R2 URL.

If any images failed (FAIL lines in output), re-run the script — it skips already-migrated images (idempotent).

- [ ] **Step 4: Verify on site**

Open http://localhost:3000/products — all product images load from `pub-xxx.r2.dev` URLs.

- [ ] **Step 5: Add migration log to .gitignore**

```bash
echo "scripts/migration-log.json" >> .gitignore
git add .gitignore
git commit -m "chore: gitignore migration log file"
```
