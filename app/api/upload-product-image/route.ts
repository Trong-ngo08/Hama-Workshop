import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2/storage"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const fileName = `product-images/${Date.now()}-${Math.random().toString(36).substring(2)}.webp`
    const buffer = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadToR2(buffer, fileName, file.type || "image/webp")

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
