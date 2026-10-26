import { AnimateIn } from '@/components/animate-in'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { HeroTikTok } from '@/components/hero-tiktok'
import { PrintQuoteCalculator } from '@/components/print-quote-calculator'
import { tiktokVideoId } from '@/lib/hero-content'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { applyDiscountSetting } from '@/lib/pricing'
import { getDiscountsEnabled, getHeroContent } from '@/lib/settings'
import { createClient } from '@/lib/supabase/server'
import { ArrowRight, Box } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const MARQUEE_ITEMS = [
  'IN 3D',
  'CÁ NHÂN HÓA',
  'ĐỘC BẢN',
  'KHÔNG ĐẠI TRÀ',
  'HMWorkshop',
  'THIẾT KẾ RIÊNG',
  'QUÀ TẶNG Ý NGHĨA',
  'HOÀN THIỆN TỈ MỈ'
]

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featuredProducts },
    discountsEnabled,
    hero
  ] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, name, description, price, category, images, is_featured, is_available, sale_price, discount_percentage'
      )
      .eq('is_featured', true)
      .eq('is_visible', true)
      .order('created_at', { ascending: false })
      .limit(6),
    getDiscountsEnabled(),
    getHeroContent()
  ])

  const featured = applyDiscountSetting(featuredProducts ?? [], discountsEnabled)
  const videoId = tiktokVideoId(hero.videoUrl)

  return (
    <div className='min-h-screen'>
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className='relative pt-12 lg:pt-20 pb-14 overflow-hidden'>
          <div className='absolute inset-0 warm-texture' />
          {/* Decorative spinning ring */}
          <div className='absolute -top-32 -right-32 w-96 h-96 rounded-full border border-primary/10 animate-spin-slow pointer-events-none' />
          <div
            className='absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full border border-accent/10 animate-spin-slow pointer-events-none'
            style={{ animationDirection: 'reverse' }}
          />

          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <div className='grid lg:grid-cols-2 gap-12 lg:gap-16 items-center lg:items-stretch'>
              {/* Left – Text + quote calculator. On desktop the headline lines
                  up with the top of the media and the calculator with its bottom. */}
              <div className='space-y-6 lg:space-y-0 lg:flex lg:flex-col lg:justify-between lg:gap-6'>
                <div className='space-y-6'>
                  {/* Headline */}
                  <h1 className='animate-fade-in-up delay-150 text-4xl lg:text-5xl font-bold leading-tight text-foreground text-balance'>
                    {hero.titleLine1}{' '}
                    <span className='block text-primary'>{hero.titleLine2}</span>
                  </h1>

                  <p className='animate-fade-in-up delay-300 text-lg text-muted-foreground leading-relaxed max-w-xl'>
                    {hero.description}
                  </p>

                  <div className='animate-fade-in-up delay-400'>
                    <Button
                      asChild
                      size='lg'
                      className='bg-primary hover:bg-primary/90 text-primary-foreground group'
                    >
                      <Link href='/products'>
                        <Box className='w-4 h-4 mr-2' />
                        {hero.primaryCta}
                        <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-1' />
                      </Link>
                    </Button>
                  </div>
                </div>

                <div className='animate-fade-in-up delay-500 max-w-xl'>
                  <PrintQuoteCalculator />
                </div>
              </div>

              {/* Right – Image */}
              <div
                className={`animate-fade-in-scale delay-300 relative ${videoId ? 'w-fit mx-auto' : ''}`}
              >
                {videoId ? (
                  // TikTok clips are vertical: keep 9:16 and roughly the
                  // height of the left column.
                  <div className='mx-auto aspect-[9/16] h-[36rem] max-h-[80vh] lg:h-full lg:max-h-none max-w-full rounded-2xl overflow-hidden tech-shadow bg-black'>
                    <HeroTikTok videoId={videoId} />
                  </div>
                ) : (
                  <div className='aspect-square rounded-2xl overflow-hidden tech-shadow animate-float'>
                    <Image
                      src={hero.imageUrl}
                      alt='Sản phẩm in 3D cá nhân hóa của HMWorkshop'
                      width={600}
                      height={600}
                      className='object-cover w-full h-full'
                      priority
                    />
                  </div>
                )}
                {/* Quote card – would cover the TikTok controls, so image only */}
                {!videoId && (
                  <div className='animate-fade-in-left delay-700 absolute -bottom-6 -left-6 bg-card p-6 rounded-2xl tech-shadow max-w-xs border border-border/50'>
                    <div className='flex items-start gap-3'>
                      <span className='text-3xl text-primary leading-none mt-1'>
                        "
                      </span>
                      <p className='text-sm italic text-muted-foreground leading-relaxed'>
                        {hero.quote}
                      </p>
                    </div>
                  </div>
                )}
                {/* Floating accent dot */}
                <div className='absolute -top-4 -right-4 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 animate-pulse-dot' />
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Products ─────────────────────────────── */}
        <section className='pt-12 lg:pt-16 pb-16 lg:pb-20 bg-muted/30'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-8'>
              <div className='space-y-3'>
                <h2 className='text-3xl lg:text-4xl font-bold text-foreground'>
                  Mẫu có sẵn
                </h2>
                <p className='text-muted-foreground max-w-xl'>
                  Mỗi sản phẩm là một bản thiết kế riêng — có thể thay đổi màu
                  sắc, kích thước và mang dấu ấn cá nhân.
                </p>
              </div>
              <Button
                asChild
                variant='outline'
                className='border-primary text-primary hover:bg-primary/10 bg-transparent shrink-0 group'
              >
                <Link href='/products'>
                  Xem tất cả
                  <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-1' />
                </Link>
              </Button>
            </AnimateIn>

            <div className='grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5'>
              {featured.map((product, i) => (
                <AnimateIn key={product.id} delay={i * 80}>
                  <ProductCard product={product} priority={i < 3} index={i} compact />
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Marquee banner ───────────────────────────────── */}
        <div className='border-y border-primary/20 bg-foreground overflow-hidden py-4'>
          <div className='animate-marquee'>
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i} className='inline-flex items-center gap-6 px-6'>
                <span className='text-primary-foreground/90 text-xs font-bold tracking-[0.25em] uppercase whitespace-nowrap'>
                  {item}
                </span>
                <span className='text-primary text-lg'>×</span>
              </span>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
