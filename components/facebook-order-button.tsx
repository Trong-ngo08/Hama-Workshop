import { Button } from '@/components/ui/button'
import { MESSENGER_URL } from '@/lib/gacha'

/** "Đặt hàng" button that opens a Messenger chat with the shop's page. */
export function FacebookOrderButton() {
  return (
    <Button
      asChild
      size='lg'
      className='rounded-full px-8 shadow-lg shadow-primary/20'
    >
      <a href={MESSENGER_URL} target='_blank' rel='noopener noreferrer'>
        Đặt hàng
      </a>
    </Button>
  )
}
