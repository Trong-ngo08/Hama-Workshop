# Admin iPad Responsive Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix 5 iPad-specific issues across the admin panel so all pages work correctly in portrait (768px) and landscape (1024px).

**Architecture:** Purely CSS/responsive changes + one new hamburger drawer component using the existing Sheet UI primitive. No new routes, no new API calls, no data model changes.

**Tech Stack:** Next.js 14, React 19, Tailwind CSS 4, shadcn/ui (Sheet, Button, etc.), lucide-react

---

## Files Modified

| File | Change |
|------|--------|
| `components/admin/admin-header.tsx` | Add hamburger + Sheet drawer; nav `hidden lg:flex` |
| `components/admin/product-form.tsx` | Main grid `lg:grid-cols-2` |
| `components/admin/image-upload.tsx` | Remove `opacity-0 group-hover:opacity-100` from action buttons |
| `components/admin/products-table.tsx` | `overflow-x-auto` on table wrapper; icon buttons `h-10 w-10` |
| `components/admin/delete-product-button.tsx` | Trigger button `size="icon" className="h-10 w-10"` |
| `components/admin/feedbacks-manager.tsx` | Edit/Delete buttons `size="icon" className="h-10 w-10"` |
| `components/admin/about-images-manager.tsx` | Edit/Delete buttons `size="icon" className="h-10 w-10"` |

---

## Task 1: AdminHeader — Hamburger Drawer

**Files:**
- Modify: `components/admin/admin-header.tsx`

- [ ] **Step 1: Replace the entire file content**

```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { logout } from '@/lib/auth'
import { cn } from '@/lib/utils'
import {
  Box,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh mục', href: '/admin/categories', icon: Users },
    { name: 'Hình ảnh Về chúng tôi', href: '/admin/about-images', icon: ImageIcon },
    { name: 'Feedbacks', href: '/admin/feedbacks', icon: MessageSquare },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white shadow-sm'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>

          {/* Logo */}
          <Link href='/admin' className='flex items-center gap-2 font-bold text-xl group'>
            <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:rotate-12 duration-300'>
              <Box className='w-4 h-4 text-primary-foreground' />
            </div>
            <Image
              src='/logo.png'
              alt='Logo'
              width={200}
              className='h-[40px] w-auto'
              height={64}
            />
          </Link>

          {/* Desktop Navigation — lg and above only */}
          <nav className='hidden lg:flex items-center gap-6'>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive(item.href) ? 'text-primary' : 'text-gray-700'
                  )}
                >
                  <Icon className='w-4 h-4' />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions — lg and above only */}
          <div className='hidden lg:flex items-center gap-4'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/' className='text-gray-700 hover:text-primary'>
                Xem trang chủ
              </Link>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='text-gray-700 hover:text-primary'
            >
              <LogOut className='w-4 h-4 mr-2' />
              Đăng xuất
            </Button>
          </div>

          {/* Hamburger — below lg (iPad portrait + phone) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='flex lg:hidden h-10 w-10'
                aria-label='Mở menu'
              >
                <Menu className='w-5 h-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-72 p-0 flex flex-col'>
              <SheetHeader className='px-6 py-4 border-b'>
                <SheetTitle className='flex items-center gap-2 text-base'>
                  <div className='w-7 h-7 rounded-lg bg-primary flex items-center justify-center'>
                    <Box className='w-3.5 h-3.5 text-primary-foreground' />
                  </div>
                  Admin Panel
                </SheetTitle>
              </SheetHeader>

              <nav className='flex flex-col py-2 flex-1'>
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors active:bg-gray-100',
                        isActive(item.href)
                          ? 'text-primary bg-primary/5'
                          : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                      )}
                    >
                      <Icon className='w-5 h-5 flex-shrink-0' />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <div className='border-t px-4 py-4 space-y-1'>
                <Button variant='ghost' size='sm' asChild className='w-full justify-start h-11'>
                  <Link href='/' onClick={() => setOpen(false)} className='text-gray-700'>
                    Xem trang chủ
                  </Link>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLogout}
                  className='w-full justify-start h-11 text-gray-700'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  Đăng xuất
                </Button>
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/admin` at 768px width (or on iPad). Confirm:
- Hamburger icon (☰) appears in top-right
- Tapping opens drawer from right with all 6 nav items
- Tapping a nav item closes drawer and navigates
- At 1024px+ (landscape), full horizontal nav shows, hamburger hidden

