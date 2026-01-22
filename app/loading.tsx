import { Box } from "lucide-react"

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center animate-pulse">
            <Box className="w-8 h-8 text-primary animate-spin" style={{ animationDuration: "2s" }} />
          </div>
        </div>
        <div className="space-y-2 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">Đang tải...</p>
        </div>
      </div>
    </div>
  )
}
