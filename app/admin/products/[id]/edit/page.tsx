import { createClient } from "@/lib/supabase/server"
import { ProductForm } from "@/components/admin/product-form"
import { notFound } from "next/navigation"

interface EditProductPageProps {
  params: { id: string }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const supabase = await createClient()

  const { data: product, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single()

  if (error || !product) {
    notFound()
  }

  const [{ data: categories }, { data: productCategories }] = await Promise.all([
    supabase.from("categories").select("*").order("name"),
    supabase.from("product_categories").select("category_id").eq("product_id", params.id)
  ])

  const initialCategoryIds = productCategories?.map((pc) => pc.category_id) ?? []

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Chỉnh sửa sản phẩm</h1>
            <p className="text-muted-foreground">Cập nhật thông tin sản phẩm</p>
          </div>

          <ProductForm
            product={product}
            categories={categories || []}
            initialCategoryIds={initialCategoryIds}
          />
        </div>
      </main>
    </div>
  )
}
