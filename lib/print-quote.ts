/**
 * Reference pricing for custom prints. Everything is printed in PETG, so
 * slicer data for other filaments is converted to PETG before pricing.
 */

export const PRICE_PER_GRAM = 800
export const PRICE_PER_HOUR = 8000

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

/** Average PETG throughput used when only the mesh is known (g per hour). */
const PETG_GRAMS_PER_HOUR = 15
/** Heating, bed levelling and purge before every print (hours). */
const PRINT_OVERHEAD_HOURS = 0.1
/** Effective thickness of walls plus top/bottom skins (cm). */
const SHELL_THICKNESS_CM = 0.1

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

export interface MeshStats {
  volumeCm3: number
  areaCm2: number
}

/**
 * Rough slicer substitute: a solid shell around the surface plus sparse
 * infill inside. Supports are not included.
 */
export function estimateFromMesh(mesh: MeshStats, infill: number) {
  const shell = Math.min(mesh.volumeCm3, mesh.areaCm2 * SHELL_THICKNESS_CM)
  const inner = Math.max(mesh.volumeCm3 - shell, 0) * infill
  const grams = (shell + inner) * PETG_DENSITY
  const hours = grams / PETG_GRAMS_PER_HOUR + PRINT_OVERHEAD_HOURS
  return { grams, hours }
}

export function quote(grams: number, hours: number) {
  const materialCost = grams * PRICE_PER_GRAM
  const timeCost = hours * PRICE_PER_HOUR
  const total = materialCost + timeCost
  return {
    materialCost,
    timeCost,
    total,
    rounded: Math.ceil(total / 1000) * 1000
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
