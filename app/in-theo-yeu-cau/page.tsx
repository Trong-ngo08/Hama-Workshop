import { FacebookOrderButton } from '@/components/facebook-order-button'
import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { PrintQuoteCalculator } from '@/components/print-quote-calculator'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatVnd,
  MIN_ORDER,
  PRICE_PER_GRAM,
  PRICE_PER_HOUR
} from '@/lib/print-quote'
import { BUSINESS } from '@/lib/site'
import { ExternalLink, Printer, Star } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'In 3D theo yêu cầu tại Nha Trang – Bảng giá | HMWorkshop' },
  description:
    'Dịch vụ in 3D theo yêu cầu tại Nha Trang bằng nhựa PETG. Giá 800đ/gam + 8.000đ/giờ in, dán link MakerWorld xem giá ngay, giao hàng toàn quốc.',
  alternates: { canonical: '/in-theo-yeu-cau' },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/in-theo-yeu-cau',
    siteName: 'HMWorkshop',
    title: 'In 3D theo yêu cầu tại Nha Trang | HMWorkshop',
    description:
      'Dán link mẫu MakerWorld để xem giá in 3D ngay. Nhựa PETG, xưởng tại Nha Trang, giao toàn quốc.',
    images: [{ url: '/hero-image.jpg', width: 1200, height: 630 }]
  }
}

