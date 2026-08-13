import sharp from 'sharp'
import type { CollectionSlug, Payload } from 'payload'

import type { Config } from '../../payload-types'
import type { SeedSet } from './seed-sets'
import { defaultLocale, locales, toPayloadLocale } from '../../lib/locales'

type PayloadLocale = Config['locale']

/** Locales are configured at runtime; see `toPayloadLocale`. */
export const asLocale = (locale: string) => toPayloadLocale<PayloadLocale>(locale)

/** Values keyed by locale code, e.g. `{ pt: 'Trabalhos', en: 'Work' }`. */
export type Localized<T> = Record<string, T>

/**
 * Picks the value for `locale`, falling back to the default locale and then to
 * whatever is defined, so a seed only has to spell out the locales it cares
 * about even when `PORTFOLIO_LOCALES` lists more.
 */
export function pick<T>(value: Localized<T>, locale: string): T {
  return value[locale] ?? value[defaultLocale] ?? Object.values(value)[0]
}

/** Every configured locale, default first — the order seeds should write in. */
export const seedLocales = [defaultLocale, ...locales.filter((l) => l !== defaultLocale)]

// ---------------------------------------------------------------------------
// Rich text
// ---------------------------------------------------------------------------

type LexicalNode = Record<string, unknown>

function textNode(text: string): LexicalNode {
  return { type: 'text', detail: 0, format: 0, mode: 'normal', style: '', text, version: 1 }
}

function block(type: string, text: string, extra: LexicalNode = {}): LexicalNode {
  return {
    type,
    format: '',
    indent: 0,
    version: 1,
    direction: 'ltr',
    textFormat: 0,
    textStyle: '',
    children: [textNode(text)],
    ...extra,
  }
}

export type RichTextBlock = string | { heading: string; tag?: 'h1' | 'h2' | 'h3' }

/** Builds a minimal Lexical document from plain strings and headings. */
export function richText(blocks: RichTextBlock[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: blocks.map((b) =>
        typeof b === 'string' ? block('paragraph', b) : block('heading', b.heading, { tag: b.tag ?? 'h2' })
      ),
    },
  }
}

// ---------------------------------------------------------------------------
// Placeholder media
// ---------------------------------------------------------------------------

/**
 * Renders a duotone gradient with film grain, so seeded frames read as imagery
 * rather than colour swatches. Generated at seed time on purpose: a template
 * repo should not carry binary placeholder assets, or anyone else's photos.
 */
