import { Button } from '@/components/ui/button'
import { Facebook } from 'lucide-react'

const FACEBOOK_PAGE_URL =
  'https://www.facebook.com/profile.php?id=61550244332051'

/** "Đặt hàng" button that opens the shop's Facebook page. */
export function FacebookOrderButton() {
  return (
    <Button
      asChild
      size='lg'
      className='rounded-full px-8 shadow-lg shadow-primary/20'
    >
      <a href={FACEBOOK_PAGE_URL} target='_blank' rel='noopener noreferrer'>
        <Facebook className='w-4 h-4' />
        Đặt hàng
      </a>
    </Button>
  )
}