- [ ] **Step 3: Commit**

```bash
git add components/admin/admin-header.tsx
git commit -m "fix: admin header hamburger drawer for iPad portrait"
```

---

## Task 2: ProductForm — Fix 2-Column Grid on Portrait iPad

**Files:**
- Modify: `components/admin/product-form.tsx`

- [ ] **Step 1: Change the main grid breakpoint**

In `components/admin/product-form.tsx`, find line ~191:

```tsx
// BEFORE
<div className='grid md:grid-cols-2 gap-6'>
```

Change to:

```tsx
// AFTER
<div className='grid lg:grid-cols-2 gap-6'>
```

This is the only change in this task — the secondary grids for sale price and SEO fields (`grid md:grid-cols-2`) stay as-is since those contain smaller inputs that fit at 768px.

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/admin/products/new` at 768px. Confirm:
- Form shows as single column — "Tên sản phẩm", "Danh mục", "Giá gốc", "Chất liệu" stack vertically
- The switches (Sản phẩm nổi bật / Còn hàng) are fully visible, not cut off
- At 1024px landscape: two columns appear as before

- [ ] **Step 3: Commit**

```bash
git add components/admin/product-form.tsx
git commit -m "fix: product form single column on iPad portrait"
```

---

## Task 3: ImageUpload — Always-Visible Action Buttons

**Files:**
- Modify: `components/admin/image-upload.tsx`

- [ ] **Step 1: Remove hover-only opacity from Delete button**

Find the Delete button (~line 164):

```tsx
// BEFORE
className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
```

Change to:

```tsx
// AFTER
className="absolute top-2 right-2 h-7 w-7 p-0"
```

- [ ] **Step 2: Remove hover-only opacity from Set-as-main button**

Find the Star button (~line 174):

```tsx
// BEFORE
className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
```

Change to:

```tsx
// AFTER
className="absolute top-2 left-2 h-7 w-7 p-0"
```

- [ ] **Step 3: Verify in browser**

Open any product edit page with images. Confirm:
- Red X button (delete) is visible on every image thumbnail without needing hover
- Star button (set as main) is visible on non-primary images without needing hover
- Both buttons still work (click/tap to delete or promote)

- [ ] **Step 4: Commit**

```bash
git add components/admin/image-upload.tsx
git commit -m "fix: image upload action buttons always visible on touch devices"
```

---

## Task 4: ProductsTable — Horizontal Scroll + Larger Touch Targets

**Files:**
- Modify: `components/admin/products-table.tsx`

- [ ] **Step 1: Add overflow-x-auto to table wrapper**

Find (~line 72):

```tsx
// BEFORE
<div className="rounded-lg border">
  <Table>
```

Change to:

```tsx
// AFTER
<div className="rounded-lg border overflow-x-auto">
  <Table>
```

- [ ] **Step 2: Increase Eye and Edit button touch targets**

Find the action buttons (~lines 129-141):

```tsx
// BEFORE
<Button variant="ghost" size="sm" asChild>
  <Link href={`/products/${product.id}`}>
    <Eye className="w-4 h-4" />
  </Link>
</Button>
<Button variant="ghost" size="sm" asChild>
  <Link href={`/admin/products/${product.id}/edit`}>
    <Edit className="w-4 h-4" />
  </Link>
</Button>
```

Change to:

```tsx
// AFTER
<Button variant="ghost" size="icon" className="h-10 w-10" asChild>
  <Link href={`/products/${product.id}`}>
    <Eye className="w-4 h-4" />
  </Link>
</Button>
<Button variant="ghost" size="icon" className="h-10 w-10" asChild>
  <Link href={`/admin/products/${product.id}/edit`}>
    <Edit className="w-4 h-4" />
  </Link>
</Button>
```

- [ ] **Step 3: Verify in browser**

Open `http://localhost:3000/admin/products` at 768px. Confirm:
- Table scrolls horizontally instead of overflowing the page
- Eye, Edit buttons are visibly larger and easier to tap

