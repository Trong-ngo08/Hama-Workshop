import { applyDiscountSettingToOne } from '@/lib/pricing'
import { withCoverPositions } from '@/lib/cover-position'
import { getCoverPositions, getDiscountsEnabled } from '@/lib/settings'
import { SITE_URL } from '@/lib/site'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import { productPath } from '@/lib/product-url'
import ProductPageClient from './ProductPageClient'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * The product URL segment is either the product slug (the canonical,
 * SEO-friendly address) or its id (older links, redirected to the slug).
 */
function productKey(segment: string) {
  const value = decodeURIComponent(segment)
  return UUID_RE.test(value)
    ? { column: 'id', value }
    : { column: 'slug', value }
}

export async function generateMetadata({
  params
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(
      'id, slug, name, description, images, price, category, seo_title, seo_description, seo_keywords, is_visible'
    )
    .eq(productKey(id).column, productKey(id).value)
    .maybeSingle()

  if (!product || product.is_visible === false) {
    return {
      title: 'Sản phẩm không tìm thấy',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
      robots: { index: false, follow: false }
    }
  }

  const priceFormatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(product.price)

  const title = product.seo_title || product.name
  const rawDescription =
    product.seo_description ||
    product.description ||
    `Mua ${product.name} in 3D bằng nhựa PETG tại HMWorkshop. Giá ${priceFormatted}`
  const description = rawDescription.slice(0, 160)
  const keywords =
    product.seo_keywords ||
    `in 3d, quà tặng cá nhân hóa, ${product.name}, ${product.category}, nhựa petg, hmworkshop`
  const image = product.images?.[0] || '/hero-image.jpg'
  const url = `${SITE_URL}${productPath(product)}`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 1200, alt: product.name }],
      type: 'website',
      siteName: 'HMWorkshop',
      url,
      locale: 'vi_VN'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image]
    },
    alternates: {
      canonical: productPath(product)
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq(productKey(id).column, productKey(id).value)
    .maybeSingle()

  if (!product || product.is_visible === false) notFound()

  // Old id links (shared posts, Google index) move permanently to the slug URL.
  if (product.slug && productKey(id).column === 'id') permanentRedirect(productPath(product))

  const discountsEnabled = await getDiscountsEnabled()
  const visibleProduct = applyDiscountSettingToOne(product, discountsEnabled)

  const { data: relatedProducts } = await supabase
    .from('products')
    .select(
      'id, slug, name, description, price, category, images, is_featured, is_available'
    )
    .eq('category', product.category)
    .eq('is_visible', true)
    .neq('id', product.id)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <ProductPageClient
      product={visibleProduct}
      relatedProducts={withCoverPositions(
        relatedProducts || [],
        await getCoverPositions()
      )}
    />
  )
}
