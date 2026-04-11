"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Save, X, Upload, GripVertical, LayoutGrid, Rows3, SlidersHorizontal } from "lucide-react"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
  display_order: number
  is_active: boolean
}

type Layout = "grid" | "masonry" | "slider"

function SortableItem({
  item,
  onEdit,
  onDelete,
  disabled,
}: {
  item: FeedbackItem
  onEdit: (item: FeedbackItem) => void
  onDelete: (id: number) => void
  disabled: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card ref={setNodeRef} style={style}>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <button
            className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-5 h-5" />
          </button>
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
            <Image
              src={item.image_url || "/placeholder.svg"}
              alt={item.customer_name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{item.customer_name}</h3>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Hiển thị" : "Ẩn"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground line-clamp-2">"{item.quote}"</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button size="sm" variant="outline" onClick={() => onEdit(item)} disabled={disabled}>
              <Edit className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={() => onDelete(item.id)} disabled={disabled}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

const LAYOUT_OPTIONS: { value: Layout; label: string; icon: React.ReactNode }[] = [
  { value: "grid", label: "Grid", icon: <LayoutGrid className="w-4 h-4" /> },
  { value: "masonry", label: "Masonry", icon: <Rows3 className="w-4 h-4" /> },
  { value: "slider", label: "Slider", icon: <SlidersHorizontal className="w-4 h-4" /> },
]

export function FeedbacksManager() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [layout, setLayout] = useState<Layout>("grid")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [savingLayout, setSavingLayout] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    quote: "",
    image_url: "",
    display_order: 0,
    is_active: true,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  useEffect(() => {
    fetchItems()
    fetchLayout()
  }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*")
      .order("display_order", { ascending: true })
    if (error) { console.error(error); return }
    setItems(data || [])
  }

  const fetchLayout = async () => {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "feedbacks_layout")
      .single()
    if (data?.value) setLayout(data.value as Layout)
  }

  const handleLayoutChange = async (newLayout: Layout) => {
    setSavingLayout(true)
    setLayout(newLayout)
    try {
      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "feedbacks_layout", value: newLayout })
      if (error) console.error("Error saving layout:", error)
    } finally {
      setSavingLayout(false)
    }
  }

  const handleSave = async () => {
    if (!formData.customer_name.trim()) { alert("Vui lòng nhập tên khách hàng"); return }
    if (!formData.quote.trim()) { alert("Vui lòng nhập nội dung feedback"); return }
    if (!formData.image_url) { alert("Vui lòng tải lên hình ảnh"); return }

    if (editingId) {
      const { error } = await supabase.from("feedbacks").update(formData).eq("id", editingId)
      if (error) { console.error(error); return }
    } else {
      const { error } = await supabase.from("feedbacks").insert([formData])
      if (error) { console.error(error); return }
    }

    setEditingId(null)
    setIsAdding(false)
    setFormData({ customer_name: "", quote: "", image_url: "", display_order: 0, is_active: true })
    fetchItems()
  }

  const handleEdit = (item: FeedbackItem) => {
    setEditingId(item.id)
    setFormData({
      customer_name: item.customer_name,
      quote: item.quote,
      image_url: item.image_url,
      display_order: item.display_order,
      is_active: item.is_active,
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return
    const { error } = await supabase.from("feedbacks").delete().eq("id", id)
    if (error) { console.error(error); return }
    fetchItems()
  }

  const handleCancel = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ customer_name: "", quote: "", image_url: "", display_order: 0, is_active: true })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append("file", file)
      const response = await fetch("/api/upload-feedback-image", { method: "POST", body: fd })
      if (!response.ok) throw new Error("Upload failed")
      const { publicUrl } = await response.json()
      setFormData((prev) => ({ ...prev, image_url: publicUrl }))
    } catch (error) {
      console.error(error)
      alert("Lỗi khi tải lên hình ảnh")
    } finally {
      setUploading(false)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)

    setItems(newItems)

    await Promise.all(
      newItems.map((item, index) =>
        supabase.from("feedbacks").update({ display_order: index }).eq("id", item.id)
      )
    )
  }

  return (
    <div className="space-y-8">
      {/* Layout Picker */}
      <Card>
        <CardHeader>
          <CardTitle>Layout trang Feedbacks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            {LAYOUT_OPTIONS.map((option) => (
              <Button
                key={option.value}
                variant={layout === option.value ? "default" : "outline"}
                onClick={() => handleLayoutChange(option.value)}
                disabled={savingLayout}
                className="flex items-center gap-2"
              >
                {option.icon}
                {option.label}
                {layout === option.value && savingLayout && (
                  <span className="text-xs opacity-70">Đang lưu...</span>
                )}
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Thay đổi được lưu ngay lập tức và áp dụng cho trang public.
          </p>
        </CardContent>
      </Card>

      {/* Feedback Manager */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Danh sách Feedbacks</h2>
          <Button onClick={() => setIsAdding(true)} disabled={isAdding || editingId !== null}>
            <Plus className="w-4 h-4 mr-2" />
            Thêm feedback
          </Button>
        </div>

        {(isAdding || editingId !== null) && (
          <Card>
            <CardHeader>
              <CardTitle>{editingId ? "Chỉnh sửa feedback" : "Thêm feedback mới"}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customer_name">Tên khách hàng</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order">Thứ tự hiển thị</Label>
                  <Input
                    id="display_order"
                    type="number"
                    value={formData.display_order}
                    onChange={(e) =>
                      setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })
                    }
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="quote">Nội dung feedback</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Sản phẩm rất đẹp và chắc chắn..."
                  rows={3}
                />
              </div>

              <div className="space-y-3">
                <Label>Hình ảnh</Label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Hoặc nhập URL hình ảnh"
                    />
                  </div>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                      id="feedback-file-upload"
                    />
                    <Label htmlFor="feedback-file-upload" className="cursor-pointer">
                      <Button type="button" disabled={uploading} asChild>
                        <span>
                          <Upload className="w-4 h-4 mr-2" />
                          {uploading ? "Đang tải..." : "Tải lên"}
                        </span>
                      </Button>
                    </Label>
                  </div>
                </div>
                {formData.image_url && (
                  <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={formData.image_url || "/placeholder.svg"}
                      alt="Preview"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label htmlFor="is_active">Hiển thị</Label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={uploading}>
                  <Save className="w-4 h-4 mr-2" />
                  Lưu
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {items.map((item) => (
                <SortableItem
                  key={item.id}
                  item={item}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  disabled={isAdding || editingId !== null}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {items.length === 0 && !isAdding && (
          <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-xl">
            Chưa có feedback nào. Nhấn "Thêm feedback" để bắt đầu.
          </div>
        )}
      </div>
    </div>
  )
}
