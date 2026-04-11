"use client"

import { useState } from "react"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import { ImagePopup } from "@/components/image-popup"

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
}

interface FeedbackSliderProps {
  items: FeedbackItem[]
}

export function FeedbackSlider({ items }: FeedbackSliderProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const imageUrls = items.map((item) => item.image_url)

  return (
    <>
      <Carousel className="w-full max-w-3xl mx-auto">
        <CarouselContent>
          {items.map((item, index) => (
            <CarouselItem key={item.id} className="md:basis-1/2 lg:basis-1/3">
              <div
                className="group rounded-2xl overflow-hidden tech-shadow cursor-pointer bg-card h-full"
                onClick={() => setSelectedIndex(index)}
              >
                <div className="relative aspect-square">
                  <Image
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.customer_name}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                </div>
                <div className="p-4 space-y-1">
                  <p className="font-semibold text-sm text-foreground">{item.customer_name}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">"{item.quote}"</p>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

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
