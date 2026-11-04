// How a product's cover photo is framed inside its card: which point of the
// photo sits at the centre of the frame (x/y in %) and how far it is zoomed.
// Stored as one JSON map under `site_settings.cover_positions`, keyed by image
// URL so the framing follows the photo even if it is reordered.
// Keep this file free of server-only imports — the admin editor uses it too.
import type { CSSProperties } from 'react'

export const COVER_POSITIONS_KEY = 'cover_positions'

export interface CoverPosition {
  x: number
  y: number
  zoom: number
}

export type CoverPositions = Record<string, CoverPosition>

export const DEFAULT_COVER_POSITION: CoverPosition = { x: 50, y: 50, zoom: 1 }

export const MAX_COVER_ZOOM = 3

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n))

/** Validates one entry, or returns null when it is malformed. */
export function parseCoverPosition(raw: unknown): CoverPosition | null {
  if (!raw || typeof raw !== 'object') return null
  const { x, y, zoom } = raw as Record<string, unknown>
  if (typeof x !== 'number' || typeof y !== 'number') return null
  return {
    x: clamp(x, 0, 100),
    y: clamp(y, 0, 100),
    zoom: clamp(typeof zoom === 'number' ? zoom : 1, 1, MAX_COVER_ZOOM)
  }
}

/** Parses the stored map, dropping malformed entries. */
export function parseCoverPositions(raw: unknown): CoverPositions {
  let data: unknown = raw
  if (typeof raw === 'string') {
    try {
      data = JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (!data || typeof data !== 'object') return {}
  const out: CoverPositions = {}
  for (const [url, value] of Object.entries(data)) {
    const pos = parseCoverPosition(value)
    if (pos) out[url] = pos
  }
  return out
}

/**
 * Inline style for an `object-cover` image. The focus point is pinned with
 * object-position and the zoom scales around that same point, so the chosen
 * spot stays centred in the frame.
 */
export function coverStyle(pos?: CoverPosition | null): CSSProperties | undefined {
  if (!pos) return undefined
  return {
    objectPosition: `${pos.x}% ${pos.y}%`,
    transform: pos.zoom > 1 ? `scale(${pos.zoom})` : undefined,
    transformOrigin: `${pos.x}% ${pos.y}%`
  }
}

/** Attaches each product's cover framing (by its first image) for the cards. */
export function withCoverPositions<T extends { images?: string[] | null }>(
  products: T[],
  positions: CoverPositions
): (T & { cover_position?: CoverPosition })[] {
  return products.map((p) => {
    const pos = p.images?.[0] ? positions[p.images[0]] : undefined
    return pos ? { ...p, cover_position: pos } : p
  })
}
