'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  MIN_ORDER,
  PRICE_PER_GRAM,
  PRICE_PER_HOUR,
  VOLUME_DISCOUNTS,
  convertToPetg,
  formatDuration,
  formatKg,
  formatNumber,
  formatVnd,
  petgTimeFactor,
  quote,
  type FilamentUsage
} from '@/lib/print-quote'
import { Calculator, Loader2, RotateCcw, Star } from 'lucide-react'
import { useState } from 'react'

interface MakerWorldInstance {
  id: number
  title: string
  weight: number
  predictionHours: number
  printCount: number
  rating: number | null
  filaments: FilamentUsage[]
}

interface MakerWorldDesign {
  title: string
  url: string
  recommended: number
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
    printCount: inst.printCount,
    rating: inst.rating,
    grams,
    hours,
    price: quote(grams, hours),
    converted: filaments.filter((f) => f.base !== 'PETG').map((f) => f.base)
  }
}

/** "Giảm 10% cho đơn trên 1 kg nhựa, 20% cho đơn trên 5 kg nhựa." */
const VOLUME_DISCOUNT_TEXT = `Giảm ${[...VOLUME_DISCOUNTS]
  .reverse()
  .map((t) => `${t.percent}% cho đơn trên ${formatKg(t.overGrams)} nhựa`)
  .join(', ')}.`

/** Material, machine time, discount and total for one print. */
function QuoteBreakdown({
  grams,
  hours,
  price
}: {
  grams: number
  hours: number
  price: ReturnType<typeof quote>
}) {
  const q = { grams, hours, price }
  return (
    <>
      <dl className='font-mono text-xs text-muted-foreground space-y-0.5'>
        <div className='flex justify-between gap-3'>
          <dt>
            Nhựa: {formatNumber(q.grams)} g × {formatVnd(PRICE_PER_GRAM)}
          </dt>
          <dd className='whitespace-nowrap'>
            {formatVnd(q.price.materialCost)}
          </dd>
        </div>
        <div className='flex justify-between gap-3'>
          <dt>
            In: {formatDuration(q.hours)} ({formatNumber(q.hours, 2)} giờ ×{' '}
            {formatVnd(PRICE_PER_HOUR)})
          </dt>
          <dd className='whitespace-nowrap'>{formatVnd(q.price.timeCost)}</dd>
        </div>
        {q.price.discountPercent > 0 && (
          <div className='flex justify-between gap-3 text-primary'>
            <dt>
              Giảm {q.price.discountPercent}% (đơn trên{' '}
              {formatKg(
                VOLUME_DISCOUNTS.find(
                  (t) => t.percent === q.price.discountPercent
                )!.overGrams
              )}{' '}
              nhựa)
            </dt>
            <dd className='whitespace-nowrap'>
              −{formatVnd(q.price.discount)}
            </dd>
          </div>
        )}
        <div className='flex justify-between gap-3 border-t border-border pt-0.5 font-semibold text-foreground'>
          <dt>Tổng (làm tròn)</dt>
          <dd className='whitespace-nowrap'>{formatVnd(q.price.final)}</dd>
        </div>
      </dl>
      {q.price.belowMinimum && (
        <p className='rounded-lg bg-amber-500/10 px-2 py-1.5 text-xs text-amber-800 dark:text-amber-300'>
          Shop nhận in theo yêu cầu từ {formatVnd(MIN_ORDER)}, nên bạn cần đặt
          ít nhất <b>{q.price.minQuantity} sản phẩm này</b> (
          {q.price.minQuantity} × {formatVnd(q.price.final)} ={' '}
          {formatVnd(q.price.minQuantity * q.price.final)}).
        </p>
      )}
    </>
  )
}

