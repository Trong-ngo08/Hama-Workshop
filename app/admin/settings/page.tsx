import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Clock } from "lucide-react"

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold flex items-center gap-2 text-foreground">
          <Settings className="w-6 h-6" />
          Cài đặt hệ thống
        </h1>
        <p className="text-muted-foreground">Cấu hình và quản lý hệ thống</p>
      </div>

      <Card className="border border-border tech-shadow">
        <CardHeader>
          <CardTitle className="text-foreground">Cài đặt hệ thống</CardTitle>
        </CardHeader>
        <CardContent className="text-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-foreground uppercase tracking-widest">Coming Soon</h3>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Tính năng cài đặt hệ thống đang được phát triển. Sẽ sớm có các tùy chọn cấu hình website, thanh toán, và
                nhiều tính năng khác.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
