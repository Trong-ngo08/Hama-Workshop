// Homepage hero content, editable from /admin/settings. Stored as one JSON
// blob under `site_settings.hero_content`. Keep this file free of server-only
// imports — the admin form (a client component) uses it too.
export const HERO_CONTENT_KEY = 'hero_content'

export interface HeroContent {
  /** TikTok clip link shown beside the hero text. */
  videoUrl: string
  titleLine1: string
  titleLine2: string
  description: string
  primaryCta: string
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
  videoUrl: '',
  titleLine1: 'In 3D theo ý bạn',
  titleLine2: '× Thiết kế độc bản',
  description:
    'Từ một ý tưởng, một tấm ảnh hay một cái tên — chúng tôi biến nó thành món đồ chỉ thuộc về bạn. Không đại trà. Không rập khuôn.',
  primaryCta: 'Khám phá sản phẩm'
}

function pick(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() !== '' ? value.trim() : fallback
}

/**
 * Merges a stored (possibly partial or malformed) value over the defaults.
 * Blank fields fall back to the default text so the hero never renders empty.
 */
export function parseHeroContent(raw: unknown): HeroContent {
  let data: Record<string, unknown> = {}
  if (typeof raw === 'string') {
    try {
      const parsed = JSON.parse(raw)
      if (parsed && typeof parsed === 'object') data = parsed
    } catch {
      // fall through to defaults
    }
  } else if (raw && typeof raw === 'object') {
    data = raw as Record<string, unknown>
  }

  const d = DEFAULT_HERO_CONTENT

  return {
    videoUrl: pick(data.videoUrl, d.videoUrl),
    titleLine1: pick(data.titleLine1, d.titleLine1),
    titleLine2: pick(data.titleLine2, d.titleLine2),
    description: pick(data.description, d.description),
    primaryCta: pick(data.primaryCta, d.primaryCta)
  }
}

/** Video id from a full TikTok link (…/video/123…), or null. */
export function tiktokVideoId(url: string): string | null {
  return url.match(/tiktok\.com\/.*?video\/(\d+)/)?.[1] ?? null
}
