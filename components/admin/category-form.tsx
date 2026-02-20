"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { CATEGORY_ICONS, ICON_REGISTRY, getIconComponent } from "@/lib/category-icons"
import { cn } from "@/lib/utils"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"

interface Category {
  id: string
  name: string
  description: string | null
  icon: string | null
}

interface CategoryFormProps {
  category?: Category
}

export function CategoryForm({ category }: CategoryFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || ""
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        name: formData.name,
        description: formData.description || null,
        icon: formData.icon || null
      }

      if (category) {
        const { error } = await supabase
          .from("categories")
          .update(payload)
          .eq("id", category.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("categories").insert(payload)
        if (error) throw error
      }

      router.push("/admin/categories")
      router.refresh()
    } catch (error) {
      console.error("Error saving category:", error)
      alert("Có lỗi xảy ra khi lưu danh mục")
    } finally {
      setLoading(false)
    }
  }

  const SelectedIcon = getIconComponent(formData.icon)

  return (
    <div className="space-y-6">
      <Button variant="outline" asChild>
        <Link href="/admin/categories">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{category ? "Chỉnh sửa danh mục" : "Thêm danh mục mới"}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Tên danh mục *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nhập tên danh mục"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Nhập mô tả danh mục (tùy chọn)"
                rows={3}
              />
            </div>

            {/* Icon Picker */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label>Biểu tượng danh mục</Label>
                {formData.icon && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    <SelectedIcon className="w-3.5 h-3.5" />
                    {CATEGORY_ICONS.find(i => i.name === formData.icon)?.label || formData.icon}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
                {CATEGORY_ICONS.map(({ name, label }) => {
                  const Icon = ICON_REGISTRY[name]
                  const isSelected = formData.icon === name
                  return (
                    <button
                      key={name}
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          icon: isSelected ? "" : name
                        })
                      }
                      className={cn(
                        "flex flex-col items-center gap-1.5 p-3 rounded-lg border text-xs text-muted-foreground transition-all hover:border-primary hover:text-primary hover:bg-primary/5",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-medium shadow-sm"
                          : "border-border bg-muted/20"
                      )}
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span className="text-center leading-tight line-clamp-2">{label}</span>
                    </button>
                  )
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Chọn biểu tượng đại diện cho danh mục. Click lại để bỏ chọn.
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Đang lưu..." : "Lưu danh mục"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/admin/categories">Hủy</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
