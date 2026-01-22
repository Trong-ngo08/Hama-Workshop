import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import {
  Box,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()

  const { data: featuredProducts } = await supabase
    .from('products')
    .select('*')
    .eq('is_featured', true)
    .eq('is_available', true)
    .order('created_at', { ascending: false })
    .limit(6)

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name')
    .limit(4)

  return (
    <div className='min-h-screen'>
      <Header />

      <main>
        {/* Hero Section */}
        <section className='relative py-20 lg:py-32 overflow-hidden'>
          <div className='absolute inset-0 wood-texture' />
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <div className='grid lg:grid-cols-2 gap-12 items-center'>
              <div className='space-y-8'>
                <div className='space-y-6'>
                  <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                    <Sparkles className='w-4 h-4' />
                    Cá nhân hóa theo yêu cầu
                  </div>
                  <h1 className='text-5xl lg:text-6xl font-bold leading-tight text-balance text-foreground'>
                    Gỗ thủ công
                    <span className='block text-primary'>
                      × Công nghệ in 3D
                    </span>
                  </h1>
                  <p className='text-xl text-muted-foreground leading-relaxed text-pretty max-w-xl'>
                    Không chỉ là sản phẩm – đó là phiên bản dành riêng cho bạn.
                    Không đại trà. Không rập khuôn.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4'>
                  <Button
                    asChild
                    size='lg'
                    className='bg-primary hover:bg-primary/90 text-primary-foreground'
                  >
                    <Link href='/products'>
                      <Box className='w-4 h-4 mr-2' />
                      Khám phá sản phẩm
                    </Link>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    size='lg'
                    className='border-primary text-primary hover:bg-primary/10 bg-transparent'
                  >
                    <Link href='/about'>Câu chuyện thương hiệu</Link>
                  </Button>
                </div>

                <div className='grid grid-cols-3 gap-6 pt-4 max-w-md'>
                  <div className='space-y-1'>
                    <div className='text-3xl font-bold text-primary'>100%</div>
                    <div className='text-sm text-muted-foreground leading-tight'>
                      Thủ công
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-3xl font-bold text-accent'>Custom</div>
                    <div className='text-sm text-muted-foreground leading-tight'>
                      Theo yêu cầu
                    </div>
                  </div>
                  <div className='space-y-1'>
                    <div className='text-3xl font-bold text-foreground'>
                      Độc đáo
                    </div>
                    <div className='text-sm text-muted-foreground leading-tight'>
                      Cho bạn
                    </div>
                  </div>
                </div>
              </div>

              <div className='relative'>
                <div className='aspect-square rounded-2xl overflow-hidden tech-shadow'>
                  <Image
                    src='/hero-image.jpg?height=600&width=600'
                    alt='Sản phẩm gỗ thủ công và in 3D'
                    width={600}
                    height={600}
                    className='object-cover w-full h-full'
                    priority
                  />
                </div>
                <div className='absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl tech-shadow max-w-xs'>
                  <p className='text-sm italic text-muted-foreground leading-relaxed'>
                    "Mỗi chi tiết đều có lý do tồn tại."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className='relative py-16 lg:py-24 bg-muted/30'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <div className='space-y-3 mb-12'>
              <h2 className='text-3xl lg:text-4xl font-bold text-foreground'>
                Sản phẩm nổi bật
              </h2>
              <p className='text-lg text-muted-foreground max-w-2xl text-pretty'>
                Bạn có thể thay đổi kích thước. Bạn có thể chọn màu sắc. Bạn có
                thể yêu cầu một chi tiết mang dấu ấn cá nhân.
              </p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {featuredProducts?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            <div className='text-center mt-12'>
              <Button
                asChild
                size='lg'
                variant='outline'
                className='border-primary text-primary hover:bg-primary/10 bg-transparent'
              >
                <Link href='/products'>Xem tất cả sản phẩm</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className='relative py-16 lg:py-24'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <Card className='border-0 tech-shadow overflow-hidden'>
              <CardContent className='p-8 lg:p-12 text-center space-y-6 relative'>
                <div className='space-y-4'>
                  <h2 className='text-3xl lg:text-4xl font-bold text-foreground'>
                    Tạo sản phẩm riêng của bạn
                  </h2>
                  <p className='text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed text-pretty'>
                    Chúng tôi không tạo ra sản phẩm để bán đại trà. Chúng tôi
                    tạo ra sản phẩm để phù hợp với từng người sử dụng.
                  </p>
                </div>

                <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                  <Button
                    asChild
                    size='lg'
                    className='bg-primary hover:bg-primary/90 text-primary-foreground'
                  >
                    <Link href='/contact'>Đặt hàng theo yêu cầu</Link>
                  </Button>
                  <Button
                    asChild
                    variant='outline'
                    size='lg'
                    className='border-foreground/20 hover:bg-foreground/5 bg-transparent'
                  >
                    <Link href='/about'>Tìm hiểu thêm</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
