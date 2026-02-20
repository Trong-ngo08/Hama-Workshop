import { Analytics } from '@vercel/analytics/next'
import type { Metadata } from 'next'
import { Be_Vietnam_Pro, Space_Mono } from 'next/font/google'
import type React from 'react'
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
    default: 'Cá Nhân Hóa Theo Yêu Cầu | Gỗ Thủ Công × In 3D',
    template: '%s | Gỗ Thủ Công × In 3D'
  },
  description:
    'Sản phẩm gỗ thủ công và in 3D cá nhân hóa theo yêu cầu. Thiết kế riêng, không đại trà, phù hợp làm quà tặng, decor và sử dụng lâu dài.',
  keywords: [
    'gỗ thủ công',
    'in 3d',
    'cá nhân hóa',
    'đồ gỗ decor',
    'quà tặng cá nhân hóa',
    'sản phẩm in 3d',
    'đồ gỗ handmade'
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
    title: 'Cá Nhân Hóa Theo Yêu Cầu | Gỗ Thủ Công × In 3D',
    description:
      'Gỗ thủ công kết hợp in 3D hiện đại. Mỗi sản phẩm được thiết kế riêng cho đúng người sử dụng.',
    images: [
      {
        url: '/hero-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gỗ thủ công và in 3D cá nhân hóa'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Cá Nhân Hóa Theo Yêu Cầu | Gỗ Thủ Công × In 3D',
    description:
      'Sản phẩm gỗ thủ công và in 3D cá nhân hóa. Không rập khuôn, không đại trà.',
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
        <Analytics />
      </body>
    </html>
  )
}
