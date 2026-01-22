import { AboutImageGallery } from '@/components/about-image-gallery'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { createServerClient } from '@supabase/ssr'
import { Box, Printer, Sparkles, Users } from 'lucide-react'
import { cookies } from 'next/headers'
import Image from 'next/image'
import Link from 'next/link'

interface AboutImage {
  id: number
  title: string
  description: string | null
  image_url: string
  display_order: number
  is_active: boolean
}

async function getAboutImages(): Promise<AboutImage[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  const { data, error } = await supabase
    .from('about_images')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching about images:', error)
    return []
  }

  return data || []
}

export default async function AboutPage() {
  const aboutImages = await getAboutImages()

  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Hero Section */}
          <section className='py-16 lg:py-24'>
            <div className='text-center space-y-6 mb-16'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                <Sparkles className='w-4 h-4' />
                Câu chuyện thương hiệu
              </div>
              <h1 className='text-4xl lg:text-5xl font-bold text-balance text-foreground'>
                Gỗ × Công nghệ × Cá nhân
              </h1>
            </div>

            {/* Brand Story Section */}
            <div className='max-w-4xl mx-auto space-y-12 mb-16'>
              <Card className='border-0 tech-shadow bg-card'>
                <CardContent className='p-8 lg:p-12 space-y-6'>
                  <p className='text-lg leading-relaxed text-muted-foreground'>
                    Chúng tôi bắt đầu từ một câu hỏi rất đơn giản:
                  </p>
                  <p className='text-2xl lg:text-3xl font-bold text-foreground leading-relaxed text-balance'>
                    "Tại sao sản phẩm lại phải giống nhau?"
                  </p>
                  <p className='text-lg leading-relaxed text-muted-foreground'>
                    Khi mỗi người đều có nhu cầu, thói quen và cá tính khác
                    nhau.
                  </p>
                </CardContent>
              </Card>

              <div className='space-y-8 text-lg leading-relaxed text-muted-foreground'>
                <p>
                  Từ những tấm gỗ mang vẻ đẹp tự nhiên đến từng lớp nhựa in 3D
                  chính xác đến từng milimet, chúng tôi không tạo ra sản phẩm để
                  bán đại trà.
                </p>
                <p className='text-xl font-medium text-foreground'>
                  Chúng tôi tạo ra sản phẩm để phù hợp với từng người sử dụng.
                </p>
                <div className='grid md:grid-cols-3 gap-6 py-8'>
                  <div className='space-y-2 p-6 rounded-xl bg-primary/5'>
                    <div className='text-primary font-bold'>Bạn có thể</div>
                    <div className='text-foreground font-semibold'>
                      Thay đổi kích thước
                    </div>
                  </div>
                  <div className='space-y-2 p-6 rounded-xl bg-accent/5'>
                    <div className='text-accent font-bold'>Bạn có thể</div>
                    <div className='text-foreground font-semibold'>
                      Chọn màu sắc
                    </div>
                  </div>
                  <div className='space-y-2 p-6 rounded-xl bg-secondary/5'>
                    <div className='text-secondary-foreground font-bold'>
                      Bạn có thể
                    </div>
                    <div className='text-foreground font-semibold'>
                      Yêu cầu chi tiết cá nhân
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Image Gallery */}
            <div className='space-y-6'>
              {aboutImages.length > 0 ? (
                <div>
                  <h2 className='text-2xl lg:text-3xl font-bold mb-8 text-center'>
                    Quy trình sản xuất
                  </h2>
                  <AboutImageGallery images={aboutImages} />
                </div>
              ) : (
                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='aspect-square rounded-2xl overflow-hidden tech-shadow'>
                    <Image
                      src='/placeholder.svg?height=500&width=500&text=Wood+Crafting'
                      alt='Quy trình làm gỗ thủ công'
                      width={500}
                      height={500}
                      className='object-cover w-full h-full'
                    />
                  </div>
                  <div className='aspect-square rounded-2xl overflow-hidden tech-shadow'>
                    <Image
                      src='/placeholder.svg?height=500&width=500&text=3D+Printing'
                      alt='Công nghệ in 3D hiện đại'
                      width={500}
                      height={500}
                      className='object-cover w-full h-full'
                    />
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Values Section */}
          <section className='py-16 lg:py-24 bg-muted/30 rounded-2xl'>
            <div className='text-center space-y-4 mb-12'>
              <h2 className='text-2xl lg:text-3xl font-bold'>
                Giá trị cốt lõi
              </h2>
              <p className='text-muted-foreground max-w-2xl mx-auto'>
                Những nguyên tắc định hướng mọi sản phẩm chúng tôi tạo ra
              </p>
            </div>

            <div className='grid md:grid-cols-3 gap-8'>
              <Card className='border border-border tech-shadow text-center'>
                <CardContent className='p-8 space-y-4'>
                  <div className='w-16 h-16 mx-auto rounded-xl bg-primary/10 flex items-center justify-center'>
                    <Box className='w-8 h-8 text-primary' />
                  </div>
                  <h3 className='text-xl font-semibold'>Thủ công tinh xảo</h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>
                    Mỗi sản phẩm gỗ đều được chế tác bằng tay với kỹ thuật
                    truyền thống và sự tỉ mỉ tuyệt đối.
                  </p>
                </CardContent>
              </Card>

              <Card className='border border-border tech-shadow text-center'>
                <CardContent className='p-8 space-y-4'>
                  <div className='w-16 h-16 mx-auto rounded-xl bg-accent/10 flex items-center justify-center'>
                    <Printer className='w-8 h-8 text-accent' />
                  </div>
                  <h3 className='text-xl font-semibold'>Công nghệ hiện đại</h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>
                    Áp dụng công nghệ in 3D tiên tiến để tạo ra những chi tiết
                    chính xác và độc đáo.
                  </p>
                </CardContent>
              </Card>

              <Card className='border border-border tech-shadow text-center'>
                <CardContent className='p-8 space-y-4'>
                  <div className='w-16 h-16 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center'>
                    <Users className='w-8 h-8 text-foreground' />
                  </div>
                  <h3 className='text-xl font-semibold'>
                    Cá nhân hóa hoàn toàn
                  </h3>
                  <p className='text-muted-foreground text-sm leading-relaxed'>
                    Mỗi sản phẩm được tùy chỉnh theo yêu cầu cụ thể của từng
                    khách hàng.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className='py-16 lg:py-24'>
            <Card className='border-0 tech-shadow overflow-hidden'>
              <CardContent className='p-8 lg:p-12 text-center space-y-6 relative'>
                <div className='space-y-4'>
                  <h2 className='text-2xl lg:text-3xl font-bold text-foreground'>
                    Tạo sản phẩm riêng của bạn
                  </h2>
                  <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed'>
                    Chia sẻ ý tưởng của bạn và chúng tôi sẽ biến nó thành hiện
                    thực với sự kết hợp độc đáo giữa gỗ thủ công và công nghệ in
                    3D.
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
                    <Link href='/products'>Xem sản phẩm</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
