import { AnimateIn } from '@/components/animate-in'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { PrintQuoteCalculator } from '@/components/print-quote-calculator'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { getIconComponent } from '@/lib/category-icons'
import { applyDiscountSetting } from '@/lib/pricing'
import { getDiscountsEnabled, getHeroContent } from '@/lib/settings'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Gift,
  Lamp,
  MessageCircle,
  Package,
  Pencil,
  PencilRuler,
  PenTool,
  Shapes,
  Printer,
  Sparkles
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const STAT_COLORS = ['text-primary', 'text-accent', 'text-foreground']

const PROCESS_STEPS = [
  {
    icon: MessageCircle,
    step: '01',
    title: 'Tư vấn',
    desc: 'Gửi ý tưởng, hình ảnh tham khảo hoặc chỉ một dòng mô tả. Chúng tôi tư vấn và báo giá miễn phí.'
  },
  {
    icon: Pencil,
    step: '02',
    title: 'Thiết kế 3D',
    desc: 'Dựng mô hình 3D, gửi bản xem trước và chỉnh sửa đến khi bạn thật sự ưng ý.'
  },
  {
    icon: Printer,
    step: '03',
    title: 'In & hoàn thiện',
    desc: 'In từng lớp trên máy đã hiệu chỉnh kỹ, sau đó xử lý bề mặt, lắp ráp và kiểm tra từng chi tiết.'
  },
  {
    icon: Package,
    step: '04',
    title: 'Giao hàng',
    desc: 'Đóng gói chống va đập cẩn thận, giao tận nơi trên toàn quốc.'
  }
]

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

const DESIGN_FEATURES = [
  'Dựng mô hình từ ảnh hoặc bản phác tay',
  'Xem trước bản 3D trước khi in',
  'Khắc tên, logo, lời nhắn riêng',
  'Tùy chỉnh kích thước & màu sắc'
]

const USE_CASES = [
  {
    icon: Gift,
    title: 'Quà tặng cá nhân hóa',
    desc: 'Khắc tên, ngày kỷ niệm hay lời nhắn riêng — món quà không ai khác có được.'
  },
  {
    icon: Lamp,
    title: 'Đèn ngủ & decor',
    desc: 'Đèn ngủ, vật trang trí góc phòng với ánh sáng ấm áp và hình khối độc đáo.'
  },
  {
    icon: Shapes,
    title: 'Mô hình & figure',
    desc: 'Nhân vật, mô hình thu nhỏ, kỷ vật được tái hiện sắc nét từng chi tiết.'
  },
  {
    icon: PencilRuler,
    title: 'Phụ kiện tiện ích',
    desc: 'Giá đỡ, hộp đựng, phụ kiện bàn làm việc thiết kế vừa khít nhu cầu của bạn.'
  }
]

const PRINT_FEATURES = [
  'Công nghệ in FDM',
  'Độ chính xác ±0.1 mm',
  '100% nhựa PETG',
  'Bền, chịu nhiệt, chống nước'
]

