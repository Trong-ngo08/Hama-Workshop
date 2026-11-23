/**
 * Readable, SEO-friendly product URLs: /products/charm-chu-in-3d-theo-yeu-cau.
 * The slug is the canonical address; the old /products/<uuid> links redirect to it.
 */

/** Short URLs read better in search results. */
const MAX_SLUG_LENGTH = 60

/** Turns a Vietnamese product name into a URL slug: "Móc khóa há cảo" → "moc-khoa-ha-cao". */
export function slugify(name: string) {
  const slug = name
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[đĐ]/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
  if (slug.length <= MAX_SLUG_LENGTH) return slug
  // Cut at the last word boundary that fits.
  const cut = slug.slice(0, MAX_SLUG_LENGTH + 1)
  return cut.slice(0, cut.lastIndexOf('-')).replace(/-+$/, '')
}

/** Site path of a product page, preferring its slug over its id. */
export function productPath(product: { id: string; slug?: string | null }) {
  return `/products/${product.slug || product.id}`
}
