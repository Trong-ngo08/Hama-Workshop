'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import {
  COVER_POSITIONS_KEY,
  DEFAULT_COVER_POSITION,
  MAX_COVER_ZOOM,
  coverStyle,
  parseCoverPositions,
  type CoverPosition
} from '@/lib/cover-position'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Move, RotateCcw } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'

interface CoverPositionEditorProps {
  url: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Lets the admin drag the cover photo inside the product-card frame and zoom
 * it, so the product sits in the middle of the card. Saved per photo URL.
 */
export function CoverPositionEditor({
  url,
  open,
  onOpenChange
}: CoverPositionEditorProps) {
  const [pos, setPos] = useState<CoverPosition>(DEFAULT_COVER_POSITION)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const drag = useRef<{ x: number; y: number; start: CoverPosition } | null>(
    null
  )
  const frame = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    createClient()
      .from('site_settings')
      .select('value')
      .eq('key', COVER_POSITIONS_KEY)
      .maybeSingle()
      .then(({ data }) => {
        setPos(parseCoverPositions(data?.value)[url] ?? DEFAULT_COVER_POSITION)
        setLoading(false)
      })
  }, [open, url])

  // Dragging the photo right moves the focus point left, like panning a map.
  const onPointerDown = (e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = { x: e.clientX, y: e.clientY, start: pos }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current || !frame.current) return
    const { width, height } = frame.current.getBoundingClientRect()
    const { start } = drag.current
    const clamp = (n: number) => Math.min(100, Math.max(0, n))
    setPos({
      ...start,
      x: clamp(start.x - ((e.clientX - drag.current.x) / width) * 100 / start.zoom),
      y: clamp(start.y - ((e.clientY - drag.current.y) / height) * 100 / start.zoom)
    })
  }
  const onPointerUp = () => {
    drag.current = null
  }

  const save = async (position: CoverPosition | null) => {
    setSaving(true)
    const ok = await fetch('/api/cover-position', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, position })
    })
      .then((res) => res.ok)
      .catch(() => false)
    setSaving(false)
    if (!ok) {
      toast.error('Không lưu được khung ảnh. Thử lại nhé.')
      return
    }
    toast.success('Đã lưu khung ảnh đại diện.')
    onOpenChange(false)
  }

  const preview = (aspect: string, label: string) => (
    <div className='space-y-1'>
      <div className={`${aspect} w-24 overflow-hidden rounded-md bg-muted`}>
        <img
          src={url}
          alt=''
          className='h-full w-full object-cover'
          style={coverStyle(pos)}
        />
      </div>
      <p className='text-center text-xs text-muted-foreground'>{label}</p>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-xl'>
        <DialogHeader>
          <DialogTitle>Chỉnh khung ảnh đại diện</DialogTitle>
          <DialogDescription>
            Kéo ảnh để đưa sản phẩm vào giữa khung, kéo thanh trượt để phóng
            to/thu nhỏ.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className='flex h-64 items-center justify-center'>
            <Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
          </div>
        ) : (
          <div className='flex flex-col gap-4 sm:flex-row'>
            <div
              ref={frame}
              className='relative aspect-[4/5] w-full max-w-64 cursor-grab touch-none overflow-hidden rounded-lg bg-muted active:cursor-grabbing'
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              <img
                src={url}
                alt=''
                draggable={false}
                className='h-full w-full select-none object-cover'
                style={coverStyle(pos)}
              />
              {/* Centre guides */}
              <div className='pointer-events-none absolute inset-0'>
                <div className='absolute left-1/2 top-0 h-full w-px bg-white/50' />
                <div className='absolute left-0 top-1/2 h-px w-full bg-white/50' />
              </div>
              <div className='pointer-events-none absolute bottom-2 left-2 flex items-center gap-1 rounded bg-black/60 px-2 py-1 text-xs text-white'>
                <Move className='h-3 w-3' /> Kéo để di chuyển
              </div>
            </div>

            <div className='flex-1 space-y-5'>
              <div className='space-y-2'>
                <p className='text-sm font-medium'>
                  Phóng to: {pos.zoom.toFixed(2)}×
                </p>
                <Slider
                  min={1}
                  max={MAX_COVER_ZOOM}
                  step={0.05}
                  value={[pos.zoom]}
                  onValueChange={([zoom]) => setPos((p) => ({ ...p, zoom }))}
                />
              </div>
              <div className='flex gap-3'>
                {preview('aspect-[4/5]', 'Trang sản phẩm')}
                {preview('aspect-square', 'Trang chủ')}
              </div>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setPos(DEFAULT_COVER_POSITION)}
              >
                <RotateCcw className='h-3 w-3' /> Về giữa
              </Button>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type='button'
            variant='outline'
            onClick={() => onOpenChange(false)}
          >
            Hủy
          </Button>
          <Button
            type='button'
            disabled={saving || loading}
            onClick={() => save(pos)}
          >
            {saving && <Loader2 className='h-4 w-4 animate-spin' />}
            Lưu khung ảnh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
