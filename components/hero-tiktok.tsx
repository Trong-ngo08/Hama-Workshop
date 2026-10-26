'use client'

import { Volume2, VolumeX } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const PLAYER_PARAMS = new URLSearchParams({
  autoplay: '1',
  loop: '1',
  controls: '1',
  progress_bar: '0',
  play_button: '0',
  volume_control: '1',
  fullscreen_button: '0',
  timestamp: '0',
  music_info: '0',
  description: '0',
  rel: '0',
  closed_caption: '0',
  native_context_menu: '0'
}).toString()

/**
 * TikTok clip for the homepage hero. Browsers only allow muted autoplay and
 * the TikTok player exposes mute/unmute but no volume level, so the clip
 * starts muted and visitors switch sound on themselves.
 */
export function HeroTikTok({ videoId }: { videoId: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [muted, setMuted] = useState(true)

  const send = (type: string) =>
    frame.current?.contentWindow?.postMessage({ type, 'x-tiktok-player': true }, '*')

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.['x-tiktok-player']) return
      if (e.data.type === 'onPlayerReady') {
        send('mute')
        send('play')
      }
      if (e.data.type === 'onMute') setMuted(Boolean(e.data.value))
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    // The player's own overlays (channel header, TikTok logo, like/share
    // column, controls) sit along its edges and can't be hidden from outside
    // the iframe, so the player is zoomed past the frame edges until hovered.
    // Zooming back in is instant; showing controls on hover eases in.
    <div className='group relative w-full h-full overflow-hidden'>
      <iframe
        ref={frame}
        src={`https://www.tiktok.com/player/v1/${videoId}?${PLAYER_PARAMS}`}
        title='Clip TikTok của HMWorkshop'
        allow='autoplay; fullscreen; encrypted-media'
        className='absolute inset-0 w-full h-full border-0 scale-[1.25] transition-none group-hover:scale-100 group-hover:transition-transform group-hover:duration-200'
      />
      <button
        type='button'
        onClick={() => send(muted ? 'unMute' : 'mute')}
        className='absolute bottom-16 left-3 z-10 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/70 transition-colors'
      >
        {muted ? <VolumeX className='w-4 h-4' /> : <Volume2 className='w-4 h-4' />}
        {muted ? 'Bật tiếng' : 'Tắt tiếng'}
      </button>
    </div>
  )
}