/** Compact quote card, sized to sit under the hero copy: paste a MakerWorld link or type weight and print time. */
export function PrintQuoteCalculator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [design, setDesign] = useState<MakerWorldDesign | null>(null)
  const [mode, setMode] = useState<'link' | 'manual'>('link')
  const [kg, setKg] = useState('')
  const [printHours, setPrintHours] = useState('')
  const [printMinutes, setPrintMinutes] = useState('')

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

  // The recommended file goes first so customers see it before the rest.
  const quotes = (design?.instances.map(quoteInstance) ?? []).sort(
    (a, b) =>
      Number(b.id === design?.recommended) -
      Number(a.id === design?.recommended)
  )
  const converted = [...new Set(quotes.flatMap((q) => q.converted))]

  // Manual mode: weight in kg and print time typed by the customer.
  // Accepts "1,5" as well as "1.5".
  const toNumber = (v: string) => Math.max(0, Number(v.replace(',', '.')) || 0)
  const manualGrams = toNumber(kg) * 1000
  const manualHours = toNumber(printHours) + toNumber(printMinutes) / 60
  const manualQuote =
    manualGrams > 0 || manualHours > 0 ? quote(manualGrams, manualHours) : null

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
            Dán link mẫu MakerWorld hoặc tự nhập số kg nhựa và thời gian in
          </p>
        </div>
      </div>

      <div
        role='tablist'
        aria-label='Cách tính giá'
        className='grid grid-cols-2 gap-1 rounded-lg bg-muted p-1 text-sm'
      >
        {(
          [
            ['link', 'Dán link MakerWorld'],
            ['manual', 'Nhập kg & thời gian']
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type='button'
            role='tab'
            aria-selected={mode === value}
            onClick={() => setMode(value)}
            className={
              mode === value
                ? 'rounded-md bg-background px-3 py-1.5 font-semibold text-foreground shadow-sm'
                : 'rounded-md px-3 py-1.5 text-muted-foreground hover:text-foreground transition-colors'
            }
          >
            {label}
          </button>
        ))}
      </div>

      {mode === 'manual' ? (
        <div className='space-y-3'>
          <div className='grid grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)_minmax(0,1fr)] gap-2'>
            <label className='space-y-1 text-xs text-muted-foreground'>
              <span>Nhựa (kg)</span>
              <Input
                inputMode='decimal'
                value={kg}
                onChange={(e) => setKg(e.target.value)}
                placeholder='VD: 0,25'
                className='bg-background'
              />
            </label>
            <label className='space-y-1 text-xs text-muted-foreground'>
              <span>Giờ in</span>
              <Input
                inputMode='decimal'
                value={printHours}
                onChange={(e) => setPrintHours(e.target.value)}
                placeholder='VD: 5'
                className='bg-background'
              />
            </label>
            <label className='space-y-1 text-xs text-muted-foreground'>
              <span>Phút</span>
              <Input
                inputMode='numeric'
                value={printMinutes}
                onChange={(e) => setPrintMinutes(e.target.value)}
                placeholder='VD: 30'
                className='bg-background'
              />
            </label>
          </div>
          {manualQuote ? (
            <div className='rounded-xl border-2 border-primary bg-primary/5 p-3 space-y-1.5 text-sm'>
              <div className='flex items-start justify-between gap-3'>
                <p className='font-medium text-foreground'>Giá in ước tính</p>
                <p className='font-bold text-primary whitespace-nowrap'>
                  ≈ {formatVnd(manualQuote.final)}
                </p>
              </div>
              <QuoteBreakdown
                grams={manualGrams}
                hours={manualHours}
                price={manualQuote}
              />
            </div>
          ) : null}
          <p className='text-xs text-muted-foreground leading-relaxed'>
            Lấy số gam nhựa và thời gian in trong phần mềm slicer (Bambu Studio,
            Orca…), tính theo nhựa PETG. 1 kg = 1.000 g.{' '}
            <span className='font-semibold text-foreground'>
              Nhận đơn theo yêu cầu từ {formatVnd(MIN_ORDER)}.
            </span>{' '}
            <span className='font-semibold text-primary'>
              {VOLUME_DISCOUNT_TEXT}
            </span>
          </p>
        </div>
      ) : (
        <>
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
              {loading ? (
                <Loader2 className='w-4 h-4 animate-spin' />
              ) : (
                'Tính giá'
              )}
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
              </span>{' '}
              <span className='font-semibold text-primary'>
                {VOLUME_DISCOUNT_TEXT}
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
                {quotes.map((q) => {
                  const recommended = q.id === design.recommended
                  return (
                    <li
                      key={q.id}
                      className={
                        recommended
                          ? 'rounded-xl border-2 border-primary bg-primary/5 p-3 space-y-1.5'
                          : 'rounded-xl border border-border bg-background p-3 space-y-1.5'
                      }
                    >
                      {recommended && (
                        <p className='flex flex-wrap items-center gap-x-2 gap-y-1 text-xs'>
                          <span className='inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 font-semibold text-primary-foreground'>
                            <Star className='w-3 h-3 fill-current' />
                            Shop đề xuất
                          </span>
                          <span className='text-muted-foreground'>
                            Nhiều người in nhất ({formatNumber(q.printCount)}{' '}
                            lượt in
                            {q.rating ? `, ${q.rating.toFixed(1)}★` : ''})
                          </span>
                        </p>
                      )}
                      <div className='flex items-start justify-between gap-3'>
                        <p className='font-medium text-foreground leading-snug'>
                          {q.title}
                        </p>
                        <p className='font-bold text-primary whitespace-nowrap'>
                          ≈ {formatVnd(q.price.final)}
                        </p>
                      </div>
                      <QuoteBreakdown
                        grams={q.grams}
                        hours={q.hours}
                        price={q.price}
                      />
                    </li>
                  )
                })}
              </ul>

              <p className='text-xs text-muted-foreground'>
                <span className='font-semibold text-foreground'>
                  Chọn 1 profile chuẩn bạn muốn, giá tính theo profile bạn in,
                  KHÔNG PHẢI TẤT CẢ.
                </span>{' '}
                {converted.length > 0 &&
                  `Đã quy đổi ${converted.join(', ')} sang PETG. `}
                Có thể phát sinh chi phí hậu kỳ, vận chuyển, phụ kiện lắp thêm
                nếu bạn cần.{' '}
                <span className='font-semibold text-primary'>
                  {VOLUME_DISCOUNT_TEXT}
                </span>{' '}
                Đặt nhiều sản phẩm thì tính theo tổng số nhựa của cả đơn.
              </p>
              <p className='text-sm font-medium text-foreground'>
                Hãy nhắn tin trực tiếp cho shop để nhận báo giá và ưu đãi thêm
                cho mẫu.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
