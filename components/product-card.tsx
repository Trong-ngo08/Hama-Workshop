import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
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
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  console.log('🚀 ~ ProductCard ~ product:', product)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price)
  }

  const displayCategories =
    product.categories && product.categories.length > 0
      ? product.categories
      : product.category
        ? [product.category]
        : []

  return (
    <Link href={`/products/${product.id}`} className='block h-full'>
      <Card className='group h-full overflow-hidden border border-border tech-shadow hover:shadow-xl transition-all duration-500 hover:-translate-y-2 bg-card relative'>
        <div className='aspect-[4/5] overflow-hidden bg-muted'>
          <Image
            src={product.images[0] || '/placeholder.svg?height=400&width=320'}
            alt={product.name}
            width={320}
            height={400}
            sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
            priority={priority}
            className='object-cover w-full h-full group-hover:scale-110 transition-transform duration-700'
          />
          <div className='absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center'>
            <span className='bg-background text-foreground px-4 py-2 text-xs font-bold uppercase tracking-widest rounded-full translate-y-4 group-hover:translate-y-0 transition-transform duration-500'>
              Xem chi tiết
            </span>
          </div>
        </div>
        <CardContent className='p-5 space-y-4 bg-background/50 backdrop-blur-sm'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='font-bold text-foreground group-hover:text-primary transition-colors line-clamp-2 uppercase tracking-tight text-sm'>
              {product.name}
            </h3>
            {product.is_featured && (
              <Badge
                variant='secondary'
                className='bg-primary/10 text-primary border-none text-[10px] uppercase tracking-wider font-bold'
              >
                Bản giới hạn
              </Badge>
            )}
          </div>

          <p className='text-sm text-muted-foreground line-clamp-2 leading-relaxed min-h-[56px]'>
            {product.description}
          </p>

          <div className='flex items-center justify-between pt-2 border-t border-border/50'>
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
              {product.discount_percentage && (
                <Badge
                  variant='destructive'
                  className='ml-2 text-[10px] uppercase tracking-wider font-bold'
                >
                  -{product.discount_percentage}%
                </Badge>
              )}
            </div>
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
