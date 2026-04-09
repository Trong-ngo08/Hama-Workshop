import { createClient } from "@supabase/supabase-js"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import * as fs from "fs"
import * as path from "path"

// ─── Config ─────────────────────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID!
const R2_ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!
const R2_SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY!
const R2_BUCKET = process.env.R2_BUCKET_NAME!
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL!

const LOG_FILE = path.join(process.cwd(), "scripts", "migration-log.json")

// ─── Clients ─────────────────────────────────────────────────────────────────
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
})

// ─── Log helpers ─────────────────────────────────────────────────────────────
function loadLog(): Record<string, string> {
  if (fs.existsSync(LOG_FILE)) {
    return JSON.parse(fs.readFileSync(LOG_FILE, "utf8"))
  }
  return {}
}

function saveLog(log: Record<string, string>) {
  fs.writeFileSync(LOG_FILE, JSON.stringify(log, null, 2))
}

// ─── Migrate one image ────────────────────────────────────────────────────────
async function migrateImage(oldUrl: string, log: Record<string, string>): Promise<string> {
  if (log[oldUrl]) {
    console.log(`  SKIP (already migrated): ${oldUrl}`)
    return log[oldUrl]
  }

  // Derive R2 key from Supabase URL
  // https://xxx.supabase.co/storage/v1/object/public/product-images/file.jpg
  //   → product-images/file.jpg
  const urlObj = new URL(oldUrl)
  const pathParts = urlObj.pathname.split("/public/")
  const key = pathParts[1] ?? `product-images/${Date.now()}-${Math.random().toString(36).slice(2)}`

  const res = await fetch(oldUrl)
  if (!res.ok) throw new Error(`Failed to download ${oldUrl}: ${res.status}`)

  const contentType = res.headers.get("content-type") ?? "image/jpeg"
  const buffer = Buffer.from(await res.arrayBuffer())

  await r2.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000",
    }),
  )

  const newUrl = `${R2_PUBLIC_URL}/${key}`
  log[oldUrl] = newUrl
  saveLog(log)
  console.log(`  OK: ${key}`)
  return newUrl
}

// ─── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log("=== Hama Workshop: Supabase → R2 Migration ===\n")

  const log = loadLog()
  let success = 0
  let failed = 0

  // Products
  console.log("Fetching products...")
  const { data: products, error: pErr } = await supabase.from("products").select("id, images")
  if (pErr) throw new Error(`Failed to fetch products: ${pErr.message}`)

  for (const product of products ?? []) {
    const images: string[] = product.images ?? []
    if (images.length === 0) continue

    console.log(`\nProduct ${product.id} (${images.length} images)`)
    const newImages: string[] = []

    for (const url of images) {
      try {
        newImages.push(await migrateImage(url, log))
        success++
      } catch (err) {
        console.error(`  FAIL: ${url}`, err)
        newImages.push(url) // keep old URL on failure
        failed++
      }
    }

    await supabase.from("products").update({ images: newImages }).eq("id", product.id)
  }

  // About images
  console.log("\nFetching about_images...")
  const { data: aboutImages, error: aErr } = await supabase.from("about_images").select("id, image_url")
  if (aErr) throw new Error(`Failed to fetch about_images: ${aErr.message}`)

  for (const row of aboutImages ?? []) {
    if (!row.image_url) continue

    console.log(`\nAbout image ${row.id}`)
    try {
      const newUrl = await migrateImage(row.image_url, log)
      await supabase.from("about_images").update({ image_url: newUrl }).eq("id", row.id)
      success++
    } catch (err) {
      console.error(`  FAIL: ${row.image_url}`, err)
      failed++
    }
  }

  console.log(`\n=== Done: ${success} migrated, ${failed} failed ===`)
  console.log(`Log saved to: ${LOG_FILE}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
