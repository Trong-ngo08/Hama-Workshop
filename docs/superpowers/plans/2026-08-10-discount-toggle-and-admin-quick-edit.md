# Discount Toggle + Card Hover Image + Admin Quick Edit — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a site-wide discount on/off switch, hover-to-second-image on product cards, and a "Giá đã giảm" column with inline row editing in the admin products table.

**Architecture:** The discount switch lives as a single row in the existing `site_settings` key/value table. Server components read it and strip `sale_price` / `discount_percentage` from product objects *before* passing them to presentation components, so `product-card.tsx` and `ProductPageClient.tsx` need no discount-awareness. The hover image is pure CSS layered on the existing `group-hover` structure, keeping `ProductCard` a server component. Admin inline editing is local state inside the existing client component `products-table.tsx`, writing through the supabase browser client exactly like every other admin mutation in this codebase.

**Tech Stack:** Next.js 14 App Router, React 19, TypeScript, Tailwind CSS 4, Radix UI (`components/ui/`), Supabase (`@supabase/ssr`), `sonner` for toasts, `lucide-react` for icons.

**Spec:** `docs/superpowers/specs/2026-08-10-discount-toggle-and-admin-quick-edit-design.md`

## Global Constraints

- **No test runner exists in this project.** `CLAUDE.md` states there are no test commands. Every task is verified by `npm run lint`, `npm run build`, and explicit manual browser checks. Do not add a test framework as part of this work.
- **All user-facing copy is Vietnamese.** Match the tone of existing strings (e.g. "Tìm kiếm sản phẩm...", "Đang hiện", "Còn hàng").
- **Admin writes go through the supabase browser client** (`createClient()` from `lib/supabase/client.ts`) followed by `router.refresh()`. Do not introduce server actions or API routes.
- **Server reads go through `lib/supabase/server.ts`** (`await createClient()` — it is async).
- **SQL migrations are numbered files in `scripts/`.** Next free number is `021`. They are run by hand in the Supabase SQL editor; nothing in the app executes them.
- **TypeScript build errors do not block builds** (`next.config.mjs` sets `typescript.ignoreBuildErrors: true`). This means a type error will NOT fail `npm run build` — check types by reading carefully, not by trusting the build.
- Code style in this repo: single quotes, no semicolons, 2-space indent. Match the file you are editing.

---

## File Structure

| File | Status | Responsibility |
|---|---|---|
| `scripts/021_seed_discount_setting.sql` | Create | Seeds the `discounts_enabled` row |
| `lib/settings-keys.ts` | Create | Plain string constants shared by server and client code (no imports, so it is safe in a client bundle) |
| `lib/settings.ts` | Create | Server-only reader for site settings |
| `lib/pricing.ts` | Create | Discount math + stripping discounts from product objects |
| `components/admin/discount-setting-card.tsx` | Create | Client card with the discount switch |
| `app/admin/settings/page.tsx` | Modify | Replace "Coming Soon" with real settings |
| `app/page.tsx` | Modify | Strip discounts from featured products when off |
| `app/products/page.tsx` | Modify | Strip discounts from the product list when off |
| `app/products/[id]/page.tsx` | Modify | Strip discounts from the single product when off |
| `app/globals.css` | Modify | Mobile alt-image cross-fade keyframes |
| `components/product-card.tsx` | Modify | Second image layer + `index` prop |
| `components/admin/products-table.tsx` | Modify | Sale price column, visibility switch, inline row edit |
| `components/admin/product-form.tsx` | Modify | Derive `discount_percentage` instead of hand-typing it |

---

### Task 1: Discount setting — storage, reader, and admin switch

Delivers a working switch in the admin that persists across reloads. The storefront is not wired up yet — that is Task 2.

**Files:**
- Create: `scripts/021_seed_discount_setting.sql`
- Create: `lib/settings-keys.ts`
- Create: `lib/settings.ts`
- Create: `lib/pricing.ts`
- Create: `components/admin/discount-setting-card.tsx`
- Modify: `app/admin/settings/page.tsx` (whole file replaced)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `DISCOUNTS_ENABLED_KEY: string` from `lib/settings-keys.ts`
  - `getDiscountsEnabled(): Promise<boolean>` from `lib/settings.ts`
  - `computeDiscountPercentage(price: number, salePrice: number | null): number | null` from `lib/pricing.ts`
  - `applyDiscountSetting<T>(products: T[], enabled: boolean): T[]` from `lib/pricing.ts`
  - `applyDiscountSettingToOne<T>(product: T, enabled: boolean): T` from `lib/pricing.ts`

- [ ] **Step 1: Write the migration script**

Create `scripts/021_seed_discount_setting.sql`:

```sql
-- Site-wide discount switch. When 'false', the storefront shows only original
-- prices; per-product sale_price values stay in the database untouched.
INSERT INTO site_settings (key, value)
VALUES ('discounts_enabled', 'true')
ON CONFLICT (key) DO NOTHING;
```

- [ ] **Step 2: Run the migration in Supabase**

Open the Supabase SQL editor for this project, paste the contents of `scripts/021_seed_discount_setting.sql`, and run it.

