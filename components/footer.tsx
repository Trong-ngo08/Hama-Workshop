import { BrandLogo } from '@/components/brand-logo'
import { Facebook, Mail } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className='bg-card border-t border-border overflow-hidden relative'>
      <div className='absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none' />
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6 relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24'>
          {/* Brand */}
          <div className='space-y-8'>
            <Link
              href='/'
              className='flex items-center gap-2 font-bold text-2xl uppercase tracking-tighter font-mono'
            >
              <BrandLogo />
            </Link>
            <p className='text-sm text-muted-foreground leading-relaxed font-medium'>
              Xưởng in 3D cá nhân hóa theo yêu cầu. Quà tặng, đèn ngủ, decor và
              mọi ý tưởng bạn muốn biến thành hiện thực.
            </p>
          </div>

          {/* Quick Links */}
          <div className='space-y-4'>
            <h3 className='text-xs uppercase tracking-widest font-bold text-foreground'>
              Sản phẩm
            </h3>
            <nav className='flex flex-col gap-3'>
              <Link
                href='/products'
                className='text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Bộ sưu tập
              </Link>
              <Link
                href='/contact'
                className='text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Đặt hàng riêng
              </Link>
            </nav>
          </div>

          {/* Brand Links */}
          <div className='space-y-4'>
            <h3 className='text-xs uppercase tracking-widest font-bold text-foreground'>
              Thương hiệu
            </h3>
            <nav className='flex flex-col gap-3'>
              <Link
                href='/contact'
                className='text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Liên hệ
              </Link>
            </nav>
          </div>

          {/* Contact Info */}
          <div className='space-y-4'>
            <h3 className='text-xs uppercase tracking-widest font-bold text-foreground'>
              Kết nối
            </h3>
            <div className='space-y-4'>
              <div className='flex items-center gap-2 group'>
                <Mail className='w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors' />
                <span className='text-sm text-muted-foreground'>
                  ductn19970411@gmail.com
                </span>
              </div>
              <div className='flex items-center gap-6'>
                <Link
                  href='https://www.facebook.com/profile.php?id=61550244332051'
                  target='_blank'
                  className='text-muted-foreground hover:text-primary transition-colors flex items-start gap-2 group'
                >
                  <Facebook className='w-5 h-5' />
                  <span>HMWorkshop trên Facebook</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* <CHANGE> Removed policy links section to simplify footer */}
        <div className='mt-12 pt-6 border-t border-border/50 text-center'>
          <p className='text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold'>
            © 2025 HMWorkshop. Chế tác những phiên bản độc bản cho những con
            người duy nhất.
          </p>
        </div>
      </div>
    </footer>
  )
}
