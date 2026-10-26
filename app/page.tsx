import { AnimateIn } from '@/components/animate-in'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { PrintQuoteCalculator } from '@/components/print-quote-calculator'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { applyDiscountSetting } from '@/lib/pricing'
import { getDiscountsEnabled, getHeroContent } from '@/lib/settings'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  Box,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const STAT_COLORS = ['text-primary', 'text-accent', 'text-foreground']

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

  return (
    <div className='min-h-screen'>
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className='relative py-24 lg:py-36 overflow-hidden'>
          <div className='absolute inset-0 warm-texture' />
          {/* Decorative spinning ring */}
          <div className='absolute -top-32 -right-32 w-96 h-96 rounded-full border border-primary/10 animate-spin-slow pointer-events-none' />
          <div
            className='absolute -bottom-48 -left-48 w-[32rem] h-[32rem] rounded-full border border-accent/10 animate-spin-slow pointer-events-none'
            style={{ animationDirection: 'reverse' }}
          />

          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <div className='grid lg:grid-cols-2 gap-16 items-center'>
              {/* Left – Text */}
              <div className='space-y-8'>
                {/* Badge */}
                <div className='animate-fade-in-down inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                  <Sparkles className='w-4 h-4 text-primary' />
                  {hero.badge}
                </div>

                {/* Headline */}
                <div className='space-y-2'>
                  <h1 className='animate-fade-in-up delay-150 text-5xl lg:text-6xl font-bold leading-tight text-foreground'>
                    {hero.titleLine1}
                  </h1>
                  <h1 className='animate-fade-in-up delay-300 text-5xl lg:text-6xl font-bold leading-tight text-primary'>
                    {hero.titleLine2}
                  </h1>
                </div>

                <p className='animate-fade-in-up delay-400 text-xl text-muted-foreground leading-relaxed max-w-xl'>
                  {hero.description}
                </p>

                {/* CTAs */}
                <div className='animate-fade-in-up delay-500 flex flex-col sm:flex-row gap-4'>
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
                  <Button
                    asChild
                    variant='outline'
                    size='lg'
                    className='border-primary text-primary hover:bg-primary/10 bg-transparent'
                  >
                    <Link href='/about'>{hero.secondaryCta}</Link>
                  </Button>
                </div>

                {/* Stats */}
                <div className='animate-fade-in-up delay-600 grid grid-cols-3 gap-6 pt-4 max-w-md'>
                  {hero.stats.map(({ value, label }, i) => (
                    <div key={i} className='space-y-1'>
                      <div
                        className={`text-3xl font-bold ${STAT_COLORS[i]}`}
                      >
                        {value}
                      </div>
                      <div className='text-sm text-muted-foreground leading-tight'>
                        {label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right – Image */}
              <div className='animate-fade-in-scale delay-300 relative'>
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
                {/* Quote card */}
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
                {/* Floating accent dot */}
                <div className='absolute -top-4 -right-4 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 animate-pulse-dot' />
              </div>
            </div>
          </div>
        </section>

        {/* ── Print quote calculator ───────────────────────── */}
        <section
          id='tinh-gia'
          className='pt-20 lg:pt-28 pb-0 bg-muted/30 scroll-mt-20'
        >
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='text-center mb-12 space-y-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                Báo giá nhanh
              </p>
              <h2 className='text-3xl lg:text-5xl font-bold text-foreground font-mono tracking-tighter'>
                Tính giá in{' '}
                <span className='text-primary italic'>theo yêu cầu</span>
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Dán link mẫu trên MakerWorld để xem giá tham khảo khi in bằng
                nhựa PETG.
              </p>
            </AnimateIn>
            <AnimateIn>
              <PrintQuoteCalculator />
            </AnimateIn>
          </div>
        </section>

        {/* ── Featured Products ─────────────────────────────── */}
        <section className='pt-6 pb-20 lg:pb-28 bg-muted/30'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12'>
              <div className='space-y-3'>
                <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                  Nổi bật
                </p>
                <h2 className='text-3xl lg:text-4xl font-bold text-foreground'>
                  Sản phẩm nổi bật
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

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
              {featured.map((product, i) => (
                <AnimateIn key={product.id} delay={i * 80}>
                  <ProductCard product={product} priority={i < 3} index={i} />
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
