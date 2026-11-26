/**
 * Reference pricing for custom prints. Everything is printed in PETG, so
 * slicer data for other filaments is converted to PETG before pricing.
 */

export const PRICE_PER_GRAM = 800
export const PRICE_PER_HOUR = 8000
/** Smallest custom print order the shop accepts. */
export const MIN_ORDER = 100000

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

/**
 * Volume discounts on large orders, by PETG weight. Highest tier first.
 * "Trên 1 kg" means strictly more than 1.000 g.
 */
export const VOLUME_DISCOUNTS = [
  { overGrams: 5000, percent: 20 },
  { overGrams: 1000, percent: 10 }
] as const

/** Discount percent for an order using this many grams of PETG (0 if none). */
export function volumeDiscountPercent(grams: number): number {
  return VOLUME_DISCOUNTS.find((t) => grams > t.overGrams)?.percent ?? 0
}

/** "1 kg", "5 kg" — tier thresholds as customers read them. */
export const formatKg = (grams: number) => `${formatNumber(grams / 1000)} kg`

export function quote(grams: number, hours: number) {
  const materialCost = grams * PRICE_PER_GRAM
  const timeCost = hours * PRICE_PER_HOUR
  const subtotal = materialCost + timeCost
  const discountPercent = volumeDiscountPercent(grams)
  const discount = (subtotal * discountPercent) / 100
  const total = subtotal - discount
  const final = Math.ceil(total / 1000) * 1000
  const belowMinimum = final < MIN_ORDER
  return {
    materialCost,
    timeCost,
    subtotal,
    discountPercent,
    discount,
    total,
    /** Price of one print after any volume discount, rounded up to 1.000đ; never raised to the minimum. */
    final,
    belowMinimum,
    /** Fewest copies of this print that reach the minimum order. */
    minQuantity: belowMinimum ? Math.ceil(MIN_ORDER / Math.max(final, 1000)) : 1
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
