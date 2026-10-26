'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { analyzeFile, type FileAnalysis } from '@/lib/mesh-stats'
import {
  PRICE_PER_GRAM,
  PRICE_PER_HOUR,
  convertToPetg,
  estimateFromMesh,
  formatDuration,
  formatNumber,
  formatVnd,
  petgTimeFactor,
  quote,
  type ConvertedFilament,
  type FilamentUsage
} from '@/lib/print-quote'
import {
  Calculator,
  FileUp,
  Link2,
  Loader2,
  MessageCircle,
  RotateCcw
} from 'lucide-react'
import Link from 'next/link'
import { useRef, useState } from 'react'

const MAX_FILE_MB = 100

const INFILL_OPTIONS = [
  { value: '0.1', label: '10% – mô hình trưng bày' },
  { value: '0.15', label: '15% – tiêu chuẩn' },
  { value: '0.25', label: '25% – chắc chắn' },
  { value: '0.5', label: '50% – chịu lực' },
  { value: '1', label: '100% – đặc' }
]

interface MakerWorldInstance {
  id: number
  title: string
  weight: number
  predictionHours: number
  filaments: FilamentUsage[]
}

interface MakerWorldDesign {
  title: string
  url: string
  selected: number
  instances: MakerWorldInstance[]
}

/** What the breakdown needs, whichever input produced it. */
interface Estimate {
  source: string
  grams: number
  hours: number
  filaments?: ConvertedFilament[]
  originalHours?: number
  timeFactor?: number
  note: string
}

function fromSlicer(
  source: string,
  filaments: FilamentUsage[],
  hours: number,
  note: string
): Estimate {
  const converted = convertToPetg(filaments)
  const timeFactor = petgTimeFactor(filaments)
  return {
    source,
    grams: converted.reduce((s, f) => s + f.petgGrams, 0),
    hours: hours * timeFactor,
    filaments: converted,
    originalHours: hours,
    timeFactor,
    note
  }
}

