'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { GACHA_SLICES, MESSENGER_URL, pickSliceIndex } from '@/lib/gacha'
import { Loader2, MessageCircle, Sparkles } from 'lucide-react'
import { useEffect, useState } from 'react'

const SPIN_MS = 5000
// One spin per browser; the result is kept so a reload shows it again.
const STORAGE_KEY = 'hmw-gacha-result'

const SLICE_COLORS = [
  { fill: 'var(--primary)', text: 'var(--primary-foreground)' },
  { fill: 'var(--secondary)', text: 'var(--secondary-foreground)' },
  { fill: 'var(--accent)', text: 'var(--accent-foreground)' }
]
const SPECIAL_COLOR = { fill: 'var(--foreground)', text: 'var(--background)' }

export default function GachaClient() {
  const [spinning, setSpinning] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [result, setResult] = useState<number | null>(null)
  const [showResult, setShowResult] = useState(false)

  useEffect(() => {
    try {
      const saved = Number(localStorage.getItem(STORAGE_KEY))
      if (localStorage.getItem(STORAGE_KEY) !== null && GACHA_SLICES[saved]) {
        setResult(saved)
        setRotation(landingAngle(saved, 0))
      }
    } catch {}
  }, [])

  const spin = () => {
    if (spinning || result !== null) return
    const index = pickSliceIndex()
    setSpinning(true)
    setRotation(rotation + landingAngle(index, rotation) + 360 * 6)
    setTimeout(() => {
      setSpinning(false)
      setResult(index)
      setShowResult(true)
      try {
        localStorage.setItem(STORAGE_KEY, String(index))
      } catch {}
    }, SPIN_MS)
  }

  const prize = result !== null ? GACHA_SLICES[result] : null

  return (
    <div className='grid lg:grid-cols-2 gap-10 items-center max-w-5xl mx-auto'>
      <Wheel rotation={rotation} />

      <Card className='border-0 cute-shadow'>
        <CardContent className='p-6 space-y-5'>
          <h2 className='font-semibold text-lg'>Phần thưởng</h2>
          <ul className='text-sm text-muted-foreground space-y-1.5 list-disc pl-5'>
            <li>Phiếu giảm 5.000đ</li>
            <li>Phiếu giảm 10.000đ</li>
            <li>1 clicker loại 30.000đ</li>
            <li className='text-foreground font-semibold'>
              Ô đặc biệt: 1 mô hình 150.000đ – 300.000đ do shop chọn
            </li>
          </ul>

          <Button
            size='lg'
            className='w-full rounded-full font-bold'
            onClick={spin}
            disabled={spinning || result !== null}
          >
            {spinning ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Đang quay...
              </>
            ) : result !== null ? (
              'Bạn đã dùng lượt quay'
            ) : (
              'Quay ngay'
            )}
          </Button>

          {prize && !spinning && (
            <div className='rounded-xl bg-muted p-4 text-center space-y-2'>
              <p className='text-xs uppercase tracking-widest text-muted-foreground'>
                Bạn đã trúng
              </p>
              <p className='text-lg font-bold text-primary'>{prize.prize}</p>
              <Button
                variant='link'
                className='h-auto p-0'
                onClick={() => setShowResult(true)}
              >
                Xem cách nhận quà
              </Button>
            </div>
          )}

          <p className='text-xs text-muted-foreground'>
            Mỗi người được quay một lần. Phiếu giảm giá và quà áp dụng khi mua
            hàng tại HMWorkshop.
          </p>
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent className='text-center'>
          <DialogHeader>
            <DialogTitle className='text-2xl text-center flex items-center justify-center gap-2'>
              <Sparkles className='w-6 h-6 text-primary' />
              Chúc mừng bạn!
            </DialogTitle>
            <DialogDescription className='text-center'>
              Bạn đã quay trúng:
            </DialogDescription>
          </DialogHeader>
          <p className='text-2xl font-bold text-primary'>{prize?.prize}</p>
          <p className='text-sm text-muted-foreground'>
            Chụp màn hình này rồi nhắn tin cho page, hoặc đưa nhân viên xem khi
            ghé shop để nhận quà.
          </p>
          <Button asChild className='rounded-full'>
            <a href={MESSENGER_URL} target='_blank' rel='noopener noreferrer'>
              <MessageCircle className='w-4 h-4 mr-2' />
              Nhắn tin page
            </a>
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}

/** Extra turn (0–360°) that brings slice `index` under the top pointer, with a little jitter. */
function landingAngle(index: number, rotation: number) {
  const slice = 360 / GACHA_SLICES.length
  const target = 360 - (index * slice + slice / 2) + (Math.random() - 0.5) * slice * 0.6
  const current = ((rotation % 360) + 360) % 360
  return (target - current + 360) % 360
}

function Wheel({ rotation }: { rotation: number }) {
  const n = GACHA_SLICES.length
  const slice = 360 / n
  const r = 100

  const point = (deg: number, radius: number) => {
    const rad = ((deg - 90) * Math.PI) / 180
    // Rounded so the server and browser render identical SVG paths.
    return [radius * Math.cos(rad), radius * Math.sin(rad)].map((v) => +v.toFixed(3))
  }

  return (
    <div className='relative w-full max-w-md mx-auto aspect-square'>
      {/* Pointer */}
      <div className='absolute left-1/2 -top-1 -translate-x-1/2 z-10 w-0 h-0 border-l-[14px] border-r-[14px] border-t-[26px] border-l-transparent border-r-transparent border-t-foreground drop-shadow' />
      <svg
        viewBox='-105 -105 210 210'
        className='w-full h-full drop-shadow-xl'
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: `transform ${SPIN_MS}ms cubic-bezier(0.15, 0.85, 0.2, 1)`
        }}
        role='img'
        aria-label='Vòng quay gacha'
      >
        <circle r={104} fill='var(--foreground)' />
        {GACHA_SLICES.map((s, i) => {
          const color = s.special ? SPECIAL_COLOR : SLICE_COLORS[i % 3]
          const mid = i * slice + slice / 2
          const [x1, y1] = point(i * slice, r)
          const [x2, y2] = point((i + 1) * slice, r)
          const [tx, ty] = point(mid, s.special ? r * 0.6 : r * 0.62)
          return (
            <g key={i}>
              <path
                d={`M0 0 L${x1} ${y1} A${r} ${r} 0 0 1 ${x2} ${y2} Z`}
                fill={color.fill}
                stroke='var(--background)'
                strokeWidth={0.8}
              />
              <text
                x={tx}
                y={ty}
                textAnchor='middle'
                dominantBaseline='middle'
                fontSize={s.special ? 5.6 : 7.5}
                fontWeight={700}
                fill={color.text}
                transform={`rotate(${mid - 90} ${tx} ${ty})`}
              >
                {s.label}
              </text>
            </g>
          )
        })}
        <circle r={14} fill='var(--background)' stroke='var(--foreground)' strokeWidth={3} />
      </svg>
    </div>
  )
}
