import { Footer } from '@/components/footer'
import { Header } from '@/components/header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, Heart, Mail, MapPin, Phone } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

export default function ContactPage() {
  return (
    <div className='min-h-screen relative overflow-hidden bg-background'>
      <Header />

      <main className='py-8 relative z-10'>
        <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
          {/* Page Header */}
          <div className='text-center space-y-4 mb-12'>
            <Badge className='bg-primary text-primary-foreground'>
              <Heart className='w-3 h-3 mr-1' />
              Liên hệ với chúng tôi
            </Badge>
            <h1 className='text-3xl lg:text-4xl font-bold'>
              Hãy kể cho chúng tôi nghe ý tưởng của bạn
            </h1>
            <p className='text-lg text-muted-foreground max-w-2xl mx-auto text-pretty'>
              Chúng tôi luôn sẵn sàng lắng nghe và biến ý tưởng của bạn thành
              những sản phẩm handmade độc đáo
            </p>
          </div>

          {/* Contact Information */}
          <div className='max-w-4xl mx-auto'>
            {/* Contact Information */}
            <div className='space-y-6'>
              <div className='space-y-4 text-center'>
                <h2 className='text-2xl font-bold'>Thông tin liên hệ</h2>
                <p className='text-muted-foreground'>
                  Liên hệ trực tiếp với chúng tôi qua các kênh sau để được tư
                  vấn nhanh nhất:
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-6'>
                {/* Quick Contact Actions */}
                <Card className='border-0 cute-shadow bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5'>
                  <CardContent className='p-6'>
                    <div className='space-y-4'>
                      <h3 className='font-semibold'>Liên hệ nhanh</h3>
                      <p className='text-sm text-muted-foreground'>
                        Bạn đã có ý tưởng cụ thể? Liên hệ ngay để được tư vấn và
                        báo giá!
                      </p>
                      <div className='grid grid-cols-2 gap-3'>
                        <Button
                          size='sm'
                          className='bg-primary hover:bg-primary/90 text-primary-foreground rounded-full'
                          asChild
                        >
                          <Link href='tel:0325311497'>
                            <Phone className='w-4 h-4 mr-2' />
                            Gọi ngay
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='rounded-full bg-transparent'
                          asChild
                        >
                          <Link
                            href='https://www.facebook.com/profile.php?id=61550244332051'
                            target='_blank'
                          >
                            <Image
                              src='/facebook.png'
                              alt='Facebook'
                              width={16}
                              height={16}
                              className='w-4 h-4 mr-2'
                            />
                            Facebook
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='rounded-full bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                          asChild
                        >
                          <Link href='tel:0325311497'>
                            <Image
                              src='/zalo.png'
                              alt='Zalo'
                              width={16}
                              height={16}
                              className='w-4 h-4 mr-2'
                            />
                            Zalo
                          </Link>
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          className='rounded-full bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100'
                          asChild
                        >
                          <Link
                            target='_blank'
                            href='https://www.tiktok.com/@hmworkshop_official'
                          >
                            <Image
                              src='/tiktok.png'
                              alt='TikTok'
                              width={16}
                              height={16}
                              className='w-4 h-4 mr-2'
                            />
                            TikTok
                          </Link>
                        </Button>
                      </div>

                      <div className='text-center'>
                        <p className='text-sm text-muted-foreground'>
                          🎬 Xem quá trình in 3D | 🖨️ Mẫu in 3D mới nhất | 💬
                          Tư vấn & báo giá trực tiếp
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Contact Details */}
                <Card className='border-0 cute-shadow'>
                  <CardContent className='p-6 space-y-6'>
                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <MapPin className='w-6 h-6 text-primary' />
                      </div>
                      <div className='space-y-1'>
                        <h3 className='font-semibold'>Địa chỉ</h3>
                        <p className='text-muted-foreground'>
                          Phước Đồng, Nam Nha Trang, Khánh Hòa
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0'>
                        <Phone className='w-6 h-6 text-secondary' />
                      </div>
                      <div className='space-y-1'>
                        <h3 className='font-semibold'>Điện thoại</h3>
                        <p className='text-muted-foreground'>0325311497</p>
                      </div>
                    </div>

                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0'>
                        <Mail className='w-6 h-6 text-accent' />
                      </div>
                      <div className='space-y-1'>
                        <h3 className='font-semibold'>Email</h3>
                        <p className='text-muted-foreground'>
                          ductn19970411@gmail.com
                        </p>
                      </div>
                    </div>

                    <div className='flex items-start gap-4'>
                      <div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0'>
                        <Clock className='w-6 h-6 text-primary' />
                      </div>
                      <div className='space-y-1'>
                        <h3 className='font-semibold'>Giờ làm việc</h3>
                        <div className='text-muted-foreground space-y-1'>
                          <p>Thứ 2 - Thứ 6: 9:00 - 18:00</p>
                          <p>Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <section className='py-16'>
            <div className='text-center space-y-4 mb-12'>
              <h2 className='text-2xl lg:text-3xl font-bold'>
                Câu hỏi thường gặp
              </h2>
              <p className='text-muted-foreground'>
                Một số câu hỏi khách hàng thường quan tâm
              </p>
            </div>

            <div className='grid md:grid-cols-2 gap-6 max-w-4xl mx-auto'>
              <Card className='border-0 cute-shadow'>
                <CardContent className='p-6 space-y-3'>
                  <h3 className='font-semibold'>
                    Thời gian hoàn thành đơn hàng?
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Thời gian hoàn thành phụ thuộc vào độ phức tạp của sản phẩm,
                    thường từ 3-14 ngày làm việc.
                  </p>
                </CardContent>
              </Card>

              <Card className='border-0 cute-shadow'>
                <CardContent className='p-6 space-y-3'>
                  <h3 className='font-semibold'>
                    Có nhận đặt hàng theo yêu cầu không?
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Có! Chúng tôi nhận đặt hàng theo yêu cầu riêng. Hãy mô tả ý
                    tưởng và chúng tôi sẽ báo giá cho bạn.
                  </p>
                </CardContent>
              </Card>

              <Card className='border-0 cute-shadow'>
                <CardContent className='p-6 space-y-3'>
                  <h3 className='font-semibold'>Phương thức thanh toán?</h3>
                  <p className='text-sm text-muted-foreground'>
                    Chúng tôi nhận thanh toán qua chuyển khoản ngân hàng, ví
                    điện tử hoặc tiền mặt khi giao hàng.
                  </p>
                </CardContent>
              </Card>

              <Card className='border-0 cute-shadow'>
                <CardContent className='p-6 space-y-3'>
                  <h3 className='font-semibold'>
                    Có giao hàng toàn quốc không?
                  </h3>
                  <p className='text-sm text-muted-foreground'>
                    Có! Chúng tôi giao hàng toàn quốc qua các đơn vị vận chuyển
                    uy tín với phí ship hợp lý.
                  </p>
                </CardContent>
              </Card>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
