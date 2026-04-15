"use client"

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
import { Plus, Edit, Trash2, Save, X, GripVertical, ImageIcon } from "lucide-react"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import { FeedbackImageManager, type LocalImage } from "@/components/admin/feedback-image-manager"
import type { FeedbackItem } from "@/types/feedback"

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
  const style = { transform: CSS.Transform.toString(transform), transition }
  const coverImage = [...item.feedback_images]
    .sort((a, b) => a.display_order - b.display_order)[0]

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
          <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 relative">
            {coverImage ? (
              <Image
                src={coverImage.image_url}
                alt={item.customer_name}
                fill
                sizes="80px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-muted-foreground opacity-40" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm">{item.customer_name}</h3>
              <Badge variant={item.is_active ? "default" : "secondary"}>
                {item.is_active ? "Hiển thị" : "Ẩn"}
              </Badge>
              {item.feedback_images.length > 0 && (
                <Badge variant="outline" className="text-xs">
                  {item.feedback_images.length} ảnh
                </Badge>
              )}
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

export function FeedbacksManager() {
  const [items, setItems] = useState<FeedbackItem[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({
    customer_name: "",
    quote: "",
    display_order: 0,
    is_active: true,
  })
  const [formImages, setFormImages] = useState<LocalImage[]>([])
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([])
  const [deletedUploadedUrls, setDeletedUploadedUrls] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

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
  }, [])

  const fetchItems = async () => {
    const { data, error } = await supabase
      .from("feedbacks")
      .select("*, feedback_images(id, image_url, display_order)")
      .order("display_order", { ascending: true })
    if (error) { console.error(error); return }
    setItems(
      (data || []).map((item) => ({
        ...item,
        feedback_images: (item.feedback_images || []).sort(
          (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
        ),
      }))
    )
  }

  const resetForm = () => {
    setEditingId(null)
    setIsAdding(false)
    setFormData({ customer_name: "", quote: "", display_order: 0, is_active: true })
    setFormImages([])
    setDeletedImageIds([])
    setDeletedUploadedUrls([])
  }

  const handleSave = async () => {
    if (!formData.customer_name.trim()) { alert("Vui lòng nhập tên khách hàng"); return }
    if (!formData.quote.trim()) { alert("Vui lòng nhập nội dung feedback"); return }

    setSaving(true)
    try {
      let feedbackId = editingId

      if (editingId) {
        const { error } = await supabase.from("feedbacks").update(formData).eq("id", editingId)
        if (error) { console.error(error); alert("Lỗi khi lưu feedback"); return }
      } else {
        const { data, error } = await supabase.from("feedbacks").insert([formData]).select().single()
        if (error) { console.error(error); alert("Lỗi khi lưu feedback"); return }
        feedbackId = data.id
      }

      // Delete removed existing images from DB
      if (deletedImageIds.length > 0) {
        await supabase.from("feedback_images").delete().in("id", deletedImageIds)
      }

      // Delete newly uploaded images that were then removed (R2 cleanup)
      for (const url of deletedUploadedUrls) {
        await fetch("/api/delete-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url }),
        })
      }

      // Insert new images (id === null = not yet in DB)
      const newImages = formImages.filter((img) => img.id === null)
      if (newImages.length > 0) {
        await supabase.from("feedback_images").insert(
          newImages.map((img) => ({
            feedback_id: feedbackId!,
            image_url: img.image_url,
            display_order: img.display_order,
          }))
        )
      }

      // Update display_order for existing images that may have been reordered
      const existingImages = formImages.filter((img) => img.id !== null)
      for (const img of existingImages) {
        await supabase
          .from("feedback_images")
          .update({ display_order: img.display_order })
          .eq("id", img.id!)
      }

      resetForm()
      fetchItems()
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (item: FeedbackItem) => {
    setEditingId(item.id)
    setFormData({
      customer_name: item.customer_name,
      quote: item.quote,
      display_order: item.display_order,
      is_active: item.is_active,
    })
    setFormImages(
      item.feedback_images.map((img) => ({
        id: img.id,
        image_url: img.image_url,
        display_order: img.display_order,
      }))
    )
    setDeletedImageIds([])
    setDeletedUploadedUrls([])
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc muốn xóa feedback này?")) return
    const item = items.find((i) => i.id === id)

    // Delete all R2 images for this feedback
    if (item) {
      for (const img of item.feedback_images) {
        await fetch("/api/delete-image", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: img.image_url }),
        })
      }
    }

    const { error } = await supabase.from("feedbacks").delete().eq("id", id)
    if (error) { console.error(error); return }
    fetchItems()
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
                  <Label htmlFor="customer_name" className="mb-1.5 block">Tên khách hàng</Label>
                  <Input
                    id="customer_name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <Label htmlFor="display_order" className="mb-1.5 block">Thứ tự hiển thị</Label>
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
                <Label htmlFor="quote" className="mb-1.5 block">Nội dung feedback</Label>
                <Textarea
                  id="quote"
                  value={formData.quote}
                  onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                  placeholder="Sản phẩm rất đẹp và chắc chắn..."
                  rows={3}
                />
              </div>

              <div>
                <Label className="mb-1.5 block">Hình ảnh</Label>
                <FeedbackImageManager
                  value={formImages}
                  onChange={setFormImages}
                  onDeleteExisting={(id) => setDeletedImageIds((prev) => [...prev, id])}
                  onDeleteUploaded={(url) => setDeletedUploadedUrls((prev) => [...prev, url])}
                />
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
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="w-4 h-4 mr-2" />
                  {saving ? "Đang lưu..." : "Lưu"}
                </Button>
                <Button variant="outline" onClick={resetForm} disabled={saving}>
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
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
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-sm">Chưa có feedback nào. Nhấn "Thêm feedback" để bắt đầu.</p>
          </div>
        )}
      </div>
    </div>
  )
}
