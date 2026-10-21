import { HERO_CONTENT_KEY, parseHeroContent } from '@/lib/hero-content'
import { DISCOUNTS_ENABLED_KEY } from '@/lib/settings-keys'
import { createClient } from '@/lib/supabase/server'
import { type NextRequest, NextResponse } from 'next/server'

// Each writable key normalises its incoming value, or returns null to reject.
const SERIALIZERS: Record<string, (value: unknown) => string | null> = {
  [DISCOUNTS_ENABLED_KEY]: (value) =>
    typeof value === 'boolean' ? String(value) : null,
  [HERO_CONTENT_KEY]: (value) =>
    value && typeof value === 'object'
      ? JSON.stringify(parseHeroContent(value))
      : null
}

export async function PUT(request: NextRequest) {
  let body: { key?: unknown; value?: unknown }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const serialize = typeof body.key === 'string' ? SERIALIZERS[body.key] : undefined
  if (!serialize) {
    return NextResponse.json({ error: 'Unknown setting' }, { status: 400 })
  }

  const value = serialize(body.value)
  if (value === null) {
    return NextResponse.json({ error: 'Invalid value' }, { status: 400 })
  }

  const supabase = await createClient()
  const { error } = await supabase.from('site_settings').upsert(
    { key: body.key, value, updated_at: new Date().toISOString() },
    { onConflict: 'key' }
  )

  if (error) {
    console.error('[settings] write error:', error)
    return NextResponse.json({ error: 'Save failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
