"use client"

import { useState } from "react"
import Image from "next/image"
import { ImagePopup } from "@/components/image-popup"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
}

interface FeedbackMasonryProps {
  items: FeedbackItem[]
}

export function FeedbackMasonry({ items }: FeedbackMasonryProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const imageUrls = items.map((item) => item.image_url)

  return (
    <>
      <div className="columns-2 md:columns-3 gap-4 space-y-4">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group break-inside-avoid rounded-2xl overflow-hidden tech-shadow cursor-pointer bg-card mb-4"
            onClick={() => setSelectedIndex(index)}
          >
            <div className="relative w-full">
              <Image
                src={item.image_url || "/placeholder.svg"}
                alt={item.customer_name}
                width={400}
                height={300}
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <div className="p-4 space-y-1">
              <p className="font-semibold text-sm text-foreground">{item.customer_name}</p>
              <p className="text-xs text-muted-foreground leading-relaxed">"{item.quote}"</p>
            </div>
          </div>
        ))}
      </div>

      {selectedIndex !== null && (
        <ImagePopup
          images={imageUrls}
          currentIndex={selectedIndex}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </>
  )
}
