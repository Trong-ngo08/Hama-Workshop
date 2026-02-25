import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { ProductCard } from '@/components/product-card'
import { ProductFilters } from '@/components/product-filters'
import { ProductSkeleton } from '@/components/product-skeleton'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { ChevronLeft, ChevronRight, PackageOpen } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'

const PAGE_SIZE = 12

interface SearchParams {
  category?: string
  search?: string
  page?: string
}

export async function generateMetadata({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}): Promise<Metadata> {
  const params = await searchParams
  const hasFilter = params.search || params.category

  const title = params.search
    ? `Tìm kiếm "${params.search}"`
    : params.category
      ? `Danh mục: ${params.category}`
      : 'Bộ sưu tập sản phẩm'

  return {
    title,
    description:
      'Khám phá bộ sưu tập sản phẩm gỗ thủ công và in 3D cá nhân hóa của Hama Workshop.',
    robots: hasFilter
      ? { index: false, follow: true }
      : { index: true, follow: true }
  }
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: Promise<SearchParams>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const page = Math.max(1, Number(params.page) || 1)

  let products: any[] = []
  let categories: any[] = []
  let totalCount = 0

  try {
    // Fetch all categories for the filter sidebar
    const { data: categoriesData, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')

    if (categoriesError) {
      console.error('[products] categories error:', categoriesError)
    } else {
      categories = categoriesData || []
    }

    // Resolve category filter → product IDs via junction table
    let filteredProductIds: string[] | null = null

    if (params.category) {
      const categoryNames = params.category.split(',')

      // Match category names case-insensitively
      const matchingCategoryIds = categories
        .filter((c) =>
          categoryNames.some((n) => c.name.toLowerCase() === n.toLowerCase())
        )
        .map((c) => c.id)

      if (matchingCategoryIds.length > 0) {
        const { data: junctionData } = await supabase
          .from('product_categories')
          .select('product_id')
          .in('category_id', matchingCategoryIds)

        // AND logic: chỉ lấy sản phẩm xuất hiện trong TẤT CẢ categories đã chọn
        const productIdCounts = (junctionData || []).reduce(
          (acc, j) => {
            acc[j.product_id] = (acc[j.product_id] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )

        filteredProductIds = Object.entries(productIdCounts)
          .filter(([_, count]) => count === matchingCategoryIds.length)
          .map(([id]) => id)
      } else {
        filteredProductIds = []
      }
    }

    // Short-circuit if category filter returns no products
    if (filteredProductIds !== null && filteredProductIds.length === 0) {
      products = []
      totalCount = 0
    } else {
      let productsQuery = supabase
        .from('products')
        .select(
          'id, name, description, price, sale_price, discount_percentage, category, images, is_featured, is_available, product_categories(categories(id, name))',
          { count: 'exact' }
        )
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .range((page - 1) * PAGE_SIZE, page * PAGE_SIZE - 1)

      if (filteredProductIds !== null && filteredProductIds.length > 0) {
        productsQuery = productsQuery.in('id', filteredProductIds)
      }

      if (params.search) {
        productsQuery = productsQuery.or(
          `name.ilike.%${params.search}%,description.ilike.%${params.search}%`
        )
      }

      const { data, error, count } = await productsQuery

      if (error) {
        console.error('[products] query error:', error)
      } else {
        // Flatten joined categories into a string array for each product
        products = (data || []).map((p) => ({
          ...p,
          categories: ((p.product_categories as any[]) || [])
            .map((pc: any) => pc.categories?.name)
            .filter(Boolean)
        }))
        totalCount = count || 0
      }
    }
  } catch (error) {
    console.error('[products] connection error:', error)
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  const buildPageUrl = (pageNum: number) => {
    const urlParams = new URLSearchParams()
    if (params.category) urlParams.set('category', params.category)
    if (params.search) urlParams.set('search', params.search)
    urlParams.set('page', String(pageNum))
    return `/products?${urlParams.toString()}`
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
                  {totalCount > 0
                    ? `${totalCount} sản phẩm${totalPages > 1 ? ` — Trang ${page}/${totalPages}` : ''}`
                    : 'Không có sản phẩm'}
                </span>
              </div>

              {/* Products Grid */}
              <Suspense
                fallback={
                  <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                    {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                      <ProductSkeleton key={i} />
                    ))}
                  </div>
                }
              >
                {products.length > 0 ? (
                  <>
                    <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8'>
                      {products.map((product, index) => (
                        <ProductCard
                          key={product.id}
                          product={product}
                          priority={index < 3}
                        />
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className='flex items-center justify-center gap-3 mt-16'>
                        {page > 1 ? (
                          <Button variant='outline' asChild className='gap-1'>
                            <Link href={buildPageUrl(page - 1)}>
                              <ChevronLeft className='w-4 h-4' />
                              Trước
                            </Link>
                          </Button>
                        ) : (
                          <Button variant='outline' disabled className='gap-1'>
                            <ChevronLeft className='w-4 h-4' />
                            Trước
                          </Button>
                        )}

                        <span className='text-xs uppercase tracking-widest text-muted-foreground font-bold px-4'>
                          {page} / {totalPages}
                        </span>

                        {page < totalPages ? (
                          <Button variant='outline' asChild className='gap-1'>
                            <Link href={buildPageUrl(page + 1)}>
                              Tiếp
                              <ChevronRight className='w-4 h-4' />
                            </Link>
                          </Button>
                        ) : (
                          <Button variant='outline' disabled className='gap-1'>
                            Tiếp
                            <ChevronRight className='w-4 h-4' />
                          </Button>
                        )}
                      </div>
                    )}
                  </>
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
