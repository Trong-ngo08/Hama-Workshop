'use client'

import { cn } from '@/lib/utils'
import { SendHorizontal, X } from 'lucide-react'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'

const MESSENGER_URL = 'https://m.me/61550244332051'
const ZALO_URL = 'https://zalo.me/0325311497'

// Messenger glyph from Simple Icons (CC0).
const MESSENGER_PATH =
  'M.001 11.639C.001 4.949 5.241 0 12.001 0S24 4.95 24 11.639c0 6.689-5.24 11.638-12 11.638-1.21 0-2.38-.16-3.47-.46a.96.96 0 00-.64.05l-2.39 1.05a.96.96 0 01-1.35-.85l-.07-2.14a.97.97 0 00-.32-.68A11.39 11.389 0 01.002 11.64zm8.32-2.19l-3.52 5.6c-.35.53.32 1.139.82.75l3.79-2.87c.26-.2.6-.2.87 0l2.8 2.1c.84.63 2.04.4 2.6-.48l3.52-5.6c.35-.53-.32-1.13-.82-.75l-3.79 2.87c-.25.2-.6.2-.86 0l-2.8-2.1a1.8 1.8 0 00-2.61.48z'

const QUICK_REPLIES = [
  'Mình muốn báo giá in theo yêu cầu',
  'Mẫu có sẵn còn hàng không ạ?',
  'Tư vấn màu sắc giúp mình'
]

const buttonClass =
  'group relative flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform duration-200 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary'

function Label({ children }: { children: string }) {
  return (
    <span className='pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background opacity-0 translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0 hidden sm:block'>
      {children}
    </span>
  )
}

function MessengerGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox='0 0 24 24' className={className} aria-hidden='true'>
      <path d={MESSENGER_PATH} />
    </svg>
  )
}

/**
 * Floating chat shortcuts shown on every public page. Facebook no longer
 * allows embedding Messenger, so the chat panel collects the first message
 * and hands it to m.me (the Messenger app on phones) with the text prefilled.
 */
export function FloatingContact() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    // Skip on touch devices so the keyboard doesn't pop up on open.
    if (window.matchMedia('(pointer: fine)').matches) inputRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  if (pathname.startsWith('/admin') || pathname.startsWith('/auth')) return null

  const send = (message: string) => {
    const msg = message.trim()
    const url = msg ? `${MESSENGER_URL}?text=${encodeURIComponent(msg)}` : MESSENGER_URL
    window.open(url, '_blank', 'noopener,noreferrer')
    setText('')
  }

  return (
    <div className='fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3'>
      {open ? (
        <div
          role='dialog'
          aria-label='Chat với HMWorkshop qua Messenger'
          className='w-[22rem] max-w-[calc(100vw-2.5rem)] overflow-hidden rounded-2xl bg-card shadow-2xl border border-border animate-fade-in-up'
        >
          {/* Header */}
          <div className='flex items-center gap-3 bg-gradient-to-r from-[#00B2FF] to-[#006AFF] px-4 py-3 text-white'>
            <span className='relative flex w-10 h-10 shrink-0 items-center justify-center rounded-full bg-white overflow-hidden'>
              <Image src='/logo.png' alt='' width={40} height={40} className='w-8 h-auto' />
              <span className='absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 ring-2 ring-white' />
            </span>
            <div className='min-w-0 flex-1'>
              <p className='font-bold leading-tight'>HMWorkshop</p>
              <p className='text-xs text-white/80'>Nhắn tin qua Messenger</p>
            </div>
            <button
              type='button'
              onClick={() => setOpen(false)}
              aria-label='Đóng khung chat'
              className='w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/20 transition-colors'
            >
              <X className='w-5 h-5' />
            </button>
          </div>

          {/* Conversation */}
          <div className='space-y-3 bg-muted/40 px-4 py-4'>
            <div className='max-w-[85%] rounded-2xl rounded-bl-sm bg-card border border-border px-3.5 py-2.5 text-sm text-foreground'>
              Chào bạn! HMWorkshop có thể giúp gì cho bạn ạ?
            </div>
            <div className='flex flex-wrap justify-end gap-2'>
              {QUICK_REPLIES.map((q) => (
                <button
                  key={q}
                  type='button'
                  onClick={() => send(q)}
                  className='rounded-full border border-[#0084FF]/40 bg-card px-3 py-1.5 text-xs font-medium text-[#0068d6] hover:bg-[#0084FF] hover:text-white transition-colors'
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(text)
            }}
            className='flex items-center gap-2 border-t border-border bg-card px-3 py-2.5'
          >
            <input
              ref={inputRef}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder='Nhập tin nhắn...'
              aria-label='Tin nhắn'
              className='min-w-0 flex-1 rounded-full bg-muted px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#0084FF]/40'
            />
            <button
              type='submit'
              aria-label='Gửi qua Messenger'
              className='w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-[#0084FF] hover:bg-[#0084FF]/10 transition-colors'
            >
              <SendHorizontal className='w-5 h-5' />
            </button>
          </form>
          <p className='bg-card pb-2.5 text-center text-[11px] text-muted-foreground'>
            Tin nhắn sẽ mở trong Messenger để gửi cho shop.
          </p>
        </div>
      ) : (
        <a
          href={ZALO_URL}
          target='_blank'
          rel='noopener noreferrer'
          aria-label='Nhắn tin Zalo'
          className={cn(buttonClass, 'bg-white')}
        >
          <Label>Nhắn Zalo</Label>
          <Image src='/zalo.png' alt='' width={56} height={56} className='w-14 h-14 rounded-full' />
        </a>
      )}

      <button
        type='button'
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Đóng khung chat' : 'Nhắn tin Messenger'}
        aria-expanded={open}
        className={cn(buttonClass, 'bg-gradient-to-br from-[#00B2FF] to-[#006AFF]')}
      >
        {!open && (
          <span className='absolute inset-0 rounded-full bg-[#0084FF] animate-ping opacity-25' />
        )}
        {!open && <Label>Nhắn Messenger</Label>}
        {open ? (
          <X className='relative w-7 h-7 text-white' />
        ) : (
          <MessengerGlyph className='relative w-7 h-7 fill-white' />
        )}
      </button>
    </div>
  )
}