export default async function HomePage() {
  const supabase = await createClient()

  const [
    { data: featuredProducts },
    { data: categories },
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
    supabase.from('categories').select('*').order('name').limit(8),
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
          className='pt-20 lg:pt-28 pb-8 bg-muted/30 scroll-mt-20'
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
        <section className='pt-8 pb-20 lg:pb-28 bg-muted/30'>
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

        {/* ── Process ──────────────────────────────────────── */}
        <section className='py-20 lg:py-28'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='text-center mb-16 space-y-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                Quy trình
              </p>
              <h2 className='text-3xl lg:text-5xl font-bold text-foreground font-mono tracking-tighter'>
                Từ ý tưởng đến{' '}
                <span className='text-primary italic'>thực tế</span>
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Bốn bước đơn giản để có một sản phẩm hoàn toàn mang dấu ấn của
                bạn.
              </p>
            </AnimateIn>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8'>
              {PROCESS_STEPS.map(({ icon: Icon, step, title, desc }, i) => (
                <AnimateIn key={step} delay={i * 100} className='relative'>
                  <div className='group p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-lg transition-all duration-300 h-full'>
                    {/* Step number */}
                    <div className='flex items-center justify-between mb-6'>
                      <div className='w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                        <Icon className='w-7 h-7 text-primary' />
                      </div>
                      <span className='text-5xl font-bold text-border group-hover:text-primary/20 transition-colors font-mono'>
                        {step}
                      </span>
                    </div>
                    <h3 className='text-lg font-bold text-foreground mb-2 uppercase tracking-tight'>
                      {title}
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {desc}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Materials showcase ────────────────────────────── */}
        <section className='py-20 lg:py-28 overflow-hidden bg-muted/30'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='text-center mb-16 space-y-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                Thiết kế & Công nghệ
              </p>
              <h2 className='text-3xl lg:text-5xl font-bold text-foreground font-mono tracking-tighter'>
                Từng lớp nhựa,{' '}
                <span className='text-primary italic'>một dấu ấn</span>
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Ý tưởng của bạn được dựng thành mô hình 3D, rồi in ra thành vật
                thể thật — chính xác đến từng chi tiết nhỏ.
              </p>
            </AnimateIn>

            <div className='grid lg:grid-cols-2 gap-8'>
              {/* Custom 3D design */}
              <AnimateIn from='left'>
                <div className='group relative rounded-3xl overflow-hidden bg-foreground min-h-[400px] flex flex-col justify-end p-8 lg:p-10'>
                  <div className='absolute inset-0 warm-texture opacity-30' />
                  <div className='absolute top-8 right-8 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center'>
                    <PenTool className='w-9 h-9 text-primary' />
                  </div>
                  <div className='relative z-10 space-y-4'>
                    <p className='text-xs uppercase tracking-[0.25em] text-primary font-bold'>
                      Thiết kế theo yêu cầu
                    </p>
                    <h3 className='text-3xl font-bold text-primary-foreground'>
                      Mô hình hóa ý tưởng
                    </h3>
                    <p className='text-primary-foreground/70 text-sm leading-relaxed max-w-sm'>
                      Một tấm ảnh, một bản phác tay hay chỉ một câu mô tả là đủ.
                      Chúng tôi dựng mô hình 3D, gửi bạn duyệt trước rồi mới bắt
                      đầu in.
                    </p>
                    <ul className='space-y-2 pt-2'>
                      {DESIGN_FEATURES.map((f) => (
                        <li
                          key={f}
                          className='flex items-center gap-2 text-sm text-primary-foreground/80'
                        >
                          <CheckCircle2 className='w-4 h-4 text-primary shrink-0' />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateIn>

              {/* 3D Print */}
              <AnimateIn from='right'>
                <div className='group relative rounded-3xl overflow-hidden bg-accent/10 border border-accent/20 min-h-[400px] flex flex-col justify-end p-8 lg:p-10'>
                  <div className='absolute top-8 right-8 w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center'>
                    <Printer className='w-9 h-9 text-accent' />
                  </div>
                  {/* Decorative grid */}
                  <div
                    className='absolute inset-0 opacity-[0.04]'
                    style={{
                      backgroundImage:
                        'linear-gradient(#5a9fa8 1px, transparent 1px), linear-gradient(90deg, #5a9fa8 1px, transparent 1px)',
                      backgroundSize: '32px 32px'
                    }}
                  />
                  <div className='relative z-10 space-y-4'>
                    <p className='text-xs uppercase tracking-[0.25em] text-accent font-bold'>
                      Công nghệ hiện đại
                    </p>
                    <h3 className='text-3xl font-bold text-foreground'>
                      In 3D chính xác
                    </h3>
                    <p className='text-muted-foreground text-sm leading-relaxed max-w-sm'>
                      In FDM bằng nhựa PETG tạo nên những hình khối phức tạp,
                      đường nét sắc sảo và độ bền cao — điều mà cách làm truyền
                      thống khó lòng đạt được.
                    </p>
                    <ul className='space-y-2 pt-2'>
                      {PRINT_FEATURES.map((f) => (
                        <li
                          key={f}
                          className='flex items-center gap-2 text-sm text-foreground/80'
                        >
                          <CheckCircle2 className='w-4 h-4 text-accent shrink-0' />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </AnimateIn>
            </div>
          </div>
        </section>

        {/* ── Use cases ─────────────────────────────────────── */}
        <section className='py-20 lg:py-28'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='text-center mb-16 space-y-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                Ứng dụng
              </p>
              <h2 className='text-3xl lg:text-5xl font-bold text-foreground font-mono tracking-tighter'>
                In được gì?{' '}
                <span className='text-primary italic'>Gần như mọi thứ</span>
              </h2>
              <p className='text-muted-foreground max-w-xl mx-auto'>
                Chỉ cần bạn hình dung được, chúng tôi sẽ tìm cách in ra nó.
              </p>
            </AnimateIn>

            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
              {USE_CASES.map(({ icon: Icon, title, desc }, i) => (
                <AnimateIn key={title} delay={i * 100}>
                  <div className='group h-full p-6 rounded-2xl bg-card border border-border hover:border-accent/40 hover:-translate-y-1 hover:shadow-lg transition-all duration-300'>
                    <div className='w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-5 group-hover:bg-accent/20 transition-colors'>
                      <Icon className='w-6 h-6 text-accent' />
                    </div>
                    <h3 className='text-lg font-bold text-foreground mb-2'>
                      {title}
                    </h3>
                    <p className='text-sm text-muted-foreground leading-relaxed'>
                      {desc}
                    </p>
                  </div>
                </AnimateIn>
              ))}
            </div>
          </div>
        </section>

        {/* ── Category grid ─────────────────────────────────── */}
        {categories && categories.length > 0 && (
          <section className='py-20 lg:py-28 bg-muted/30'>
            <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
              <AnimateIn className='text-center mb-12 space-y-4'>
                <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                  Danh mục
                </p>
                <h2 className='text-3xl lg:text-4xl font-bold text-foreground'>
                  Khám phá theo danh mục
                </h2>
              </AnimateIn>

              <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'>
                {categories.map((cat, i) => {
                  const Icon = getIconComponent(cat.icon)
                  return (
                    <AnimateIn key={cat.id} delay={i * 60} from='scale'>
                      <Link
                        href={`/products?category=${encodeURIComponent(cat.name.toLowerCase())}`}
                        className='group flex flex-col items-center gap-3 p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-md'
                      >
                        <div className='w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors'>
                          <Icon className='w-7 h-7 text-primary' />
                        </div>
                        <span className='text-sm font-semibold text-foreground text-center leading-tight'>
                          {cat.name}
                        </span>
                      </Link>
                    </AnimateIn>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ───────────────────────────────────────────── */}
        <section className='py-20 lg:py-32 relative overflow-hidden'>
          <div className='absolute inset-0 minimal-gradient opacity-[0.06]' />
          <div className='absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/5 animate-spin-slow pointer-events-none' />
          <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative'>
            <AnimateIn
              from='scale'
              className='max-w-3xl mx-auto text-center space-y-8'
            >
              <div className='space-y-4'>
                <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                  Bắt đầu ngay
                </p>
                <h2 className='text-4xl lg:text-6xl font-bold text-foreground font-mono tracking-tighter'>
                  Tạo sản phẩm
                  <span className='block text-primary italic'>
                    của riêng bạn
                  </span>
                </h2>
                <p className='text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed'>
                  Chúng tôi không tạo ra sản phẩm để bán đại trà. Chúng tôi tạo
                  ra sản phẩm để phù hợp với đúng một người — bạn.
                </p>
              </div>

              <div className='flex flex-col sm:flex-row gap-4 justify-center'>
                <Button
                  asChild
                  size='lg'
                  className='bg-primary hover:bg-primary/90 text-primary-foreground h-14 px-8 text-base group'
                >
                  <Link href='/contact'>
                    <MessageCircle className='w-5 h-5 mr-2' />
                    Đặt hàng theo yêu cầu
                    <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-1' />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant='outline'
                  size='lg'
                  className='border-foreground/20 hover:bg-foreground/5 bg-transparent h-14 px-8 text-base'
                >
                  <Link href='/about'>Tìm hiểu thêm</Link>
                </Button>
              </div>

              {/* Trust badges */}
              <div className='flex flex-wrap items-center justify-center gap-6 pt-4 text-xs text-muted-foreground font-medium uppercase tracking-widest'>
                {[
                  'Tư vấn miễn phí',
                  'Giao hàng toàn quốc',
                  'Bảo hành chất lượng'
                ].map((badge) => (
                  <div key={badge} className='flex items-center gap-1.5'>
                    <CheckCircle2 className='w-3.5 h-3.5 text-primary' />
                    {badge}
                  </div>
                ))}
              </div>
            </AnimateIn>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
