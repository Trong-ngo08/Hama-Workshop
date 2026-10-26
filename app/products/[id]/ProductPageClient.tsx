'use client'

import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ImagePopup } from '@/components/image-popup'
import { ProductCard } from '@/components/product-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  Box,
  Check,
  MessageCircle,
  Palette,
  Printer,
  Share2,
  Shield
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

const BASE_URL = 'https://hmworkshop.vn'

interface Product {
  id: string
  name: string
  description: string
  price: number
  sale_price?: number
  discount_percentage?: number
  category: string
  images: string[]
  is_featured: boolean
  is_available: boolean
  materials?: string | null
  size_info?: string | null
  care_instructions?: string | null
}

interface ProductPageClientProps {
  product: Product
  relatedProducts: Product[]
}

export default function ProductPageClient({
  product,
  relatedProducts
}: ProductPageClientProps) {
  const [copied, setCopied] = useState(false)

  const handleShare = async () => {
    const url = `${BASE_URL}/products/${product.id}`
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
    }
    setCopied(true)
    toast.success('Đã copy đường dẫn thành công')
    setTimeout(() => setCopied(false), 2000)
  }

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'VND',
      availability: product.is_available
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'HMWorkshop'
      }
    },
    brand: {
      '@type': 'Brand',
      name: 'HMWorkshop'
    },
    category: product.category,
    material: 'PETG'
  }

  const breadcrumbData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: BASE_URL
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Sản phẩm',
        item: `${BASE_URL}/products`
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: product.name,
        item: `${BASE_URL}/products/${product.id}`
      }
    ]
  }

  return (
    <div className='min-h-screen'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }}
      />

      <Header />

      <main className='py-8'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Breadcrumb */}
          <nav
            aria-label='Breadcrumb'
            className='flex items-center gap-2 text-sm text-muted-foreground mb-8'
          >
            <Link href='/' className='hover:text-primary transition-colors'>
              Trang chủ
            </Link>
            <span aria-hidden='true'>/</span>
            <Link
              href='/products'
              className='hover:text-primary transition-colors'
            >
              Sản phẩm
            </Link>
            <span aria-hidden='true'>/</span>
            <span className='text-foreground' aria-current='page'>
              {product.name}
            </span>
          </nav>

          {/* Back Button */}
          <Button variant='ghost' size='sm' className='mb-6' asChild>
            <Link href='/products'>
              <ArrowLeft className='w-4 h-4 mr-2' />
              Quay lại danh sách
            </Link>
          </Button>

          {/* Product Details */}
          <div className='grid lg:grid-cols-2 gap-12 mb-16'>
            {/* Product Images */}
            <ProductImageGallery
              images={product.images || []}
              productName={product.name}
            />

            {/* Product Info */}
            <div className='space-y-8'>
              <div className='space-y-4'>
                <div className='flex items-start justify-between gap-4'>
                  <div className='space-y-3'>
                    <h1 className='text-4xl lg:text-5xl font-bold text-foreground leading-tight'>
                      {product.name}
                    </h1>
                    <div className='flex items-center gap-3'>
                      <Badge
                        variant='outline'
                        className='text-muted-foreground border-border rounded-none px-3 uppercase tracking-wider text-[10px]'
                      >
                        {product.category}
                      </Badge>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      onClick={handleShare}
                      title={copied ? 'Đã copy link' : 'Copy link'}
                      className='text-muted-foreground hover:text-primary rounded-full'
                    >
                      {copied ? (
                        <Check className='w-5 h-5 text-primary' />
                      ) : (
                        <Share2 className='w-5 h-5' />
                      )}
                    </Button>
                  </div>
                </div>
                <div className='flex items-start gap-2'>
                  {product.sale_price ? (
                    <div className='flex items-start gap-2 flex-col'>
                      <span className='font-bold text-lg text-primary'>
                        {formatPrice(product.sale_price)}
                      </span>
                      <span className='text-sm text-muted-foreground line-through'>
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <span className='font-bold text-lg text-primary'>
                      {formatPrice(product.price)}
                    </span>
                  )}
                  {product.discount_percentage ? (
                    <Badge
                      variant='destructive'
                      className='ml-2 text-[10px] uppercase tracking-wider font-bold'
                    >
                      -{product.discount_percentage}%
                    </Badge>
                  ) : null}
                </div>

                <p className='text-lg text-muted-foreground leading-relaxed max-w-prose whitespace-pre-line'>
                  {product.description}
                </p>
              </div>

              <Separator className='bg-border/50' />

              {/* Product Details */}
              <div className='flex items-center justify-between py-2'>
                <div className='flex items-center gap-3 text-muted-foreground'>
                  <Palette className='w-4 h-4' />
                  <span>Màu sắc:</span>
                </div>
                <span className='font-semibold text-foreground'>
                  Tùy chọn theo yêu cầu
                </span>
              </div>

              <Separator className='bg-border/50' />

              {/* Action Buttons */}
              <div className='space-y-6'>
                <Button
                  size='lg'
                  className='w-full bg-primary hover:bg-primary/90 text-primary-foreground h-14 text-lg font-bold'
                  asChild
                >
                  <Link href='/contact'>
                    <MessageCircle className='w-5 h-5 mr-3' />
                    Đặt hàng
                  </Link>
                </Button>

                <div className='grid grid-cols-3 gap-6 text-center'>
                  <div className='space-y-3'>
                    <div className='w-14 h-14 mx-auto rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10'>
                      <Box className='w-7 h-7 text-primary' />
                    </div>
                    <div className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold'>
                      Thiết kế riêng
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='w-14 h-14 mx-auto rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10'>
                      <Printer className='w-7 h-7 text-accent' />
                    </div>
                    <div className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold'>
                      In 3D chính xác
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='w-14 h-14 mx-auto rounded-xl bg-foreground/5 flex items-center justify-center border border-foreground/10'>
                      <Shield className='w-7 h-7 text-foreground' />
                    </div>
                    <div className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold'>
                      Độc bản
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className='py-12' aria-label='Sản phẩm liên quan'>
              <div className='space-y-8'>
                <div className='text-center space-y-4'>
                  <h2 className='text-2xl lg:text-3xl font-bold text-foreground'>
                    Sản phẩm liên quan
                  </h2>
                  <p className='text-muted-foreground'>
                    Các sản phẩm khác trong cùng danh mục
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {relatedProducts.map((relatedProduct, index) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                      index={index}
                    />
                  ))}
                </div>

                <div className='text-center'>
                  <Button
                    asChild
                    variant='outline'
                    className='rounded-full bg-transparent border-border text-foreground hover:bg-muted'
                  >
                    <Link
                      href={`/products?category=${product.category.toLowerCase()}`}
                    >
                      Xem thêm trong {product.category}
                    </Link>
                  </Button>
                </div>
              </div>
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

