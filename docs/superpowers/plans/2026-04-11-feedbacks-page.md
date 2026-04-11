# Feedbacks Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng trang `/feedbacks` hiển thị ảnh + quote khách hàng với 3 layout preset (Grid/Masonry/Slider), lightbox khi click ảnh, và `/admin/feedbacks` để admin quản lý nội dung + chọn layout.

**Architecture:** Supabase lưu dữ liệu feedback và layout setting (key-value). Public page là Server Component fetch data và truyền vào Client Component để xử lý lightbox. Admin page dùng `@dnd-kit/sortable` để reorder và gọi Supabase trực tiếp từ browser client.

**Tech Stack:** Next.js 14 App Router, Supabase, Cloudflare R2 (upload), @dnd-kit/core + @dnd-kit/sortable, Tailwind CSS, Radix UI (components/ui sẵn có)

---

## File Map

**Tạo mới:**
- `app/api/upload-feedback-image/route.ts` — Upload API cho ảnh feedback (clone pattern từ upload-about-image)
- `app/feedbacks/page.tsx` — Public page (Server Component, fetch data + layout)
- `components/feedbacks/feedback-grid.tsx` — Grid layout (2-3 cột)
- `components/feedbacks/feedback-masonry.tsx` — Masonry layout (CSS columns)
- `components/feedbacks/feedback-slider.tsx` — Slider layout (dùng Carousel UI có sẵn)
- `app/admin/feedbacks/page.tsx` — Admin page wrapper
- `components/admin/feedbacks-manager.tsx` — Admin CRUD component + layout picker + drag reorder

**Chỉnh sửa:**
- `components/header.tsx` — Thêm "Feedbacks" vào navigation array
- `components/admin/admin-header.tsx` — Thêm "Feedbacks" vào admin navigation

---

## Task 1: Install @dnd-kit packages

**Files:** (không có file thay đổi, chỉ install)

- [ ] **Step 1: Install packages**

```bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
```

Expected output: packages added to node_modules, package.json updated

- [ ] **Step 2: Verify install**

```bash
grep "@dnd-kit" package.json
```

Expected output dạng:
```
"@dnd-kit/core": "^6.x.x",
"@dnd-kit/sortable": "^8.x.x",
"@dnd-kit/utilities": "^3.x.x",
```

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install @dnd-kit for drag-and-drop reorder"
```

---

## Task 2: Create Supabase tables

**Files:** (SQL chạy trực tiếp trên Supabase SQL Editor)

- [ ] **Step 1: Chạy SQL sau trong Supabase Dashboard → SQL Editor**

```sql
-- Bảng feedbacks
create table if not exists feedbacks (
  id serial primary key,
  customer_name text not null,
  quote text not null,
  image_url text not null,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Bảng site_settings (key-value cho cài đặt toàn site)
create table if not exists site_settings (
  key text primary key,
  value text not null
);

-- Seed layout mặc định
insert into site_settings (key, value)
values ('feedbacks_layout', 'grid')
on conflict (key) do nothing;
```

- [ ] **Step 2: Verify trong Supabase Table Editor**

Kiểm tra bảng `feedbacks` và `site_settings` xuất hiện. `site_settings` có 1 row: `key=feedbacks_layout`, `value=grid`.

---

## Task 3: Upload API route

**Files:**
- Create: `app/api/upload-feedback-image/route.ts`

- [ ] **Step 1: Tạo file**

```typescript
// app/api/upload-feedback-image/route.ts
import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = `feedbacks/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
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
git add app/api/upload-feedback-image/route.ts
git commit -m "feat: add upload API route for feedback images"
```

---

## Task 4: Add navigation links

**Files:**
- Modify: `components/header.tsx`
- Modify: `components/admin/admin-header.tsx`

- [ ] **Step 1: Thêm Feedbacks vào public navigation**

Trong `components/header.tsx`, tìm mảng `navigation` (dòng 15-20), thêm item trước "Liên hệ":

```typescript
const navigation = [
  { name: 'Trang chủ', href: '/' },
  { name: 'Sản phẩm', href: '/products' },
  { name: 'Về chúng tôi', href: '/about' },
  { name: 'Feedbacks', href: '/feedbacks' },
  { name: 'Liên hệ', href: '/contact' }
]
```

- [ ] **Step 2: Thêm Feedbacks vào admin navigation**

Trong `components/admin/admin-header.tsx`, tìm mảng `navigation` (dòng 23-33), thêm item sau "Hình ảnh Về chúng tôi":

```typescript
const navigation = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Sản phẩm', href: '/admin/products', icon: Package },
  { name: 'Danh mục', href: '/admin/categories', icon: Users },
  {
    name: 'Hình ảnh Về chúng tôi',
    href: '/admin/about-images',
    icon: ImageIcon
  },
  { name: 'Feedbacks', href: '/admin/feedbacks', icon: MessageSquare },
  { name: 'Cài đặt', href: '/admin/settings', icon: Settings }
]
```

Thêm import `MessageSquare` từ lucide-react ở dòng import (cùng dòng với các icon khác):

```typescript
import {
  Box,
  Home,
  ImageIcon,
  LogOut,
  MessageSquare,
  Package,
  Settings,
  Users
} from 'lucide-react'
```

- [ ] **Step 3: Commit**

```bash
git add components/header.tsx components/admin/admin-header.tsx
git commit -m "feat: add Feedbacks to public and admin navigation"
```

---

## Task 5: Feedback layout components

**Files:**
- Create: `components/feedbacks/feedback-grid.tsx`
- Create: `components/feedbacks/feedback-masonry.tsx`
- Create: `components/feedbacks/feedback-slider.tsx`

> Note: Lightbox dùng lại `ImagePopup` component đã có tại `components/image-popup.tsx`. Không cần tạo mới.

- [ ] **Step 1: Tạo Grid layout**

```typescript
// components/feedbacks/feedback-grid.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePopup } from "@/components/image-popup"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
}

interface FeedbackGridProps {
  items: FeedbackItem[]
}

export function FeedbackGrid({ items }: FeedbackGridProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const imageUrls = items.map((item) => item.image_url)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group rounded-2xl overflow-hidden tech-shadow cursor-pointer bg-card"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="relative aspect-square">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.customer_name}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
            </div>
            <div className="p-4 space-y-1">
              <p className="font-semibold text-sm text-foreground">{item.customer_name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">"{item.quote}"</p>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <ImagePopup
          images={imageUrls}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 2: Tạo Masonry layout**

```typescript
// components/feedbacks/feedback-masonry.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePopup } from "@/components/image-popup"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
}

