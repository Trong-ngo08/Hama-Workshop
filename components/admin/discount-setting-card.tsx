'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { DISCOUNTS_ENABLED_KEY } from '@/lib/settings-keys'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'

interface DiscountSettingCardProps {
  initialEnabled: boolean
}

export function DiscountSettingCard({ initialEnabled }: DiscountSettingCardProps) {
  const router = useRouter()
  const supabase = createClient()
  const [enabled, setEnabled] = useState(initialEnabled)
  const [isSaving, setIsSaving] = useState(false)

  const handleToggle = async (checked: boolean) => {
    const previous = enabled
    setEnabled(checked)
    setIsSaving(true)

    const { error } = await supabase.from('site_settings').upsert(
      {
        key: DISCOUNTS_ENABLED_KEY,
        value: checked ? 'true' : 'false',
        updated_at: new Date().toISOString()
      },
      { onConflict: 'key' }
    )

    setIsSaving(false)

    if (error) {
      setEnabled(previous)
      console.error('[settings] discount toggle error:', error)
      toast.error('Không lưu được cài đặt. Thử lại nhé.')
      return
    }

    toast.success(
      checked
        ? 'Đã bật giảm giá toàn site'
        : 'Đã tắt giảm giá, khách chỉ thấy giá gốc'
    )
    router.refresh()
  }

  return (
    <Card className='border border-border tech-shadow'>
      <CardHeader>
        <CardTitle className='text-foreground'>Khuyến mãi</CardTitle>
      </CardHeader>
      <CardContent>
        <div className='flex items-center justify-between gap-6'>
          <div className='space-y-1'>
            <Label htmlFor='discounts_enabled' className='text-base'>
              Bật giảm giá toàn site
            </Label>
            <p className='text-sm text-muted-foreground max-w-md leading-relaxed'>
              {enabled
                ? 'Giá khuyến mãi đang được áp dụng cho khách.'
                : 'Khách chỉ thấy giá gốc. Giá khuyến mãi đã set vẫn được lưu, bật lại là hiện.'}
            </p>
          </div>
          <Switch
            id='discounts_enabled'
            checked={enabled}
            disabled={isSaving}
            onCheckedChange={handleToggle}
          />
        </div>
      </CardContent>
    </Card>
  )
}
