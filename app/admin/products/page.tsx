import { ProductsTable } from '@/components/admin/products-table'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { Package, Plus } from 'lucide-react'
import Link from 'next/link'

export default async function AdminProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div className='space-y-1'>
          <h1 className='text-2xl font-bold flex items-center gap-2 text-gray-900'>
            <Package className='w-6 h-6' />
            Quản lý sản phẩm
          </h1>
          <p className='text-gray-600'>
            Thêm, sửa và quản lý các sản phẩm trong cửa hàng
          </p>
        </div>

        <Button asChild className='bg-primary hover:bg-primary/80 text-white'>
          <Link href='/admin/products/new'>
            <Plus className='w-4 h-4 mr-2' />
            Thêm sản phẩm
          </Link>
        </Button>
      </div>

      {/* Products Table */}
      <Card className='shadow-sm border border-gray-200'>
        <CardHeader>
          <CardTitle className='text-gray-900'>
            Danh sách sản phẩm ({products?.length || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProductsTable products={products || []} />
        </CardContent>
      </Card>
    </div>
  )
}
