'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MIN_ORDER,
  PRICE_PER_GRAM,
  PRICE_PER_HOUR,
  convertToPetg,
  formatDuration,
  formatNumber,
  formatVnd,
  petgTimeFactor,
  quote,
  type FilamentUsage
} from '@/lib/print-quote'
import { Calculator, Loader2, RotateCcw } from 'lucide-react'
import { useState } from 'react'

interface MakerWorldInstance {
  id: number
  title: string
  weight: number
  predictionHours: number
  filaments: FilamentUsage[]
}

interface MakerWorldDesign {
  title: string
  url: string
  instances: MakerWorldInstance[]
}

/** PETG grams, print hours and price for one MakerWorld print file. */
function quoteInstance(inst: MakerWorldInstance) {
  const usage: FilamentUsage[] = inst.filaments.length
    ? inst.filaments
    : [{ type: 'PLA', grams: inst.weight }]
  const filaments = convertToPetg(usage)
  const grams = filaments.reduce((s, f) => s + f.petgGrams, 0)
  const hours = inst.predictionHours * petgTimeFactor(usage)
  return {
    id: inst.id,
    title: inst.title,
    grams,
    hours,
    price: quote(grams, hours),
    converted: filaments.filter((f) => f.base !== 'PETG').map((f) => f.base)
  }
}

/** Compact MakerWorld quote card, sized to sit under the hero copy. */
export function PrintQuoteCalculator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [design, setDesign] = useState<MakerWorldDesign | null>(null)

  const handleLink = async () => {
    if (!link.trim()) return
    setError(null)
    setDesign(null)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/makerworld?url=${encodeURIComponent(link.trim())}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDesign(data)
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Không lấy được dữ liệu từ MakerWorld.'
      )
    } finally {
      setLoading(false)
    }
  }

  const reset = () => {
    setDesign(null)
    setLink('')
    setError(null)
  }

  const quotes = design?.instances.map(quoteInstance) ?? []
  const converted = [...new Set(quotes.flatMap((q) => q.converted))]

  return (
    <div
      id='tinh-gia'
      className='scroll-mt-28 rounded-2xl border border-border bg-card/90 backdrop-blur-sm p-5 tech-shadow space-y-4'
    >
      <div className='flex items-center gap-3'>
        <div className='w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0'>
          <Calculator className='w-4 h-4 text-primary' />
        </div>
        <div>
          <p className='font-bold text-foreground leading-tight'>
            Tính giá in nhanh
          </p>
          <p className='text-xs text-muted-foreground'>
            Dán link mẫu MakerWorld, giá tính theo nhựa PETG
          </p>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleLink()
        }}
        className='flex gap-2'
      >
        <Input
          aria-label='Link mẫu trên MakerWorld'
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder='https://makerworld.com/vi/models/...'
          className='bg-background'
        />
        <Button type='submit' disabled={loading || !link.trim()}>
          {loading ? <Loader2 className='w-4 h-4 animate-spin' /> : 'Tính giá'}
        </Button>
      </form>

      {error && (
        <p className='text-sm text-destructive' role='alert'>
          {error}
        </p>
      )}

      {!design || quotes.length === 0 ? (
        <p className='text-xs text-muted-foreground leading-relaxed'>
          Giá = số gam nhựa × {formatVnd(PRICE_PER_GRAM)} + số giờ in ×{' '}
          {formatVnd(PRICE_PER_HOUR)}. Giá nhựa PETG.{' '}
          <span className='font-semibold text-foreground'>
            Nhận đơn theo yêu cầu từ {formatVnd(MIN_ORDER)}.
          </span>
        </p>
      ) : (
        <div className='space-y-3 text-sm'>
          <div className='flex items-center justify-between gap-3'>
            <p className='font-semibold text-foreground'>
              {design.title}
              <span className='font-normal text-muted-foreground'>
                {' '}
                · {quotes.length} file in
              </span>
            </p>
            <Button
              variant='outline'
              size='icon'
              onClick={reset}
              title='Tính mẫu khác'
              className='shrink-0'
            >
              <RotateCcw className='w-4 h-4' />
            </Button>
          </div>

          <ul className='space-y-2'>
            {quotes.map((q) => (
              <li
                key={q.id}
                className='rounded-xl border border-border bg-background p-3 space-y-1.5'
              >
                <div className='flex items-start justify-between gap-3'>
                  <p className='font-medium text-foreground leading-snug'>
                    {q.title}
                  </p>
                  <p className='font-bold text-primary whitespace-nowrap'>
                    ≈ {formatVnd(q.price.final)}
                  </p>
                </div>
                <p className='font-mono text-xs text-muted-foreground'>
                  {formatNumber(q.grams)} g × {formatVnd(PRICE_PER_GRAM)} +{' '}
                  {formatNumber(q.hours, 2)} giờ × {formatVnd(PRICE_PER_HOUR)} ·
                  in khoảng {formatDuration(q.hours)}
                </p>
              </li>
            ))}
          </ul>

          <p className='text-xs text-muted-foreground'>
            Mỗi file in được báo giá riêng.{' '}
            {converted.length > 0 &&
              `Đã quy đổi ${converted.join(', ')} sang PETG. `}
            {quotes.some((q) => q.price.belowMinimum) &&
              `Shop nhận đơn theo yêu cầu từ ${formatVnd(MIN_ORDER)}. `}
            Có thể phát sinh chi phí hậu kỳ, vận chuyển, phụ kiện lắp thêm nếu
            bạn cần.
          </p>
          <p className='text-sm font-medium text-foreground'>
            Hãy nhắn tin trực tiếp cho shop để nhận báo giá và ưu đãi thêm cho
            mẫu.
          </p>
        </div>
      )}
    </div>
  )
}
