'use client'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Box, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Về chúng tôi', href: '/about' },
    { name: 'Liên hệ', href: '/contact' }
  ]

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md tech-shadow'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>
          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 font-bold text-xl group'
          >
            <div className='w-8 h-8 rounded-lg bg-primary flex items-center justify-center transition-transform group-hover:rotate-12 duration-300'>
              <Box className='w-4 h-4 text-primary-foreground' />
            </div>
            <Image
              src='/logo.png'
              alt='Logo'
              width={200}
              className='h-[40px] w-auto'
              height={64}
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-8'>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-xs uppercase tracking-widest font-bold transition-all hover:text-primary relative py-1',
                    isActive
                      ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                      : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Contact Button */}
          <div className='hidden md:flex items-center gap-4'>
            <Button
              asChild
              className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
            >
              <Link href='/contact'>Đặt hàng ngay</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant='ghost'
            size='sm'
            className='md:hidden text-gray-700'
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className='w-5 h-5' />
            ) : (
              <Menu className='w-5 h-5' />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-200'>
            <nav className='flex flex-col gap-4'>
              {navigation.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname.startsWith(item.href))

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary relative py-1',
                      isActive
                        ? 'text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary'
                        : 'text-muted-foreground'
                    )}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )
              })}
              <Button
                asChild
                className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20 w-fit'
              >
                <Link href='/contact' onClick={() => setIsMenuOpen(false)}>
                  Đặt hàng ngay
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
