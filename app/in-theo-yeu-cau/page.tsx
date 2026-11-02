import { FacebookOrderButton } from '@/components/facebook-order-button'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { PrintQuoteCalculator } from '@/components/print-quote-calculator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatVnd, PRICE_PER_GRAM, PRICE_PER_HOUR } from '@/lib/print-quote'
import { ExternalLink, Printer } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hướng dẫn in theo yêu cầu',
  description:
    'Chọn mẫu 3D miễn phí trên MakerWorld, dán link để xem giá in và đặt hàng qua Facebook HMWorkshop.'
}

const MAKERWORLD_URL = 'https://makerworld.com/vi'

function StepNumber({ n }: { n: number }) {
  return (
    <span className='w-9 h-9 shrink-0 rounded-full bg-primary text-primary-foreground font-bold flex items-center justify-center'>
      {n}
    </span>
  )
}

export default function CustomPrintGuidePage() {
  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl'>
          <div className='text-center space-y-4 mb-10'>
            <Badge className='bg-primary text-primary-foreground'>
              <Printer className='w-3 h-3 mr-1' />
              In 3D theo yêu cầu
            </Badge>
            <h1 className='text-3xl lg:text-4xl font-bold'>
              Hướng dẫn in theo yêu cầu
            </h1>
            <p className='text-lg text-muted-foreground text-pretty'>
              Chọn mẫu bạn thích trên MakerWorld, xem
              giá in ngay tại đây và đặt hàng với shop qua Facebook.
            </p>
          </div>

          <ol className='space-y-8'>
            <li className='flex gap-4'>
              <StepNumber n={1} />
              <div className='space-y-3 min-w-0 flex-1'>
                <h2 className='text-xl font-bold pt-1'>Tìm mẫu và copy link</h2>
                <p className='text-muted-foreground'>
                  Vào MakerWorld (trang chia sẻ mô hình in 3D miễn phí), tìm sản
                  phẩm bạn muốn in rồi copy link trang mẫu đó.
                </p>
                <Button asChild size='sm' className='rounded-full'>
                  <a href={MAKERWORLD_URL} target='_blank' rel='noopener noreferrer'>
                    Mở MakerWorld
                    <ExternalLink className='w-3 h-3' />
                  </a>
                </Button>
              </div>
            </li>

            <li className='flex gap-4'>
              <StepNumber n={2} />
              <div className='space-y-3 min-w-0 flex-1'>
                <h2 className='text-xl font-bold pt-1'>Dán link để xem giá in</h2>
                <p className='text-muted-foreground'>
                  Dán link mẫu MakerWorld vào ô bên dưới, giá in sẽ hiện ra ngay.
                </p>
                <PrintQuoteCalculator />
                <div className='rounded-xl border border-border bg-muted/40 p-4 text-sm space-y-1'>
                  <p className='font-semibold text-foreground'>
                    Giá in được tính gồm 2 phần:
                  </p>
                  <ul className='list-disc pl-5 text-muted-foreground space-y-1'>
                    <li>
                      Tiền nhựa: <b className='text-foreground'>{formatVnd(PRICE_PER_GRAM)}/gam</b>{' '}
                      nhựa PETG mà mẫu sử dụng.
                    </li>
                    <li>
                      Tiền máy in: <b className='text-foreground'>{formatVnd(PRICE_PER_HOUR)}/giờ</b>{' '}
                      in.
                    </li>
                  </ul>
                  <p className='text-muted-foreground'>
                    Ví dụ: mẫu dùng 100 g nhựa, in 5 giờ = 100 ×{' '}
                    {formatVnd(PRICE_PER_GRAM)} + 5 × {formatVnd(PRICE_PER_HOUR)} ={' '}
                    {formatVnd(100 * PRICE_PER_GRAM + 5 * PRICE_PER_HOUR)}.
                  </p>
                </div>
              </div>
            </li>

            <li className='flex gap-4'>
              <StepNumber n={3} />
              <div className='space-y-3 min-w-0 flex-1'>
                <h2 className='text-xl font-bold pt-1'>Bấm đặt hàng</h2>
                <p className='text-muted-foreground'>
                  Bấm nút bên dưới để mở Messenger nhắn tin cho shop, gửi link
                  mẫu và màu bạn muốn.
                </p>
                <FacebookOrderButton />
              </div>
            </li>
          </ol>

          <div className='mt-10 rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-4'>
            <p className='font-bold text-foreground'>Lưu ý</p>
            <ul className='list-disc pl-5 text-sm text-muted-foreground space-y-1.5'>
              <li>
                Giá trên đã bao gồm in và gỡ sản phẩm thô.
              </li>
              <li>
                Chưa bao gồm xử lý chi tiết và lắp ghép với các mẫu có độ khó
                cao.
              </li>
              <li>Chưa bao gồm phí ship.</li>
              <li className='font-semibold text-foreground'>
                Khách hàng in theo yêu cầu cần thanh toán trước toàn bộ chi phí.
              </li>
            </ul>
            <FacebookOrderButton />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
