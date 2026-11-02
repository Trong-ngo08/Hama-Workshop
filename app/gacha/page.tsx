import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Gift } from 'lucide-react'
import type { Metadata } from 'next'
import GachaClient from './gacha-client'

export const metadata: Metadata = {
  title: 'Quay gacha miễn phí',
  description:
    'Quay vòng quay may mắn HMWorkshop miễn phí, trúng phiếu giảm giá, clicker hoặc mô hình in 3D.'
}

export default function GachaPage() {
  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center space-y-4 mb-10'>
            <Badge className='bg-primary text-primary-foreground'>
              <Gift className='w-3 h-3 mr-1' />
              Miễn phí
            </Badge>
            <h1 className='text-3xl lg:text-4xl font-bold'>Quay gacha nhận quà</h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty'>
              Bấm quay để thử vận may: phiếu giảm giá, clicker hoặc một mô hình
              in 3D do shop chọn.
            </p>
          </div>

          <GachaClient />
        </div>
      </main>

      <Footer />
    </div>
  )
}