interface FeedbackMasonryProps {
  items: FeedbackItem[]
}

export function FeedbackMasonry({ items }: FeedbackMasonryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const imageUrls = items.map((item) => item.image_url)

  return (
    <>
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group break-inside-avoid rounded-2xl overflow-hidden tech-shadow cursor-pointer bg-card mb-4"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="relative w-full">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.customer_name}
                width={400}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4 space-y-1">
              <p className="font-semibold text-sm text-foreground">{item.customer_name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">"{item.quote}"</p>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <ImagePopup
          images={imageUrls}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 3: Tạo Slider layout**

```typescript
// components/feedbacks/feedback-slider.tsx
"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ImagePopup } from "@/components/image-popup"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
}

interface FeedbackSliderProps {
  items: FeedbackItem[]
}

export function FeedbackSlider({ items }: FeedbackSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const imageUrls = items.map((item) => item.image_url)

  return (
    <>
      <Carousel className="w-full max-w-3xl mx-auto">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <div
                className="group rounded-2xl overflow-hidden tech-shadow cursor-pointer bg-card h-full"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.customer_name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-4 space-y-1">
                  <p className="font-semibold text-sm text-foreground">{item.customer_name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">"{item.quote}"</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {selectedIndex !== null && (
        <ImagePopup
          images={imageUrls}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add components/feedbacks/
git commit -m "feat: add feedback layout components (grid, masonry, slider)"
```

---

## Task 6: Public feedbacks page

**Files:**
- Create: `app/feedbacks/page.tsx`

- [ ] **Step 1: Tạo public page**

```typescript
// app/feedbacks/page.tsx
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { FeedbackGrid } from '@/components/feedbacks/feedback-grid'
import { FeedbackMasonry } from '@/components/feedbacks/feedback-masonry'
import { FeedbackSlider } from '@/components/feedbacks/feedback-slider'
import { createServerClient } from '@supabase/ssr'
import { MessageSquare } from 'lucide-react'
import { cookies } from 'next/headers'

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
  display_order: number
  is_active: boolean
}

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
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching feedbacks:', error)
    return []
  }

  return data || []
}

async function getFeedbacksLayout(): Promise<string> {
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

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'feedbacks_layout')
    .single()

  return data?.value || 'grid'
}

export default async function FeedbacksPage() {
  const [feedbacks, layout] = await Promise.all([
    getFeedbacks(),
    getFeedbacksLayout()
  ])

  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header Section */}
          <section className='py-16 lg:py-20'>
            <div className='text-center space-y-6 mb-16'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                <MessageSquare className='w-4 h-4' />
                Khách hàng nói gì
              </div>
              <h1 className='text-4xl lg:text-5xl font-bold text-balance text-foreground'>
                Feedbacks
              </h1>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty'>
                Những hình ảnh và cảm nhận thực tế từ khách hàng đã tin tưởng Hama Workshop.
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className='text-center py-20 text-muted-foreground'>
                <MessageSquare className='w-12 h-12 mx-auto mb-4 opacity-30' />
                <p>Chưa có feedback nào.</p>
              </div>
            ) : (
              <>
                {layout === 'masonry' && <FeedbackMasonry items={feedbacks} />}
                {layout === 'slider' && <FeedbackSlider items={feedbacks} />}
                {layout !== 'masonry' && layout !== 'slider' && (
                  <FeedbackGrid items={feedbacks} />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
```

- [ ] **Step 2: Verify trong browser**

```bash
npm run dev
```

Mở `http://localhost:3000/feedbacks` — trang load không lỗi, hiển thị header "Feedbacks", empty state nếu DB chưa có data.

- [ ] **Step 3: Commit**

```bash
git add app/feedbacks/page.tsx
git commit -m "feat: add public /feedbacks page with layout switching"
```

---

## Task 7: Admin feedbacks manager component

**Files:**
- Create: `components/admin/feedbacks-manager.tsx`

- [ ] **Step 1: Tạo component**

```typescript
// components/admin/feedbacks-manager.tsx
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
import { Plus, Edit, Trash2, Save, X, Upload, GripVertical, LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
  display_order: number
  is_active: boolean
}

type Layout = "grid" | "masonry" | "slider"

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

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

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
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={item.image_url || "/placeholder.svg"}
              alt={item.customer_name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{item.customer_name}</h3>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Hiển thị" : "Ẩn"}
              </Badge>
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

const LAYOUT_OPTIONS: { value: Layout; label: string; icon: React.ReactNode }[] = [
  { value: "grid", label: "Grid", icon: <LayoutGrid className="w-4 h-4" /> },
  { value: "masonry", label: "Masonry", icon: <Rows3 className="w-4 h-4" /> },
  { value: "slider", label: "Slider", icon: <SlidersHorizontal className="w-4 h-4" /> },
]

export function FeedbacksManager() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [layout, setLayout] = useState<Layout>("grid")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingLayout, setSavingLayout] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    quote: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  })

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
    fetchLayout()
  }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("display_order", { ascending: true })
    if (error) { console.error(error); return }
    setItems(data || [])
  }

  const fetchLayout = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "feedbacks_layout")
      .single()
    if (data?.value) setLayout(data.value as Layout)
  }

  const handleLayoutChange = async (newLayout: Layout) => {
    setSavingLayout(true)
    setLayout(newLayout)
    await supabase
      .from("site_settings")
      .upsert({ key: "feedbacks_layout", value: newLayout })
    setSavingLayout(false)
  }

  const handleSave = async () => {
    if (!formData.customer_name.trim()) { alert("Vui lòng nhập tên khách hàng"); return }
    if (!formData.quote.trim()) { alert("Vui lòng nhập nội dung feedback"); return }
    if (!formData.image_url) { alert("Vui lòng tải lên hình ảnh"); return }

    if (editingId) {
      const { error } = await supabase.from("feedbacks").update(formData).eq("id", editingId)
      if (error) { console.error(error); return }
    } else {
      const { error } = await supabase.from("feedbacks").insert([formData])
      if (error) { console.error(error); return }
    }

    setEditingId(null)
    setIsAdding(false)
    setFormData({ customer_name: "", quote: "", image_url: "", display_order: 0, is_active: true })
    fetchItems()
  }

  const handleEdit = (item: FeedbackItem) => {
    setEditingId(item.id)
    setFormData({
      customer_name: item.customer_name,
      quote: item.quote,
      image_url: item.image_url,
      display_order: item.display_order,
      is_active: item.is_active,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return
    const { error } = await supabase.from("feedbacks").delete().eq("id", id)
    if (error) { console.error(error); return }
    fetchItems()
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ customer_name: "", quote: "", image_url: "", display_order: 0, is_active: true })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const response = await fetch("/api/upload-feedback-image", { method: "POST", body: fd })
      if (!response.ok) throw new Error("Upload failed")
      const { publicUrl } = await response.json()
      setFormData((prev) => ({ ...prev, image_url: publicUrl }))
    } catch (error) {
      console.error(error)
      alert("Lỗi khi tải lên hình ảnh")
    } finally {
      setUploading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)

    setItems(newItems)

    // Update display_order for all items
    await Promise.all(
      newItems.map((item, index) =>
        supabase.from("feedbacks").update({ display_order: index }).eq("id", item.id)
      )
    )
  }

  return (
    <div className="space-y-8">
      {/* Layout Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Layout trang Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {LAYOUT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={layout === option.value ? "default" : "outline"}
                onClick={() => handleLayoutChange(option.value)}
                disabled={savingLayout}
                className="flex items-center gap-2"
              >
                {option.icon}
                {option.label}
                {layout === option.value && savingLayout && (
                  <span className="text-xs opacity-70">Đang lưu...</span>
                )}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Thay đổi được lưu ngay lập tức và áp dụng cho trang public.
          </p>
        </CardContent>
      </Card>

      {/* Feedback Manager */}
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
                  <Label htmlFor="customer_name">Tên khách hàng</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Thứ tự hiển thị</Label>
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
                <Label htmlFor="quote">Nội dung feedback</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Sản phẩm rất đẹp và chắc chắn..."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Hình ảnh</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Hoặc nhập URL hình ảnh"
                    />
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="feedback-file-upload"
                    />
                    <Label htmlFor="feedback-file-upload" className="cursor-pointer">
                      <Button type="button" disabled={uploading} asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? "Đang tải..." : "Tải lên"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                {formData.image_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={formData.image_url || "/placeholder.svg"}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
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
                <Button onClick={handleSave} disabled={uploading}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
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
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            Chưa có feedback nào. Nhấn "Thêm feedback" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/admin/feedbacks-manager.tsx
git commit -m "feat: add admin feedbacks manager component with dnd reorder and layout picker"
```

---

## Task 8: Admin feedbacks page

**Files:**
- Create: `app/admin/feedbacks/page.tsx`

- [ ] **Step 1: Tạo page**

```typescript
// app/admin/feedbacks/page.tsx
import { FeedbacksManager } from '@/components/admin/feedbacks-manager'

export default function AdminFeedbacksPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Quản lý Feedbacks</h1>
        <p className='text-muted-foreground text-sm mt-1'>
          Quản lý hình ảnh và nhận xét từ khách hàng, chọn layout hiển thị cho trang public.
        </p>
      </div>
      <FeedbacksManager />
    </div>
  )
}
```

- [ ] **Step 2: Verify toàn bộ flow**

```bash
npm run dev
```

Kiểm tra:
1. `http://localhost:3000/feedbacks` — trang public load, nav có "Feedbacks"
2. `http://localhost:3000/admin/feedbacks` — admin page load, có Layout Picker và Feedback Manager
3. Thêm 1 feedback → xuất hiện trong danh sách
4. Chọn layout "Masonry" → refresh trang public → layout thay đổi
5. Click ảnh trên trang public → lightbox mở
6. Drag reorder item trong admin → thứ tự cập nhật

- [ ] **Step 3: Commit**

```bash
git add app/admin/feedbacks/page.tsx
git commit -m "feat: add admin /feedbacks page"
```

---

## Self-Review

### Spec coverage check

| Requirement | Task |
|-------------|------|
| Bảng `feedbacks` | Task 2 |
| Bảng `site_settings` | Task 2 |
| Upload API | Task 3 |
| Public nav "Feedbacks" | Task 4 |
| Admin nav "Feedbacks" | Task 4 |
| Layout picker (Grid/Masonry/Slider) | Task 7 |
| CRUD feedbacks (thêm/sửa/xóa/bật-tắt) | Task 7 |
| Drag-and-drop reorder | Task 7 |
| Grid layout | Task 5 |
| Masonry layout | Task 5 |
| Slider layout | Task 5 |
| Public page với layout switching | Task 6 |
| Lightbox khi click ảnh | Task 5 (dùng ImagePopup), Task 6 |
| Empty state | Task 6 |

### Type consistency check

- `FeedbackItem` interface định nghĩa ở `feedbacks-manager.tsx`, `feedback-grid.tsx`, `feedback-masonry.tsx`, `feedback-slider.tsx`, `feedbacks/page.tsx` — tất cả dùng cùng shape: `{ id, customer_name, quote, image_url, display_order, is_active }`
- Props `items: FeedbackItem[]` nhất quán ở cả 3 layout components
- `Layout` type `"grid" | "masonry" | "slider"` dùng nhất quán trong manager và page

### Placeholder check

Không có TBD, TODO, hay implementation gaps.
