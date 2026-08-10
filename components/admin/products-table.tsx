"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import Image from "next/image"
import { Edit, Search } from "lucide-react"
import { DeleteProductButton } from "./delete-product-button"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface Product {
  id: string
  name: string
  category: string
  categories?: string[]
  price: number
  sale_price?: number | null
  discount_percentage?: number | null
  is_featured: boolean
  is_available: boolean
  is_visible: boolean
  images: string[]
  created_at: string
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const router = useRouter()
  const supabase = createClient()

  // Optimistic overrides only. Anything not in here falls back to the prop, so
  // a router.refresh() bringing fresh rows never fights with stale local state.
  const [pendingVisibility, setPendingVisibility] = useState<Record<string, boolean>>({})

  // Prune overrides once the incoming prop agrees with them (or the product
  // is gone), so a stale override can never outlive its purpose.
  useEffect(() => {
    setPendingVisibility((prev) => {
      const ids = Object.keys(prev)
      if (ids.length === 0) return prev

      let changed = false
      const next = { ...prev }

      for (const id of ids) {
        const product = products.find((p) => p.id === id)
        const settled = !product || (product.is_visible !== false) === prev[id]
        if (settled) {
          delete next[id]
          changed = true
        }
      }

      return changed ? next : prev
    })
  }, [products])

  const isProductVisible = (product: Product) =>
    pendingVisibility[product.id] ?? product.is_visible !== false

  const handleVisibilityChange = async (product: Product, checked: boolean) => {
    setPendingVisibility((prev) => ({ ...prev, [product.id]: checked }))

    const { error } = await supabase
      .from("products")
      .update({ is_visible: checked })
      .eq("id", product.id)

    if (error) {
      setPendingVisibility((prev) => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
      console.error("[admin/products] visibility error:", error)
      toast.error("Không đổi được trạng thái hiển thị")
      return
    }

    toast.success(checked ? `Đã hiện "${product.name}"` : `Đã ẩn "${product.name}"`)
    router.refresh()
  }

  const filteredProducts = products.filter((product) => {
    const categoryList = product.categories?.length
      ? product.categories
      : product.category
        ? [product.category]
        : []
    const lowerSearch = searchTerm.toLowerCase()
    return (
      product.name.toLowerCase().includes(lowerSearch) ||
      categoryList.some((cat) => cat.toLowerCase().includes(lowerSearch))
    )
  })

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN")
  }

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Ảnh</TableHead>
              <TableHead>Tên sản phẩm</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Giá đã giảm</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="w-32">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => {
                const categoryList = product.categories?.length
                  ? product.categories
                  : product.category
                    ? [product.category]
                    : []
                const visible = isProductVisible(product)
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted">
                        <Image
                          src={product.images[0] || "/placeholder.svg?height=48&width=48"}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="font-medium">{product.name}</div>
                        {product.is_featured && (
                          <Badge className="bg-accent text-accent-foreground text-xs">Nổi bật</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {categoryList.map((cat) => (
                          <Badge key={cat} variant="outline">{cat}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">{formatPrice(product.price)}</TableCell>
                    <TableCell>
                      {product.sale_price ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-primary">{formatPrice(product.sale_price)}</span>
                          {product.discount_percentage ? (
                            <Badge variant="destructive" className="text-[10px] font-bold">
                              -{product.discount_percentage}%
                            </Badge>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        <Badge variant={visible ? "outline" : "secondary"}>
                          {visible ? "Đang hiện" : "Đang ẩn"}
                        </Badge>
                        <Badge variant={product.is_available ? "default" : "destructive"}>
                          {product.is_available ? "Còn hàng" : "Hết hàng"}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(product.created_at)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={visible}
                          onCheckedChange={(checked) => handleVisibilityChange(product, checked)}
                          aria-label={visible ? `Ẩn ${product.name}` : `Hiện ${product.name}`}
                        />
                        <Button variant="ghost" size="icon" className="h-10 w-10" asChild>
                          <Link href={`/admin/products/${product.id}/edit`}>
                            <Edit className="w-4 h-4" />
                          </Link>
                        </Button>
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  {searchTerm ? "Không tìm thấy sản phẩm nào" : "Chưa có sản phẩm nào"}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
