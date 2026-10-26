'use client'

import { cn } from '@/lib/utils'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

/** Sun/moon switch for light and dark theme. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // The stored theme is only known on the client; render light until then.
  const dark = mounted && resolvedTheme === 'dark'

  return (
    <button
      type='button'
      role='switch'
      aria-checked={dark}
      aria-label={dark ? 'Chuyển sang giao diện sáng' : 'Chuyển sang giao diện tối'}
      title={dark ? 'Giao diện sáng' : 'Giao diện tối'}
      onClick={() => setTheme(dark ? 'light' : 'dark')}
      className={cn(
        'relative inline-flex h-8 w-14 shrink-0 items-center rounded-full border border-border bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        className
      )}
    >
      <Sun className='absolute left-1.5 w-4 h-4 text-primary' />
      <Moon className='absolute right-1.5 w-4 h-4 text-muted-foreground' />
      <span
        className={cn(
          'relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-card shadow-md transition-transform duration-300',
          dark ? 'translate-x-7' : 'translate-x-1'
        )}
      >
        {dark ? (
          <Moon className='w-3.5 h-3.5 text-primary' />
        ) : (
          <Sun className='w-3.5 h-3.5 text-primary' />
        )}
      </span>
    </button>
  )
}
