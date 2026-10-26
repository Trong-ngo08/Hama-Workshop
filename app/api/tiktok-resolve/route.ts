import { NextResponse } from 'next/server'

// Turns any TikTok share link (full or vt./vm. short link) into the video id
// via TikTok's public oEmbed endpoint, which also confirms the clip exists.
export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url')?.trim() ?? ''
  if (!/^https?:\/\/([a-z]+\.)?tiktok\.com\//i.test(url)) {
    return NextResponse.json({ error: 'Link không phải link TikTok.' }, { status: 400 })
  }

  try {
    const res = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`,
      { headers: { 'user-agent': 'Mozilla/5.0' } }
    )
    const data = res.ok ? await res.json() : null
    const id: string | undefined =
      data?.embed_product_id ?? data?.html?.match(/player\/v1\/(\d+)/)?.[1]
    if (!id) {
      return NextResponse.json(
        { error: 'Không tìm thấy clip. Kiểm tra lại link hoặc clip có đang để công khai không.' },
        { status: 404 }
      )
    }
    return NextResponse.json({ id, url: `https://www.tiktok.com/video/${id}` })
  } catch {
    return NextResponse.json({ error: 'Không kết nối được tới TikTok.' }, { status: 502 })
  }
}
