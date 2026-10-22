// Homepage hero content, editable from /admin/settings. Stored as one JSON
// blob under `site_settings.hero_content`. Keep this file free of server-only
// imports — the admin form (a client component) uses it too.
export const HERO_CONTENT_KEY = 'hero_content'

export const DEFAULT_HERO_IMAGE = '/hero-image.jpg'

export interface HeroStat {
  value: string
  label: string
}

export interface HeroContent {
  imageUrl: string
  badge: string
  titleLine1: string
  titleLine2: string
  description: string
  primaryCta: string
  secondaryCta: string
  quote: string
  stats: [HeroStat, HeroStat, HeroStat]
}

export const DEFAULT_HERO_CONTENT: HeroContent = {
  imageUrl: DEFAULT_HERO_IMAGE,
  badge: 'Cá nhân hóa theo yêu cầu',
  titleLine1: 'In 3D theo ý bạn',
  titleLine2: '× Thiết kế độc bản',
  description:
    'Từ một ý tưởng, một tấm ảnh hay một cái tên — chúng tôi biến nó thành món đồ chỉ thuộc về bạn. Không đại trà. Không rập khuôn.',
  primaryCta: 'Khám phá sản phẩm',
  secondaryCta: 'Câu chuyện thương hiệu',
  quote: 'Mỗi lớp in đều mang một phần câu chuyện của bạn.',
  stats: [
    { value: '100%', label: 'Thiết kế riêng' },
    { value: 'Custom', label: 'Màu & kích thước' },
    { value: 'Độc bản', label: 'Chỉ dành cho bạn' }
  ]
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
  const stats = Array.isArray(data.stats) ? data.stats : []

  return {
    imageUrl: pick(data.imageUrl, d.imageUrl),
    badge: pick(data.badge, d.badge),
    titleLine1: pick(data.titleLine1, d.titleLine1),
    titleLine2: pick(data.titleLine2, d.titleLine2),
    description: pick(data.description, d.description),
    primaryCta: pick(data.primaryCta, d.primaryCta),
    secondaryCta: pick(data.secondaryCta, d.secondaryCta),
    quote: pick(data.quote, d.quote),
    stats: d.stats.map((fallback, i) => {
      const s = (stats[i] ?? {}) as Record<string, unknown>
      return {
        value: pick(s.value, fallback.value),
        label: pick(s.label, fallback.label)
      }
    }) as HeroContent['stats']
  }
}
