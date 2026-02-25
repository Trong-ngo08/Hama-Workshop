import { AnimateIn } from '@/components/animate-in'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { Button } from '@/components/ui/button'
import { getIconComponent } from '@/lib/category-icons'
import { createClient } from '@/lib/supabase/server'
import {
  ArrowRight,
  Box,
  CheckCircle2,
  Hammer,
  MessageCircle,
  Package,
  Pencil,
  Printer,
  Sparkles,
  Trees
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

const PROCESS_STEPS = [
  {
    icon: MessageCircle,
    step: '01',
    title: 'Tư vấn',
    desc: 'Chia sẻ ý tưởng, yêu cầu thiết kế và ngân sách. Chúng tôi tư vấn miễn phí.'
  },
  {
    icon: Pencil,
    step: '02',
    title: 'Thiết kế',
    desc: 'Phác thảo bản thiết kế 2D/3D, chỉnh sửa đến khi bạn hoàn toàn hài lòng.'
  },
  {
    icon: Hammer,
    step: '03',
    title: 'Chế tác',
    desc: 'Thợ lành nghề gia công thủ công kết hợp công nghệ in 3D chính xác cao.'
  },
  {
    icon: Package,
    step: '04',
    title: 'Giao hàng',
    desc: 'Đóng gói bảo vệ kỹ lưỡng, giao tận nơi trên toàn quốc.'
  }
]

const MARQUEE_ITEMS = [
  'GỖ THỦ CÔNG',
  'IN 3D',
  'CÁ NHÂN HÓA',
  'ĐỘC BẢN',
  'KHÔNG ĐẠI TRÀ',
  'HAMA WORKSHOP',
  'THIẾT KẾ RIÊNG',
  'CHẤT LƯỢNG CAO'
]

const WOOD_FEATURES = [
  'Gỗ Walnut nhập khẩu',
  'Gỗ Oak nguyên khối',
  'Gỗ Ash tự nhiên',
  'Hoàn thiện dầu tự nhiên'
]

const PRINT_FEATURES = [
  'Công nghệ FDM & SLA',
  'Độ chính xác ±0.1mm',
  'Nhựa PETG / PLA+ cao cấp',
  'Phủ UV chống nước'
]

export default async function HomePage() {
  const supabase = await createClient()

  const [{ data: featuredProducts }, { data: categories }] = await Promise.all([
    supabase
      .from('products')
      .select(
        'id, name, description, price, category, images, is_featured, is_available, sale_price, discount_percentage'
      )
      .eq('is_featured', true)
      .eq('is_available', true)
      .order('created_at', { ascending: false })
      .limit(6),
    supabase.from('categories').select('*').order('name').limit(8)
  ])

  return (
    <div className='min-h-screen'>
      <Header />

      <main>
        {/* ── Hero ─────────────────────────────────────────── */}
        <section className='relative py-24 lg:py-36 overflow-hidden'>
          <div className='absolute inset-0 wood-texture' />
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
                  Cá nhân hóa theo yêu cầu
                </div>

                {/* Headline */}
                <div className='space-y-2'>
                  <h1 className='animate-fade-in-up delay-150 text-5xl lg:text-6xl font-bold leading-tight text-foreground'>
                    Gỗ thủ công
                  </h1>
                  <h1 className='animate-fade-in-up delay-300 text-5xl lg:text-6xl font-bold leading-tight text-primary'>
                    × Công nghệ in 3D
                  </h1>
                </div>

                <p className='animate-fade-in-up delay-400 text-xl text-muted-foreground leading-relaxed max-w-xl'>
                  Không chỉ là sản phẩm – đó là phiên bản dành riêng cho bạn.
                  Không đại trà. Không rập khuôn.
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
                      Khám phá sản phẩm
                      <ArrowRight className='w-4 h-4 ml-2 transition-transform group-hover:translate-x-1' />
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

                {/* Stats */}
                <div className='animate-fade-in-up delay-600 grid grid-cols-3 gap-6 pt-4 max-w-md'>
                  {[
                    { value: '100%', label: 'Thủ công' },
                    {
                      value: 'Custom',
                      label: 'Theo yêu cầu',
                      color: 'text-accent'
                    },
                    {
                      value: 'Độc đáo',
                      label: 'Cho bạn',
                      color: 'text-foreground'
                    }
                  ].map(({ value, label, color }) => (
                    <div key={label} className='space-y-1'>
                      <div
                        className={`text-3xl font-bold ${color ?? 'text-primary'}`}
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
                    src='/hero-image.jpg'
                    alt='Sản phẩm gỗ thủ công và in 3D của Hama Workshop'
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
                      Mỗi chi tiết đều có lý do tồn tại.
                    </p>
                  </div>
                </div>
                {/* Floating accent dot */}
                <div className='absolute -top-4 -right-4 w-8 h-8 rounded-full bg-accent/20 border border-accent/40 animate-pulse-dot' />
              </div>
            </div>
          </div>
        </section>

        {/* ── Featured Products ─────────────────────────────── */}
        <section className='py-20 lg:py-28 bg-muted/30'>
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
              {(featuredProducts ?? []).map((product, i) => (
                <AnimateIn key={product.id} delay={i * 80}>
                  <ProductCard product={product} priority={i < 3} />
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
        <section className='py-20 lg:py-28 overflow-hidden'>
          <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
            <AnimateIn className='text-center mb-16 space-y-4'>
              <p className='text-xs uppercase tracking-[0.3em] text-primary font-bold'>
                Vật liệu
              </p>
              <h2 className='text-3xl lg:text-5xl font-bold text-foreground font-mono tracking-tighter'>
                Hai thế giới,{' '}
                <span className='text-primary italic'>một sản phẩm</span>
              </h2>
            </AnimateIn>

            <div className='grid lg:grid-cols-2 gap-8'>
              {/* Wood */}
              <AnimateIn from='left'>
                <div className='group relative rounded-3xl overflow-hidden bg-foreground min-h-[400px] flex flex-col justify-end p-8 lg:p-10'>
                  <div className='absolute inset-0 wood-texture opacity-30' />
                  <div className='absolute top-8 right-8 w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center'>
                    <Trees className='w-9 h-9 text-primary' />
                  </div>
                  <div className='relative z-10 space-y-4'>
                    <p className='text-xs uppercase tracking-[0.25em] text-primary font-bold'>
                      Thủ công truyền thống
                    </p>
                    <h3 className='text-3xl font-bold text-primary-foreground'>
                      Gỗ tự nhiên
                    </h3>
                    <p className='text-primary-foreground/70 text-sm leading-relaxed max-w-sm'>
                      Chọn lọc từ những cánh rừng bền vững. Mỗi thớ gỗ là một
                      câu chuyện, được đôi bàn tay thợ lành nghề thổi hồn vào.
                    </p>
                    <ul className='space-y-2 pt-2'>
                      {WOOD_FEATURES.map((f) => (
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
                      Công nghệ FDM & SLA tạo ra những chi tiết phức tạp với độ
                      chính xác đến từng micromet mà thủ công không thể đạt
                      được.
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
