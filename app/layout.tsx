import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Space_Mono } from 'next/font/google'
import type React from 'react'
import { FloatingContact } from '@/components/floating-contact'
import { SiteThemeProvider } from '@/components/site-theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { SITE_URL, localBusinessJsonLd } from '@/lib/site'
import './globals.css'

const beVietnamPro = Be_Vietnam_Pro({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-be-vietnam',
  weight: ['400', '500', '600', '700']
})

const spaceMono = Space_Mono({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-space-mono'
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'In 3D theo yêu cầu tại Nha Trang | HMWorkshop',
    template: '%s | HMWorkshop – In 3D theo yêu cầu'
  },
  description:
    'Xưởng in 3D theo yêu cầu tại Nha Trang: mô hình, quà tặng, đèn ngủ, decor in nhựa PETG. Dán link MakerWorld để xem giá ngay, giao hàng toàn quốc.',
  keywords: [
    'in 3d',
    'in 3d theo yêu cầu',
    'in 3d nha trang',
    'cá nhân hóa',
    'quà tặng cá nhân hóa',
    'đèn ngủ in 3d',
    'decor in 3d',
    'sản phẩm in 3d'
  ],
  authors: [{ name: 'HMWorkshop' }],
  creator: 'HMWorkshop',
  publisher: 'HMWorkshop',

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1
    }
  },

  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    siteName: 'HMWorkshop',
    title: 'In 3D theo yêu cầu tại Nha Trang | HMWorkshop',
    description:
      'Xưởng in 3D theo yêu cầu tại Nha Trang – mô hình, quà tặng, decor in nhựa PETG.',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sản phẩm in 3D cá nhân hóa – HMWorkshop'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'In 3D theo yêu cầu tại Nha Trang | HMWorkshop',
    description:
      'Xưởng in 3D theo yêu cầu tại Nha Trang. Không rập khuôn, không đại trà.',
    images: ['/hero-image.jpg']
  },

  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico'
  }
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang='vi'
      className={`${beVietnamPro.variable} ${spaceMono.variable}`}
      suppressHydrationWarning
    >
      <body className='font-sans antialiased'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }}
        />
        <SiteThemeProvider>
          {children}
          <FloatingContact />
          <Toaster position='top-center' richColors />
        </SiteThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
