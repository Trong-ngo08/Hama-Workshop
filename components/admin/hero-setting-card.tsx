'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DEFAULT_HERO_CONTENT,
  HERO_CONTENT_KEY,
  parseHeroContent,
  tiktokVideoId,
  type HeroContent
} from '@/lib/hero-content'
import { RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type TextField = Exclude<keyof HeroContent, 'videoUrl'>

const TEXT_FIELDS: { key: TextField; label: string; multiline?: boolean }[] = [
  { key: 'titleLine1', label: 'Tiêu đề dòng 1' },
  { key: 'titleLine2', label: 'Tiêu đề dòng 2 (màu nhấn)' },
  { key: 'description', label: 'Mô tả', multiline: true },
  { key: 'primaryCta', label: 'Nút chính (→ Sản phẩm)' }
]

interface HeroSettingCardProps {
  initialContent: HeroContent
}

export function HeroSettingCard({ initialContent }: HeroSettingCardProps) {
  const router = useRouter()
  const [saved, setSaved] = useState(initialContent)
  const [form, setForm] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved)

  const setField = (key: TextField, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSave = async () => {
    // Normalise so blank fields are stored (and shown) as their defaults.
    const next = parseHeroContent(form)
    setIsSaving(true)

    // Short share links (vt.tiktok.com/…) carry no id; resolve them first.
    if (next.videoUrl && !tiktokVideoId(next.videoUrl)) {
      const res = await fetch(`/api/tiktok-resolve?url=${encodeURIComponent(next.videoUrl)}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok || !data.url) {
        setIsSaving(false)
        toast.error(data.error ?? 'Link TikTok không hợp lệ.')
        return
      }
      next.videoUrl = data.url
    }

    const ok = await fetch('/api/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key: HERO_CONTENT_KEY, value: next })
    })
      .then((res) => res.ok)
      .catch((error) => {
        console.error('[settings] hero save error:', error)
        return false
      })

    setIsSaving(false)

    if (!ok) {
      toast.error('Không lưu được nội dung hero. Thử lại nhé.')
      return
    }

    setSaved(next)
    setForm(next)
    toast.success('Đã cập nhật hero trang chủ')
    router.refresh()
  }

  return (
    <Card className='border border-border tech-shadow'>
      <CardHeader className='flex flex-row items-center justify-between gap-4 space-y-0'>
        <CardTitle className='text-foreground'>Hero trang chủ</CardTitle>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          disabled={isSaving}
          onClick={() => setForm(DEFAULT_HERO_CONTENT)}
        >
          <RotateCcw className='w-4 h-4 mr-2' />
          Về mặc định
        </Button>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='grid lg:grid-cols-2 gap-6'>
          <div className='space-y-2'>
            <div className='space-y-1.5'>
              <Label htmlFor='hero-videoUrl'>Link clip TikTok</Label>
              <Input
                id='hero-videoUrl'
                value={form.videoUrl}
                placeholder='https://www.tiktok.com/@hmworkshop_official/video/...'
                disabled={isSaving}
                onChange={(e) => setForm((prev) => ({ ...prev, videoUrl: e.target.value }))}
              />
              <p className='text-xs text-muted-foreground'>
                Dán link chia sẻ từ app hoặc web TikTok (clip dọc). Clip tự chạy và lặp
                lại trên trang chủ. Để trống thì hero chỉ hiện phần chữ.
              </p>
            </div>
          </div>

          <div className='space-y-4'>
            {TEXT_FIELDS.map(({ key, label, multiline }) => (
              <div key={key} className='space-y-1.5'>
                <Label htmlFor={`hero-${key}`}>{label}</Label>
                {multiline ? (
                  <Textarea
                    id={`hero-${key}`}
                    rows={3}
                    value={form[key]}
                    placeholder={DEFAULT_HERO_CONTENT[key]}
                    disabled={isSaving}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                ) : (
                  <Input
                    id={`hero-${key}`}
                    value={form[key]}
                    placeholder={DEFAULT_HERO_CONTENT[key]}
                    disabled={isSaving}
                    onChange={(e) => setField(key, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className='flex items-center justify-between gap-4'>
          <p className='text-xs text-muted-foreground'>
            Ô để trống sẽ dùng nội dung mặc định.
          </p>
          <div className='flex gap-2'>
            <Button
              type='button'
              variant='outline'
              disabled={!isDirty || isSaving}
              onClick={() => setForm(saved)}
            >
              Hủy
            </Button>
            <Button type='button' disabled={!isDirty || isSaving} onClick={handleSave}>
              {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
