# Feedbacks Page Redesign

**Date:** 2026-04-15
**Status:** Approved

## Overview

Redesign the public `/feedbacks` page and admin feedbacks manager to better showcase customer testimonials. Key changes: multi-image support per feedback, horizontal card layout, click-to-gallery modal, simplified admin image upload.

## Goals

- Differentiate feedbacks page from product page visually
- Balance image showcase and quote readability equally
- Support multiple images per feedback (DB + UI)
- Simplify admin UX: upload-only, no URL input

## Data Model

### New table: `feedback_images`

```sql
CREATE TABLE feedback_images (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Migration

- Copy existing `feedbacks.image_url` → insert into `feedback_images` for each existing feedback
- Make `feedbacks.image_url` nullable (ALTER COLUMN)
- Remove `feedbacks_layout` key from `site_settings` (no longer needed)

### Cover image logic

The first image by `display_order` in `feedback_images` is the cover image shown in the card. If no images exist, show a placeholder.

## Public Page (`/feedbacks`)

### Layout

- Remove layout switcher (grid/masonry/slider) entirely
- Single column, full width, max-width ~780px centered
- Cards stacked vertically with consistent gap

### Feedback Card

Horizontal layout:
- **Left:** Cover image (fixed width ~200px, full card height, `object-cover`). Badge "📷 N" overlaid bottom-right when N > 1.
- **Right:** Large opening quote mark (`"`) in brand color, italic quote text (4-line clamp), thumbnail strip (up to 3 thumbs + "+N" overflow) when multiple images exist, customer name + "Xem N ảnh" hint at bottom.
- Hover: subtle lift + shadow increase
- Click anywhere on card → opens modal

### Feedback Modal

Dark background overlay. Two-panel layout:
- **Left panel:** Main image display. Thumbnail strip at bottom (click to switch). Navigation arrows for prev/next image.
- **Right panel:** Full quote (no clamp), customer name, image count.
- Close on backdrop click or × button.
- Modal scoped to one feedback's images only (not cross-feedback navigation).

### Data Fetching

Single query joining `feedbacks` with `feedback_images`:

```ts
supabase
  .from('feedbacks')
  .select('*, feedback_images(id, image_url, display_order)')
  .eq('is_active', true)
  .order('display_order', { ascending: true })
```

Images ordered by `display_order` on the client.

## Admin (`/admin/feedbacks`)

### Form changes

- Replace single image input (URL field + upload button) with **ImageManager component**
- ImageManager shows:
  - Upload button (multi-file select, `accept="image/*"`, `multiple`)
  - Grid of uploaded image thumbnails, each with a × delete button
  - First thumbnail is the cover (indicated by a small "Bìa" badge)
  - Drag to reorder (reuses existing @dnd-kit already in project)
- No URL input field — upload only

### Save flow

When saving a feedback (create or update):
1. Save feedback row to `feedbacks`
2. Upload any new images to Supabase Storage → get URLs
3. Insert new records into `feedback_images` with correct `feedback_id`
4. Delete removed images from `feedback_images` and Supabase Storage

### List view

Each feedback row in the sortable list shows a small thumbnail of the cover image (first from `feedback_images`), or placeholder if none.

### Layout switcher

Remove the grid/masonry/slider layout picker from admin UI entirely.

## Components

### New / modified public components

| Component | Action | Notes |
|---|---|---|
| `components/feedbacks/feedback-card.tsx` | New | Horizontal card, accepts `feedback` with `images[]` |
| `components/feedbacks/feedback-modal.tsx` | New | Dark modal with image gallery + quote panel |
| `app/feedbacks/page.tsx` | Modify | Remove layout switch, use single column with `FeedbackCard` |
| `components/feedbacks/feedback-grid.tsx` | Delete | No longer needed |
| `components/feedbacks/feedback-masonry.tsx` | Delete | No longer needed |
| `components/feedbacks/feedback-slider.tsx` | Delete | No longer needed |

### New / modified admin components

| Component | Action | Notes |
|---|---|---|
| `components/admin/feedback-image-manager.tsx` | New | Multi-image upload/delete/reorder |
| `components/admin/feedbacks-manager.tsx` | Modify | Integrate ImageManager, remove layout switcher, update save/delete logic |

### Shared types

Add `FeedbackImage` and update `FeedbackItem`:

```ts
interface FeedbackImage {
  id: number
  feedback_id: number
  image_url: string
  display_order: number
}

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  display_order: number
  is_active: boolean
  feedback_images: FeedbackImage[]
}
```

## Migration Script

New file: `scripts/019_feedback_images.sql`

```sql
-- Create feedback_images table
CREATE TABLE IF NOT EXISTS feedback_images (
  id SERIAL PRIMARY KEY,
  feedback_id INTEGER REFERENCES feedbacks(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Migrate existing image_url data
INSERT INTO feedback_images (feedback_id, image_url, display_order)
SELECT id, image_url, 0
FROM feedbacks
WHERE image_url IS NOT NULL AND image_url != '';

-- Make image_url nullable
ALTER TABLE feedbacks ALTER COLUMN image_url DROP NOT NULL;

-- Remove feedbacks_layout setting
DELETE FROM site_settings WHERE key = 'feedbacks_layout';
```

## Out of Scope

- Star ratings
- Linking feedbacks to specific products
- Stats bar ("50+ khách hài lòng")
- Featured/pinned feedback concept
