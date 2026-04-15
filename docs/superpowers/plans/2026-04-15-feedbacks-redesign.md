# Feedbacks Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public feedbacks page with horizontal cards + gallery modal, add multi-image support per feedback, and simplify the admin image manager to upload-only.

**Architecture:** Add a `feedback_images` table (one-to-many from `feedbacks`). Public page uses a single-column layout with new `FeedbackCard` and `FeedbackModal` components. Admin uses a new `FeedbackImageManager` component integrated into the existing `feedbacks-manager`. Old layout components (grid/masonry/slider) are deleted.

**Tech Stack:** Next.js 14 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase (DB), R2 (image storage via `/api/upload-feedback-image` and `/api/delete-image`), @dnd-kit (drag reorder — already installed)

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `scripts/019_feedback_images.sql` | Create | DB migration: new table, migrate data, nullable column, remove setting |
| `types/feedback.ts` | Create | Shared `FeedbackImage` and `FeedbackItem` types used across public + admin |
| `components/feedbacks/feedback-card.tsx` | Create | Horizontal card: cover image left, quote + thumbs + name right |
| `components/feedbacks/feedback-modal.tsx` | Create | Dark modal: gallery panel left, quote panel right, scoped to one feedback |
| `app/feedbacks/page.tsx` | Modify | Remove layout switch, single-column, use `FeedbackCard` + `FeedbackModal` |
| `components/feedbacks/feedback-grid.tsx` | Delete | No longer needed |
| `components/feedbacks/feedback-masonry.tsx` | Delete | No longer needed |
| `components/feedbacks/feedback-slider.tsx` | Delete | No longer needed |
| `components/admin/feedback-image-manager.tsx` | Create | Multi-upload, thumbnail grid, drag reorder, delete — upload-only (no URL input) |
| `components/admin/feedbacks-manager.tsx` | Modify | Remove layout switcher, integrate ImageManager, update save/delete for multi-image |

---

## Task 1: DB Migration

**Files:**
- Create: `scripts/019_feedback_images.sql`

- [ ] **Step 1: Create the migration script**

Create `scripts/019_feedback_images.sql` with this exact content:

```sql
-- Create feedback_images table
CREATE TABLE IF NOT EXISTS feedback_images (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing image_url data into feedback_images
INSERT INTO feedback_images (feedback_id, image_url, display_order)
SELECT id, image_url, 0
FROM feedbacks
WHERE image_url IS NOT NULL AND image_url != '';

-- Make image_url nullable (no longer required, cover comes from feedback_images)
ALTER TABLE feedbacks ALTER COLUMN image_url DROP NOT NULL;

-- Remove obsolete layout setting
DELETE FROM site_settings WHERE key = 'feedbacks_layout';
```

- [ ] **Step 2: Run the migration**

Open Supabase SQL Editor and run the content of `scripts/019_feedback_images.sql`.

Verify by running: `SELECT * FROM feedback_images LIMIT 5;` — should show rows populated from existing feedbacks.

- [ ] **Step 3: Commit**

```bash
git add scripts/019_feedback_images.sql
git commit -m "feat: add feedback_images table and migrate existing image data"
```

---

## Task 2: Shared Types

**Files:**
- Create: `types/feedback.ts`

- [ ] **Step 1: Create the types file**

Create `types/feedback.ts`:

```ts
export interface FeedbackImage {
  id: number
  feedback_id: number
  image_url: string
  display_order: number
}

export interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  display_order: number
  is_active: boolean
  feedback_images: FeedbackImage[]
}
```

- [ ] **Step 2: Commit**

```bash
git add types/feedback.ts
git commit -m "feat: add shared feedback types"
```

---

## Task 3: FeedbackCard Component

**Files:**
- Create: `components/feedbacks/feedback-card.tsx`

- [ ] **Step 1: Create the component**

Create `components/feedbacks/feedback-card.tsx`:

