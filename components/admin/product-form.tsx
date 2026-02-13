'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Save } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useState } from 'react'
import { ImageUpload } from './image-upload'

interface Category {
  id: string
  name: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  materials: string | null
  size_info: string | null
  care_instructions: string | null
  is_featured: boolean
  is_available: boolean
  images: string[]
  sale_price?: number | null
  discount_percentage?: number | null
  seo_title?: string | null
  seo_description?: string | null
  seo_keywords?: string | null
  slug?: string | null
}

interface ProductFormProps {
  categories: Category[]
  product?: Product
}

export function ProductForm({ categories, product }: ProductFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price?.toString() || '',
    category: product?.category || '',
    materials: product?.materials || '',
    size_info: product?.size_info || '',
    care_instructions: product?.care_instructions || '',
    is_featured: product?.is_featured || false,
    is_available: product?.is_available ?? true,
    images: product?.images || [],
    sale_price: product?.sale_price?.toString() || '',
    discount_percentage: product?.discount_percentage?.toString() || '',
    seo_title: product?.seo_title || '',
    seo_description: product?.seo_description || '',
    seo_keywords: product?.seo_keywords || '',
    slug: product?.slug || ''
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const slug = formData.slug || generateSlug(formData.name)

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number.parseFloat(formData.price),
        category: formData.category,
        materials: formData.materials || null,
        size_info: formData.size_info || null,
        care_instructions: formData.care_instructions || null,
        is_featured: formData.is_featured,
        is_available: formData.is_available,
        images: formData.images,
        sale_price: formData.sale_price
          ? Number.parseFloat(formData.sale_price)
          : null,
        discount_percentage: formData.discount_percentage
          ? Number.parseInt(formData.discount_percentage)
          : null,
        seo_title: formData.seo_title || null,
        seo_description: formData.seo_description || null,
        seo_keywords: formData.seo_keywords || null,
        slug: slug
      }

      if (product) {
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)
          .select()

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()

        if (error) throw error
      }

      router.push('/admin/products')
      router.refresh()
    } catch (error) {
      console.error('Error saving product:', error)
      alert('Có lỗi xảy ra khi lưu sản phẩm: ' + (error as Error).message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className='space-y-6'>
      <Button variant='outline' asChild>
        <Link href='/admin/products'>
          <ArrowLeft className='h-4 w-4 mr-2' />
          Quay lại
        </Link>
      </Button>

      <form onSubmit={handleSubmit} className='space-y-6'>
        <div className='grid md:grid-cols-2 gap-6'>
          {/* Basic Information */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='name'>Tên sản phẩm *</Label>
              <Input
                id='name'
                type='text'
                placeholder='Nhập tên sản phẩm'
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='category'>Danh mục *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleChange('category', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder='Chọn danh mục' />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='price'>Giá gốc (VND) *</Label>
              <Input
                id='price'
                type='number'
                placeholder='0'
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                required
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='materials'>Chất liệu</Label>
              <Input
                id='materials'
                type='text'
                placeholder='Ví dụ: Cotton yarn, polyester filling'
                value={formData.materials}
                onChange={(e) => handleChange('materials', e.target.value)}
              />
            </div>
          </div>

          {/* Additional Information */}
          <div className='space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='size_info'>Kích thước</Label>
              <Input
                id='size_info'
                type='text'
                placeholder='Ví dụ: 25cm x 20cm x 15cm'
                value={formData.size_info}
                onChange={(e) => handleChange('size_info', e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='care_instructions'>Hướng dẫn bảo quản</Label>
              <Textarea
                id='care_instructions'
                placeholder='Ví dụ: Hand wash with mild soap, air dry only'
                value={formData.care_instructions}
                onChange={(e) =>
                  handleChange('care_instructions', e.target.value)
                }
                rows={3}
              />
            </div>

            {/* Settings */}
            <Card className='border-0 bg-muted/30'>
              <CardContent className='p-4 space-y-4'>
                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label htmlFor='is_featured'>Sản phẩm nổi bật</Label>
                    <p className='text-xs text-muted-foreground'>
                      Hiển thị trong danh sách nổi bật
                    </p>
                  </div>
                  <Switch
                    id='is_featured'
                    checked={formData.is_featured}
                    onCheckedChange={(checked) =>
                      handleChange('is_featured', checked)
                    }
                  />
                </div>

                <div className='flex items-center justify-between'>
                  <div className='space-y-1'>
                    <Label htmlFor='is_available'>Còn hàng</Label>
                    <p className='text-xs text-muted-foreground'>
                      Khách hàng có thể đặt hàng
                    </p>
                  </div>
                  <Switch
                    id='is_available'
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      handleChange('is_available', checked)
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className='border-pink-200 bg-pink-50/50'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Thông tin khuyến mãi
            </h3>

            <div className='grid md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='sale_price'>Giá khuyến mãi (VND)</Label>
                <Input
                  id='sale_price'
                  type='number'
                  placeholder='Để trống nếu không có khuyến mãi'
                  value={formData.sale_price}
                  onChange={(e) => handleChange('sale_price', e.target.value)}
                />
                <p className='text-xs text-muted-foreground'>
                  Nhập giá sau khi giảm
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='discount_percentage'>
                  Phần trăm giảm giá (%)
                </Label>
                <Input
                  id='discount_percentage'
                  type='number'
                  placeholder='0'
                  min='0'
                  max='100'
                  value={formData.discount_percentage}
                  onChange={(e) =>
                    handleChange('discount_percentage', e.target.value)
                  }
                />
                <p className='text-xs text-muted-foreground'>
                  Chỉ để hiển thị badge giảm giá
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='border-blue-200 bg-blue-50/50'>
          <CardContent className='p-6'>
            <h3 className='text-lg font-semibold text-gray-900 mb-4'>
              Tối ưu SEO
            </h3>

            <div className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='seo_title'>Tiêu đề SEO</Label>
                <Input
                  id='seo_title'
                  type='text'
                  placeholder='Tiêu đề tối ưu cho công cụ tìm kiếm (50-60 ký tự)'
                  value={formData.seo_title}
                  onChange={(e) => handleChange('seo_title', e.target.value)}
                  maxLength={60}
                />
                <p className='text-xs text-muted-foreground'>
                  {formData.seo_title.length}/60 ký tự
                </p>
              </div>

              <div className='space-y-2'>
                <Label htmlFor='seo_description'>Mô tả SEO</Label>
                <Textarea
                  id='seo_description'
                  placeholder='Mô tả ngắn gọn cho công cụ tìm kiếm (150-160 ký tự)'
                  value={formData.seo_description}
                  onChange={(e) =>
                    handleChange('seo_description', e.target.value)
                  }
                  maxLength={160}
                  rows={3}
                />
                <p className='text-xs text-muted-foreground'>
                  {formData.seo_description.length}/160 ký tự
                </p>
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='seo_keywords'>Từ khóa SEO</Label>
                  <Input
                    id='seo_keywords'
                    type='text'
                    placeholder='từ khóa 1, từ khóa 2, từ khóa 3'
                    value={formData.seo_keywords}
                    onChange={(e) =>
                      handleChange('seo_keywords', e.target.value)
                    }
                  />
                  <p className='text-xs text-muted-foreground'>
                    Phân cách bằng dấu phẩy
                  </p>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='slug'>URL thân thiện</Label>
                  <Input
                    id='slug'
                    type='text'
                    placeholder='url-than-thien-seo'
                    value={formData.slug}
                    onChange={(e) => handleChange('slug', e.target.value)}
                  />
                  <p className='text-xs text-muted-foreground'>
                    Để trống để tự động tạo từ tên sản phẩm
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <div className='space-y-2'>
          <Label htmlFor='description'>Mô tả sản phẩm *</Label>
          <Textarea
            id='description'
            placeholder='Mô tả chi tiết về sản phẩm, đặc điểm nổi bật...'
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            required
            rows={4}
          />
        </div>

        <div className='space-y-2'>
          <Label>Hình ảnh sản phẩm</Label>
          <ImageUpload
            value={formData.images}
            onChange={(urls) => handleChange('images', urls)}
            disabled={isSubmitting}
            maxFiles={20}
          />
        </div>

        {/* Submit */}
        <div className='flex items-center gap-4 pt-4'>
          <Button
            type='submit'
            disabled={isSubmitting}
            className='bg-primary hover:bg-primary/90 text-primary-foreground'
          >
            {isSubmitting ? (
              <>
                <div className='w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin' />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className='w-4 h-4 mr-2' />
                {product ? 'Cập nhật sản phẩm' : 'Lưu sản phẩm'}
              </>
            )}
          </Button>
          <Button type='button' variant='outline' asChild>
            <Link href='/admin/products'>Hủy</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
