import { type NextRequest, NextResponse } from "next/server"
import { uploadToR2 } from "@/lib/r2/storage"
import { verifyToken } from "@/lib/jwt"
import { createClient } from "@/lib/supabase/server"

const ALLOWED_TYPES: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
  "image/png": "png",
}
const MAX_SIZE_BYTES = 5 * 1024 * 1024

async function isAdminRequest(request: NextRequest): Promise<boolean> {
  const token = request.cookies.get("admin_token")?.value
  if (!token) return false

  try {
    await verifyToken(token)
  } catch {
    return false
  }

  const supabase = await createClient()
  const { data: session } = await supabase
    .from("admin_sessions")
    .select("id")
    .eq("session_token", token)
    .gt("expires_at", new Date().toISOString())
    .maybeSingle()

  return !!session
}

export async function POST(request: NextRequest) {
  try {
    if (!(await isAdminRequest(request))) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const ext = ALLOWED_TYPES[file.type]
    if (!ext) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 })
    }

    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ error: "File too large" }, { status: 413 })
    }

    const fileName = `hero/${Date.now()}-${Math.random().toString(36).substring(2)}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())
    const publicUrl = await uploadToR2(buffer, fileName, file.type)

    return NextResponse.json({ publicUrl })
  } catch (error) {
    console.error("Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
