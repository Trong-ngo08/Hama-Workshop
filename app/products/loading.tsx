// <CHANGE> Added skeleton loading for products page
import { ProductSkeleton } from "@/components/product-skeleton"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"

export default function Loading() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-12 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4 mb-16 lg:mb-24 text-center lg:text-left">
            <div className="h-20 lg:h-32 bg-muted/50 rounded-lg animate-pulse max-w-2xl" />
            <div className="h-6 bg-muted/30 rounded animate-pulse max-w-xl" />
          </div>

          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
            <div className="w-full lg:w-64 space-y-6">
              <div className="h-8 bg-muted/50 rounded animate-pulse" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 bg-muted/30 rounded animate-pulse" />
                ))}
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
