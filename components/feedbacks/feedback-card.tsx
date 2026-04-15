"use client"

import Image from "next/image"
import { Eye, ImageIcon } from "lucide-react"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbackCardProps {
  item: FeedbackItem
  onClick: () => void
}

export function FeedbackCard({ item, onClick }: FeedbackCardProps) {
  const images = [...item.feedback_images].sort((a, b) => a.display_order - b.display_order)
  const coverImage = images[0]
  const thumbs = images.slice(1, 4)
  const extraCount = images.length - 4

  return (
    <div
      className="group bg-card rounded-2xl overflow-hidden border border-border cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-200 flex"
      onClick={onClick}
    >
      {/* Image side */}
      <div className="w-48 flex-shrink-0 relative bg-muted min-h-[180px]">
        {coverImage ? (
          <Image
            src={coverImage.image_url}
            alt={item.customer_name}
            fill
            sizes="192px"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
            <ImageIcon className="w-8 h-8 opacity-30" />
          </div>
        )}
        {images.length > 1 && (
          <div className="absolute bottom-2 right-2 bg-black/55 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            📷 {images.length}
          </div>
        )}
      </div>

      {/* Content side */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          <span className="text-5xl leading-none text-primary/60 font-serif block mb-1">"</span>
          <p className="text-sm text-foreground/80 italic leading-relaxed line-clamp-4">
            {item.quote}
          </p>
        </div>
        <div>
          {thumbs.length > 0 && (
            <div className="flex gap-1.5 mb-3">
              {thumbs.map((img) => (
                <div
                  key={img.id}
                  className="w-8 h-8 rounded-md overflow-hidden border border-border flex-shrink-0 relative"
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    sizes="32px"
                    className="object-cover"
                  />
                </div>
              ))}
              {extraCount > 0 && (
                <div className="w-8 h-8 rounded-md bg-muted border border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground flex-shrink-0">
                  +{extraCount}
                </div>
              )}
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">{item.customer_name}</span>
            <span className="text-[11px] text-primary/70 flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {images.length > 1 ? `Xem ${images.length} ảnh` : "Xem ảnh"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
