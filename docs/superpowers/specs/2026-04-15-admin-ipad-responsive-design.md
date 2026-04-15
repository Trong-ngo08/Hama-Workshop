# Admin iPad Responsive Design

**Date:** 2026-04-15  
**Scope:** Admin panel responsive fixes for iPad (portrait 768px / landscape 1024px)  
**Goal:** Fix broken layouts and inaccessible touch interactions across all admin pages

---

## Problem Summary

The admin panel is used exclusively on iPad. Five concrete issues were found:

| # | Location | Issue | Severity |
|---|----------|-------|----------|
| 1 | `AdminHeader` | Nav uses `hidden md:flex` — 6 items + logo + 2 buttons overflow at 768px, "Đăng xuất" gets clipped | Critical |
| 2 | `ProductForm` | `grid md:grid-cols-2` — right column (switches) cut off at 768px portrait | Critical |
| 3 | `ImageUpload` | Delete and "Set as main" buttons use `opacity-0 group-hover:opacity-100` — permanently hidden on touch, images cannot be deleted or reordered | Critical |
| 4 | `ProductsTable` | No `overflow-x-auto` — 7-column table overflows horizontally on portrait | Medium |
| 5 | Icon buttons | `size="sm"` ≈ 32px in Eye/Edit/Delete actions — below 44px Apple touch target minimum | Medium |

---

## Target Devices

- **iPad portrait:** 768px viewport width (`md` breakpoint)
- **iPad landscape:** 1024px viewport width (`lg` breakpoint)
- Both orientations must work correctly

---

## Fix 1 — AdminHeader: Hamburger Drawer

**File:** `components/admin/admin-header.tsx`

### Current behavior
Nav uses `hidden md:flex` — shows at 768px but all items overflow in one row.

### New behavior
- Nav changes to `hidden lg:flex` — only shows full horizontal nav at 1024px+ (iPad landscape / desktop)
- A hamburger button `flex lg:hidden` appears at md and below
- Tapping hamburger opens a `Sheet` (already in `components/ui/sheet.tsx`) sliding from the right
- Sheet contents:
  - Logo row at top
  - Nav items as full-width vertical list (icon + label, `py-3 px-4` for 48px+ touch targets)
  - Divider
  - "Xem trang chủ" link
  - "Đăng xuất" button
- Active nav item highlighted same as desktop (text-primary)
- Sheet closes on nav item tap (using `useRouter` + `onOpenChange`)

### What stays the same
- Desktop (lg+): header looks and works identically to today
- Logo, "Xem trang chủ", logout button remain in header at all sizes

---

## Fix 2 — ProductForm: Grid Breakpoint

**File:** `components/admin/product-form.tsx`

### Change
Main two-column layout: `grid md:grid-cols-2 gap-6` → `grid lg:grid-cols-2 gap-6`

### Result
- **768px portrait:** Single column, all fields stack vertically, no overflow
- **1024px landscape:** Two columns as before (Basic Info left, Additional Info right)

### Unchanged
Secondary grids inside the form (sale price row, SEO keywords/slug row) keep `md:grid-cols-2` — these contain small inputs that fit comfortably at 768px.

---

## Fix 3 — ImageUpload: Always-visible Action Buttons

**File:** `components/admin/image-upload.tsx`

### Current behavior
Delete (X) and Set-as-main (Star) buttons have class `opacity-0 group-hover:opacity-100` — invisible on touch devices.

### New behavior
Remove `opacity-0 group-hover:opacity-100 transition-opacity` from both buttons. Buttons are always visible.

Visual adjustment to avoid clutter: buttons remain small (`h-7 w-7`) and positioned at corners of the image — they are unobtrusive but always accessible.

No behavior change — same click handlers, same logic.

---

## Fix 4 — ProductsTable: Horizontal Scroll

**File:** `components/admin/products-table.tsx`

### Change
Wrap `<Table>` in `<div className="overflow-x-auto">`.

### Result
On portrait iPad, table scrolls horizontally rather than overflowing the page. All 7 columns remain intact — no columns hidden or removed.

---

## Fix 5 — Touch Targets: Icon Buttons

**Files:** `components/admin/products-table.tsx`, `components/admin/feedbacks-manager.tsx`, `components/admin/about-images-manager.tsx`

### Change
Icon-only action buttons: `size="sm"` → `size="icon"` with explicit `className="h-10 w-10"` (40px, close to Apple's 44px guideline).

Affected buttons:
- ProductsTable: Eye (view), Edit, Delete — 3 buttons per row
- FeedbacksManager: Edit, Delete — 2 buttons per item
- AboutImagesManager: Edit, Delete — 2 buttons per item (same pattern as feedbacks)

The `DeleteProductButton` component wraps its own button — it should also receive the same size treatment.

---

## Files to Change

| File | Changes |
|------|---------|
| `components/admin/admin-header.tsx` | Nav `hidden lg:flex`, add hamburger + Sheet drawer |
| `components/admin/product-form.tsx` | Main grid `lg:grid-cols-2` |
| `components/admin/image-upload.tsx` | Remove `opacity-0 group-hover:opacity-100` from action buttons |
| `components/admin/products-table.tsx` | `overflow-x-auto` wrapper, larger icon buttons |
| `components/admin/feedbacks-manager.tsx` | Larger icon buttons |
| `components/admin/about-images-manager.tsx` | Larger icon buttons |
| `components/admin/delete-product-button.tsx` | Larger button size |

---

## Out of Scope

- No changes to public-facing pages
- No changes to auth/login page
- No sidebar nav redesign
- No changes to data fetching or API logic
- Drag-and-drop reordering in FeedbacksManager uses `PointerSensor` which supports touch natively — no change needed
