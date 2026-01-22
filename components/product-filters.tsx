'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from '@/components/ui/sheet'
import {
  Bot,
  Box,
  Cpu,
  Filter,
  Gift,
  Lightbulb,
  Package,
  Printer,
  Puzzle,
  RotateCcw,
  Sofa,
  Sparkles,
  Trees,
  Wrench
} from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

interface Category {
  id: string
  name: string
}

interface ProductFiltersProps {
  categories: Category[]
}

export function ProductFilters({ categories }: ProductFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])

  useEffect(() => {
    const categoryParam = searchParams.get('category')
    const newSelected = categoryParam ? categoryParam.split(',') : []

    // Check if the current state is different from the param to avoid unnecessary updates
    if (JSON.stringify(selectedCategories) !== JSON.stringify(newSelected)) {
      setSelectedCategories(newSelected)
    }
  }, [searchParams])

  const handleCategoryChange = (categoryName: string) => {
    const normalizedName = categoryName.toLowerCase()
    const updated = selectedCategories.includes(normalizedName)
      ? selectedCategories.filter((c) => c !== normalizedName)
      : [...selectedCategories, normalizedName]

    setSelectedCategories(updated)

    const params = new URLSearchParams(searchParams.toString())
    if (updated.length > 0) {
      params.set('category', updated.join(','))
    } else {
      params.delete('category')
    }
    router.push(`/products?${params.toString()}`, { scroll: false })
  }

  const clearFilters = () => {
    setSelectedCategories([])
    router.push('/products', { scroll: false })
  }

  const ICON_CLASS = 'w-4 h-4 text-primary/70 rotate-3d-hover'

  const iconRules: {
    keywords: string[]
    icon: React.ElementType
  }[] = [
    { keywords: ['gỗ', 'wood'], icon: Trees },
    { keywords: ['3d', 'in 3d', 'print'], icon: Printer },
    { keywords: ['mô hình', 'model', 'box'], icon: Box },
    { keywords: ['quà', 'gift'], icon: Gift },
    { keywords: ['đèn', 'lamp', 'light'], icon: Lightbulb },
    { keywords: ['điện tử', 'electronics'], icon: Cpu },
    { keywords: ['robot', 'bot'], icon: Bot },
    { keywords: ['trang trí', 'decor'], icon: Sparkles },
    { keywords: ['nội thất', 'sofa'], icon: Sofa },
    { keywords: ['mini'], icon: Package },
    { keywords: ['đồ chơi', 'toy'], icon: Puzzle },
    { keywords: ['cơ khí', 'kim loại', 'tool'], icon: Wrench }
  ]

  const getIcon = (name: string) => {
    const lowerName = name.toLowerCase()

    for (const rule of iconRules) {
      if (rule.keywords.some((k) => lowerName.includes(k))) {
        const Icon = rule.icon
        return <Icon className={ICON_CLASS} />
      }
    }

    return <Box className={ICON_CLASS} />
  }

  const FilterContent = () => (
    <div className='space-y-8'>
      <div>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-xs font-bold uppercase tracking-widest text-foreground'>
            Danh mục
          </h3>
          {selectedCategories.length > 0 && (
            <Button
              variant='ghost'
              size='sm'
              onClick={clearFilters}
              className='h-auto p-0 text-[10px] text-muted-foreground hover:text-primary'
            >
              <RotateCcw className='w-3 h-3 mr-1' />
              Đặt lại
            </Button>
          )}
        </div>
        <div className='space-y-3'>
          {categories.map((category) => (
            <div
              key={category.id}
              className='flex items-center gap-3 group cursor-pointer'
            >
              <Checkbox
                id={category.id}
                checked={selectedCategories.includes(
                  category.name.toLowerCase()
                )}
                onCheckedChange={() => handleCategoryChange(category.name)}
                className='border-muted-foreground/30 data-[state=checked]:bg-primary data-[state=checked]:border-primary transition-all'
              />
              <Label
                htmlFor={category.id}
                className='text-sm font-medium text-muted-foreground group-hover:text-foreground cursor-pointer transition-colors flex items-center gap-2'
              >
                <div className='flex items-center justify-center w-8 h-8 rounded bg-muted/50 group-hover:bg-primary/10 transition-colors'>
                  {getIcon(category.name)}
                </div>
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className='hidden lg:block w-64 flex-shrink-0'>
        <div className='sticky top-24'>
          <FilterContent />
        </div>
      </aside>

      {/* Mobile Trigger */}
      <div className='lg:hidden mb-8'>
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant='outline'
              className='w-full flex items-center justify-between font-bold uppercase tracking-widest text-xs px-6 py-6 border-2 border-primary/20 bg-background/50 backdrop-blur-sm'
            >
              <div className='flex items-center gap-2'>
                <Filter className='w-4 h-4' />
                Bộ lọc
              </div>
              {selectedCategories.length > 0 && (
                <span className='bg-primary text-primary-foreground text-[10px] w-5 h-5 rounded-full flex items-center justify-center'>
                  {selectedCategories.length}
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent side='left' className='w-80'>
            <SheetHeader className='text-left mb-8 border-b pb-4'>
              <SheetTitle className='uppercase font-mono tracking-tighter text-xl'>
                Lọc sản phẩm
              </SheetTitle>
            </SheetHeader>
            <FilterContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
