import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { createServerClient } from '@supabase/ssr'
import { MessageSquare } from 'lucide-react'
import { cookies } from 'next/headers'
import type { FeedbackItem } from '@/types/feedback'
import FeedbacksClient from './feedbacks-client'

async function getFeedbacks(): Promise<FeedbackItem[]> {
  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        }
      }
    }
  )

  const { data, error } = await supabase
    .from('feedbacks')
    .select('*, feedback_images(id, feedback_id, image_url, display_order)')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching feedbacks:', error)
    return []
  }

  return (data || []).map((item) => ({
    ...item,
    feedback_images: (item.feedback_images || []).sort(
      (a: { display_order: number }, b: { display_order: number }) => a.display_order - b.display_order
    ),
  }))
}

export default async function FeedbacksPage() {
  const feedbacks = await getFeedbacks()

  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          <section className='py-16 lg:py-20'>
            <div className='text-center space-y-6 mb-16'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                <MessageSquare className='w-4 h-4' />
                Khách hàng nói gì
              </div>
              <h1 className='text-4xl lg:text-5xl font-bold text-balance text-foreground'>
                Feedbacks thực tế
              </h1>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty'>
                Những hình ảnh và cảm nhận từ khách hàng đã tin tưởng Hama Workshop.
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className='text-center py-20 text-muted-foreground'>
                <MessageSquare className='w-12 h-12 mx-auto mb-4 opacity-30' />
                <p>Chưa có feedback nào.</p>
              </div>
            ) : (
              <FeedbacksClient feedbacks={feedbacks} />
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