Then verify with:

```sql
SELECT key, value FROM site_settings WHERE key = 'discounts_enabled';
```

Expected: exactly one row, `discounts_enabled | true`.

If the query errors with `relation "site_settings" does not exist`, run `scripts/018_create_feedbacks_and_settings.sql` first, then retry.

- [ ] **Step 3: Create the shared key constant**

Create `lib/settings-keys.ts`:

```ts
// Plain constants shared by server and client code. Keep this file free of
// imports — `lib/settings.ts` pulls in `next/headers`, which cannot be bundled
// into a client component.
export const DISCOUNTS_ENABLED_KEY = 'discounts_enabled'
```

- [ ] **Step 4: Create the server-side reader**

Create `lib/settings.ts`:

```ts
import { DISCOUNTS_ENABLED_KEY } from '@/lib/settings-keys'
import { createClient } from '@/lib/supabase/server'

/**
 * Reads the site-wide discount switch.
 *
 * Defaults to `true` on any failure or missing row: if the database is
 * unreachable we keep the existing behaviour (discounts shown) rather than
 * silently charging customers full price.
 */
export async function getDiscountsEnabled(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', DISCOUNTS_ENABLED_KEY)
      .maybeSingle()

    if (error) {
      console.error('[settings] discounts_enabled read error:', error)
      return true
    }

    if (!data) return true

    return data.value !== 'false'
  } catch (error) {
    console.error('[settings] discounts_enabled connection error:', error)
    return true
  }
}
```

- [ ] **Step 5: Create the pricing helpers**

Create `lib/pricing.ts`:

```ts
interface Discountable {
  price?: number | null
  sale_price?: number | null
  discount_percentage?: number | null
}

/**
 * Sale price is the single source of truth. The percentage badge is always
 * derived from it, never typed by hand.
 *
 * Returns null when there is no valid discount to show.
 */
export function computeDiscountPercentage(
  price: number,
  salePrice: number | null
): number | null {
  if (salePrice === null) return null
  if (!Number.isFinite(price) || price <= 0) return null
  if (!Number.isFinite(salePrice) || salePrice <= 0) return null
  if (salePrice >= price) return null

  return Math.round(((price - salePrice) / price) * 100)
}

/**
 * Blanks out the discount fields when the site-wide switch is off, so
 * presentation components fall through to their "no sale" branch without
 * knowing the setting exists. Database values are untouched.
 */
export function applyDiscountSettingToOne<T extends Discountable>(
  product: T,
  enabled: boolean
): T {
  if (enabled) return product
  // The cast is needed because TypeScript cannot prove a spread still
  // satisfies the generic T. The shape is unchanged — only two values differ.
  return { ...product, sale_price: null, discount_percentage: null } as T
}

export function applyDiscountSetting<T extends Discountable>(
  products: T[],
  enabled: boolean
): T[] {
  if (enabled) return products
  return products.map((product) => applyDiscountSettingToOne(product, false))
}
```

- [ ] **Step 6: Create the admin switch card**

Create `components/admin/discount-setting-card.tsx`:

```tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DISCOUNTS_ENABLED_KEY } from '@/lib/settings-keys'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DiscountSettingCardProps {
  initialEnabled: boolean
}

export function DiscountSettingCard({ initialEnabled }: DiscountSettingCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = async (checked: boolean) => {
    const previous = enabled
    setEnabled(checked)
    setIsSaving(true)

    const { error } = await supabase.from('site_settings').upsert(
      {
        key: DISCOUNTS_ENABLED_KEY,
        value: checked ? 'true' : 'false',
        updated_at: new Date().toISOString()
      },
      { onConflict: 'key' }
    )

    setIsSaving(false)

    if (error) {
      setEnabled(previous)
      console.error('[settings] discount toggle error:', error)
      toast.error('Không lưu được cài đặt. Thử lại nhé.')
      return
    }

    toast.success(
      checked
        ? 'Đã bật giảm giá toàn site'
        : 'Đã tắt giảm giá, khách chỉ thấy giá gốc'
    )
    router.refresh()
  }

  return (
    <Card className='border border-border tech-shadow'>
      <CardHeader>
        <CardTitle className='text-foreground'>Khuyến mãi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between gap-6'>
          <div className='space-y-1'>
            <Label htmlFor='discounts_enabled' className='text-base'>
              Bật giảm giá toàn site
            </Label>
            <p className='text-sm text-muted-foreground max-w-md leading-relaxed'>
              {enabled
                ? 'Giá khuyến mãi đang được áp dụng cho khách.'
                : 'Khách chỉ thấy giá gốc. Giá khuyến mãi đã set vẫn được lưu, bật lại là hiện.'}
            </p>
          </div>
          <Switch
            id='discounts_enabled'
            checked={enabled}
            disabled={isSaving}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 7: Rewrite the settings page**

Replace the entire contents of `app/admin/settings/page.tsx`:

```tsx
import { DiscountSettingCard } from '@/components/admin/discount-setting-card'
import { getDiscountsEnabled } from '@/lib/settings'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const discountsEnabled = await getDiscountsEnabled()

  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold flex items-center gap-2 text-foreground'>
          <Settings className='w-6 h-6' />
          Cài đặt hệ thống
        </h1>
        <p className='text-muted-foreground'>Cấu hình và quản lý hệ thống</p>
      </div>

      <DiscountSettingCard initialEnabled={discountsEnabled} />
    </div>
  )
}
```

- [ ] **Step 8: Verify in the browser**

Run: `npm run dev`

1. Log in and open http://localhost:3000/admin/settings
2. Expected: a "Khuyến mãi" card with the switch **on**, description reads "Giá khuyến mãi đang được áp dụng cho khách."
3. Turn the switch off. Expected: green toast "Đã tắt giảm giá, khách chỉ thấy giá gốc", description text changes.
4. Hard-reload the page (Ctrl+Shift+R). Expected: switch is still **off**.
5. Confirm in Supabase: `SELECT value FROM site_settings WHERE key = 'discounts_enabled';` → `false`.
6. Turn it back **on** and reload once more to confirm it sticks.

If step 3 shows a red error toast, the `site_settings` table is rejecting the write — check whether RLS is enabled on it (`SELECT relrowsecurity FROM pg_class WHERE relname = 'site_settings';`). If it returns `t`, add a permissive policy in a new `scripts/022_site_settings_policies.sql` mirroring the style of `scripts/009_fix_product_policies.sql`, and note it in the commit.

- [ ] **Step 9: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 10: Commit**

```bash
git add scripts/021_seed_discount_setting.sql lib/settings-keys.ts lib/settings.ts lib/pricing.ts components/admin/discount-setting-card.tsx app/admin/settings/page.tsx
git commit -m "feat(settings): add site-wide discount toggle"
```

---

### Task 2: Wire the discount switch into the storefront

**Files:**
- Modify: `app/page.tsx` (featured products grid)
- Modify: `app/products/page.tsx` (product list)
- Modify: `app/products/[id]/page.tsx` (single product)

**Interfaces:**
- Consumes: `getDiscountsEnabled()` from `lib/settings.ts`; `applyDiscountSetting` and `applyDiscountSettingToOne` from `lib/pricing.ts` (Task 1).
- Produces: nothing new. `components/product-card.tsx` and `ProductPageClient.tsx` are deliberately NOT modified.

- [ ] **Step 1: Wire the home page**

In `app/page.tsx`, add to the imports:

```tsx
import { applyDiscountSetting } from '@/lib/pricing'
import { getDiscountsEnabled } from '@/lib/settings'
```

Inside `HomePage`, after the existing `Promise.all([...])` destructuring (around line 78-90), add:

```tsx
  const discountsEnabled = await getDiscountsEnabled()
  const featured = applyDiscountSetting(featuredProducts ?? [], discountsEnabled)
