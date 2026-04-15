"use client"

import { useState } from "react"
import { FeedbackCard } from "@/components/feedbacks/feedback-card"
import { FeedbackModal } from "@/components/feedbacks/feedback-modal"
import type { FeedbackItem } from "@/types/feedback"

interface FeedbacksClientProps {
  feedbacks: FeedbackItem[]
}

export default function FeedbacksClient({ feedbacks }: FeedbacksClientProps) {
  const [selected, setSelected] = useState<FeedbackItem | null>(null)

  return (
    <>
      <div className="max-w-3xl mx-auto flex flex-col gap-4">
        {feedbacks.map((item) => (
          <FeedbackCard
            key={item.id}
            item={item}
            onClick={() => setSelected(item)}
          />
        ))}
      </div>

      {selected && (
        <FeedbackModal
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  )
}
