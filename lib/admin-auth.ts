import { verifyToken } from '@/lib/jwt'
import { createAdminClient } from '@/lib/supabase/admin'
import type { NextRequest } from 'next/server'

/**
 * True when the request carries a valid `admin_token` JWT backed by an
 * unexpired row in `admin_sessions`. Use in API routes that mutate data.
 */
export async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get('admin_token')?.value
  if (!token) return false

  try {
    await verifyToken(token)
  } catch {
    return false
  }

  const supabase = createAdminClient()
  const { data: session, error } = await supabase
    .from('admin_sessions')
    .select('id')
    .eq('session_token', token)
    .gt('expires_at', new Date().toISOString())
    .maybeSingle()

  if (error) {
    console.error('[admin-auth] session lookup error:', error)
    return false
  }

  return !!session
}