function ProductImageGallery({
  images,
  productName
}: {
  images: string[]
  productName: string
}) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null
  )

  const validImages = images.filter((img) => img && img.trim() !== '')
  const displayImages =
    validImages.length > 0
      ? validImages
      : ['/placeholder.svg?height=600&width=600']

  return (
    <>
      <div className='space-y-4'>
        <div
          className='aspect-square rounded-2xl overflow-hidden cute-shadow cursor-pointer hover:scale-105 transition-transform'
          onClick={() => setSelectedImageIndex(0)}
        >
          <Image
            src={displayImages[0] || '/placeholder.svg'}
            alt={productName}
            width={600}
            height={600}
            className='object-cover w-full h-full'
            priority
          />
        </div>

        {displayImages.length > 1 && (
          <div className='grid grid-cols-4 gap-2'>
            {displayImages.slice(1, 5).map((image, index) => (
              <div
                key={index}
                className='aspect-square rounded-lg overflow-hidden border cursor-pointer hover:scale-105 transition-transform'
                onClick={() => setSelectedImageIndex(index + 1)}
              >
                <Image
                  src={image || '/placeholder.svg'}
                  alt={`${productName} ${index + 2}`}
                  width={150}
                  height={150}
                  className='object-cover w-full h-full'
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedImageIndex !== null && (
        <ImagePopup
          images={displayImages}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(null)}
        />
      )}
    </>
  )
}
