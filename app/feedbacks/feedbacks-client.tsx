"use client"

import { useState } from "react"
import Image from "next/image"
import { AnimateIn } from "@/components/animate-in"
import { FeedbackCard } from "@/components/feedbacks/feedback-card"
import { FeedbackModal } from "@/components/feedbacks/feedback-modal"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbacksClientProps {
  feedbacks: FeedbackItem[]
}

export default function FeedbacksClient({ feedbacks }: FeedbacksClientProps) {
  const [selected, setSelected] = useState<FeedbackItem | null>(null)

  // Every customer photo, for the photo wall below the cards.
  const photos = feedbacks.flatMap((item) =>
    [...item.feedback_images]
      .sort((a, b) => a.display_order - b.display_order)
      .map((img) => ({ ...img, item }))
  )

  return (
    <>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
        {feedbacks.map((item, i) => (
          <AnimateIn key={item.id} delay={i * 120}>
            <FeedbackCard item={item} index={i} onClick={() => setSelected(item)} />
          </AnimateIn>
        ))}
      </div>

      {photos.length > 0 && (
        <section className="mt-24 max-w-6xl mx-auto">
          <AnimateIn className="flex items-end justify-between gap-4 mb-8">
            <div className="space-y-2">
              <h2 className="text-2xl lg:text-3xl font-bold text-foreground">
                Ảnh thực tế từ khách
              </h2>
              <p className="text-muted-foreground">
                Hình ảnh và tin nhắn khách hàng gửi về sau khi nhận hàng.
              </p>
            </div>
            <span className="hidden sm:inline text-sm text-muted-foreground shrink-0">
              {photos.length} ảnh
            </span>
          </AnimateIn>

          <div className="columns-2 md:columns-3 gap-4 [&>*]:mb-4">
            {photos.map((photo, i) => (
              <AnimateIn key={photo.id} delay={(i % 6) * 80} from="scale" className="break-inside-avoid">
                <button
                  type="button"
                  onClick={() => setSelected(photo.item)}
                  className="group relative block w-full overflow-hidden rounded-2xl border border-border bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                >
                  <Image
                    src={photo.image_url}
                    alt={`Ảnh thực tế của ${photo.item.customer_name}`}
                    width={600}
                    height={600}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-x-0 bottom-0 p-3 text-left text-sm font-semibold text-white bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                    {photo.item.customer_name}
                  </span>
                </button>
              </AnimateIn>
            ))}
          </div>
        </section>
      )}

      {selected && (
        <FeedbackModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
