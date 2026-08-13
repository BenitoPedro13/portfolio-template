/**
 * One-off import of the real project photos from docs/<Title> - <order>/*.jpg
 * into the live production site, via its own REST API (not a direct DB
 * connection — sensitive DB credentials never leave Vercel).
 *
 *   1. Log in yourself and save a token:
 *        curl -s -X POST "$SITE_URL/api/users/login" \
 *          -H "Content-Type: application/json" \
 *          -d '{"email":"you@example.com","password":"..."}' \
 *          | node -e "..." > .payload-token
 *      (see the README / chat for the full one-liner — this script never
 *      touches your password, only the resulting token file.)
 *   2. pnpm import:docs
 *
 * Safe to re-run: media is matched by filename and projects are upserted by
 * slug, so a partial run (e.g. a timeout on a big upload) can just be re-run.
 */
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const SITE_URL = process.env.PORTFOLIO_SITE_URL ?? 'https://portfolio-template-one-lovat.vercel.app'
const TOKEN_FILE = path.resolve(import.meta.dirname, '../.payload-token')
const DOCS_DIR = path.resolve(import.meta.dirname, '../docs')
const MAX_DIMENSION = 2560
const JPEG_QUALITY = 85
const IMAGE_EXT = /\.(jpe?g)$/i
const LOCALES = ['pt', 'en']
const DEFAULT_LOCALE = 'pt'

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function sanitizeFilename(name: string): string {
  const ext = path.extname(name) || '.jpg'
  const base = path.basename(name, ext)
  return `${base.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}${ext.toLowerCase()}`
}

async function readProjectFolders() {
  const entries = await fs.readdir(DOCS_DIR, { withFileTypes: true })

  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const match = entry.name.match(/^(.*?)\s*-\s*(\d+)$/)
      if (!match) return null
      return { dir: entry.name, title: match[1].trim(), order: Number(match[2]) }
    })
    .filter((v): v is { dir: string; title: string; order: number } => v !== null)
    .sort((a, b) => a.order - b.order)
}

class Api {
  constructor(
    private baseUrl: string,
    private token: string
  ) {}

  private headers(extra: Record<string, string> = {}) {
    return { Authorization: `JWT ${this.token}`, ...extra }
  }

  async findByField(collection: string, field: string, value: string) {
    const url = `${this.baseUrl}/api/${collection}?where[${field}][equals]=${encodeURIComponent(value)}&limit=1`
    const res = await fetch(url, { headers: this.headers() })
    if (!res.ok) throw new Error(`GET ${collection} failed: ${res.status} ${await res.text()}`)
    const json = (await res.json()) as { docs: Array<{ id: number }> }
    return json.docs[0]
  }

  async uploadMedia(buffer: Buffer, filename: string, alt: string, locale: string) {
    const form = new FormData()
    form.append('file', new Blob([buffer], { type: 'image/jpeg' }), filename)
    form.append('_payload', JSON.stringify({ alt }))

    const res = await fetch(`${this.baseUrl}/api/media?locale=${locale}`, {
      method: 'POST',
      headers: this.headers(),
      body: form,
    })
    if (!res.ok) throw new Error(`upload media failed: ${res.status} ${await res.text()}`)
    const json = (await res.json()) as { doc: { id: number } }
    return json.doc
  }

  async setLocalizedField(collection: string, id: number, locale: string, data: Record<string, unknown>) {
    const res = await fetch(`${this.baseUrl}/api/${collection}/${id}?locale=${locale}`, {
      method: 'PATCH',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`PATCH ${collection}/${id} failed: ${res.status} ${await res.text()}`)
    return res.json()
  }

  async create(collection: string, locale: string, data: Record<string, unknown>) {
    const res = await fetch(`${this.baseUrl}/api/${collection}?locale=${locale}`, {
      method: 'POST',
      headers: this.headers({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    })
    if (!res.ok) throw new Error(`create ${collection} failed: ${res.status} ${await res.text()}`)
    const json = (await res.json()) as { doc: { id: number } }
    return json.doc
  }
}

async function uploadImage(api: Api, filePath: string, filename: string, alt: Record<string, string>) {
  const existing = await api.findByField('media', 'filename', filename)
  if (existing) return existing

  const original = await fs.readFile(filePath)
  const resized = await sharp(original)
    .rotate()
    .resize({ width: MAX_DIMENSION, height: MAX_DIMENSION, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: JPEG_QUALITY, mozjpeg: true })
    .toBuffer()

  const doc = await api.uploadMedia(resized, filename, alt[DEFAULT_LOCALE], DEFAULT_LOCALE)

  for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    await api.setLocalizedField('media', doc.id, locale, { alt: alt[locale] })
  }

  return doc
}

async function importProject(api: Api, project: { dir: string; title: string; order: number }) {
  const folderPath = path.join(DOCS_DIR, project.dir)
  const files = (await fs.readdir(folderPath))
    .filter((f) => IMAGE_EXT.test(f))
    .sort((a, b) => a.localeCompare(b))

  if (files.length === 0) {
    console.warn(`Skipping "${project.dir}" — no images found.`)
    return
  }

  const mediaIds: number[] = []

  for (const [index, file] of files.entries()) {
    const filename = sanitizeFilename(`${slugify(project.title)}-${index + 1}${path.extname(file)}`)
    const alt =
      index === 0
        ? { pt: `Foto de ${project.title}`, en: `Photo from ${project.title}` }
        : { pt: `Foto de ${project.title} — ${index + 1}`, en: `Photo from ${project.title} — ${index + 1}` }

    const doc = await uploadImage(api, path.join(folderPath, file), filename, alt)
    mediaIds.push(doc.id as number)
    console.log(`  ${filename}`)
  }

  const [coverId, ...galleryIds] = mediaIds
  const slug = slugify(project.title)

  const existing = await api.findByField('projects', 'slug', slug)

  const baseData = {
    title: project.title,
    slug,
    year: '2026',
    cover: coverId,
    gallery: galleryIds.map((id) => ({ image: id })),
    order: project.order,
  }

  const id = existing
    ? existing.id
    : (await api.create('projects', DEFAULT_LOCALE, baseData)).id

  if (existing) {
    await api.setLocalizedField('projects', existing.id, DEFAULT_LOCALE, baseData)
  }

  for (const locale of LOCALES.filter((l) => l !== DEFAULT_LOCALE)) {
    await api.setLocalizedField('projects', id, locale, { title: project.title })
  }

  console.log(`Imported "${project.title}" (order ${project.order}, ${mediaIds.length} images)\n`)
}

async function run() {
  const token = (await fs.readFile(TOKEN_FILE, 'utf-8')).trim()
  const api = new Api(SITE_URL, token)
  const projects = await readProjectFolders()

  console.log(`Found ${projects.length} project folders in docs/. Target: ${SITE_URL}\n`)

  for (const project of projects) {
    console.log(`Importing "${project.title}" (${project.dir})…`)
    await importProject(api, project)
  }

  console.log('Done. Open /admin to review — covers, credits and descriptions can be tweaked there.')
}

await run()
