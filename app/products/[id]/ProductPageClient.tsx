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
  Heart,
  MessageCircle,
  Palette,
  PenTool,
  Printer,
  Ruler,
  Share2,
  Shield,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

const BASE_URL = 'https://hmworkshop.vn'

interface Product {
  id: string
  name: string
  description: string
  price: number
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
        name: 'Hama Workshop'
      }
    },
    brand: {
      '@type': 'Brand',
      name: 'Hama Workshop'
    },
    category: product.category,
    ...(product.materials ? { material: product.materials } : {})
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
                      {product.is_featured && (
                        <Badge className='bg-primary/10 text-primary border-none rounded-none px-3 uppercase tracking-wider text-[10px] font-bold'>
                          <Sparkles className='w-3 h-3 mr-1' />
                          Phiên bản giới hạn
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-primary rounded-full'
                    >
                      <Heart className='w-5 h-5' />
                    </Button>
                    <Button
                      variant='ghost'
                      size='icon'
                      className='text-muted-foreground hover:text-primary rounded-full'
                    >
                      <Share2 className='w-5 h-5' />
                    </Button>
                  </div>
                </div>

                <div className='text-4xl font-bold text-primary'>
                  {formatPrice(product.price)}
                </div>

                <p className='text-lg text-muted-foreground leading-relaxed max-w-prose'>
                  "Không đại trà. Không rập khuôn. Mỗi chi tiết đều có lý do tồn
                  tại." - {product.description}
                </p>
              </div>

              <Separator className='bg-border/50' />

              {/* Product Details */}
              <div className='space-y-6'>
                <h2 className='font-bold text-xl text-foreground'>
                  Cá nhân hóa cho bạn
                </h2>
                <div className='grid gap-4'>
                  <div className='flex items-center justify-between py-2 border-b border-border/30'>
                    <div className='flex items-center gap-3 text-muted-foreground'>
                      <Palette className='w-4 h-4' />
                      <span>Màu sắc:</span>
                    </div>
                    <span className='font-semibold text-foreground'>
                      Tùy chọn theo yêu cầu
                    </span>
                  </div>
                  <div className='flex items-center justify-between py-2 border-b border-border/30'>
                    <div className='flex items-center gap-3 text-muted-foreground'>
                      <Ruler className='w-4 h-4' />
                      <span>Kích thước:</span>
                    </div>
                    <span className='font-semibold text-foreground'>
                      {product.size_info || 'Chỉnh sửa mm theo ý muốn'}
                    </span>
                  </div>
                  <div className='flex items-center justify-between py-2 border-b border-border/30'>
                    <div className='flex items-center gap-3 text-muted-foreground'>
                      <PenTool className='w-4 h-4' />
                      <span>Khắc tên/Logo:</span>
                    </div>
                    <span className='font-semibold text-foreground'>
                      Dấu ấn cá nhân miễn phí
                    </span>
                  </div>
                </div>
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
                    Bắt đầu thiết kế riêng
                  </Link>
                </Button>

                <div className='grid grid-cols-3 gap-6 text-center'>
                  <div className='space-y-3'>
                    <div className='w-14 h-14 mx-auto rounded-xl bg-primary/5 flex items-center justify-center border border-primary/10'>
                      <Box className='w-7 h-7 text-primary' />
                    </div>
                    <div className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold'>
                      Thủ công
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <div className='w-14 h-14 mx-auto rounded-xl bg-accent/5 flex items-center justify-center border border-accent/10'>
                      <Printer className='w-7 h-7 text-accent' />
                    </div>
                    <div className='text-[11px] uppercase tracking-widest text-muted-foreground font-bold'>
                      In 3D Precision
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

          {/* Detailed Product Description */}
          <section className='mb-24' aria-label='Triết lý chế tác'>
            <div className='bg-card rounded-2xl tech-shadow border border-border p-10 lg:p-16 overflow-hidden relative'>
              <div className='absolute top-0 right-0 w-64 h-64 wood-texture opacity-50 -mr-32 -mt-32 rounded-full' />
              <div className='max-w-4xl mx-auto relative z-10'>
                <div className='text-center mb-12 space-y-4'>
                  <h2 className='text-3xl lg:text-4xl font-bold text-foreground'>
                    Triết lý chế tác
                  </h2>
                  <p className='text-lg text-muted-foreground leading-relaxed'>
                    Kết hợp giữa sự mộc mạc của gỗ và độ chính xác của công
                    nghệ.
                  </p>
                </div>

                <div className='prose prose-lg max-w-none prose-headings:text-foreground prose-p:text-muted-foreground'>
                  <div className='grid lg:grid-cols-2 gap-12 items-start'>
                    <div className='space-y-8'>
                      <div className='space-y-4'>
                        <h3 className='text-2xl font-bold text-foreground'>
                          Vật liệu & Quy trình
                        </h3>
                        <p className='leading-relaxed'>
                          Chúng tôi tuyển chọn những loại gỗ tự nhiên tốt nhất
                          như Walnut, Oak và Ash. Mỗi thớ gỗ đều mang một câu
                          chuyện riêng, được chế tác tỉ mỉ bởi những người thợ
                          lành nghề.
                        </p>
                        <p className='leading-relaxed'>
                          Song song đó, công nghệ in 3D FDM/SLA được áp dụng để
                          tạo ra những chi tiết cơ khí hoặc hình khối mà thủ
                          công truyền thống khó lòng đạt được sự chính xác đến
                          từng micromet.
                        </p>
                      </div>

                      <div className='space-y-4'>
                        <h3 className='text-2xl font-bold text-foreground'>
                          Bản sắc riêng của bạn
                        </h3>
                        <p className='leading-relaxed'>
                          "Tại sao sản phẩm lại phải giống nhau?" - Đây là kim
                          chỉ nam cho mọi thiết kế. Bạn hoàn toàn có quyền thay
                          đổi bất kỳ thông số nào để sản phẩm thực sự là của
                          bạn.
                        </p>
                      </div>
                    </div>

                    <div className='space-y-6'>
                      <div className='aspect-[4/3] rounded-xl overflow-hidden tech-shadow border border-border'>
                        <Image
                          src='/clock.jpg?height=400&width=600&text=Precision+Crafting'
                          alt='Quy trình chế tác chính xác'
                          width={600}
                          height={400}
                          className='object-cover w-full h-full'
                        />
                      </div>
                      <p className='text-xs uppercase tracking-widest text-muted-foreground text-center font-bold'>
                        Độ chính xác kỹ thuật cao × Vẻ đẹp thủ công
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <section className='py-12' aria-label='Sản phẩm liên quan'>
              <div className='space-y-8'>
                <div className='text-center space-y-4'>
                  <h2 className='text-2xl lg:text-3xl font-bold text-gray-900'>
                    Sản phẩm liên quan
                  </h2>
                  <p className='text-gray-600'>
                    Các sản phẩm khác trong cùng danh mục
                  </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
                  {relatedProducts.map((relatedProduct) => (
                    <ProductCard
                      key={relatedProduct.id}
                      product={relatedProduct}
                    />
                  ))}
                </div>

                <div className='text-center'>
                  <Button
                    asChild
                    variant='outline'
                    className='rounded-full bg-transparent border-gray-300 text-gray-700 hover:bg-gray-50'
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
