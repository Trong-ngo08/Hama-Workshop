'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { logout } from '@/lib/auth'
import { cn } from '@/lib/utils'
import {
  Box,
  Home,
  ImageIcon,
  LogOut,
  Menu,
  MessageSquare,
  Package,
  Settings,
  Users,
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminHeader() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const navigation = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Danh mục', href: '/admin/categories', icon: Users },
    { name: 'Hình ảnh Về chúng tôi', href: '/admin/about-images', icon: ImageIcon },
    { name: 'Feedbacks', href: '/admin/feedbacks', icon: MessageSquare },
    { name: 'Cài đặt', href: '/admin/settings', icon: Settings },
  ]

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href))

  const handleLogout = async () => {
    await logout()
  }

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white shadow-sm'>
      <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex h-16 items-center justify-between'>

          {/* Logo */}
          <Link href='/admin' className='flex items-center gap-2 font-bold text-xl group'>
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

          {/* Desktop Navigation — lg and above only */}
          <nav className='hidden lg:flex items-center gap-6'>
            {navigation.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary',
                    isActive(item.href) ? 'text-primary' : 'text-gray-700'
                  )}
                >
                  <Icon className='w-4 h-4' />
                  {item.name}
                </Link>
              )
            })}
          </nav>

          {/* Desktop Actions — lg and above only */}
          <div className='hidden lg:flex items-center gap-4'>
            <Button variant='ghost' size='sm' asChild>
              <Link href='/' className='text-gray-700 hover:text-primary'>
                Xem trang chủ
              </Link>
            </Button>
            <Button
              variant='ghost'
              size='sm'
              onClick={handleLogout}
              className='text-gray-700 hover:text-primary'
            >
              <LogOut className='w-4 h-4 mr-2' />
              Đăng xuất
            </Button>
          </div>

          {/* Hamburger — below lg (iPad portrait + phone) */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='flex lg:hidden h-10 w-10'
                aria-label='Mở menu'
              >
                <Menu className='w-5 h-5' />
              </Button>
            </SheetTrigger>
            <SheetContent side='right' className='w-72 p-0 flex flex-col'>
              <SheetHeader className='px-6 py-4 border-b'>
                <SheetTitle className='flex items-center gap-2 text-base'>
                  <div className='w-7 h-7 rounded-lg bg-primary flex items-center justify-center'>
                    <Box className='w-3.5 h-3.5 text-primary-foreground' />
                  </div>
                  Admin Panel
                </SheetTitle>
              </SheetHeader>

              <nav className='flex flex-col py-2 flex-1'>
                {navigation.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors active:bg-gray-100',
                        isActive(item.href)
                          ? 'text-primary bg-primary/5'
                          : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                      )}
                    >
                      <Icon className='w-5 h-5 flex-shrink-0' />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>

              <div className='border-t px-4 py-4 space-y-1'>
                <Button variant='ghost' size='sm' asChild className='w-full justify-start h-11'>
                  <Link href='/' onClick={() => setOpen(false)} className='text-gray-700'>
                    Xem trang chủ
                  </Link>
                </Button>
                <Button
                  variant='ghost'
                  size='sm'
                  onClick={handleLogout}
                  className='w-full justify-start h-11 text-gray-700'
                >
                  <LogOut className='w-4 h-4 mr-2' />
                  Đăng xuất
                </Button>
              </div>
            </SheetContent>
          </Sheet>

        </div>
      </div>
    </header>
  )
}
