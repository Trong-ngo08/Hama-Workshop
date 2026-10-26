'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Calculator, Link2, Loader2, MessageCircle, RotateCcw } from 'lucide-react'
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

  return (
    <div className='grid lg:grid-cols-5 gap-8 items-start'>
      {/* Input */}
      <div className='lg:col-span-3 rounded-2xl border border-border bg-card p-6 lg:p-8 tech-shadow space-y-5'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
            <Link2 className='w-5 h-5 text-primary' />
          </div>
          <h3 className='text-lg font-bold text-foreground'>Link MakerWorld</h3>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleLink()
          }}
          className='space-y-2'
        >
          <Label htmlFor='mw-link'>Dán link mẫu trên MakerWorld</Label>
          <div className='flex gap-2'>
            <Input
              id='mw-link'
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder='https://makerworld.com/vi/models/...'
            />
            <Button type='submit' disabled={loading || !link.trim()}>
              Tính giá
            </Button>
          </div>
        </form>

        {design && design.instances.length > 1 && (
          <div className='space-y-2'>
            <Label htmlFor='mw-profile'>Profile in</Label>
            <Select
              value={String(instanceId)}
              onValueChange={(v) => setInstanceId(Number(v))}
            >
              <SelectTrigger id='mw-profile'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {design.instances.map((i) => (
                  <SelectItem key={i.id} value={String(i.id)}>
                    {i.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {design && (
          <a
            href={design.url}
            target='_blank'
            rel='noopener noreferrer'
            className='block text-sm text-primary hover:underline'
          >
            {design.title}
          </a>
        )}

        {loading && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground'>
            <Loader2 className='w-4 h-4 animate-spin' />
            Đang lấy dữ liệu...
          </div>
        )}
        {error && (
          <p className='text-sm text-destructive' role='alert'>
            {error}
          </p>
        )}
      </div>

      {/* Breakdown */}
      <div className='lg:col-span-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 lg:p-8 space-y-5'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
            <Calculator className='w-5 h-5 text-primary' />
          </div>
          <h3 className='text-lg font-bold text-foreground'>Bảng tính giá</h3>
        </div>

        {!inst || !price || !filaments ? (
          <div className='space-y-3 text-sm text-muted-foreground'>
            <p>Giá in được tính bằng tổng hai phần:</p>
            <p className='font-mono text-foreground bg-background/60 rounded-lg p-3 leading-relaxed'>
              Số gam nhựa × {formatVnd(PRICE_PER_GRAM)}
              <br />+ Số giờ in × {formatVnd(PRICE_PER_HOUR)}
            </p>
            <p>
              Tất cả sản phẩm in bằng nhựa PETG. Mẫu dùng nhựa khác (PLA, TPU…)
              sẽ được quy đổi sang PETG.
            </p>
            <p className='font-semibold text-foreground'>
              Nhận đơn theo yêu cầu từ {formatVnd(MIN_ORDER)}.
            </p>
          </div>
        ) : (
          <div className='space-y-4 text-sm'>
            <p className='text-muted-foreground break-words'>
              {design!.title} – {inst.title}
            </p>

            <div className='space-y-1.5 rounded-lg bg-background/60 p-3'>
              <p className='font-semibold text-foreground'>Quy đổi sang PETG</p>
              {filaments.map((f, i) => (
                <div
                  key={i}
                  className='flex justify-between gap-3 text-muted-foreground'
                >
                  <span>
                    {f.type} {formatNumber(f.grams)} g
                    {f.base !== 'PETG' &&
                      ` × 1,27 / ${formatNumber(f.density, 2)}`}
                  </span>
                  <span className='text-foreground whitespace-nowrap'>
                    {formatNumber(f.petgGrams)} g
                  </span>
                </div>
              ))}
              {timeFactor !== 1 && (
                <div className='flex justify-between gap-3 text-muted-foreground'>
                  <span>
                    Thời gian {formatDuration(inst.predictionHours)} ×{' '}
                    {formatNumber(timeFactor, 2)}
                  </span>
                  <span className='text-foreground whitespace-nowrap'>
                    {formatDuration(hours)}
                  </span>
                </div>
              )}
            </div>

            <div className='space-y-2 font-mono'>
              <div className='flex justify-between gap-3'>
                <span className='text-muted-foreground'>
                  {formatNumber(grams)} g × {formatVnd(PRICE_PER_GRAM)}
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
              <div className='flex justify-between gap-3 border-t border-border pt-2'>
                <span className='text-muted-foreground'>Tổng</span>
                <span className='text-foreground whitespace-nowrap'>
                  {formatVnd(price.total)}
                </span>
              </div>
            </div>

            <div className='rounded-xl bg-primary text-primary-foreground p-4 flex items-baseline justify-between gap-3'>
              <span className='text-sm'>Giá tham khảo</span>
              <span className='text-2xl font-bold'>
                ≈ {formatVnd(price.final)}
              </span>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed'>
              Thời gian in khoảng {formatDuration(hours)}, lấy từ profile in
              trên MakerWorld.{' '}
              {price.belowMinimum &&
                `Shop nhận đơn theo yêu cầu từ ${formatVnd(MIN_ORDER)}. `}
              Giá chưa gồm hậu kỳ, lắp ráp và phí vận chuyển; shop sẽ báo giá
              chính xác sau khi xem mẫu.
            </p>

            <div className='flex gap-2'>
              <Button asChild className='flex-1'>
                <Link href='/contact'>
                  <MessageCircle className='w-4 h-4 mr-2' />
                  Đặt in mẫu này
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
          </div>
        )}
      </div>
    </div>
  )
}
