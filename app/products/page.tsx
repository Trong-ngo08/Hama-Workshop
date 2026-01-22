import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from '@/components/product-filters'
import { ProductSkeleton } from '@/components/product-skeleton'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { PackageOpen } from 'lucide-react'
import { Suspense } from 'react'

interface SearchParams {
  category?: string
  search?: string
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()

  let products = []
  let categories = []

  try {
    // Get products based on filters - Updated multi-select logic
    let productsQuery = supabase
      .from('products')
      .select('*')
      .eq('is_available', true)
      .order('created_at', { ascending: false })

    if (params.category) {
      const categoryList = params.category.split(',')
      // Using or filter for multiple categories
      const filterStr = categoryList
        .map((cat) => `category.ilike.%${cat}%`)
        .join(',')
      productsQuery = productsQuery.or(filterStr)
    }

    if (params.search) {
      productsQuery = productsQuery.or(
        `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
      )
    }

    const { data: productsData, error: productsError } = await productsQuery

    if (productsError) {
      console.error('[v0] Products query error:', productsError)
    } else {
      products = productsData || []
    }

    // Get categories
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('[v0] Categories query error:', categoriesError)
    } else {
      categories = categoriesData || []
    }
  } catch (error) {
    console.error('[v0] Database connection error:', error)
  }

  return (
    <div className='min-h-screen'>
      <Header />

      <main className='py-12 lg:py-24 relative overflow-hidden'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8 relative z-10'>
          {/* Page Header */}
          <div className='space-y-4 mb-16 lg:mb-24 text-center lg:text-left'>
            <h1 className='text-4xl lg:text-7xl lg:leading-24 font-bold text-foreground tracking-tighter uppercase font-mono'>
              Bộ sưu tập <br className='hidden lg:block' />{' '}
              <span className='text-primary italic'>Độc bản</span>
            </h1>
            <p className='text-sm lg:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto lg:mx-0 font-medium uppercase tracking-widest'>
              Từ những tấm gỗ mang vẻ đẹp tự nhiên đến từng lớp nhựa in 3D chính
              xác. Sự giao thoa giữa thủ công truyền thống và công nghệ tương
              lai.
            </p>
          </div>

          <div className='flex flex-col lg:flex-row gap-12 lg:gap-16'>
            <ProductFilters categories={categories} />

            <div className='flex-1'>
              <div className='flex items-center justify-between mb-8 border-b border-border/50 pb-4'>
                <span className='text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold'>
                  Hiện có {products?.length || 0} sản phẩm
                </span>
              </div>

              {/* Products Grid */}
              <Suspense
                fallback={
                  <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                {products && products.length > 0 ? (
                  <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                ) : (
                  <div className='text-center py-24 bg-muted/30 rounded-3xl border-2 border-dashed border-border/50'>
                    <div className='space-y-6 max-w-sm mx-auto'>
                      <div className='w-20 h-20 mx-auto rounded-full bg-background flex items-center justify-center shadow-xl'>
                        <PackageOpen className='w-10 h-10 text-primary' />
                      </div>
                      <div className='space-y-2'>
                        <h3 className='text-xl font-bold uppercase tracking-tight'>
                          Trống kho
                        </h3>
                        <p className='text-sm text-muted-foreground font-medium'>
                          Chúng tôi không tìm thấy sản phẩm nào khớp với bộ lọc
                          hiện tại của bạn.
                        </p>
                      </div>
                      <Button
                        asChild
                        variant='default'
                        className='rounded-full px-8 bg-primary hover:bg-primary/90'
                      >
                        <a href='/products'>Xem tất cả sản phẩm</a>
                      </Button>
                    </div>
                  </div>
                )}
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
