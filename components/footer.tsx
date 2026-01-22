import { Box, Facebook, Mail } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export function Footer() {
  return (
    <footer className='bg-card border-t border-border overflow-hidden relative'>
      <div className='absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none' />
      <div className='container mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24 relative z-10'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-24'>
          {/* Brand */}
          <div className='space-y-8'>
            <Link
              href='/'
              className='flex items-center gap-2 font-bold text-2xl uppercase tracking-tighter font-mono'
            >
              <div className='w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20'>
                <Box className='w-5 h-5 text-primary-foreground' />
              </div>
              <Image
                src='/logo.png'
                alt='Hama Workshop'
                width={100}
                height={40}
                className='h-[40px] w-auto'
              />
            </Link>
            <p className='text-sm text-muted-foreground leading-relaxed font-medium'>
              Cá nhân hóa theo yêu cầu. Gỗ thủ công kết hợp công nghệ in 3D hiện
              đại. Tương lai của sự sáng tạo nằm ở đôi bàn tay bạn.
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
                href='/products?category=wood'
                className='text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Đồ gỗ thủ công
              </Link>
              <Link
                href='/products?category=3d-print'
                className='text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                In 3D hiện đại
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
                href='/about'
                className='text-sm text-muted-foreground hover:text-primary transition-colors'
              >
                Câu chuyện
              </Link>
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
                  <span>Hmworkshop Wooden Gift and Decor Ornament</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* <CHANGE> Removed policy links section to simplify footer */}
        <div className='mt-24 pt-8 border-t border-border/50 text-center'>
          <p className='text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold'>
            © 2025 Hama Workshop. Chế tác những phiên bản độc bản cho những con
            người duy nhất.
          </p>
        </div>
      </div>
    </footer>
  )
}
