import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageSquare } from 'lucide-react'

function FeedbackCardSkeleton() {
  return (
    <div className="bg-card rounded-2xl overflow-hidden border border-border flex">
      {/* Image side */}
      <Skeleton className="w-48 flex-shrink-0 min-h-[180px] rounded-none" />

      {/* Content side */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div className="space-y-2">
          <Skeleton className="h-8 w-6" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
          <Skeleton className="h-3 w-4/6" />
        </div>
        <div className="flex items-center justify-between mt-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
    </div>
  )
}

export default function FeedbacksLoading() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      <Header />

      <main className="py-8 relative z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <section className="py-16 lg:py-20">
            <div className="text-center space-y-6 mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium">
                <MessageSquare className="w-4 h-4" />
                Khách hàng nói gì
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground">
                Feedbacks thực tế
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Những hình ảnh và cảm nhận từ khách hàng đã tin tưởng Hama Workshop.
              </p>
            </div>

            <div className="max-w-3xl mx-auto flex flex-col gap-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <FeedbackCardSkeleton key={i} />
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
