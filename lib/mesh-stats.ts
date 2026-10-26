/**
 * Browser-side readers for STL and 3MF files. They return the mesh volume
 * and surface area (or the slicer's own numbers when a 3MF was already
 * sliced), so files never leave the visitor's machine.
 */

import type { FilamentUsage, MeshStats } from './print-quote'

export type FileAnalysis =
  | { kind: 'mesh'; mesh: MeshStats; triangles: number }
  | { kind: 'sliced'; filaments: FilamentUsage[]; hours: number }

type Vec = [number, number, number]

class MeshAccumulator {
  volume = 0 // mm³
  area = 0 // mm²
  triangles = 0

  add(a: Vec, b: Vec, c: Vec) {
    // Signed tetrahedron volume against the origin; summed over a closed
    // mesh this is the enclosed volume.
    this.volume +=
      (a[0] * (b[1] * c[2] - b[2] * c[1]) -
        a[1] * (b[0] * c[2] - b[2] * c[0]) +
        a[2] * (b[0] * c[1] - b[1] * c[0])) /
      6
    const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
    const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
    this.area +=
      Math.hypot(
        u[1] * v[2] - u[2] * v[1],
        u[2] * v[0] - u[0] * v[2],
        u[0] * v[1] - u[1] * v[0]
      ) / 2
    this.triangles++
  }
}

// ── STL ────────────────────────────────────────────────────────────────

export function analyzeStl(buffer: ArrayBuffer): FileAnalysis {
  const view = new DataView(buffer)
  const acc = new MeshAccumulator()
  const count = buffer.byteLength >= 84 ? view.getUint32(80, true) : 0

  if (count > 0 && 84 + count * 50 === buffer.byteLength) {
    const read = (o: number): Vec => [
      view.getFloat32(o, true),
      view.getFloat32(o + 4, true),
      view.getFloat32(o + 8, true)
    ]
    for (let i = 0; i < count; i++) {
      const o = 84 + i * 50 + 12 // skip the facet normal
      acc.add(read(o), read(o + 12), read(o + 24))
    }
  } else {
    const text = new TextDecoder().decode(buffer)
    const re = /vertex\s+(\S+)\s+(\S+)\s+(\S+)/g
    const verts: Vec[] = []
    let m: RegExpExecArray | null
    while ((m = re.exec(text))) {
      verts.push([+m[1], +m[2], +m[3]])
      if (verts.length === 3) {
        acc.add(verts[0], verts[1], verts[2])
        verts.length = 0
      }
    }
  }

  return toMesh(acc, 1)
}

function toMesh(acc: MeshAccumulator, volumeScale: number): FileAnalysis {
  if (acc.triangles === 0) throw new Error('File không chứa mô hình 3D nào.')
  return {
    kind: 'mesh',
    triangles: acc.triangles,
    mesh: {
      volumeCm3: Math.abs(acc.volume * volumeScale) / 1000,
      areaCm2: (acc.area * Math.cbrt(volumeScale) ** 2) / 100
    }
  }
}

// ── ZIP (3MF container) ────────────────────────────────────────────────

async function readZip(buffer: ArrayBuffer): Promise<Map<string, string>> {
  const view = new DataView(buffer)
  let eocd = -1
  for (let i = buffer.byteLength - 22; i >= Math.max(0, buffer.byteLength - 65557); i--) {
    if (view.getUint32(i, true) === 0x06054b50) {
      eocd = i
      break
    }
  }
  if (eocd < 0) throw new Error('File 3MF bị hỏng hoặc không đúng định dạng.')

  const entries = view.getUint16(eocd + 10, true)
  let p = view.getUint32(eocd + 16, true)
  const files = new Map<string, string>()
  const decoder = new TextDecoder()

  for (let i = 0; i < entries; i++) {
    const method = view.getUint16(p + 10, true)
    const compressedSize = view.getUint32(p + 20, true)
    const nameLen = view.getUint16(p + 28, true)
    const extraLen = view.getUint16(p + 30, true)
    const commentLen = view.getUint16(p + 32, true)
    const localOffset = view.getUint32(p + 42, true)
    const name = decoder.decode(new Uint8Array(buffer, p + 46, nameLen))
    p += 46 + nameLen + extraLen + commentLen

    // Only the XML parts matter; thumbnails and gcode are skipped.
    if (!/\.(model|config)$/i.test(name)) continue

    const localNameLen = view.getUint16(localOffset + 26, true)
    const localExtraLen = view.getUint16(localOffset + 28, true)
    const start = localOffset + 30 + localNameLen + localExtraLen
    const data = new Uint8Array(buffer, start, compressedSize)

    if (method === 0) {
      files.set(name, decoder.decode(data))
    } else if (method === 8) {
      const stream = new Blob([data])
        .stream()
        .pipeThrough(new DecompressionStream('deflate-raw'))
      files.set(name, await new Response(stream).text())
    }
  }
  return files
}

// ── 3MF ────────────────────────────────────────────────────────────────

