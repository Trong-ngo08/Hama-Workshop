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
        <section className='relative py-8 md:py-10 desk:py-6 overflow-hidden'>
          <div className='absolute inset-0 warm-texture' />
          {/* Decorative spinning ring */}
          <div className='absolute -top-32 -right-32 w-96 h-96 rounded-full border border-primary/10 animate-spin-slow pointer-events-none' />
          <div
            className='absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full border border-accent/10 animate-spin-slow pointer-events-none'
            style={{ animationDirection: 'reverse' }}
          />

          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <div
              className={`grid gap-10 md:gap-8 desk:gap-16 ${videoId ? 'md:grid-cols-[auto_minmax(0,1fr)] md:items-center desk:grid-cols-[minmax(0,1fr)_auto] desk:items-stretch' : ''}`}
            >
              {/* Left – Text + quote calculator, centred against the clip on
                  desktop. Below that the wrapper dissolves (contents): phones
                  stack text, clip, calculator; portrait tablets put the text
                  on top and the clip beside the calculator. */}
              <div className='contents desk:flex desk:flex-col desk:justify-center desk:gap-12'>
                <div className={`order-1 space-y-6 desk:space-y-8 ${videoId ? 'md:col-span-2' : ''}`}>
                  <h1 className='animate-fade-in-up delay-150 text-4xl md:text-5xl 2xl:text-6xl font-bold leading-tight text-foreground text-balance'>
                    {hero.titleLine1}{' '}
                    <span className='block text-primary'>{hero.titleLine2}</span>
                  </h1>

                  <p className='animate-fade-in-up delay-300 text-lg xl:text-xl text-muted-foreground leading-relaxed max-w-2xl'>
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

                <div className='order-3 animate-fade-in-up delay-500 max-w-2xl'>
                  <PrintQuoteCalculator />
                </div>
              </div>

              {/* Right – vertical TikTok clip, as tall as the screen allows on desktop */}
              {videoId && (
                <div className='order-2 animate-fade-in-scale delay-300 relative w-full max-w-sm mx-auto md:mx-0 md:w-[17rem] desk:max-w-none desk:w-auto'>
                  <div className='aspect-[9/16] w-full desk:w-auto desk:h-[calc(100svh-8rem)] desk:min-h-[32rem] rounded-2xl overflow-hidden tech-shadow bg-black'>
                    <HeroTikTok videoId={videoId} />
                  </div>
                  {/* Floating accent dot */}
                  <div className='absolute -top-4 -right-4 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 animate-pulse-dot' />
                </div>
              )}
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
