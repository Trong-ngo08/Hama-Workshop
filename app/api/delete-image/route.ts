import { type NextRequest, NextResponse } from "next/server"
import { deleteFromR2, getKeyFromR2Url, isR2Url } from "@/lib/r2/storage"

export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "No URL provided" }, { status: 400 })
    }

    if (!isR2Url(url)) {
      // Old Supabase URL — skip deletion (kept as backup on Supabase)
      return NextResponse.json({ ok: true })
    }

    const key = getKeyFromR2Url(url)
    await deleteFromR2(key)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("Delete error:", error)
    return NextResponse.json({ error: "Delete failed" }, { status: 500 })
  }
}
