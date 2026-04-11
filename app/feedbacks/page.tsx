import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { FeedbackGrid } from '@/components/feedbacks/feedback-grid'
import { FeedbackMasonry } from '@/components/feedbacks/feedback-masonry'
import { FeedbackSlider } from '@/components/feedbacks/feedback-slider'
import { createServerClient } from '@supabase/ssr'
import { MessageSquare } from 'lucide-react'
import { cookies } from 'next/headers'

interface FeedbackItem {
  id: number
  customer_name: string
  quote: string
  image_url: string
  display_order: number
  is_active: boolean
}

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
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching feedbacks:', error)
    return []
  }

  return data || []
}

async function getFeedbacksLayout(): Promise<string> {
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

  const { data } = await supabase
    .from('site_settings')
    .select('value')
    .eq('key', 'feedbacks_layout')
    .single()

  return data?.value || 'grid'
}

export default async function FeedbacksPage() {
  const [feedbacks, layout] = await Promise.all([
    getFeedbacks(),
    getFeedbacksLayout()
  ])

  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Header Section */}
          <section className='py-16 lg:py-20'>
            <div className='text-center space-y-6 mb-16'>
              <div className='inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium'>
                <MessageSquare className='w-4 h-4' />
                Khách hàng nói gì
              </div>
              <h1 className='text-4xl lg:text-5xl font-bold text-balance text-foreground'>
                Feedbacks
              </h1>
              <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty'>
                Những hình ảnh và cảm nhận thực tế từ khách hàng đã tin tưởng Hama Workshop.
              </p>
            </div>

            {feedbacks.length === 0 ? (
              <div className='text-center py-20 text-muted-foreground'>
                <MessageSquare className='w-12 h-12 mx-auto mb-4 opacity-30' />
                <p>Chưa có feedback nào.</p>
              </div>
            ) : (
              <>
                {layout === 'masonry' && <FeedbackMasonry items={feedbacks} />}
                {layout === 'slider' && <FeedbackSlider items={feedbacks} />}
                {layout !== 'masonry' && layout !== 'slider' && (
                  <FeedbackGrid items={feedbacks} />
                )}
              </>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
