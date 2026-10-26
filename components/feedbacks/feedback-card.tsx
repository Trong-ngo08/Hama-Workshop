"use client"

import Image from "next/image"
import { Images, ImageIcon, Quote } from "lucide-react"
import type { FeedbackItem } from "@/types/feedback"
import { cn } from "@/lib/utils"

interface FeedbackCardProps {
  item: FeedbackItem
  index: number
  onClick: () => void
}

const AVATAR_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-accent text-accent-foreground",
  "bg-foreground text-background",
]

// Alternate a slight tilt so the grid reads like pinned photos.
const TILTS = ["lg:-rotate-1", "lg:rotate-1", "lg:-rotate-[0.5deg]"]

export function FeedbackCard({ item, index, onClick }: FeedbackCardProps) {
  const images = [...item.feedback_images].sort((a, b) => a.display_order - b.display_order)
  const cover = images[0]
  const initial = item.customer_name.trim().charAt(0).toUpperCase()

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full text-left bg-card rounded-3xl border border-border overflow-hidden tech-shadow transition-all duration-300 hover:rotate-0 hover:-translate-y-1.5 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        TILTS[index % TILTS.length]
      )}
    >
      {/* Photo */}
      <div className="relative aspect-[4/3] bg-muted overflow-hidden">
        {cover ? (
          <Image
            src={cover.image_url}
            alt={`Ảnh feedback của ${item.customer_name}`}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-10 h-10 opacity-30" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        {images.length > 1 && (
          <span className="absolute top-3 right-3 inline-flex items-center gap-1 bg-black/55 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Images className="w-3.5 h-3.5" />
            {images.length}
          </span>
        )}
      </div>

      {/* Quote bubble */}
      <div className="p-5 space-y-4">
        <div className="relative rounded-2xl rounded-tl-sm bg-secondary/60 px-4 py-3">
          <Quote className="absolute -top-3 left-3 w-6 h-6 text-primary fill-primary/20" />
          <p className="text-foreground leading-relaxed line-clamp-3">{item.quote}</p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0",
              AVATAR_COLORS[index % AVATAR_COLORS.length]
            )}
          >
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-bold text-foreground truncate">{item.customer_name}</p>
            <p className="text-xs text-muted-foreground">Khách hàng HMWorkshop</p>
          </div>
          <span className="text-xs font-semibold text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
            Xem ảnh →
          </span>
        </div>
      </div>
    </button>
  )
}
