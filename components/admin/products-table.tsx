"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import Image from "next/image"
import { Check, Edit, Search, X } from "lucide-react"
import { DeleteProductButton } from "./delete-product-button"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { computeDiscountPercentage } from "@/lib/pricing"
import type React from "react"

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

    const rollbackVisibility = () => {
      setPendingVisibility((prev) => {
        const next = { ...prev }
        delete next[product.id]
        return next
      })
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .update({ is_visible: checked })
        .eq("id", product.id)
        .select("id")

      if (error) {
        rollbackVisibility()
        console.error("[admin/products] visibility error:", error)
        toast.error("Không đổi được trạng thái hiển thị")
        return
      }

      if (!data || data.length === 0) {
        rollbackVisibility()
        console.error("[admin/products] visibility error: update matched no rows", product.id)
        toast.error("Không đổi được trạng thái hiển thị")
        return
      }

      toast.success(checked ? `Đã hiện "${product.name}"` : `Đã ẩn "${product.name}"`)
      router.refresh()
    } catch (error) {
      rollbackVisibility()
      console.error("[admin/products] visibility error:", error)
      toast.error("Không đổi được trạng thái hiển thị")
    }
  }

  const [editingId, setEditingId] = useState<string | null>(null)
  const [savingId, setSavingId] = useState<string | null>(null)
  const [draft, setDraft] = useState({ name: "", price: "", sale_price: "" })

  const startEdit = (product: Product) => {
    setEditingId(product.id)
    setDraft({
      name: product.name,
      price: product.price?.toString() ?? "",
      sale_price: product.sale_price != null ? product.sale_price.toString() : "",
    })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setDraft({ name: "", price: "", sale_price: "" })
  }

  // Returns null and shows a toast when the draft is unusable, so the caller
  // can bail without the row leaving edit mode or losing what was typed.
  const validateDraft = () => {
    const name = draft.name.trim()
    if (!name) {
      toast.error("Tên sản phẩm không được để trống")
      return null
    }

    const price = Number(draft.price)
    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Giá phải là số lớn hơn 0")
      return null
    }

    const rawSale = draft.sale_price.trim()
    if (rawSale === "") return { name, price, salePrice: null as number | null }

    const salePrice = Number(rawSale)
    if (!Number.isFinite(salePrice) || salePrice <= 0) {
      toast.error("Giá đã giảm phải lớn hơn 0")
      return null
    }
    if (salePrice >= price) {
      toast.error("Giá đã giảm phải nhỏ hơn giá gốc")
      return null
    }

    return { name, price, salePrice }
  }

  const saveEdit = async (productId: string) => {
    const valid = validateDraft()
    if (!valid) return

    setSavingId(productId)

    try {
      const { data, error } = await supabase
        .from("products")
        .update({
          name: valid.name,
          price: valid.price,
          sale_price: valid.salePrice,
          discount_percentage: computeDiscountPercentage(valid.price, valid.salePrice),
        })
        .eq("id", productId)
        .select("id")

      if (error) {
        console.error("[admin/products] quick edit error:", error)
        toast.error("Lưu thất bại. Thử lại nhé.")
        return
      }

      if (!data || data.length === 0) {
        console.error("[admin/products] quick edit error: update matched no rows", productId)
        toast.error("Lưu thất bại. Thử lại nhé.")
        return
      }

      toast.success("Đã lưu")
      cancelEdit()
      router.refresh()
    } catch (error) {
      console.error("[admin/products] quick edit error:", error)
      toast.error("Lưu thất bại. Thử lại nhé.")
    } finally {
      setSavingId(null)
    }
  }

  const handleEditKeyDown = (e: React.KeyboardEvent, productId: string) => {
    if (e.key === "Enter") {
      e.preventDefault()
      saveEdit(productId)
    }
    if (e.key === "Escape") {
      e.preventDefault()
      cancelEdit()
    }
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
            onChange={(e) => {
              cancelEdit()
              setSearchTerm(e.target.value)
            }}
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
              <TableHead className="w-44">Thao tác</TableHead>
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
                const isEditing = editingId === product.id
                const isSaving = savingId === product.id
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
                      {isEditing ? (
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                          onKeyDown={(e) => handleEditKeyDown(e, product.id)}
                          disabled={isSaving}
                          autoFocus
                          className="h-9 min-w-[180px]"
                        />
                      ) : (
                        <div className="space-y-1">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="font-medium hover:text-primary hover:underline"
                          >
                            {product.name}
                          </Link>
                          {product.is_featured && (
                            <Badge className="bg-accent text-accent-foreground text-xs">Nổi bật</Badge>
                          )}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {categoryList.map((cat) => (
                          <Badge key={cat} variant="outline">{cat}</Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-primary">
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          value={draft.price}
                          onChange={(e) => setDraft({ ...draft, price: e.target.value })}
                          onKeyDown={(e) => handleEditKeyDown(e, product.id)}
                          disabled={isSaving}
                          className="h-9 w-28"
                        />
                      ) : (
                        formatPrice(product.price)
                      )}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <Input
                          type="number"
                          min="0"
                          placeholder="Để trống"
                          value={draft.sale_price}
                          onChange={(e) => setDraft({ ...draft, sale_price: e.target.value })}
                          onKeyDown={(e) => handleEditKeyDown(e, product.id)}
                          disabled={isSaving}
                          className="h-9 w-28"
                        />
                      ) : product.sale_price ? (
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
                        {isEditing ? (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10 text-green-600 hover:text-green-700"
                              onClick={() => saveEdit(product.id)}
                              disabled={isSaving}
                              aria-label="Lưu"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={cancelEdit}
                              disabled={isSaving}
                              aria-label="Huỷ"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-10 w-10"
                              onClick={() => startEdit(product)}
                              disabled={savingId !== null}
                              aria-label="Sửa nhanh"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <DeleteProductButton
                              productId={product.id}
                              productName={product.name}
                              disabled={savingId !== null}
                            />
                          </>
                        )}
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
