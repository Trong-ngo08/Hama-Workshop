import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import Link from 'next/link'

interface Product {
  id: string
  name: string
  description: string
  price: number
  sale_price?: number
  discount_percentage?: number
  category: string
  categories?: string[]
  images: string[]
  is_featured: boolean
  is_available: boolean
}

interface ProductCardProps {
  product: Product
  priority?: boolean
  index?: number
  /** Square image, name and price only — for dense rows like the homepage. */
  compact?: boolean
}

export function ProductCard({
  product,
  priority = false,
  index = 0,
  compact = false
}: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const secondImage = product.images?.[1]

  const displayCategories =
    product.categories && product.categories.length > 0
      ? product.categories
      : product.category
        ? [product.category]
        : []

  return (
    <Link href={`/products/${product.id}`} className='block h-full'>
      <Card className='group h-full overflow-hidden border border-border tech-shadow hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card relative'>
        <div
          className={cn(
            'overflow-hidden bg-muted relative',
            compact ? 'aspect-square' : 'aspect-[4/5]'
          )}
        >
          <Image
            src={product.images[0] || '/placeholder.svg?height=400&width=320'}
            alt={product.name}
            width={320}
            height={400}
            sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
            priority={priority}
            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-700'
          />
          {secondImage && (
            <Image
              src={secondImage}
              alt={`${product.name} — ảnh 2`}
              width={320}
              height={400}
              sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
              className='card-alt-image absolute inset-0 object-cover w-full h-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-110'
              style={{ animationDelay: `${(index % 4) * 1.2}s` }}
            />
          )}
          <div className='absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center'>
            <span className='bg-background text-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
              Xem chi tiết
            </span>
          </div>
        </div>
        <CardContent
          className={cn(
            'bg-background/50 backdrop-blur-sm',
            compact ? 'p-3 space-y-2' : 'p-5 space-y-4'
          )}
        >
          <div className='flex items-start justify-between gap-2'>
            <h3
              className={cn(
                'font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight',
                compact ? 'text-xs min-h-[2.5em]' : 'text-sm'
              )}
            >
              {product.name}
            </h3>
          </div>

          {!compact && (
            <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[56px]'>
              {product.description}
            </p>
          )}

          <div
            className={cn(
              'flex items-center justify-between border-t border-border/50',
              compact ? 'pt-1.5' : 'pt-2'
            )}
          >
            <div className='flex items-start gap-2'>
              {product.sale_price ? (
                <div className='flex items-start gap-2 flex-col'>
                  <span className='font-bold text-lg text-primary'>
                    {formatPrice(product.sale_price)}
                  </span>
                  <span className='text-sm text-muted-foreground line-through'>
                    {formatPrice(product.price)}
                  </span>
                </div>
              ) : (
                <span className='font-bold text-lg text-primary'>
                  {formatPrice(product.price)}
                </span>
              )}
              {product.discount_percentage ? (
                <Badge
                  variant='destructive'
                  className='ml-2 text-[10px] uppercase tracking-wider font-bold'
                >
                  -{product.discount_percentage}%
                </Badge>
              ) : null}
            </div>
            {!compact && (
              <div className='flex flex-wrap gap-1 justify-end'>
                {displayCategories.map((cat) => (
                  <span
                    key={cat}
                    className='text-[11px] uppercase tracking-widest text-muted-foreground font-medium'
                  >
                    {cat}
                  </span>
                ))}
              </div>
            )}
          </div>

          {!product.is_available && (
            <Badge variant='destructive' className='w-full justify-center'>
              Hết hàng
            </Badge>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