export function PrintQuoteCalculator() {
  const [tab, setTab] = useState('file')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [file, setFile] = useState<File | null>(null)
  const [analysis, setAnalysis] = useState<FileAnalysis | null>(null)
  const [infill, setInfill] = useState('0.15')
  const fileInput = useRef<HTMLInputElement>(null)

  const [link, setLink] = useState('')
  const [design, setDesign] = useState<MakerWorldDesign | null>(null)
  const [instanceId, setInstanceId] = useState<number | null>(null)

  const handleFile = async (f: File | undefined) => {
    if (!f) return
    setError(null)
    setAnalysis(null)
    setFile(f)
    if (!/\.(stl|3mf)$/i.test(f.name)) {
      setError('Chỉ hỗ trợ file .stl và .3mf.')
      return
    }
    if (f.size > MAX_FILE_MB * 1024 * 1024) {
      setError(`File quá lớn (tối đa ${MAX_FILE_MB} MB).`)
      return
    }
    setLoading(true)
    try {
      setAnalysis(await analyzeFile(f))
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không đọc được file này.')
    } finally {
      setLoading(false)
    }
  }

  const handleLink = async () => {
    if (!link.trim()) return
    setError(null)
    setDesign(null)
    setLoading(true)
    try {
      const res = await fetch(
        `/api/makerworld?url=${encodeURIComponent(link.trim())}`
      )
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDesign(data)
      setInstanceId(data.selected)
    } catch (e) {
      setError(
        e instanceof Error && e.message
          ? e.message
          : 'Không lấy được dữ liệu từ MakerWorld.'
      )
    } finally {
      setLoading(false)
    }
  }

  let estimate: Estimate | null = null
  if (tab === 'file' && analysis && file) {
    if (analysis.kind === 'sliced') {
      estimate = fromSlicer(
        file.name,
        analysis.filaments,
        analysis.hours,
        'Lấy khối lượng và thời gian từ dữ liệu slice có sẵn trong file 3MF.'
      )
    } else {
      const { grams, hours } = estimateFromMesh(analysis.mesh, Number(infill))
      estimate = {
        source: file.name,
        grams,
        hours,
        note: `Ước tính từ thể tích mô hình (${formatNumber(analysis.mesh.volumeCm3)} cm³), infill ${Math.round(Number(infill) * 100)}%, chưa tính support.`
      }
    }
  } else if (tab === 'link' && design) {
    const inst = design.instances.find((i) => i.id === instanceId)
    if (inst) {
      const filaments = inst.filaments.length
        ? inst.filaments
        : [{ type: 'PLA', grams: inst.weight }]
      estimate = fromSlicer(
        `${design.title} – ${inst.title}`,
        filaments,
        inst.predictionHours,
        'Lấy khối lượng và thời gian từ profile in trên MakerWorld.'
      )
    }
  }

  const price = estimate && quote(estimate.grams, estimate.hours)

  const reset = () => {
    setFile(null)
    setAnalysis(null)
    setDesign(null)
    setLink('')
    setError(null)
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className='grid lg:grid-cols-5 gap-8 items-start'>
      {/* Input */}
      <div className='lg:col-span-3 rounded-2xl border border-border bg-card p-6 lg:p-8 tech-shadow'>
        <Tabs
          value={tab}
          onValueChange={(v) => {
            setTab(v)
            setError(null)
          }}
        >
          <TabsList className='grid grid-cols-2 w-full mb-6'>
            <TabsTrigger value='file'>
              <FileUp className='w-4 h-4 mr-2' />
              Tải file 3D
            </TabsTrigger>
            <TabsTrigger value='link'>
              <Link2 className='w-4 h-4 mr-2' />
              Link MakerWorld
            </TabsTrigger>
          </TabsList>

          <TabsContent value='file' className='space-y-5'>
            <label
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                handleFile(e.dataTransfer.files[0])
              }}
              className='flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-colors p-8 text-center cursor-pointer'
            >
              <FileUp className='w-8 h-8 text-primary' />
              <span className='font-semibold text-foreground'>
                {file ? file.name : 'Kéo thả hoặc bấm để chọn file'}
              </span>
              <span className='text-xs text-muted-foreground'>
                Hỗ trợ .stl và .3mf, tối đa {MAX_FILE_MB} MB. File được đọc
                ngay trên trình duyệt, không tải lên máy chủ.
              </span>
              <input
                ref={fileInput}
                type='file'
                accept='.stl,.3mf'
                className='sr-only'
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
            </label>

            {analysis?.kind !== 'sliced' && (
              <div className='space-y-2'>
                <Label htmlFor='infill'>Độ đặc bên trong (infill)</Label>
                <Select value={infill} onValueChange={setInfill}>
                  <SelectTrigger id='infill'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INFILL_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </TabsContent>

          <TabsContent value='link' className='space-y-5'>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleLink()
              }}
              className='space-y-2'
            >
              <Label htmlFor='mw-link'>Dán link mẫu trên MakerWorld</Label>
              <div className='flex gap-2'>
                <Input
                  id='mw-link'
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  placeholder='https://makerworld.com/vi/models/...'
                />
                <Button type='submit' disabled={loading || !link.trim()}>
                  Tính giá
                </Button>
              </div>
            </form>

            {design && design.instances.length > 1 && (
              <div className='space-y-2'>
                <Label htmlFor='mw-profile'>Profile in</Label>
                <Select
                  value={String(instanceId)}
                  onValueChange={(v) => setInstanceId(Number(v))}
                >
                  <SelectTrigger id='mw-profile'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {design.instances.map((i) => (
                      <SelectItem key={i.id} value={String(i.id)}>
                        {i.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {design && (
              <a
                href={design.url}
                target='_blank'
                rel='noopener noreferrer'
                className='block text-sm text-primary hover:underline'
              >
                {design.title}
              </a>
            )}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className='flex items-center gap-2 text-sm text-muted-foreground mt-5'>
            <Loader2 className='w-4 h-4 animate-spin' />
            Đang phân tích...
          </div>
        )}
        {error && (
          <p className='mt-5 text-sm text-destructive' role='alert'>
            {error}
          </p>
        )}
      </div>

      {/* Breakdown */}
      <div className='lg:col-span-2 rounded-2xl border border-primary/20 bg-primary/5 p-6 lg:p-8 space-y-5'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center'>
            <Calculator className='w-5 h-5 text-primary' />
          </div>
          <h3 className='text-lg font-bold text-foreground'>Bảng tính giá</h3>
        </div>

        {!estimate || !price ? (
          <div className='space-y-3 text-sm text-muted-foreground'>
            <p>Giá in được tính bằng tổng hai phần:</p>
            <p className='font-mono text-foreground bg-background/60 rounded-lg p-3 leading-relaxed'>
              Số gam nhựa × {formatVnd(PRICE_PER_GRAM)}
              <br />+ Số giờ in × {formatVnd(PRICE_PER_HOUR)}
            </p>
            <p>
              Tất cả sản phẩm in bằng nhựa PETG. Mẫu dùng nhựa khác (PLA, TPU…)
              sẽ được quy đổi sang PETG.
            </p>
          </div>
        ) : (
          <div className='space-y-4 text-sm'>
            <p className='text-muted-foreground break-words'>
              {estimate.source}
            </p>

            {estimate.filaments && (
              <div className='space-y-1.5 rounded-lg bg-background/60 p-3'>
                <p className='font-semibold text-foreground'>
                  Quy đổi sang PETG
                </p>
                {estimate.filaments.map((f, i) => (
                  <div
                    key={i}
                    className='flex justify-between gap-3 text-muted-foreground'
                  >
                    <span>
                      {f.type} {formatNumber(f.grams)} g
                      {f.base !== 'PETG' &&
                        ` × 1,27 / ${formatNumber(f.density, 2)}`}
                    </span>
                    <span className='text-foreground whitespace-nowrap'>
                      {formatNumber(f.petgGrams)} g
                    </span>
                  </div>
                ))}
                {estimate.timeFactor !== undefined &&
                  estimate.timeFactor !== 1 && (
                    <div className='flex justify-between gap-3 text-muted-foreground'>
                      <span>
                        Thời gian {formatDuration(estimate.originalHours!)} ×{' '}
                        {formatNumber(estimate.timeFactor, 2)}
                      </span>
                      <span className='text-foreground whitespace-nowrap'>
                        {formatDuration(estimate.hours)}
                      </span>
                    </div>
                  )}
              </div>
            )}

            <div className='space-y-2 font-mono'>
              <div className='flex justify-between gap-3'>
                <span className='text-muted-foreground'>
                  {formatNumber(estimate.grams)} g × {formatVnd(PRICE_PER_GRAM)}
                </span>
                <span className='text-foreground whitespace-nowrap'>
                  {formatVnd(price.materialCost)}
                </span>
              </div>
              <div className='flex justify-between gap-3'>
                <span className='text-muted-foreground'>
                  {formatNumber(estimate.hours, 2)} giờ ×{' '}
                  {formatVnd(PRICE_PER_HOUR)}
                </span>
                <span className='text-foreground whitespace-nowrap'>
                  {formatVnd(price.timeCost)}
                </span>
              </div>
              <div className='flex justify-between gap-3 border-t border-border pt-2'>
                <span className='text-muted-foreground'>Tổng</span>
                <span className='text-foreground whitespace-nowrap'>{formatVnd(price.total)}</span>
              </div>
            </div>

            <div className='rounded-xl bg-primary text-primary-foreground p-4 flex items-baseline justify-between gap-3'>
              <span className='text-sm'>Giá tham khảo</span>
              <span className='text-2xl font-bold'>
                ≈ {formatVnd(price.rounded)}
              </span>
            </div>

            <p className='text-xs text-muted-foreground leading-relaxed'>
              Thời gian in khoảng {formatDuration(estimate.hours)}.{' '}
              {estimate.note} Giá chưa gồm hậu kỳ, lắp ráp và phí vận chuyển;
              shop sẽ báo giá chính xác sau khi xem mẫu.
            </p>

            <div className='flex gap-2'>
              <Button asChild className='flex-1'>
                <Link href='/contact'>
                  <MessageCircle className='w-4 h-4 mr-2' />
                  Đặt in mẫu này
                </Link>
              </Button>
              <Button
                variant='outline'
                size='icon'
                onClick={reset}
                title='Tính mẫu khác'
              >
                <RotateCcw className='w-4 h-4' />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
