export const FACEBOOK_PAGE_URL =
  'https://www.facebook.com/profile.php?id=61550244332051'
export const MESSENGER_URL = 'https://m.me/61550244332051'

export interface GachaSlice {
  label: string
  prize: string
  special?: boolean
}

const OFF_5K: GachaSlice = { label: 'Giảm 5K', prize: 'Phiếu giảm 5.000đ' }
const OFF_10K: GachaSlice = { label: 'Giảm 10K', prize: 'Phiếu giảm 10.000đ' }
const CLICKER: GachaSlice = { label: 'Clicker 30K', prize: '1 clicker loại 30.000đ' }
const SPECIAL: GachaSlice = {
  label: 'Mô hình 150-300K',
  prize: '1 mô hình đặc biệt 150.000đ – 300.000đ',
  special: true
}

// 12 slices, ordered so no two equal prizes sit side by side.
export const GACHA_SLICES: GachaSlice[] = [
  OFF_5K, OFF_10K, OFF_5K, CLICKER, OFF_5K, SPECIAL,
  OFF_5K, OFF_10K, CLICKER, OFF_5K, OFF_10K, CLICKER
]

/** The special slice wins 3% of spins; the other slices share the rest equally. */
export const SPECIAL_CHANCE = 0.03

export function pickSliceIndex(random = Math.random()): number {
  const special = GACHA_SLICES.findIndex((s) => s.special)
  if (random < SPECIAL_CHANCE) return special
  const others = GACHA_SLICES.map((_, i) => i).filter((i) => i !== special)
  const step = (1 - SPECIAL_CHANCE) / others.length
  return others[Math.min(others.length - 1, Math.floor((random - SPECIAL_CHANCE) / step))]
}