```tsx
"use client"

import Image from "next/image"
import { Eye, ImageIcon } from "lucide-react"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbackCardProps {
  item: FeedbackItem
  onClick: () => void
}

export function FeedbackCard({ item, onClick }: FeedbackCardProps) {
  const images = [...item.feedback_images].sort((a, b) => a.display_order - b.display_order)
  const coverImage = images[0]
  const thumbs = images.slice(1, 4)
  const extraCount = images.length - 4

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex"
      onClick={onClick}
    >
      {/* Image side */}
      <div className="w-48 flex-shrink-0 relative bg-muted min-h-[180px]">
        {coverImage ? (
          <Image
            src={coverImage.image_url}
            alt={item.customer_name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-30" />
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            📷 {images.length}
          </div>
        )}
      </div>

      {/* Content side */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <span className="text-5xl leading-none text-primary/60 font-serif block mb-1">"</span>
          <p className="text-sm text-foreground/80 italic leading-relaxed line-clamp-4">
            {item.quote}
          </p>
        </div>
        <div>
          {thumbs.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {thumbs.map((img) => (
                <div
                  key={img.id}
                  className="w-8 h-8 rounded-md overflow-hidden border border-border flex-shrink-0 relative"
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
              {extraCount > 0 && (
                <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground flex-shrink-0">
                  +{extraCount + 1}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{item.customer_name}</span>
            <span className="text-[11px] text-primary/70 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {images.length > 1 ? `Xem ${images.length} ảnh` : "Xem ảnh"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors related to `feedback-card.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/feedbacks/feedback-card.tsx
git commit -m "feat: add FeedbackCard horizontal layout component"
```

---

## Task 4: FeedbackModal Component

**Files:**
- Create: `components/feedbacks/feedback-modal.tsx`

- [ ] **Step 1: Create the component**

Create `components/feedbacks/feedback-modal.tsx`:

```tsx
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbackModalProps {
  item: FeedbackItem
  onClose: () => void
}

