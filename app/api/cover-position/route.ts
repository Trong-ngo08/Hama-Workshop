import {
  COVER_POSITIONS_KEY,
  parseCoverPosition,
  parseCoverPositions
} from '@/lib/cover-position'
import { verifyToken } from '@/lib/jwt'
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

// Sets (or clears, with `position: null`) the cover framing of one photo,
// merging it into the shared map. Admin only.
export async function PUT(request: NextRequest) {
  const token = request.cookies.get('admin_token')?.value
  try {
    if (!token) throw new Error('missing token')
    await verifyToken(token)
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { url?: unknown; position?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (typeof body.url !== 'string' || !body.url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }
  const position = body.position === null ? null : parseCoverPosition(body.position)
  if (body.position !== null && !position) {
    return NextResponse.json({ error: 'Invalid position' }, { status: 400 })
  }

  const supabase = await createClient()
  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', COVER_POSITIONS_KEY)
    .maybeSingle()

  const positions = parseCoverPositions(data?.value)
  if (position) positions[body.url] = position
  else delete positions[body.url]

  const { error } = await supabase.from('site_settings').upsert(
    {
      key: COVER_POSITIONS_KEY,
      value: JSON.stringify(positions),
      updated_at: new Date().toISOString()
    },
    { onConflict: 'key' }
  )

  if (error) {
    console.error('[cover-position] write error:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
