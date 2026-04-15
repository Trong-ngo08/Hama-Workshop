export interface FeedbackImage {
  id: number
  feedback_id: number
  image_url: string
  display_order: number
}

export interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  display_order: number
  is_active: boolean
  feedback_images: FeedbackImage[]
}
