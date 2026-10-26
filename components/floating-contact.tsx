'use client'

import { cn } from '@/lib/utils'
import Image from 'next/image'
import { usePathname } from 'next/navigation'

const MESSENGER_URL = 'https://m.me/61550244332051'
const ZALO_URL = 'https://zalo.me/0325311497'

// Messenger glyph from Simple Icons (CC0).
const MESSENGER_PATH =
  'M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z'

const linkClass =
  'group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'

function Label({ children }: { children: string }) {
  return (
    <span className='pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background opacity-0 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block'>
      {children}
    </span>
  )
}

/** Floating chat shortcuts shown on every public page. */
export function FloatingContact() {
  const pathname = usePathname()
  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return null

  return (
    <div className='fixed bottom-5 right-5 z-50 flex flex-col gap-3'>
      <a
        href={ZALO_URL}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Nhắn tin Zalo'
        className={cn(linkClass, 'bg-white')}
      >
        <Label>Nhắn Zalo</Label>
        <Image src='/zalo.png' alt='' width={56} height={56} className='w-14 h-14 rounded-full' />
      </a>

      <a
        href={MESSENGER_URL}
        target='_blank'
        rel='noopener noreferrer'
        aria-label='Nhắn tin Messenger'
        className={cn(linkClass, 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF]')}
      >
        <span className='absolute inset-0 rounded-full bg-[#0084FF] animate-ping opacity-25' />
        <Label>Nhắn Messenger</Label>
        <svg viewBox='0 0 24 24' className='relative w-7 h-7 fill-white' aria-hidden='true'>
          <path d={MESSENGER_PATH} />
        </svg>
      </a>
    </div>
  )
}
