'use client'

import { BrandLogo } from '@/components/brand-logo'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/theme-toggle'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()

  const navigation = [
    { name: 'Trang chủ', href: '/' },
    { name: 'Sản phẩm', href: '/products' },
    { name: 'Feedback', href: '/feedbacks' },
    { name: 'Liên hệ', href: '/contact' }
  ]

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md tech-shadow'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between gap-4'>
          {/* Logo */}
          <Link
            href='/'
            className='flex shrink-0 items-center gap-2 font-bold text-xl group'
          >
            <BrandLogo />
          </Link>

          {/* Desktop Navigation */}
          <nav className='hidden md:flex items-center gap-5 lg:gap-8'>
            {navigation.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== '/' && pathname.startsWith(item.href))

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'text-xs uppercase tracking-wider lg:tracking-widest font-bold whitespace-nowrap transition-all hover:text-primary relative py-1',
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
          <div className='hidden md:flex shrink-0 items-center gap-3 lg:gap-4'>
            <ThemeToggle />
            <Button
              asChild
              className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-6 transition-transform hover:scale-105 active:scale-95 shadow-lg shadow-primary/20'
            >
              <Link href='/contact'>Đặt hàng ngay</Link>
            </Button>
          </div>

          {/* Mobile: theme switch + menu button */}
          <div className='flex md:hidden items-center gap-2'>
            <ThemeToggle />
            <Button
              variant='ghost'
              size='sm'
              className='text-foreground'
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className='w-5 h-5' />
              ) : (
                <Menu className='w-5 h-5' />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className='md:hidden py-4 border-t border-border'>
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
