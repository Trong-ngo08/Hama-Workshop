"use client"

import { useRef, useState } from "react"
import Image from "next/image"
import { Upload, X, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

export interface LocalImage {
  id: number | null   // null = newly uploaded, not yet saved to DB
  image_url: string
  display_order: number
}

interface FeedbackImageManagerProps {
  value: LocalImage[]
  onChange: (images: LocalImage[]) => void
  onDeleteExisting: (id: number) => void
  onDeleteUploaded: (url: string) => void
}

function SortableThumb({
  img,
  index,
  onRemove,
}: {
  img: LocalImage
  index: number
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: img.image_url,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div ref={setNodeRef} style={style} className="relative flex-shrink-0 group">
      <div className="w-20 h-20 rounded-lg overflow-hidden border-2 border-border relative">
        <Image src={img.image_url} alt="" fill sizes="80px" className="object-cover" />
        {index === 0 && (
          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[9px] text-center py-0.5 font-semibold">
            Bìa
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <X className="w-3 h-3" />
      </button>
      <div
        className="absolute bottom-1 left-1 cursor-grab touch-none"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-3 h-3 text-white drop-shadow" />
      </div>
    </div>
  )
}

export function FeedbackImageManager({
  value,
  onChange,
  onDeleteExisting,
  onDeleteUploaded,
}: FeedbackImageManagerProps) {
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleFiles = async (files: FileList) => {
    setUploading(true)
    try {
      const uploaded: LocalImage[] = []
      for (const file of Array.from(files)) {
        const fd = new FormData()
        fd.append("file", file)
        const res = await fetch("/api/upload-feedback-image", { method: "POST", body: fd })
        if (!res.ok) throw new Error("Upload failed")
        const { publicUrl } = await res.json()
        uploaded.push({
          id: null,
          image_url: publicUrl,
          display_order: value.length + uploaded.length,
        })
      }
      onChange([...value, ...uploaded])
    } catch {
      alert("Lỗi khi tải lên hình ảnh")
    } finally {
      setUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  const handleRemove = (img: LocalImage) => {
    onChange(
      value
        .filter((i) => i.image_url !== img.image_url)
        .map((i, idx) => ({ ...i, display_order: idx }))
    )
    if (img.id !== null) {
      onDeleteExisting(img.id)
    } else {
      onDeleteUploaded(img.image_url)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIdx = value.findIndex((i) => i.image_url === active.id)
    const newIdx = value.findIndex((i) => i.image_url === over.id)
    onChange(
      arrayMove(value, oldIdx, newIdx).map((img, idx) => ({ ...img, display_order: idx }))
    )
  }

  return (
    <div className="space-y-3">
      {value.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={value.map((i) => i.image_url)}
            strategy={horizontalListSortingStrategy}
          >
            <div className="flex flex-wrap gap-3">
              {value.map((img, idx) => (
                <SortableThumb
                  key={img.image_url}
                  img={img}
                  index={idx}
                  onRemove={() => handleRemove(img)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
      <div>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          id="feedback-images-input"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-2" />
          {uploading ? "Đang tải lên..." : "Tải lên ảnh"}
        </Button>
        {value.length === 0 && (
          <p className="text-xs text-muted-foreground mt-1.5">
            Ảnh đầu tiên sẽ là ảnh bìa. Có thể chọn nhiều ảnh cùng lúc.
          </p>
        )}
      </div>
    </div>
  )
}