async function generateFrame(width: number, height: number, from: string, to: string) {
  const angle = 35

  const gradient = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
       <defs>
         <linearGradient id="g" gradientTransform="rotate(${angle})">
           <stop offset="0%" stop-color="${from}" />
           <stop offset="55%" stop-color="${to}" />
           <stop offset="100%" stop-color="${from}" />
         </linearGradient>
         <radialGradient id="v" cx="50%" cy="45%" r="75%">
           <stop offset="55%" stop-color="#000" stop-opacity="0" />
           <stop offset="100%" stop-color="#000" stop-opacity="0.55" />
         </radialGradient>
       </defs>
       <rect width="100%" height="100%" fill="url(#g)" />
       <rect width="100%" height="100%" fill="url(#v)" />
     </svg>`
  )

  // Monochrome noise at quarter resolution, then scaled up — cheaper than
  // per-pixel noise at full size and closer to real grain clumping.
  const noiseWidth = Math.max(1, Math.round(width / 4))
  const noiseHeight = Math.max(1, Math.round(height / 4))
  const noise = Buffer.alloc(noiseWidth * noiseHeight)
  for (let i = 0; i < noise.length; i += 1) {
    noise[i] = 110 + Math.floor(Math.random() * 36)
  }

  const grain = await sharp(noise, {
    raw: { width: noiseWidth, height: noiseHeight, channels: 1 },
  })
    .resize(width, height)
    .toColourspace('b-w')
    .png()
    .toBuffer()

  return sharp(gradient)
    .composite([{ input: grain, blend: 'overlay' }])
    .png()
    .toBuffer()
}

export async function placeholderImage(
  payload: Payload,
  options: {
    filename: string
    alt: Localized<string>
    width?: number
    height?: number
    /** Gradient endpoints; defaults to a neutral graphite. */
    from?: string
    to?: string
  }
) {
  const {
    filename,
    alt,
    width = 1600,
    height = 900,
    from = '#141416',
    to = '#3a3a40',
  } = options

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  /**
   * A doc seeded before blob storage was configured carries a local
   * `/api/media/file/...` URL, which serverless cannot serve — the images
   * silently 404 in production. Re-upload whenever the stored URL disagrees
   * with the storage backend currently in effect, so switching backends heals
   * itself on the next seed instead of leaving broken images behind.
   */
  const existingDoc = existing.docs[0]

  if (existingDoc) {
    const usingBlob = Boolean(process.env.BLOB_READ_WRITE_TOKEN)
    const storedInBlob = (existingDoc.url ?? '').includes('blob.vercel-storage.com')

    if (usingBlob === storedInBlob) {
      return existingDoc
    }
  }

  const buffer = await generateFrame(width, height, from, to)

  const file = {
    data: buffer,
    mimetype: 'image/png',
    name: filename,
    size: buffer.byteLength,
  }

  // Replace the file on the existing document rather than deleting and
  // recreating it. Projects require a cover, so dropping the media row makes
  // Postgres try to null a NOT NULL column; updating in place keeps the id and
  // every reference to it intact.
  if (existingDoc) {
    const updated = await payload.update({
      collection: 'media',
      id: existingDoc.id,
      locale: asLocale(defaultLocale),
      data: { alt: pick(alt, defaultLocale) },
      file,
      // Re-uploading under the same name trips the unique-filename check
      // against the document being replaced; this is a deliberate overwrite.
      overwriteExistingFiles: true,
    })

    for (const locale of seedLocales.slice(1)) {
      await payload.update({
        collection: 'media',
        id: existingDoc.id,
        locale: asLocale(locale),
        data: { alt: pick(alt, locale) },
      })
    }

    return updated
  }

  const doc = await payload.create({
    collection: 'media',
    locale: asLocale(defaultLocale),
    data: { alt: pick(alt, defaultLocale) },
    file,
  })

  for (const locale of seedLocales.slice(1)) {
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: asLocale(locale),
      data: { alt: pick(alt, locale) },
    })
  }

  return doc
}

// ---------------------------------------------------------------------------
// Upserts
// ---------------------------------------------------------------------------

type Json = Record<string, unknown>

const isObject = (value: unknown): value is Json =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Copies array row `id`s from an already-saved document onto the data being
 * written for another locale.
 *
 * Payload writes one locale per request. An array row sent without an `id` is
 * treated as a brand new row, so writing the second locale replaced the rows
 * the first had created and silently discarded its translations — the default
 * locale ended up with rows that had no localized values at all. Matching rows
 * by position and carrying their ids over makes each pass an update.
 */
function withRowIds<T>(next: T, saved: unknown): T {
  if (Array.isArray(next)) {
    const savedRows = Array.isArray(saved) ? saved : []

    return next.map((row, index) => {
      const savedRow = savedRows[index]
      const merged = withRowIds(row, savedRow)

      if (isObject(merged) && isObject(savedRow) && typeof savedRow.id === 'string') {
        return { ...merged, id: savedRow.id }
      }

      return merged
    }) as T
  }

  if (isObject(next)) {
    const savedObject = isObject(saved) ? saved : {}

    return Object.fromEntries(
      Object.entries(next).map(([key, value]) => [key, withRowIds(value, savedObject[key])])
    ) as T
  }

  return next
}

/**
 * Creates or updates a document identified by its slug, writing one locale at a
 * time so localized fields land in the right place.
 *
 * `data` receives the locale being written and returns that locale's payload.
 */
export async function upsertBySlug<T extends CollectionSlug>(
  payload: Payload,
  collection: T,
  slug: string,
  data: (locale: string) => Record<string, unknown>
) {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    locale: asLocale(defaultLocale),
  })

  let id = existing.docs[0]?.id
  let saved: unknown = existing.docs[0]

  for (const locale of seedLocales) {
    // Rows must carry the ids assigned by the previous locale's write, or this
    // pass replaces them and drops that locale's translations.
    const localeData = withRowIds({ ...data(locale), slug }, saved)

    if (id === undefined) {
      const created = await payload.create({
        collection,
        locale: asLocale(locale),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: localeData as any,
      })
      id = created.id
      saved = created
    } else {
      saved = await payload.update({
        collection,
        id,
        locale: asLocale(locale),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: localeData as any,
      })
    }
  }

  return id as number
}

/** Writes the `site` global once per locale. */
export async function upsertSite(payload: Payload, data: (locale: string) => Record<string, unknown>) {
  let saved: unknown = await payload.findGlobal({ slug: 'site', locale: asLocale(defaultLocale) })

  for (const locale of seedLocales) {
    saved = await payload.updateGlobal({
      slug: 'site',
      locale: asLocale(locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: withRowIds(data(locale), saved) as any,
    })
  }
}

// ---------------------------------------------------------------------------
// Pruning
// ---------------------------------------------------------------------------

/**
 * Removes the documents belonging to another seed, so switching between
 * `pnpm seed` and `pnpm seed:demo` replaces the desktop instead of stacking a
 * second set of icons on top of the first.
 *
 * Only ever touches slugs and media filenames that seed owns — anything you
 * created in /admin is left alone.
 */
export async function removeSeedSet(payload: Payload, set: SeedSet) {
  for (const slug of set.desktopItems) {
    await payload.delete({
      collection: 'desktop-items',
      where: { slug: { equals: slug } },
    })
  }

  for (const slug of set.projects) {
    await payload.delete({
      collection: 'projects',
      where: { slug: { equals: slug } },
    })
  }

  await payload.delete({
    collection: 'media',
    where: { filename: { like: set.mediaPrefix } },
  })
}