export function FeedbackModal({ item, onClose }: FeedbackModalProps) {
  const images = [...item.feedback_images].sort((a, b) => a.display_order - b.display_order)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [images.length, onClose])

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#1a110a] rounded-2xl overflow-hidden flex w-full max-w-3xl max-h-[90vh]">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gallery panel */}
        <div className="flex-[1.4] flex flex-col min-h-[360px]">
          <div className="flex-1 relative bg-black/40 min-h-[280px]">
            {images[activeIndex] && (
              <Image
                src={images[activeIndex].image_url}
                alt={`Ảnh ${activeIndex + 1}`}
                fill
                className="object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 bg-black/30 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  className={`w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors relative ${
                    i === activeIndex ? "border-amber-500" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quote panel */}
        <div className="flex-1 p-7 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-5xl text-amber-600/80 font-serif leading-none block mb-2">"</span>
            <p className="text-sm text-amber-50/90 italic leading-relaxed">{item.quote}</p>
          </div>
          <div>
            <p className="text-white font-bold text-sm">{item.customer_name}</p>
            {images.length > 0 && (
              <p className="text-amber-800/60 text-xs mt-1">{images.length} hình ảnh</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no TypeScript errors related to `feedback-modal.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/feedbacks/feedback-modal.tsx
git commit -m "feat: add FeedbackModal with image gallery and keyboard navigation"
```

---

## Task 5: Update Public Feedbacks Page

**Files:**
- Modify: `app/feedbacks/page.tsx`

- [ ] **Step 1: Replace the page**

Replace the entire content of `app/feedbacks/page.tsx`:

```tsx
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { createServerClient } from '@supabase/ssr'
import { MessageSquare } from 'lucide-react'
import { cookies } from 'next/headers'
import type { FeedbackItem } from '@/types/feedback'
import FeedbacksClient from './feedbacks-client'

async function getFeedbacks(): Promise<FeedbackItem[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  const { data, error } = await supabase
    .from('feedbacks')
    .select('*, feedback_images(id, feedback_id, image_url, display_order)')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching feedbacks:', error)
    return []
  }

  return (data || []).map((item) => ({
    ...item,
    feedback_images: (item.feedback_images || []).sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    ),
  }))
}

export default async function FeedbacksPage() {
  const feedbacks = await getFeedbacks()

  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <section className='py-16 lg:py-20'>
            <div className='text-center space-y-6 mb-16'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                <MessageSquare className='w-4 h-4' />
                Khách hàng nói gì
              </div>
              <h1 className='text-4xl lg:text-5xl font-bold text-balance text-foreground'>
                Feedbacks thực tế
              </h1>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty'>
                Những hình ảnh và cảm nhận từ khách hàng đã tin tưởng Hama Workshop.
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className='text-center py-20 text-muted-foreground'>
                <MessageSquare className='w-12 h-12 mx-auto mb-4 opacity-30' />
                <p>Chưa có feedback nào.</p>
              </div>
            ) : (
              <FeedbacksClient feedbacks={feedbacks} />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Create the client component**

Create `app/feedbacks/feedbacks-client.tsx` (handles the `useState` for modal — keeps page as a Server Component):

```tsx
"use client"

import { useState } from "react"
import { FeedbackCard } from "@/components/feedbacks/feedback-card"
import { FeedbackModal } from "@/components/feedbacks/feedback-modal"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbacksClientProps {
  feedbacks: FeedbackItem[]
}

export default function FeedbacksClient({ feedbacks }: FeedbacksClientProps) {
  const [selected, setSelected] = useState<FeedbackItem | null>(null)

  return (
    <>
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {feedbacks.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>

      {selected && (
        <FeedbackModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add app/feedbacks/page.tsx app/feedbacks/feedbacks-client.tsx
git commit -m "feat: update public feedbacks page with single-column layout and modal"
```

---

## Task 6: Delete Old Layout Components

**Files:**
- Delete: `components/feedbacks/feedback-grid.tsx`
- Delete: `components/feedbacks/feedback-masonry.tsx`
- Delete: `components/feedbacks/feedback-slider.tsx`

- [ ] **Step 1: Delete the files**

```bash
rm components/feedbacks/feedback-grid.tsx
rm components/feedbacks/feedback-masonry.tsx
rm components/feedbacks/feedback-slider.tsx
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors (nothing imports these files anymore).

- [ ] **Step 3: Commit**

```bash
git add -u components/feedbacks/
git commit -m "chore: remove old feedback layout components (grid, masonry, slider)"
```

---

## Task 7: FeedbackImageManager Admin Component

**Files:**
- Create: `components/admin/feedback-image-manager.tsx`

- [ ] **Step 1: Create the component**

Create `components/admin/feedback-image-manager.tsx`:

```tsx
"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface LocalImage {
  id: number | null   // null = newly uploaded, not yet saved to DB
  image_url: string
  display_order: number
}

interface FeedbackImageManagerProps {
  value: LocalImage[]
  onChange: (images: LocalImage[]) => void
  onDeleteExisting: (id: number) => void
  onDeleteUploaded: (url: string) => void
}

function SortableThumb({
  img,
  index,
  onRemove,
}: {
  img: LocalImage
  index: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: img.image_url,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0 group">
      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border relative">
        <Image src={img.image_url} alt="" fill className="object-cover" />
        {index === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 font-semibold">
            Bìa
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
      <div
        className="absolute bottom-1 left-1 cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-white drop-shadow" />
      </div>
    </div>
  )
}

export function FeedbackImageManager({
  value,
  onChange,
  onDeleteExisting,
  onDeleteUploaded,
}: FeedbackImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      const uploaded: LocalImage[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload-feedback-image", { method: "POST", body: fd })
        if (!res.ok) throw new Error("Upload failed")
        const { publicUrl } = await res.json()
        uploaded.push({
          id: null,
          image_url: publicUrl,
          display_order: value.length + uploaded.length,
        })
      }
      onChange([...value, ...uploaded])
    } catch {
      alert("Lỗi khi tải lên hình ảnh")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleRemove = (img: LocalImage) => {
    onChange(
      value
        .filter((i) => i.image_url !== img.image_url)
        .map((i, idx) => ({ ...i, display_order: idx }))
    )
    if (img.id !== null) {
      onDeleteExisting(img.id)
    } else {
      onDeleteUploaded(img.image_url)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = value.findIndex((i) => i.image_url === active.id)
    const newIdx = value.findIndex((i) => i.image_url === over.id)
    onChange(
      arrayMove(value, oldIdx, newIdx).map((img, idx) => ({ ...img, display_order: idx }))
    )
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={value.map((i) => i.image_url)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {value.map((img, idx) => (
                <SortableThumb
                  key={img.image_url}
                  img={img}
                  index={idx}
                  onRemove={() => handleRemove(img)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id="feedback-images-input"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Đang tải lên..." : "Tải lên ảnh"}
        </Button>
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Ảnh đầu tiên sẽ là ảnh bìa. Có thể chọn nhiều ảnh cùng lúc.
          </p>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/feedback-image-manager.tsx
git commit -m "feat: add FeedbackImageManager component with multi-upload and drag reorder"
```

---

## Task 8: Update feedbacks-manager (Admin)

**Files:**
- Modify: `components/admin/feedbacks-manager.tsx`

This is the most complex task. Replace the entire file with the updated version below. Key changes from the original:
- `FeedbackItem` now includes `feedback_images: FeedbackImage[]` (imported from `@/types/feedback`)
- Form state replaces `image_url` with `formImages: LocalImage[]` + `deletedImageIds: number[]` + `deletedUploadedUrls: string[]`
- `fetchItems` queries with `feedback_images` join
- `handleSave` manages `feedback_images` inserts + deletes
- `handleDelete` also calls `/api/delete-image` for all feedback images
- Layout switcher section and all related state/logic removed
- `SortableItem` uses cover image from `feedback_images[0]`

- [ ] **Step 1: Replace feedbacks-manager.tsx**

Replace the entire content of `components/admin/feedbacks-manager.tsx`:

```tsx
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, GripVertical, ImageIcon } from "lucide-react"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import { FeedbackImageManager, type LocalImage } from "@/components/admin/feedback-image-manager"
import type { FeedbackItem } from "@/types/feedback"

function SortableItem({
  item,
  onEdit,
  onDelete,
  disabled,
}: {
  item: FeedbackItem
  onEdit: (item: FeedbackItem) => void
  onDelete: (id: number) => void
  disabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const coverImage = [...item.feedback_images]
    .sort((a, b) => a.display_order - b.display_order)[0]

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <button
            className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {coverImage ? (
              <Image
                src={coverImage.image_url}
                alt={item.customer_name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground opacity-40" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{item.customer_name}</h3>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Hiển thị" : "Ẩn"}
              </Badge>
              {item.feedback_images.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {item.feedback_images.length} ảnh
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">"{item.quote}"</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(item)} disabled={disabled}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(item.id)} disabled={disabled}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function FeedbacksManager() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    quote: "",
    display_order: 0,
    is_active: true,
  })
  const [formImages, setFormImages] = useState<LocalImage[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
  const [deletedUploadedUrls, setDeletedUploadedUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*, feedback_images(id, feedback_id, image_url, display_order)")
      .order("display_order", { ascending: true })
    if (error) { console.error(error); return }
    setItems(
      (data || []).map((item) => ({
        ...item,
        feedback_images: (item.feedback_images || []).sort(
          (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
        ),
      }))
    )
  }

  const resetForm = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ customer_name: "", quote: "", display_order: 0, is_active: true })
    setFormImages([])
    setDeletedImageIds([])
    setDeletedUploadedUrls([])
  }

  const handleSave = async () => {
    if (!formData.customer_name.trim()) { alert("Vui lòng nhập tên khách hàng"); return }
    if (!formData.quote.trim()) { alert("Vui lòng nhập nội dung feedback"); return }

    setSaving(true)
    try {
      let feedbackId = editingId

      if (editingId) {
        const { error } = await supabase.from("feedbacks").update(formData).eq("id", editingId)
        if (error) { console.error(error); return }
      } else {
        const { data, error } = await supabase.from("feedbacks").insert([formData]).select().single()
        if (error) { console.error(error); return }
        feedbackId = data.id
      }

      // Delete removed existing images from DB
      if (deletedImageIds.length > 0) {
        await supabase.from("feedback_images").delete().in("id", deletedImageIds)
      }

      // Delete newly uploaded images that were then removed (R2 cleanup)
      for (const url of deletedUploadedUrls) {
        await fetch("/api/delete-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
      }

      // Insert new images (id === null = not yet in DB)
      const newImages = formImages.filter((img) => img.id === null)
      if (newImages.length > 0) {
        await supabase.from("feedback_images").insert(
          newImages.map((img) => ({
            feedback_id: feedbackId,
            image_url: img.image_url,
            display_order: img.display_order,
          }))
        )
      }

      // Update display_order for existing images that may have been reordered
      const existingImages = formImages.filter((img) => img.id !== null)
      for (const img of existingImages) {
        await supabase
          .from("feedback_images")
          .update({ display_order: img.display_order })
          .eq("id", img.id!)
      }

      resetForm()
      fetchItems()
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: FeedbackItem) => {
    setEditingId(item.id)
    setFormData({
      customer_name: item.customer_name,
      quote: item.quote,
      display_order: item.display_order,
      is_active: item.is_active,
    })
    setFormImages(
      item.feedback_images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        display_order: img.display_order,
      }))
    )
    setDeletedImageIds([])
    setDeletedUploadedUrls([])
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return
    const item = items.find((i) => i.id === id)

    // Delete all R2 images for this feedback
    if (item) {
      for (const img of item.feedback_images) {
        await fetch("/api/delete-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: img.image_url }),
        })
      }
    }

    const { error } = await supabase.from("feedbacks").delete().eq("id", id)
    if (error) { console.error(error); return }
    fetchItems()
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
    await Promise.all(
      newItems.map((item, index) =>
        supabase.from("feedbacks").update({ display_order: index }).eq("id", item.id)
      )
    )
  }

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Danh sách Feedbacks</h2>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm feedback
          </Button>
        </div>

        {(isAdding || editingId !== null) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Chỉnh sửa feedback" : "Thêm feedback mới"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name" className="mb-1.5 block">Tên khách hàng</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order" className="mb-1.5 block">Thứ tự hiển thị</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quote" className="mb-1.5 block">Nội dung feedback</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Sản phẩm rất đẹp và chắc chắn..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Hình ảnh</Label>
                <FeedbackImageManager
                  value={formImages}
                  onChange={setFormImages}
                  onDeleteExisting={(id) => setDeletedImageIds((prev) => [...prev, id])}
                  onDeleteUploaded={(url) => setDeletedUploadedUrls((prev) => [...prev, url])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Hiển thị</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  disabled={isAdding || editingId !== null}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && !isAdding && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Chưa có feedback nào. Nhấn "Thêm feedback" để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -20
```

Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add components/admin/feedbacks-manager.tsx
git commit -m "feat: update feedbacks-manager with multi-image support and remove layout switcher"
```

---

## Task 9: Final verification

- [ ] **Step 1: Start dev server**

```bash
npm run dev
```

- [ ] **Step 2: Test public page**

Open `http://localhost:3000/feedbacks`. Verify:
- Feedbacks render as horizontal cards (image left, quote right)
- Cards with multiple images show thumbnail strip and "📷 N" badge
- Clicking a card opens the dark modal
- Modal shows gallery panel left + quote panel right
- Arrow keys (← →) and Escape close/navigate
- Thumbnail strip at bottom of gallery switches active image

- [ ] **Step 3: Test admin**

Open `http://localhost:3000/admin/feedbacks`. Verify:
- No layout switcher visible
- "Thêm feedback" opens form with image upload section
- Can upload multiple images at once
- Thumbnails show with "Bìa" badge on first image
- Can drag thumbnails to reorder
- Hover on thumbnail shows × button to remove
- Save creates feedback with images visible on list item
- Edit pre-populates images correctly
- Delete removes feedback and cleans up R2

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: complete feedbacks redesign with multi-image support"
```
