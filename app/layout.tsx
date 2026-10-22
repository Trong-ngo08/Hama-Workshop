import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Space_Mono } from 'next/font/google'
import type React from 'react'
import { Toaster } from '@/components/ui/sonner'
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
  metadataBase: new URL('https://hmworkshop.vn'),
  title: {
    default: 'In 3D Cá Nhân Hóa Theo Yêu Cầu | Hama Workshop',
    template: '%s | Hama Workshop – In 3D theo yêu cầu'
  },
  description:
    'Xưởng in 3D cá nhân hóa theo yêu cầu: quà tặng khắc tên, đèn ngủ, decor, mô hình. Thiết kế riêng, không đại trà, tư vấn miễn phí, giao hàng toàn quốc.',
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
  authors: [{ name: 'Hama Workshop' }],
  creator: 'Hama Workshop',
  publisher: 'Hama Workshop',

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
    url: 'https://hmworkshop.vn',
    siteName: 'Hama Workshop',
    title: 'In 3D Cá Nhân Hóa Theo Yêu Cầu | Hama Workshop',
    description:
      'In 3D theo yêu cầu – mỗi sản phẩm được thiết kế riêng cho đúng người sử dụng.',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Sản phẩm in 3D cá nhân hóa – Hama Workshop'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'In 3D Cá Nhân Hóa Theo Yêu Cầu | Hama Workshop',
    description:
      'Sản phẩm in 3D cá nhân hóa. Không rập khuôn, không đại trà.',
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
    >
      <body
        className='font-sans antialiased'
        style={{ backgroundColor: '#faf9f6' }}
      >
        {children}
        <Toaster position='top-center' richColors />
        <Analytics />
      </body>
    </html>
  )
}