const FAQS = [
  {
    q: 'Xưởng in 3D của HMWorkshop ở đâu tại Nha Trang?',
    a: `Xưởng ở ${BUSINESS.addressText}. Bạn có thể nhắn tin hoặc gọi ${BUSINESS.phone} (có Zalo) trước khi ghé, hoặc đặt online và nhận hàng tận nơi.`
  },
  {
    q: 'Giá in 3D theo yêu cầu được tính thế nào?',
    a: `Giá = số gam nhựa × ${formatVnd(PRICE_PER_GRAM)} + số giờ in × ${formatVnd(PRICE_PER_HOUR)}. Dán link mẫu MakerWorld vào bảng tính giá ở trên là thấy giá ngay. Shop nhận đơn in theo yêu cầu từ ${formatVnd(MIN_ORDER)}.`
  },
  {
    q: 'Shop in bằng nhựa gì?',
    a: 'Shop in bằng nhựa PETG: bền, dẻo dai, chịu nhiệt tốt hơn PLA, phù hợp cả đồ trang trí lẫn đồ dùng hằng ngày. Có nhiều màu để bạn chọn.'
  },
  {
    q: 'Tôi chưa có file 3D thì có in được không?',
    a: 'Được. Bạn tìm mẫu có sẵn trên MakerWorld (miễn phí) rồi gửi link cho shop. Nếu bạn có ý tưởng riêng hoặc ảnh mẫu, hãy nhắn tin để shop tư vấn.'
  },
  {
    q: 'Mẫu có nhiều profile (file in) thì chọn cái nào?',
    a: 'Chọn 1 profile bạn muốn in, giá tính theo profile đó chứ không cộng tất cả. Nếu chưa biết chọn, hãy lấy profile có nhãn "Shop đề xuất" – profile được nhiều người in và đánh giá tốt nhất.'
  },
  {
    q: 'Bao lâu thì nhận được hàng?',
    a: 'Thời gian in của từng mẫu hiện ngay trong bảng tính giá. Khi nhận đơn, shop sẽ báo ngày hoàn thiện cụ thể. Khách ở Nha Trang có thể nhận tại xưởng, khách tỉnh khác shop gửi giao hàng toàn quốc.'
  },
  {
    q: 'Thanh toán như thế nào?',
    a: 'Với đơn in theo yêu cầu, bạn thanh toán trước toàn bộ chi phí, shop bắt đầu in ngay sau khi xác nhận.'
  }
]

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a }
  }))
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
              In 3D theo yêu cầu tại Nha Trang
            </h1>
            <p className='text-lg text-muted-foreground text-pretty'>
              HMWorkshop là xưởng in 3D ở Nha Trang, nhận in mô hình, quà tặng,
              đèn ngủ, đồ decor và đồ dùng theo mẫu bạn chọn. Chọn mẫu trên
              MakerWorld, chọn profile in, xem giá ngay tại đây và nhắn tin cho
              shop qua Messenger.
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
                <h2 className='text-xl font-bold pt-1'>Chọn 1 profile in</h2>
                <p className='text-muted-foreground'>
                  Một mẫu trên MakerWorld thường có nhiều profile (file in): bản
                  đầy đủ, bản thu nhỏ, từng chi tiết riêng… Mỗi profile có giá
                  riêng trong bảng tính giá ở trên.
                </p>
                <ul className='list-disc pl-5 text-sm text-muted-foreground space-y-1.5'>
                  <li>
                    Chọn <b className='text-foreground'>1 profile chuẩn</b> bạn
                    muốn in. Giá tính theo profile bạn chọn,{' '}
                    <b className='text-foreground'>không phải cộng tất cả</b>.
                  </li>
                  <li>
                    Profile có nhãn{' '}
                    <span className='inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground'>
                      <Star className='w-3 h-3 fill-current' />
                      Shop đề xuất
                    </span>{' '}
                    là profile được nhiều người in và đánh giá tốt nhất. Nếu
                    chưa biết chọn, hãy chọn profile này.
                  </li>
                  <li>Ghi lại tên profile để gửi cho shop ở bước sau.</li>
                </ul>
              </div>
            </li>

            <li className='flex gap-4'>
              <StepNumber n={4} />
              <div className='space-y-3 min-w-0 flex-1'>
                <h2 className='text-xl font-bold pt-1'>Nhắn tin cho shop</h2>
                <p className='text-muted-foreground'>
                  Bấm nút bên dưới để mở Messenger nhắn tin cho shop, gửi link
                  mẫu, tên profile và màu bạn muốn. Nhắn tin trực tiếp để nhận
                  báo giá và ưu đãi thêm cho mẫu.
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

          <section className='mt-14 space-y-4'>
            <h2 className='text-2xl font-bold'>
              Xưởng in 3D theo yêu cầu ở Nha Trang
            </h2>
            <p className='text-muted-foreground'>
              HMWorkshop in trực tiếp tại xưởng ở {BUSINESS.addressText} bằng
              máy in 3D Bambu Lab, nên bạn biết rõ giá từ đầu và nhận sản phẩm
              đúng như mẫu. Khách ở Nha Trang có thể nhắn tin hẹn nhận tại
              xưởng, khách ở tỉnh khác shop gửi giao hàng toàn quốc.
            </p>
            <div className='grid gap-4 sm:grid-cols-3'>
              <div className='rounded-xl border border-border bg-card p-4 space-y-1'>
                <h3 className='font-semibold'>Nhựa PETG bền</h3>
                <p className='text-sm text-muted-foreground'>
                  Dẻo dai, chịu nhiệt tốt hơn PLA, dùng được cả cho đồ dùng hằng
                  ngày. Nhiều màu để chọn.
                </p>
              </div>
              <div className='rounded-xl border border-border bg-card p-4 space-y-1'>
                <h3 className='font-semibold'>Giá minh bạch</h3>
                <p className='text-sm text-muted-foreground'>
                  {formatVnd(PRICE_PER_GRAM)}/gam nhựa + {formatVnd(PRICE_PER_HOUR)}
                  /giờ in. Dán link là thấy giá, không phải chờ báo giá.
                </p>
              </div>
              <div className='rounded-xl border border-border bg-card p-4 space-y-1'>
                <h3 className='font-semibold'>In gì cũng được</h3>
                <p className='text-sm text-muted-foreground'>
                  Mô hình game, Minecraft, móc khóa, đèn ngủ, đồ decor, quà
                  tặng, đồ cosplay và phụ kiện theo yêu cầu.
                </p>
              </div>
            </div>
          </section>

          <section className='mt-14 space-y-4'>
            <h2 className='text-2xl font-bold'>Câu hỏi thường gặp</h2>
            <div className='space-y-3'>
              {FAQS.map((f) => (
                <details
                  key={f.q}
                  className='group rounded-xl border border-border bg-card p-4'
                >
                  <summary className='cursor-pointer font-semibold text-foreground'>
                    {f.q}
                  </summary>
                  <p className='mt-2 text-sm text-muted-foreground'>{f.a}</p>
                </details>
              ))}
            </div>
          </section>

          <section className='mt-14 space-y-4'>
            <h2 className='text-2xl font-bold'>Địa chỉ xưởng</h2>
            <p className='text-muted-foreground'>
              {BUSINESS.name} – {BUSINESS.addressText}. Điện thoại/Zalo:{' '}
              <a
                href={`tel:${BUSINESS.phone}`}
                className='font-semibold text-foreground hover:text-primary'
              >
                {BUSINESS.phone}
              </a>
              .
            </p>
            <iframe
              title='Bản đồ xưởng HMWorkshop tại Nha Trang'
              src={`https://www.google.com/maps?q=${encodeURIComponent(`${BUSINESS.street}, ${BUSINESS.locality}, ${BUSINESS.region}`)}&output=embed`}
              className='w-full h-72 rounded-xl border border-border'
              loading='lazy'
              referrerPolicy='no-referrer-when-downgrade'
            />
          </section>
        </div>
      </main>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <Footer />
    </div>
  )
}
