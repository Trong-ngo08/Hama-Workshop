import { DiscountSettingCard } from '@/components/admin/discount-setting-card'
import { HeroSettingCard } from '@/components/admin/hero-setting-card'
import { getDiscountsEnabled, getHeroContent } from '@/lib/settings'
import { Settings } from 'lucide-react'

export default async function SettingsPage() {
  const [discountsEnabled, heroContent] = await Promise.all([
    getDiscountsEnabled(),
    getHeroContent()
  ])

  return (
    <div className='space-y-6'>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold flex items-center gap-2 text-foreground'>
          <Settings className='w-6 h-6' />
          Cài đặt hệ thống
        </h1>
        <p className='text-muted-foreground'>Cấu hình và quản lý hệ thống</p>
      </div>

      <HeroSettingCard initialContent={heroContent} />

      <DiscountSettingCard initialEnabled={discountsEnabled} />
    </div>
  )
}
