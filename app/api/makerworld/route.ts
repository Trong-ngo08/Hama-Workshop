import { NextResponse } from 'next/server'

// makerworld.com sits behind a Cloudflare challenge; the Bambu API that the
// site itself uses serves the same design JSON without one.
const DESIGN_API = 'https://api.bambulab.com/v1/design-service/design/'

interface RawFilament {
  type?: string
  usedG?: string | number
}

interface RawInstance {
  id: number
  profileId?: number
  title?: string
  prediction?: number
  weight?: number
  instanceFilaments?: RawFilament[]
}

export async function GET(request: Request) {
  const url = new URL(request.url).searchParams.get('url') ?? ''
  const designId = url.match(/makerworld\.com\/(?:[a-z-]+\/)?models\/(\d+)/i)?.[1]
  if (!designId) {
    return NextResponse.json(
      { error: 'Link không hợp lệ. Hãy dán link dạng makerworld.com/.../models/...' },
      { status: 400 }
    )
  }
  const profileId = Number(url.match(/profileId-(\d+)/)?.[1]) || null

  let res: Response
  try {
    res = await fetch(DESIGN_API + designId, {
      headers: { 'user-agent': 'Mozilla/5.0 (HamaWorkshop quote)' },
      next: { revalidate: 3600 }
    })
  } catch {
    return NextResponse.json(
      { error: 'Không kết nối được tới MakerWorld, vui lòng thử lại.' },
      { status: 502 }
    )
  }
  if (!res.ok) {
    return NextResponse.json(
      { error: 'Không tìm thấy mẫu này trên MakerWorld.' },
      { status: 404 }
    )
  }

  const design = await res.json()
  const instances = ((design.instances ?? []) as RawInstance[])
    .filter((i) => i.weight && i.prediction)
    .map((i) => ({
      id: i.id,
      profileId: i.profileId ?? null,
      title: i.title ?? 'Profile',
      weight: Number(i.weight),
      predictionHours: Number(i.prediction) / 3600,
      filaments: (i.instanceFilaments ?? []).map((f) => ({
        type: f.type ?? 'PLA',
        grams: Number(f.usedG) || 0
      }))
    }))

  if (instances.length === 0) {
    return NextResponse.json(
      { error: 'Mẫu này chưa có profile in kèm khối lượng và thời gian.' },
      { status: 422 }
    )
  }

  const selected =
    instances.find((i) => i.profileId === profileId)?.id ??
    instances.find((i) => i.id === design.defaultInstanceId)?.id ??
    instances[0].id

  return NextResponse.json({
    id: design.id,
    title: design.title,
    cover: design.coverUrl ?? null,
    url: `https://makerworld.com/vi/models/${design.id}`,
    selected,
    instances
  })
}