```

Then at the featured grid (around line 242), change:

```tsx
              {(featuredProducts ?? []).map((product, i) => (
```

to:

```tsx
              {featured.map((product, i) => (
```

- [ ] **Step 2: Wire the products list page**

In `app/products/page.tsx`, add to the imports:

```tsx
import { applyDiscountSetting } from '@/lib/pricing'
import { getDiscountsEnabled } from '@/lib/settings'
```

Inside the existing `else` branch, the code currently ends with:

```tsx
        products = (data || []).map((p) => ({
          ...p,
          categories: ((p.product_categories as any[]) || [])
            .map((pc: any) => pc.categories?.name)
            .filter(Boolean)
        }))
        totalCount = count || 0
```

Change the assignment to strip discounts:

```tsx
        const discountsEnabled = await getDiscountsEnabled()
        products = applyDiscountSetting(
          (data || []).map((p) => ({
            ...p,
            categories: ((p.product_categories as any[]) || [])
              .map((pc: any) => pc.categories?.name)
              .filter(Boolean)
          })),
          discountsEnabled
        )
        totalCount = count || 0
```

- [ ] **Step 3: Wire the product detail page**

In `app/products/[id]/page.tsx`, add to the imports:

```tsx
import { applyDiscountSettingToOne } from '@/lib/pricing'
import { getDiscountsEnabled } from '@/lib/settings'
```

In `ProductPage` (the default export, NOT `generateMetadata`), after the `if (!product || product.is_visible === false) notFound()` line, add:

```tsx
  const discountsEnabled = await getDiscountsEnabled()
  const visibleProduct = applyDiscountSettingToOne(product, discountsEnabled)
```

Then change the render from `product={product}` to:

```tsx
    <ProductPageClient
      product={visibleProduct}
      relatedProducts={relatedProducts || []}
    />
```

Leave `generateMetadata` alone — the switch is a display concern and metadata does not render prices.

`relatedProducts` also needs no change: its `select` does not fetch `sale_price` or `discount_percentage` at all, so those cards already only ever show the original price. That is pre-existing behaviour and out of scope here.

- [ ] **Step 4: Verify with the switch ON**

Run: `npm run dev`

Pick a product that has a `sale_price` set (find one via `SELECT id, name, price, sale_price FROM products WHERE sale_price IS NOT NULL LIMIT 3;`). Make sure the switch at `/admin/settings` is **on**.

Check all three surfaces:
1. http://localhost:3000/ — if the product is featured, its card shows the sale price on top, original price struck through
2. http://localhost:3000/products — same card treatment in the list
3. http://localhost:3000/products/<id> — sale price plus the `-x%` badge

- [ ] **Step 5: Verify with the switch OFF**

Turn the switch **off** at `/admin/settings`, then reload each of the three pages above.

Expected on all three: **only the original price**. No struck-through price, no `-x%` badge. A product that never had a sale price looks identical either way.

Confirm the data survived: `SELECT sale_price, discount_percentage FROM products WHERE id = '<id>';` → values unchanged.

Turn the switch back **on** and confirm the sale prices return.

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add app/page.tsx app/products/page.tsx "app/products/[id]/page.tsx"
git commit -m "feat(storefront): honour site-wide discount toggle"
```

---

### Task 3: Product card shows the second image

**Files:**
- Modify: `components/product-card.tsx`
- Modify: `app/globals.css` (add keyframes near the existing animation block, ~line 190)
- Modify: `app/page.tsx` (pass `index`)
- Modify: `app/products/page.tsx` (pass `index`)

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: `ProductCard` gains an optional prop `index?: number` (defaults to `0`).

- [ ] **Step 1: Add the mobile cross-fade keyframes**

In `app/globals.css`, immediately after the `.animate-marquee { ... }` rule (around line 200, before the `/* Stagger delay helpers */` comment), add:

```css
/* ── Product card alt image (mobile auto-swap) ───────────────── */
/* Touch devices have no hover, so the second image cross-fades on a loop.
   Cards stagger via an inline animation-delay so they don't blink in unison. */
@media (hover: none) {
  @keyframes altImageCycle {
    0%, 42%   { opacity: 0; }
    50%, 92%  { opacity: 1; }
    100%      { opacity: 0; }
  }
  .card-alt-image {
    animation: altImageCycle 5s ease-in-out infinite;
  }
}

@media (prefers-reduced-motion: reduce) {
  .card-alt-image {
    animation: none;
  }
}
```

- [ ] **Step 2: Add the second image layer to the card**

In `components/product-card.tsx`:

Add `index` to the props interface:

```tsx
interface ProductCardProps {
  product: Product
  priority?: boolean
  index?: number
}
```

Change the signature:

```tsx
export function ProductCard({ product, priority = false, index = 0 }: ProductCardProps) {
```

Delete the stray debug line at the top of the function:

```tsx
  console.log('🚀 ~ ProductCard ~ product:', product)
```

Add below `formatPrice`:

```tsx
  const secondImage = product.images?.[1]
```

Replace the image container block (currently lines 44-59, from `<div className='aspect-[4/5] ...'>` through its closing `</div>`) with:

```tsx
        <div className='aspect-[4/5] overflow-hidden bg-muted relative'>
          <Image
            src={product.images[0] || '/placeholder.svg?height=400&width=320'}
            alt={product.name}
            width={320}
            height={400}
            sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
            priority={priority}
            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-700'
          />
          {secondImage && (
            <Image
              src={secondImage}
              alt={`${product.name} — ảnh 2`}
              width={320}
              height={400}
              sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
              className='card-alt-image absolute inset-0 object-cover w-full h-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110'
              style={{ animationDelay: `${(index % 4) * 1.2}s` }}
            />
          )}
          <div className='absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center'>
            <span className='bg-background text-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
              Xem chi tiết
            </span>
          </div>
        </div>
```

Three details that matter: the container gains `relative` so the absolutely-positioned second image anchors to it; the second image uses `transition-all` rather than stacking `transition-opacity` and `transition-transform` (two `transition-*` utilities on one element cancel each other out — the last one in Tailwind's generated CSS wins, not the last one you typed); and the second image is never given `priority`, so it cannot compete with the LCP image for bandwidth.

- [ ] **Step 3: Pass the index from both callers**

In `app/page.tsx` (around line 244), change:

```tsx
                  <ProductCard product={product} priority={i < 3} />
```

to:

```tsx
                  <ProductCard product={product} priority={i < 3} index={i} />
```

In `app/products/page.tsx`, change:

```tsx
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={index < 3}
                        />
```

to:

```tsx
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={index < 3}
                          index={index}
                        />
```

- [ ] **Step 4: Verify on desktop**

Run: `npm run dev`

First make sure a test product has at least 2 images (check with `SELECT id, name, array_length(images, 1) FROM products ORDER BY array_length(images, 1) DESC NULLS LAST LIMIT 5;`). If none has 2, upload a second image to one product via `/admin/products/<id>/edit`.

1. Open http://localhost:3000/products
2. Hover a card with 2+ images. Expected: it cross-fades to the second image over ~0.5s, the zoom and the "Xem chi tiết" overlay still work.
3. Move the mouse away. Expected: it fades back to the first image.
4. Hover a card with exactly 1 image. Expected: unchanged behaviour, no flicker, no broken image.

- [ ] **Step 5: Verify on mobile**

In Chrome DevTools, toggle device emulation (Ctrl+Shift+M) and pick a phone preset, then reload the page — `@media (hover: none)` only re-evaluates on reload in some cases.

1. Expected: cards with 2 images cycle between the two roughly every 5 seconds.
2. Expected: adjacent cards are visibly out of sync with each other, not blinking together.
3. Enable "Emulate CSS prefers-reduced-motion: reduce" in the DevTools Rendering panel and reload. Expected: no cycling, first image stays put.

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add components/product-card.tsx app/globals.css app/page.tsx app/products/page.tsx
git commit -m "feat(product-card): reveal second image on hover"
```

---

### Task 4: Admin table — "Giá đã giảm" column

**Files:**
- Modify: `components/admin/products-table.tsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces: the `Product` interface in `products-table.tsx` gains `sale_price?: number | null` and `discount_percentage?: number | null`.

No query change is needed — `app/admin/products/page.tsx` already does `select('*', ...)`, so both fields are present in the data at runtime.

- [ ] **Step 1: Extend the Product interface**

In `components/admin/products-table.tsx`, add two fields to the `Product` interface:

```tsx
interface Product {
  id: string
  name: string
  category: string
  categories?: string[]
  price: number
  sale_price?: number | null
  discount_percentage?: number | null
  is_featured: boolean
  is_available: boolean
  is_visible: boolean
  images: string[]
  created_at: string
}
```

- [ ] **Step 2: Add the column header**

In the `<TableHeader>`, add a header cell directly after `<TableHead>Giá</TableHead>`:

```tsx
              <TableHead>Giá đã giảm</TableHead>
```

- [ ] **Step 3: Add the column body cell**

Directly after the existing price cell:

```tsx
                    <TableCell className="font-semibold text-primary">{formatPrice(product.price)}</TableCell>
```

add:

```tsx
                    <TableCell>
                      {product.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{formatPrice(product.sale_price)}</span>
                          {product.discount_percentage ? (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              -{product.discount_percentage}%
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
```

- [ ] **Step 4: Fix the empty-state colSpan**

The table now has 8 columns. Change:

```tsx
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
```

to:

```tsx
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
```

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev`, open http://localhost:3000/admin/products

1. Expected: a "Giá đã giảm" column between "Giá" and "Trạng thái".
2. A product with a sale price shows it plus a red `-x%` badge.
3. A product without one shows a grey `—`.
4. Type nonsense into the search box so no rows match. Expected: the "Không tìm thấy sản phẩm nào" row spans the full table width with no ragged edge.

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add components/admin/products-table.tsx
git commit -m "feat(admin): show sale price column in products table"
```

---

### Task 5: Admin table — visibility switch replaces the eye button

**Files:**
- Modify: `components/admin/products-table.tsx`

**Interfaces:**
- Consumes: the `Product` interface from Task 4.
- Produces: nothing consumed by later tasks, but Task 6 edits the same actions cell — read this task's final markup before starting Task 6.

- [ ] **Step 1: Update imports**

In `components/admin/products-table.tsx`, replace the lucide import (`Eye` is no longer used):

```tsx
import { Edit, Search } from "lucide-react"
```

and add:

```tsx
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
```

- [ ] **Step 2: Add the optimistic visibility state**

Inside `ProductsTable`, below the existing `const [searchTerm, setSearchTerm] = useState("")`:

```tsx
  const router = useRouter()
  const supabase = createClient()

  // Optimistic overrides only. Anything not in here falls back to the prop, so
  // a router.refresh() bringing fresh rows never fights with stale local state.
  const [pendingVisibility, setPendingVisibility] = useState<Record<string, boolean>>({})

  const isProductVisible = (product: Product) =>
    pendingVisibility[product.id] ?? product.is_visible !== false

  const handleVisibilityChange = async (product: Product, checked: boolean) => {
    setPendingVisibility((prev) => ({ ...prev, [product.id]: checked }))

    const { error } = await supabase
      .from("products")
      .update({ is_visible: checked })
      .eq("id", product.id)

    if (error) {
      setPendingVisibility((prev) => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      console.error("[admin/products] visibility error:", error)
      toast.error("Không đổi được trạng thái hiển thị")
      return
    }

    toast.success(checked ? `Đã hiện "${product.name}"` : `Đã ẩn "${product.name}"`)
    router.refresh()
  }
```

- [ ] **Step 3: Read visibility from the helper in the status cell**

Inside the `.map()` callback, next to the existing `categoryList` const, add:

```tsx
                const visible = isProductVisible(product)
```

Then in the status cell, replace:

```tsx
                        <Badge variant={product.is_visible === false ? "secondary" : "outline"}>
                          {product.is_visible === false ? "Đang ẩn" : "Đang hiện"}
                        </Badge>
```

with:

```tsx
                        <Badge variant={visible ? "outline" : "secondary"}>
                          {visible ? "Đang hiện" : "Đang ẩn"}
                        </Badge>
```

- [ ] **Step 4: Swap the eye button for the switch**

In the actions cell, replace the eye button:

```tsx
                        <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                          <Link href={`/products/${product.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
```

with:

```tsx
                        <Switch
                          checked={visible}
                          onCheckedChange={(checked) => handleVisibilityChange(product, checked)}
                          aria-label={visible ? `Ẩn ${product.name}` : `Hiện ${product.name}`}
                        />
```

- [ ] **Step 5: Verify in the browser**

Run: `npm run dev`, open http://localhost:3000/admin/products

1. Expected: each row's actions column starts with a switch, no eye icon anywhere.
2. Toggle a visible product off. Expected: green toast `Đã ẩn "<tên>"`, and the status badge flips to "Đang ẩn" instantly.
3. Open http://localhost:3000/products in another tab. Expected: that product is gone from the public list.
4. Toggle it back on, reload the public list. Expected: it is back.
5. Reload the admin page. Expected: the switch positions match what you left them at.

To check the failure path: stop the dev server's network access by toggling DevTools "Offline" in the Network tab, then flip a switch. Expected: red toast "Không đổi được trạng thái hiển thị" and the switch snaps back to its previous position. Turn the network back on afterwards.

- [ ] **Step 6: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 7: Commit**

```bash
git add components/admin/products-table.tsx
git commit -m "feat(admin): toggle product visibility from the table"
```

---

### Task 6: Admin table — inline row editing

**Files:**
- Modify: `components/admin/products-table.tsx`

**Interfaces:**
- Consumes: `computeDiscountPercentage(price: number, salePrice: number | null): number | null` from `lib/pricing.ts` (Task 1); the `Product` interface from Task 4; `isProductVisible`, `router`, and `supabase` from Task 5.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Audit the data before changing how percentages are stored**

This task makes `sale_price` the sole source of truth for `discount_percentage`. Any row whose hand-typed percentage disagrees with its sale price will be overwritten the first time it is saved.

Run this in the Supabase SQL editor:

```sql
SELECT id, name, price, sale_price, discount_percentage,
       CASE WHEN sale_price IS NULL OR price IS NULL OR price = 0 THEN NULL
            ELSE ROUND((price - sale_price) / price * 100)::int END AS computed_percentage
FROM products
WHERE discount_percentage IS DISTINCT FROM (
  CASE WHEN sale_price IS NULL OR price IS NULL OR price = 0 THEN NULL
       ELSE ROUND((price - sale_price) / price * 100)::int END
);
```

**Stop and show the result to the user before continuing.** If it returns rows, they need to confirm those percentages are safe to recompute. Zero rows means there is nothing to lose — say so and carry on.

- [ ] **Step 2: Add the edit imports**

In `components/admin/products-table.tsx`, extend the lucide import:

```tsx
import { Check, Edit, Search, X } from "lucide-react"
```

and add:

```tsx
import { computeDiscountPercentage } from "@/lib/pricing"
import type React from "react"
```

- [ ] **Step 3: Add the edit state and handlers**

Below the visibility handlers added in Task 5, add:

```tsx
  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: "", price: "", sale_price: "" })

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setDraft({
      name: product.name,
      price: product.price?.toString() ?? "",
      sale_price: product.sale_price != null ? product.sale_price.toString() : "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({ name: "", price: "", sale_price: "" })
  }

  // Returns null and shows a toast when the draft is unusable, so the caller
  // can bail without the row leaving edit mode or losing what was typed.
  const validateDraft = () => {
    const name = draft.name.trim()
    if (!name) {
      toast.error("Tên sản phẩm không được để trống")
      return null
    }

    const price = Number(draft.price)
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Giá phải là số lớn hơn 0")
      return null
    }

    const rawSale = draft.sale_price.trim()
    if (rawSale === "") return { name, price, salePrice: null as number | null }

    const salePrice = Number(rawSale)
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      toast.error("Giá đã giảm phải lớn hơn 0")
      return null
    }
    if (salePrice >= price) {
      toast.error("Giá đã giảm phải nhỏ hơn giá gốc")
      return null
    }

    return { name, price, salePrice }
  }

  const saveEdit = async (productId: string) => {
    const valid = validateDraft()
    if (!valid) return

    setSavingId(productId)

    const { error } = await supabase
      .from("products")
      .update({
        name: valid.name,
        price: valid.price,
        sale_price: valid.salePrice,
        discount_percentage: computeDiscountPercentage(valid.price, valid.salePrice),
      })
      .eq("id", productId)

    setSavingId(null)

    if (error) {
      console.error("[admin/products] quick edit error:", error)
      toast.error("Lưu thất bại. Thử lại nhé.")
      return
    }

    toast.success("Đã lưu")
    cancelEdit()
    router.refresh()
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit(productId)
    }
    if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
  }
```

- [ ] **Step 4: Cancel the edit when the search box changes**

A filtered-out row must not stay in edit mode invisibly. Change the search input's handler:

```tsx
            onChange={(e) => setSearchTerm(e.target.value)}
```

to:

```tsx
            onChange={(e) => {
              cancelEdit()
              setSearchTerm(e.target.value)
            }}
```

- [ ] **Step 5: Add the per-row edit flags**

Inside the `.map()` callback, next to `const visible = isProductVisible(product)` from Task 5, add:

```tsx
                const isEditing = editingId === product.id
                const isSaving = savingId === product.id
```

- [ ] **Step 6: Make the name cell editable**

Replace the whole name cell:

```tsx
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{product.name}</div>
                        {product.is_featured && (
                          <Badge className="bg-accent text-accent-foreground text-xs">Nổi bật</Badge>
                        )}
                      </div>
                    </TableCell>
```

with:

```tsx
                    <TableCell>
                      {isEditing ? (
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          onKeyDown={(e) => handleEditKeyDown(e, product.id)}
                          disabled={isSaving}
                          autoFocus
                          className="h-9 min-w-[180px]"
                        />
                      ) : (
                        <div className="space-y-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.is_featured && (
                            <Badge className="bg-accent text-accent-foreground text-xs">Nổi bật</Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
```

- [ ] **Step 7: Make the price cell editable**

Replace:

```tsx
                    <TableCell className="font-semibold text-primary">{formatPrice(product.price)}</TableCell>
```

with:

```tsx
                    <TableCell className="font-semibold text-primary">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={draft.price}
                          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                          onKeyDown={(e) => handleEditKeyDown(e, product.id)}
                          disabled={isSaving}
                          className="h-9 w-28"
                        />
                      ) : (
                        formatPrice(product.price)
                      )}
                    </TableCell>
```

- [ ] **Step 8: Make the sale price cell editable**

Replace the "Giá đã giảm" cell added in Task 4 with:

```tsx
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          placeholder="Để trống"
                          value={draft.sale_price}
                          onChange={(e) => setDraft({ ...draft, sale_price: e.target.value })}
                          onKeyDown={(e) => handleEditKeyDown(e, product.id)}
                          disabled={isSaving}
                          className="h-9 w-28"
                        />
                      ) : product.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{formatPrice(product.sale_price)}</span>
                          {product.discount_percentage ? (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              -{product.discount_percentage}%
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
```

- [ ] **Step 9: Swap the action buttons by mode**

Replace the edit and delete buttons (leaving the `Switch` from Task 5 exactly where it is, as the first child):

```tsx
                        <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton productId={product.id} productName={product.name} />
```

with:

```tsx
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-green-600 hover:text-green-700"
                              onClick={() => saveEdit(product.id)}
                              disabled={isSaving}
                              aria-label="Lưu"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={cancelEdit}
                              disabled={isSaving}
                              aria-label="Huỷ"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => startEdit(product)}
                              aria-label="Sửa nhanh"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <DeleteProductButton productId={product.id} productName={product.name} />
                          </>
                        )}
```

The delete button is intentionally hidden while a row is being edited — it removes any chance of hitting delete while reaching for save.

- [ ] **Step 10: Verify the happy path**

Run: `npm run dev`, open http://localhost:3000/admin/products

1. Click the pencil on a row. Expected: name, price, and sale price become inputs; the pencil and trash are replaced by ✓ and ✕; the visibility switch stays usable; the name input is focused.
2. Change the name, press **Enter**. Expected: toast "Đã lưu", row returns to display mode with the new name.
3. Click the pencil again, type a sale price lower than the price, click ✓. Expected: toast "Đã lưu", the "Giá đã giảm" cell shows the price plus a `-x%` badge, and the percentage matches `round((price - sale) / price * 100)`.
4. Open the same product on the storefront. Expected: the same percentage on the badge (with the discount switch on).
5. Click the pencil, clear the sale price field, click ✓. Expected: the cell returns to `—`; verify in SQL that both `sale_price` and `discount_percentage` are `NULL`.
6. Click the pencil, change something, press **Esc**. Expected: row reverts, nothing saved.
7. Click the pencil on row A, then the pencil on row B. Expected: row A leaves edit mode, row B enters it.
8. Click the product name in display mode. Expected: navigates to the full edit page.

- [ ] **Step 11: Verify each validation rule**

For each case: enter edit mode, apply the input, press Enter, and confirm the exact toast appears, the row **stays in edit mode**, and what you typed is **still there**.

| Input | Expected toast |
|---|---|
| Clear the name entirely | Tên sản phẩm không được để trống |
| Name of only spaces | Tên sản phẩm không được để trống |
| Price `0` | Giá phải là số lớn hơn 0 |
| Price `-5` | Giá phải là số lớn hơn 0 |
| Price cleared | Giá phải là số lớn hơn 0 |
| Sale price `0` (price `40000`) | Giá đã giảm phải lớn hơn 0 |
| Sale price `40000` (price `40000`) | Giá đã giảm phải nhỏ hơn giá gốc |
| Sale price `50000` (price `40000`) | Giá đã giảm phải nhỏ hơn giá gốc |

- [ ] **Step 12: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 13: Commit**

```bash
git add components/admin/products-table.tsx
git commit -m "feat(admin): edit name, price and sale price inline"
```

---

### Task 7: Product form derives the discount percentage

**Files:**
- Modify: `components/admin/product-form.tsx`

**Interfaces:**
- Consumes: `computeDiscountPercentage` from `lib/pricing.ts` (Task 1).
- Produces: nothing. This is the last task.

- [ ] **Step 1: Import the helper**

In `components/admin/product-form.tsx`, add:

```tsx
import { computeDiscountPercentage } from '@/lib/pricing'
```

- [ ] **Step 2: Drop discount_percentage from form state**

In the `useState` initialiser for `formData`, delete this line:

```tsx
    discount_percentage: product?.discount_percentage?.toString() || '',
```

Leave `discount_percentage` in the `Product` interface — it is still part of the database row shape.

- [ ] **Step 3: Add the derived preview value**

Above the `return` of the component (next to `generateSlug` is fine), add:

```tsx
  const parsedPrice = Number.parseFloat(formData.price)
  const parsedSalePrice =
    formData.sale_price.trim() === '' ? null : Number.parseFloat(formData.sale_price)
  const previewDiscount = computeDiscountPercentage(parsedPrice, parsedSalePrice)
```

- [ ] **Step 4: Replace the percentage input with the preview**

Replace this whole block:

```tsx
              <div className='space-y-2'>
                <Label htmlFor='discount_percentage'>Phần trăm giảm giá (%)</Label>
                <Input
                  id='discount_percentage'
                  type='number'
                  placeholder='0'
                  min='0'
                  max='100'
                  value={formData.discount_percentage}
                  onChange={(e) => handleChange('discount_percentage', e.target.value)}
                />
                <p className='text-xs text-muted-foreground'>Chỉ để hiển thị badge giảm giá</p>
              </div>
```

with:

```tsx
              <div className='space-y-2'>
                <Label>Phần trăm giảm giá</Label>
                <div className='flex h-9 items-center rounded-md border border-input bg-muted/40 px-3 text-sm'>
                  {previewDiscount !== null ? (
                    <span className='font-semibold text-primary'>-{previewDiscount}%</span>
                  ) : (
                    <span className='text-muted-foreground'>—</span>
                  )}
                </div>
                <p className='text-xs text-muted-foreground'>
                  Tự tính từ giá gốc và giá khuyến mãi
                </p>
              </div>
```

- [ ] **Step 5: Guard against an invalid sale price on submit**

In `handleSubmit`, directly below the existing category guard:

```tsx
    if (formData.categoryIds.length === 0) {
      alert('Vui lòng chọn ít nhất một danh mục')
      return
    }
```

add:

```tsx
    if (parsedSalePrice !== null && !(parsedSalePrice > 0 && parsedSalePrice < parsedPrice)) {
      alert('Giá khuyến mãi phải lớn hơn 0 và nhỏ hơn giá gốc')
      return
    }
```

`alert` matches the existing style in this file — do not swap it for a toast here.

- [ ] **Step 6: Derive the percentage on save**

In the `productData` object, replace:

```tsx
        sale_price: formData.sale_price ? Number.parseFloat(formData.sale_price) : null,
        discount_percentage: formData.discount_percentage
          ? Number.parseInt(formData.discount_percentage)
          : null,
```

with:

```tsx
        sale_price: parsedSalePrice,
        discount_percentage: computeDiscountPercentage(parsedPrice, parsedSalePrice),
```

- [ ] **Step 7: Verify in the browser**

Run: `npm run dev`, open http://localhost:3000/admin/products and edit a product.

1. Expected: in the "Thông tin khuyến mãi" card, the percentage field is now read-only text, not an input.
2. With price `40000`, type `30000` into "Giá khuyến mãi". Expected: the preview updates live to `-25%`.
3. Clear the sale price. Expected: the preview shows `—`.
4. Save with the sale price at `30000`. Expected: the products table's "Giá đã giảm" column shows `30.000 ₫` and `-25%`; the storefront badge matches.
5. Type `50000` as the sale price (higher than the `40000` price) and hit save. Expected: browser alert "Giá khuyến mãi phải lớn hơn 0 và nhỏ hơn giá gốc", nothing saved.
6. Create a brand-new product with no sale price at all. Expected: saves fine, `sale_price` and `discount_percentage` are both `NULL`.

- [ ] **Step 8: Lint and build**

Run: `npm run lint && npm run build`
Expected: both succeed.

- [ ] **Step 9: Commit**

```bash
git add components/admin/product-form.tsx
git commit -m "feat(admin): derive discount percentage from sale price"
```

---

## Final verification

After all seven tasks, run through the spec's acceptance list end to end:

- [ ] Discount switch off → home, list, and detail pages all show original prices only
- [ ] Discount switch on → sale prices and badges return, no data lost
- [ ] Cards with 2+ images swap on hover (desktop) and cycle out of sync (mobile)
- [ ] Cards with 1 image are unchanged
- [ ] Inline edit saves name, price, and sale price, with a percentage matching the formula
- [ ] Visibility switch hides a product from the public list immediately
- [ ] Every validation rule blocks the save and preserves what was typed
- [ ] `npm run lint && npm run build` both clean