- [ ] **Step 4: Commit**

```bash
git add components/admin/products-table.tsx
git commit -m "fix: products table horizontal scroll and larger touch targets"
```

---

## Task 5: DeleteProductButton — Larger Touch Target

**Files:**
- Modify: `components/admin/delete-product-button.tsx`

- [ ] **Step 1: Update trigger button size**

Find (~line 81):

```tsx
// BEFORE
<Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
  <Trash2 className="w-4 h-4" />
</Button>
```

Change to:

```tsx
// AFTER
<Button variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:text-destructive">
  <Trash2 className="w-4 h-4" />
</Button>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/admin/products` at 768px. Confirm:
- Delete (trash) button in the table is the same size as Eye and Edit buttons
- Tapping it opens the confirmation dialog as before

- [ ] **Step 3: Commit**

```bash
git add components/admin/delete-product-button.tsx
git commit -m "fix: delete product button larger touch target"
```

---

## Task 6: FeedbacksManager — Larger Touch Targets

**Files:**
- Modify: `components/admin/feedbacks-manager.tsx`

- [ ] **Step 1: Update Edit and Delete button sizes in SortableItem**

Find the action buttons inside `SortableItem` (~lines 92-97):

```tsx
// BEFORE
<Button size="sm" variant="outline" onClick={() => onEdit(item)} disabled={disabled}>
  <Edit className="w-4 h-4" />
</Button>
<Button size="sm" variant="outline" onClick={() => onDelete(item.id)} disabled={disabled}>
  <Trash2 className="w-4 h-4" />
</Button>
```

Change to:

```tsx
// AFTER
<Button size="icon" variant="outline" className="h-10 w-10" onClick={() => onEdit(item)} disabled={disabled}>
  <Edit className="w-4 h-4" />
</Button>
<Button size="icon" variant="outline" className="h-10 w-10" onClick={() => onDelete(item.id)} disabled={disabled}>
  <Trash2 className="w-4 h-4" />
</Button>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/admin/feedbacks` at 768px. Confirm Edit and Delete buttons are larger and easier to tap.

- [ ] **Step 3: Commit**

```bash
git add components/admin/feedbacks-manager.tsx
git commit -m "fix: feedbacks manager larger touch targets"
```

---

## Task 7: AboutImagesManager — Larger Touch Targets

**Files:**
- Modify: `components/admin/about-images-manager.tsx`

- [ ] **Step 1: Update Edit and Delete button sizes**

Find the action buttons (~lines 304-319):

```tsx
// BEFORE
<Button
  size="sm"
  variant="outline"
  onClick={() => handleEdit(image)}
  disabled={editingId !== null || isAdding}
>
  <Edit className="w-4 h-4" />
</Button>
<Button
  size="sm"
  variant="outline"
  onClick={() => handleDelete(image.id)}
  disabled={editingId !== null || isAdding}
>
  <Trash2 className="w-4 h-4" />
</Button>
```

Change to:

```tsx
// AFTER
<Button
  size="icon"
  variant="outline"
  className="h-10 w-10"
  onClick={() => handleEdit(image)}
  disabled={editingId !== null || isAdding}
>
  <Edit className="w-4 h-4" />
</Button>
<Button
  size="icon"
  variant="outline"
  className="h-10 w-10"
  onClick={() => handleDelete(image.id)}
  disabled={editingId !== null || isAdding}
>
  <Trash2 className="w-4 h-4" />
</Button>
```

- [ ] **Step 2: Verify in browser**

Open `http://localhost:3000/admin/about-images` at 768px. Confirm Edit and Delete buttons are larger and easier to tap.

- [ ] **Step 3: Commit**

```bash
git add components/admin/about-images-manager.tsx
git commit -m "fix: about images manager larger touch targets"
```

---

## Final Check

- [ ] Test all 6 admin pages at 768px (portrait) and 1024px (landscape):
  - `/admin` — dashboard stats, quick actions
  - `/admin/products` — table scrolls, action buttons usable
  - `/admin/products/new` — form single column at portrait, no overflow
  - `/admin/categories` — category list, icon picker
  - `/admin/about-images` — list with edit/delete buttons
  - `/admin/feedbacks` — drag-reorder list with edit/delete buttons
