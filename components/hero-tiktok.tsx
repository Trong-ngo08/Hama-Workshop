'use client'

import { useEffect, useRef, useState } from 'react'

// Standard TikTok embed: the player shows its own header, progress bar,
// controls and logo. Only autoplay (muted, as browsers require) and loop are set.
const PLAYER_PARAMS = new URLSearchParams({
  autoplay: '1',
  muted: '1',
  loop: '1'
}).toString()

// Some browsers (Edge tracking prevention, Safari ITP) block the embedded
// TikTok player, which then shows "Unable to load player". If the player has
// not reported ready by this time, cover it with a link to the clip instead.
const READY_TIMEOUT_MS = 10000

/** TikTok clip for the homepage hero, embedded as the normal TikTok player. */
export function HeroTikTok({ videoId, videoUrl }: { videoId: string; videoUrl: string }) {
  const frame = useRef<HTMLIFrameElement>(null)
  const [ready, setReady] = useState(false)
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), READY_TIMEOUT_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onMessage = (e: MessageEvent) => {
      if (e.source !== frame.current?.contentWindow || !e.data?.['x-tiktok-player']) return
      if (e.data.type === 'onPlayerReady') setReady(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  return (
    <div className='relative w-full h-full'>
      <iframe
        ref={frame}
        src={`https://www.tiktok.com/player/v1/${videoId}?${PLAYER_PARAMS}`}
        title='Clip TikTok của HMWorkshop'
        allow='autoplay; fullscreen; encrypted-media; picture-in-picture'
        allowFullScreen
        className='absolute inset-0 w-full h-full border-0'
      />
      {timedOut && !ready && (
        <div className='absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black px-6 text-center text-white'>
          <img src='/tiktok.png' alt='' className='w-14 h-14 rounded-xl' />
          <p className='text-sm text-white/80 text-pretty'>
            Trình duyệt này đang chặn clip TikTok nhúng trong trang.
          </p>
          <a
            href={videoUrl}
            target='_blank'
            rel='noopener noreferrer'
            className='inline-flex items-center rounded-full bg-white px-5 py-2 text-sm font-semibold text-black hover:bg-white/90 transition-colors'
          >
            Xem clip trên TikTok
          </a>
        </div>
      )}
    </div>
  )
}
