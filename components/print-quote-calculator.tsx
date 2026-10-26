'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
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
import { Calculator, Loader2, MessageCircle, RotateCcw } from 'lucide-react'
import Link from 'next/link'
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
  selected: number
  instances: MakerWorldInstance[]
}

/** Compact MakerWorld quote card, sized to sit under the hero copy. */
export function PrintQuoteCalculator() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState('')
  const [design, setDesign] = useState<MakerWorldDesign | null>(null)
  const [instanceId, setInstanceId] = useState<number | null>(null)

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
      setInstanceId(data.selected)
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

  const inst = design?.instances.find((i) => i.id === instanceId)
  const usage: FilamentUsage[] | null = inst
    ? inst.filaments.length
      ? inst.filaments
      : [{ type: 'PLA', grams: inst.weight }]
    : null
  const filaments = usage && convertToPetg(usage)
  const timeFactor = usage ? petgTimeFactor(usage) : 1
  const grams = filaments?.reduce((s, f) => s + f.petgGrams, 0) ?? 0
  const hours = inst ? inst.predictionHours * timeFactor : 0
  const price = inst && quote(grams, hours)

  const converted = filaments?.filter((f) => f.base !== 'PETG') ?? []

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

      {!inst || !price || !filaments ? (
        <p className='text-xs text-muted-foreground leading-relaxed'>
          Giá = số gam nhựa × {formatVnd(PRICE_PER_GRAM)} + số giờ in ×{' '}
          {formatVnd(PRICE_PER_HOUR)}. Giá nhựa PETG.{' '}
          <span className='font-semibold text-foreground'>
            Nhận đơn theo yêu cầu từ {formatVnd(MIN_ORDER)}.
          </span>
        </p>
      ) : (
        <div className='space-y-3 text-sm'>
          {design!.instances.length > 1 ? (
            <Select
              value={String(instanceId)}
              onValueChange={(v) => setInstanceId(Number(v))}
            >
              <SelectTrigger aria-label='Profile in' className='bg-background'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {design!.instances.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : null}

          <a
            href={design!.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block truncate text-primary hover:underline'
          >
            {design!.title}
          </a>

          <div className='space-y-1 font-mono text-xs'>
            <div className='flex justify-between gap-3'>
              <span className='text-muted-foreground'>
                {formatNumber(grams)} g PETG × {formatVnd(PRICE_PER_GRAM)}
              </span>
              <span className='text-foreground whitespace-nowrap'>
                {formatVnd(price.materialCost)}
              </span>
            </div>
            <div className='flex justify-between gap-3'>
              <span className='text-muted-foreground'>
                {formatNumber(hours, 2)} giờ × {formatVnd(PRICE_PER_HOUR)}
              </span>
              <span className='text-foreground whitespace-nowrap'>
                {formatVnd(price.timeCost)}
              </span>
            </div>
          </div>

          {converted.length > 0 && (
            <p className='text-xs text-muted-foreground'>
              Đã quy đổi {[...new Set(converted.map((f) => f.base))].join(', ')}{' '}
              sang PETG.
            </p>
          )}

          <div className='flex items-center gap-2'>
            <div className='flex-1 rounded-xl bg-primary text-primary-foreground px-4 py-2.5 flex items-baseline justify-between gap-3'>
              <span className='text-xs'>Giá tham khảo</span>
              <span className='text-xl font-bold'>
                ≈ {formatVnd(price.final)}
              </span>
            </div>
            <Button asChild size='icon' variant='outline' title='Đặt in mẫu này'>
              <Link href='/contact'>
                <MessageCircle className='w-4 h-4' />
              </Link>
            </Button>
            <Button
              variant='outline'
              size='icon'
              onClick={reset}
              title='Tính mẫu khác'
            >
              <RotateCcw className='w-4 h-4' />
            </Button>
          </div>

          <p className='text-xs text-muted-foreground'>
            In khoảng {formatDuration(hours)}.{' '}
            {price.belowMinimum &&
              `Shop nhận đơn theo yêu cầu từ ${formatVnd(MIN_ORDER)}. `}
            Chưa gồm hậu kỳ và phí vận chuyển.
          </p>
        </div>
      )}
    </div>
  )
}
