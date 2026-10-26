'use client'

import { ThemeProvider } from '@/components/theme-provider'
import { usePathname } from 'next/navigation'
import type React from 'react'

/**
 * Light/dark theme for the storefront. Admin pages use hardcoded light
 * colours, so they stay light whatever the visitor picked.
 */
export function SiteThemeProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const lightOnly = pathname.startsWith('/admin') || pathname.startsWith('/auth')

  return (
    <ThemeProvider
      attribute='class'
      defaultTheme='light'
      enableSystem={false}
      disableTransitionOnChange
      forcedTheme={lightOnly ? 'light' : undefined}
    >
      {children}
    </ThemeProvider>
  )
}
