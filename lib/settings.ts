import {
  DEFAULT_HERO_CONTENT,
  HERO_CONTENT_KEY,
  parseHeroContent,
  type HeroContent
} from '@/lib/hero-content'
import { DISCOUNTS_ENABLED_KEY } from '@/lib/settings-keys'
import { createClient } from '@/lib/supabase/server'

/**
 * Reads the site-wide discount switch.
 *
 * Defaults to `true` on any failure or missing row: if the database is
 * unreachable we keep the existing behaviour (discounts shown) rather than
 * silently charging customers full price.
 */
export async function getDiscountsEnabled(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', DISCOUNTS_ENABLED_KEY)
      .maybeSingle()

    if (error) {
      console.error('[settings] discounts_enabled read error:', error)
      return true
    }

    if (!data) return true

    const normalized = String(data.value ?? '').trim().toLowerCase()
    return normalized !== 'false' && normalized !== '0'
  } catch (error) {
    console.error('[settings] discounts_enabled connection error:', error)
    return true
  }
}

/**
 * Reads the homepage hero content. Falls back to the built-in defaults on any
 * failure so the homepage always renders.
 */
export async function getHeroContent(): Promise<HeroContent> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', HERO_CONTENT_KEY)
      .maybeSingle()

    if (error) {
      console.error('[settings] hero_content read error:', error)
      return DEFAULT_HERO_CONTENT
    }

    return parseHeroContent(data?.value)
  } catch (error) {
    console.error('[settings] hero_content connection error:', error)
    return DEFAULT_HERO_CONTENT
  }
}
