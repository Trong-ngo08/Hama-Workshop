import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ProductPageClient from './ProductPageClient'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select(
      'name, description, images, price, sale_price, discount_percentage, category, seo_title, seo_description, seo_keywords'
    )
    .eq('id', id)
    .single()

  if (!product) {
    return {
      title: 'Sản phẩm không tìm thấy',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.'
    }
  }

  const priceFormatted = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(product.price)

  const title = product.seo_title || `${product.name} - Hama Workshop`
  const rawDescription =
    product.seo_description ||
    product.description ||
    `Mua ${product.name} handmade chất lượng cao tại Hama Workshop. Giá ${priceFormatted}`
  const description = rawDescription.slice(0, 160)
  const keywords =
    product.seo_keywords ||
    `gỗ thủ công, in 3d, ${product.name}, ${product.category}, handmade, hama workshop`
  const image = product.images?.[0] || '/hero-image.jpg'
  const url = `https://hmworkshop.vn/products/${id}`

  return {
    title,
    description,
    keywords,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 1200, alt: product.name }],
      type: 'website',
      siteName: 'Hama Workshop',
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
      canonical: `/products/${id}`
    }
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (!product) notFound()

  const { data: relatedProducts } = await supabase
    .from('products')
    .select(
      'id, name, description, price, category, images, is_featured, is_available'
    )
    .eq('category', product.category)
    .eq('is_available', true)
    .neq('id', id)
    .order('created_at', { ascending: false })
    .limit(4)

  return (
    <ProductPageClient
      product={product}
      relatedProducts={relatedProducts || []}
    />
  )
}
