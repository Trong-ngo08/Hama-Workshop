import {
  Bot,
  Box,
  Cpu,
  Gem,
  Gift,
  Hammer,
  Heart,
  Home,
  Leaf,
  Lightbulb,
  type LucideIcon,
  Package,
  Paintbrush,
  Printer,
  Puzzle,
  ShoppingBag,
  Sofa,
  Sparkles,
  Star,
  Tag,
  Trees,
  Watch,
  Wrench
} from 'lucide-react'

export const ICON_REGISTRY: Record<string, LucideIcon> = {
  Trees,
  Printer,
  Box,
  Gift,
  Lightbulb,
  Cpu,
  Bot,
  Sparkles,
  Sofa,
  Package,
  Puzzle,
  Wrench,
  Hammer,
  Paintbrush,
  Gem,
  Watch,
  Home,
  Star,
  Heart,
  Leaf,
  Tag,
  ShoppingBag
}

export const CATEGORY_ICONS: { name: string; label: string }[] = [
  { name: 'Trees', label: 'Gỗ / Cây' },
  { name: 'Printer', label: 'In 3D' },
  { name: 'Box', label: 'Mô hình' },
  { name: 'Gift', label: 'Quà tặng' },
  { name: 'Lightbulb', label: 'Đèn' },
  { name: 'Cpu', label: 'Điện tử' },
  { name: 'Bot', label: 'Robot' },
  { name: 'Sparkles', label: 'Trang trí' },
  { name: 'Sofa', label: 'Nội thất' },
  { name: 'Package', label: 'Đóng gói' },
  { name: 'Puzzle', label: 'Đồ chơi' },
  { name: 'Wrench', label: 'Cơ khí' },
  { name: 'Hammer', label: 'Thủ công' },
  { name: 'Paintbrush', label: 'Nghệ thuật' },
  { name: 'Gem', label: 'Trang sức' },
  { name: 'Watch', label: 'Đồng hồ' },
  { name: 'Home', label: 'Nhà cửa' },
  { name: 'Star', label: 'Nổi bật' },
  { name: 'Heart', label: 'Yêu thích' },
  { name: 'Leaf', label: 'Tự nhiên' },
  { name: 'Tag', label: 'Phổ thông' },
  { name: 'ShoppingBag', label: 'Mua sắm' }
]

/** Returns the LucideIcon for a stored icon name, falling back to Box */
export function getIconComponent(iconName: string | null | undefined): LucideIcon {
  if (iconName && ICON_REGISTRY[iconName]) return ICON_REGISTRY[iconName]
  return Box
}
