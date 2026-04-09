"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Upload, X, ImageIcon, Star } from "lucide-react"
import Image from "next/image"
import imageCompression from "browser-image-compression"

interface ImageUploadProps {
  value: string[]
  onChange: (urls: string[]) => void
  maxFiles?: number
  disabled?: boolean
}

const COMPRESSION_OPTIONS = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  fileType: "image/webp" as const,
  initialQuality: 0.85,
}

export function ImageUpload({ value = [], onChange, maxFiles = 5, disabled }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (disabled) return

      setUploading(true)
      setUploadProgress(0)

      try {
        const uploadedUrls: string[] = []

        for (let i = 0; i < acceptedFiles.length; i++) {
          const file = acceptedFiles[i]
          const compressed = await imageCompression(file, COMPRESSION_OPTIONS)

          const formData = new FormData()
          formData.append("file", compressed)

          const res = await fetch("/api/upload-product-image", {
            method: "POST",
            body: formData,
          })

          if (!res.ok) throw new Error("Upload failed")

          const { publicUrl } = await res.json()
          uploadedUrls.push(publicUrl)
          setUploadProgress(((i + 1) / acceptedFiles.length) * 100)
        }

        const newUrls = [...value, ...uploadedUrls].slice(0, maxFiles)
        onChange(newUrls)
      } catch (error) {
        console.error("Upload error:", error)
        alert("Có lỗi xảy ra khi tải ảnh lên")
      } finally {
        setUploading(false)
        setUploadProgress(0)
      }
    },
    [value, onChange, maxFiles, disabled],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: maxFiles - value.length,
    disabled: disabled || uploading,
  })

  const setAsMain = (urlToPromote: string) => {
    const newUrls = [urlToPromote, ...value.filter((url) => url !== urlToPromote)]
    onChange(newUrls)
  }

  const removeImage = async (urlToRemove: string) => {
    if (disabled) return

    try {
      await fetch("/api/delete-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlToRemove }),
      })
      const newUrls = value.filter((url) => url !== urlToRemove)
      onChange(newUrls)
    } catch (error) {
      console.error("Delete error:", error)
      alert("Có lỗi xảy ra khi xóa ảnh")
    }
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      {value.length < maxFiles && (
        <Card>
          <CardContent className="p-6">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"}
                ${disabled || uploading ? "opacity-50 cursor-not-allowed" : "hover:border-primary hover:bg-primary/5"}
              `}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <div className="text-sm">
                  {isDragActive ? (
                    <p>Thả ảnh vào đây...</p>
                  ) : (
                    <div>
                      <p className="font-medium">Kéo thả ảnh hoặc click để chọn</p>
                      <p className="text-muted-foreground">
                        Hỗ trợ: JPG, PNG, WebP (tối đa {maxFiles - value.length} ảnh)
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {uploading && (
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Đang tải lên...</span>
                  <span>{Math.round(uploadProgress)}%</span>
                </div>
                <Progress value={uploadProgress} />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Image Preview Grid */}
      {value.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {value.map((url, index) => (
            <Card key={url} className="relative group">
              <CardContent className="p-2">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={url || "/placeholder.svg"}
                    alt={`Product image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  {!disabled && (
                    <>
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                        onClick={() => removeImage(url)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          title="Đặt làm ảnh chính"
                          className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                          onClick={() => setAsMain(url)}
                        >
                          <Star className="h-3 w-3" />
                        </Button>
                      )}
                    </>
                  )}
                  {index === 0 && (
                    <div className="absolute bottom-2 left-2">
                      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded flex items-center gap-1">
                        <Star className="h-3 w-3 fill-current" />
                        Ảnh chính
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {value.length === 0 && !uploading && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Chưa có ảnh nào được tải lên</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
