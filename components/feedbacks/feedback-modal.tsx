"use client"

import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbackModalProps {
  item: FeedbackItem
  onClose: () => void
}

export function FeedbackModal({ item, onClose }: FeedbackModalProps) {
  const images = useMemo(
    () => [...item.feedback_images].sort((a, b) => a.display_order - b.display_order),
    [item.feedback_images]
  )
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [images.length, onClose])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#1a110a] rounded-2xl overflow-hidden flex w-full max-w-3xl max-h-[90vh]">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gallery panel */}
        <div className="flex-[1.4] flex flex-col min-h-[360px]">
          <div className="flex-1 relative bg-black/40 min-h-[280px]">
            {images[activeIndex] && (
              <Image
                src={images[activeIndex].image_url}
                alt={`Ảnh ${activeIndex + 1}`}
                fill
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-contain"
              />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveIndex((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setActiveIndex((i) => (i + 1) % images.length)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 p-3 bg-black/30 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Xem ảnh ${i + 1}`}
                  className={`w-12 h-12 rounded-md overflow-hidden flex-shrink-0 border-2 transition-colors relative ${
                    i === activeIndex ? "border-amber-500" : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img.image_url}
                    alt=""
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Quote panel */}
        <div className="flex-1 p-7 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-5xl text-amber-600/80 font-serif leading-none block mb-2">"</span>
            <p className="text-sm text-amber-50/90 italic leading-relaxed">{item.quote}</p>
          </div>
          <div>
            <p className="text-white font-bold text-sm">{item.customer_name}</p>
            {images.length > 0 && (
              <p className="text-amber-800/60 text-xs mt-1">{images.length} hình ảnh</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
