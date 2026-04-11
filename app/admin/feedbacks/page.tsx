import { FeedbacksManager } from '@/components/admin/feedbacks-manager'

export default function AdminFeedbacksPage() {
  return (
    <div className='space-y-6'>
      <div>
        <h1 className='text-2xl font-bold'>Quản lý Feedbacks</h1>
        <p className='text-muted-foreground text-sm mt-1'>
          Quản lý hình ảnh và nhận xét từ khách hàng, chọn layout hiển thị cho trang public.
        </p>
      </div>
      <FeedbacksManager />
    </div>
  )
}