const UNIT_TO_MM: Record<string, number> = {
  micron: 0.001,
  millimeter: 1,
  centimeter: 10,
  inch: 25.4,
  foot: 304.8,
  meter: 1000
}

/** Sliced Bambu/Orca projects carry the slicer's weight and time per plate. */
function readSliceInfo(xml: string): FileAnalysis | null {
  const doc = new DOMParser().parseFromString(xml, 'application/xml')
  let seconds = 0
  const filaments: FilamentUsage[] = []
  for (const plate of Array.from(doc.getElementsByTagName('plate'))) {
    for (const meta of Array.from(plate.getElementsByTagName('metadata'))) {
      if (meta.getAttribute('key') === 'prediction') {
        seconds += Number(meta.getAttribute('value')) || 0
      }
    }
    for (const f of Array.from(plate.getElementsByTagName('filament'))) {
      const grams = Number(f.getAttribute('used_g')) || 0
      if (grams > 0) filaments.push({ type: f.getAttribute('type') || 'PLA', grams })
    }
  }
  if (seconds <= 0 || filaments.length === 0) return null
  return { kind: 'sliced', filaments, hours: seconds / 3600 }
}

function determinant(transform: string | null): number {
  if (!transform) return 1
  const m = transform.trim().split(/\s+/).map(Number)
  if (m.length < 9) return 1
  return Math.abs(
    m[0] * (m[4] * m[8] - m[5] * m[7]) -
      m[1] * (m[3] * m[8] - m[5] * m[6]) +
      m[2] * (m[3] * m[7] - m[4] * m[6])
  )
}

export async function analyze3mf(buffer: ArrayBuffer): Promise<FileAnalysis> {
  const files = await readZip(buffer)

  const sliceInfo = [...files].find(([n]) => /slice_info\.config$/i.test(n))
  const sliced = sliceInfo && readSliceInfo(sliceInfo[1])
  if (sliced) return sliced

  const docs = new Map<string, Document>()
  for (const [name, xml] of files) {
    if (name.toLowerCase().endsWith('.model')) {
      docs.set('/' + name.replace(/^\//, ''), new DOMParser().parseFromString(xml, 'application/xml'))
    }
  }
  const rootPath =
    [...docs.keys()].find((k) => /^\/3D\/3dmodel\.model$/i.test(k)) ?? [...docs.keys()][0]
  if (!rootPath) throw new Error('Không tìm thấy mô hình trong file 3MF.')

  const unit = docs.get(rootPath)!.documentElement.getAttribute('unit') ?? 'millimeter'
  const unitScale = (UNIT_TO_MM[unit] ?? 1) ** 3

  const acc = new MeshAccumulator()
  const totals = { volume: 0, area: 0 }

  // Measure one object (mesh or component tree) and add it, scaled.
  const addObject = (path: string, id: string, scale: number, depth = 0) => {
    const doc = docs.get(path)
    if (!doc || depth > 8) return
    const obj = Array.from(doc.getElementsByTagName('object')).find(
      (o) => o.getAttribute('id') === id
    )
    if (!obj) return

    const mesh = obj.getElementsByTagName('mesh')[0]
    if (mesh) {
      const part = new MeshAccumulator()
      const verts: Vec[] = Array.from(mesh.getElementsByTagName('vertex')).map((v) => [
        Number(v.getAttribute('x')),
        Number(v.getAttribute('y')),
        Number(v.getAttribute('z'))
      ])
      for (const t of Array.from(mesh.getElementsByTagName('triangle'))) {
        const a = verts[Number(t.getAttribute('v1'))]
        const b = verts[Number(t.getAttribute('v2'))]
        const c = verts[Number(t.getAttribute('v3'))]
        if (a && b && c) part.add(a, b, c)
      }
      totals.volume += Math.abs(part.volume) * scale
      totals.area += part.area * Math.cbrt(scale) ** 2
      acc.triangles += part.triangles
      return
    }

    for (const comp of Array.from(obj.getElementsByTagName('component'))) {
      const ref =
        comp.getAttribute('p:path') ??
        comp.getAttributeNS('http://schemas.microsoft.com/3dmanufacturing/production/2015/06', 'path')
      addObject(
        ref ? '/' + ref.replace(/^\//, '') : path,
        comp.getAttribute('objectid') ?? '',
        scale * determinant(comp.getAttribute('transform')),
        depth + 1
      )
    }
  }

  const root = docs.get(rootPath)!
  for (const item of Array.from(root.getElementsByTagName('item'))) {
    if (item.getAttribute('printable') === '0') continue
    addObject(
      rootPath,
      item.getAttribute('objectid') ?? '',
      determinant(item.getAttribute('transform'))
    )
  }

  acc.volume = totals.volume
  acc.area = totals.area
  return toMesh(acc, unitScale)
}

export async function analyzeFile(file: File): Promise<FileAnalysis> {
  const buffer = await file.arrayBuffer()
  const name = file.name.toLowerCase()
  if (name.endsWith('.stl')) return analyzeStl(buffer)
  if (name.endsWith('.3mf')) return analyze3mf(buffer)
  throw new Error('Chỉ hỗ trợ file .stl và .3mf.')
}
