/**
 * Reference pricing for custom prints. Everything is printed in PETG, so
 * slicer data for other filaments is converted to PETG before pricing.
 */

export const PRICE_PER_GRAM = 800
export const PRICE_PER_HOUR = 8000
/** Smallest custom print order the shop accepts. */
export const MIN_ORDER = 50000

export const PETG_DENSITY = 1.27 // g/cm³

/** Filament densities (g/cm³), used to convert grams of X into grams of PETG. */
const DENSITIES: Record<string, number> = {
  PETG: 1.27,
  PET: 1.27,
  PCTG: 1.23,
  PLA: 1.24,
  TPU: 1.21,
  ABS: 1.04,
  ASA: 1.07,
  PC: 1.2,
  PA: 1.14,
  PVA: 1.23,
  HIPS: 1.04
}

/**
 * Time multipliers from X to PETG. PETG profiles print slower than PLA and
 * faster than TPU; engineering filaments are close enough to treat as equal.
 */
const TIME_FACTORS: Record<string, number> = {
  PLA: 1.15,
  TPU: 0.8
}

/** "PLA Basic", "PETG-HF", "PLA-CF" → "PLA", "PETG", "PLA". */
export function baseMaterial(type: string): string {
  const upper = type.toUpperCase()
  const keys = Object.keys(DENSITIES).sort((a, b) => b.length - a.length)
  return keys.find((k) => upper.startsWith(k)) ?? upper.split(/[\s-]/)[0]
}

export interface FilamentUsage {
  type: string
  grams: number
}

export interface ConvertedFilament extends FilamentUsage {
  base: string
  density: number
  petgGrams: number
}

export function convertToPetg(filaments: FilamentUsage[]): ConvertedFilament[] {
  return filaments.map((f) => {
    const base = baseMaterial(f.type)
    const density = DENSITIES[base] ?? PETG_DENSITY
    return {
      ...f,
      base,
      density,
      petgGrams: (f.grams * PETG_DENSITY) / density
    }
  })
}

/**
 * Time factor for a multi-material print, weighted by how much of each
 * filament the print uses.
 */
export function petgTimeFactor(filaments: FilamentUsage[]): number {
  const total = filaments.reduce((s, f) => s + f.grams, 0)
  if (total <= 0) return 1
  return filaments.reduce(
    (s, f) => s + (TIME_FACTORS[baseMaterial(f.type)] ?? 1) * (f.grams / total),
    0
  )
}

export function quote(grams: number, hours: number) {
  const materialCost = grams * PRICE_PER_GRAM
  const timeCost = hours * PRICE_PER_HOUR
  const total = materialCost + timeCost
  const rounded = Math.ceil(total / 1000) * 1000
  return {
    materialCost,
    timeCost,
    total,
    belowMinimum: rounded < MIN_ORDER,
    final: Math.max(rounded, MIN_ORDER)
  }
}

export const formatVnd = (n: number) =>
  `${Math.round(n).toLocaleString('vi-VN')}đ`

export const formatNumber = (n: number, digits = 1) =>
  n.toLocaleString('vi-VN', { maximumFractionDigits: digits })

export function formatDuration(hours: number): string {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  if (h === 0) return `${m} phút`
  return m === 0 ? `${h} giờ` : `${h} giờ ${m} phút`
}
