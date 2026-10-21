'use client'

import { SingleImageUpload } from '@/components/admin/single-image-upload'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  DEFAULT_HERO_CONTENT,
  DEFAULT_HERO_IMAGE,
  HERO_CONTENT_KEY,
  parseHeroContent,
  type HeroContent
} from '@/lib/hero-content'
import { createClient } from '@/lib/supabase/client'
import { RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

type TextField = Exclude<keyof HeroContent, 'imageUrl' | 'stats'>

const TEXT_FIELDS: { key: TextField; label: string; multiline?: boolean }[] = [
  { key: 'badge', label: 'Nhãn nhỏ phía trên' },
  { key: 'titleLine1', label: 'Tiêu đề dòng 1' },
  { key: 'titleLine2', label: 'Tiêu đề dòng 2 (màu nhấn)' },
  { key: 'description', label: 'Mô tả', multiline: true },
  { key: 'primaryCta', label: 'Nút chính (→ Sản phẩm)' },
  { key: 'secondaryCta', label: 'Nút phụ (→ Về chúng tôi)' },
  { key: 'quote', label: 'Câu quote dưới ảnh' }
]

interface HeroSettingCardProps {
  initialContent: HeroContent
}

export function HeroSettingCard({ initialContent }: HeroSettingCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [saved, setSaved] = useState(initialContent)
  const [form, setForm] = useState(initialContent)
  const [isSaving, setIsSaving] = useState(false)

  const isDirty = JSON.stringify(form) !== JSON.stringify(saved)

  const setField = (key: TextField, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setStat = (index: number, field: 'value' | 'label', value: string) =>
    setForm((prev) => {
      const stats = prev.stats.map((s, i) =>
        i === index ? { ...s, [field]: value } : s
      ) as HeroContent['stats']
      return { ...prev, stats }
    })

  const handleSave = async () => {
    // Normalise so blank fields are stored (and shown) as their defaults.
    const next = parseHeroContent(form)
    setIsSaving(true)

    const { error } = await supabase.from('site_settings').upsert(
      {
        key: HERO_CONTENT_KEY,
        value: JSON.stringify(next),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'key' }
    )

    setIsSaving(false)

    if (error) {
      console.error('[settings] hero save error:', error)
      toast.error('Không lưu được nội dung hero. Thử lại nhé.')
      return
    }

    // The previous uploaded image is no longer referenced anywhere.
    if (saved.imageUrl !== next.imageUrl && saved.imageUrl !== DEFAULT_HERO_IMAGE) {
      fetch('/api/delete-image', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: saved.imageUrl })
      }).catch((err) => console.error('[settings] old hero image delete error:', err))
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
            <Label>Ảnh hero</Label>
            <SingleImageUpload
              value={form.imageUrl === DEFAULT_HERO_IMAGE ? undefined : form.imageUrl}
              onChange={(url) =>
                setForm((prev) => ({ ...prev, imageUrl: url ?? DEFAULT_HERO_IMAGE }))
              }
              uploadEndpoint='/api/upload-hero-image'
              deleteOnRemove={false}
              disabled={isSaving}
              placeholder='Tải ảnh hero mới (nên dùng ảnh vuông)'
            />
            {form.imageUrl === DEFAULT_HERO_IMAGE && (
              <p className='text-xs text-muted-foreground'>
                Đang dùng ảnh mặc định.
              </p>
            )}
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

        <div className='space-y-2'>
          <Label>Chỉ số (3 ô dưới nút)</Label>
          <div className='grid sm:grid-cols-3 gap-4'>
            {form.stats.map((stat, i) => (
              <div key={i} className='space-y-2 rounded-lg border border-border p-3'>
                <Input
                  aria-label={`Chỉ số ${i + 1} – giá trị`}
                  value={stat.value}
                  placeholder={DEFAULT_HERO_CONTENT.stats[i].value}
                  disabled={isSaving}
                  onChange={(e) => setStat(i, 'value', e.target.value)}
                />
                <Input
                  aria-label={`Chỉ số ${i + 1} – nhãn`}
                  value={stat.label}
                  placeholder={DEFAULT_HERO_CONTENT.stats[i].label}
                  disabled={isSaving}
                  onChange={(e) => setStat(i, 'label', e.target.value)}
                />
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
