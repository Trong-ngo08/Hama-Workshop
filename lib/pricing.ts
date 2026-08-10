interface Discountable {
  price?: number | null
  sale_price?: number | null
  discount_percentage?: number | null
}

/**
 * Sale price is the single source of truth. The percentage badge is always
 * derived from it, never typed by hand.
 *
 * Returns null when there is no valid discount to show, including when the
 * rounded percentage would be 0 (a discount that rounds down to nothing is
 * not a discount worth representing).
 */
export function computeDiscountPercentage(
  price: number,
  salePrice: number | null
): number | null {
  if (salePrice === null) return null
  if (!Number.isFinite(price) || price <= 0) return null
  if (!Number.isFinite(salePrice) || salePrice <= 0) return null
  if (salePrice >= price) return null

  const percentage = Math.round(((price - salePrice) / price) * 100)
  return percentage === 0 ? null : percentage
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
