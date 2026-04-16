"use client"

import { useState, useEffect, useMemo } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbackModalProps {
  item: FeedbackItem
  onClose: () => void
}

function Lightbox({
  images,
  startIndex,
  onClose,
}: {
  images: { id: number; image_url: string }[]
  startIndex: number
  onClose: () => void
}) {
  const [index, setIndex] = useState(startIndex)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % images.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [images.length, onClose])

  if (!mounted) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] bg-black flex flex-col"
      onClick={onClose}
    >
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-white/60 text-sm">
          {index + 1} / {images.length}
        </span>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Image area */}
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <div
          className="relative w-full h-full"
          onClick={(e) => e.stopPropagation()}
        >
          <Image
            key={images[index].image_url}
            src={images[index].image_url}
            alt={`Ảnh ${index + 1}`}
            fill
            sizes="100vw"
            quality={100}
            className="object-contain"
            priority
          />
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); setIndex((i) => (i - 1 + images.length) % images.length) }}
              className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIndex((i) => (i + 1) % images.length) }}
              className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center text-white transition-colors backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div
          className="flex gap-2 p-3 justify-center flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setIndex(i)}
              className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all relative ${
                i === index ? "border-white opacity-100" : "border-transparent opacity-40 hover:opacity-70"
              }`}
            >
              <Image src={img.image_url} alt="" fill sizes="56px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  )
}

export function FeedbackModal({ item, onClose }: FeedbackModalProps) {
  const images = useMemo(
    () => [...item.feedback_images].sort((a, b) => a.display_order - b.display_order),
    [item.feedback_images]
  )
  const [activeIndex, setActiveIndex] = useState(0)
  const [mounted, setMounted] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  useEffect(() => {
    setMounted(true)
    return () => setMounted(false)
  }, [])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (lightboxIndex !== null) return // lightbox handles its own keys
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") setActiveIndex((i) => (i - 1 + images.length) % images.length)
      if (e.key === "ArrowRight") setActiveIndex((i) => (i + 1) % images.length)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [images.length, onClose, lightboxIndex])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = prev }
  }, [])

  const modal = (
    <div
      className="fixed inset-0 bg-black/85 z-[9999] flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="relative bg-[#1a110a] rounded-2xl overflow-hidden flex w-full max-w-6xl max-h-[92vh]">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </button>

        {/* Gallery panel */}
        <div className="flex-[1.6] flex flex-col min-h-[560px]">
          <div className="flex-1 relative bg-black/40 min-h-[480px] group cursor-zoom-in">
            {images[activeIndex] && (
              <>
                <Image
                  src={images[activeIndex].image_url}
                  alt={`Ảnh ${activeIndex + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 60vw"
                  className="object-contain"
                  onClick={() => setLightboxIndex(activeIndex)}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  <div className="bg-black/40 rounded-full p-3 backdrop-blur-sm">
                    <ZoomIn className="w-6 h-6 text-white" />
                  </div>
                </div>
              </>
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
        <div className="flex-1 p-8 flex flex-col justify-between min-w-0">
          <div>
            <span className="text-6xl text-amber-600/80 font-serif leading-none block mb-3">"</span>
            <p className="text-base text-amber-50/90 italic leading-relaxed">{item.quote}</p>
          </div>
          <div>
            <p className="text-white font-bold">{item.customer_name}</p>
            {images.length > 0 && (
              <p className="text-amber-800/60 text-sm mt-1">{images.length} hình ảnh</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  if (!mounted) return null
  return (
    <>
      {createPortal(modal, document.body)}
      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          startIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
