import sharp from 'sharp'
import type { CollectionSlug, Payload } from 'payload'

import type { Config } from '../../payload-types'
import { defaultLocale, locales, toPayloadLocale } from '../../lib/locales'

type PayloadLocale = Config['locale']

/** Locales are configured at runtime; see `toPayloadLocale`. */
const asLocale = (locale: string) => toPayloadLocale<PayloadLocale>(locale)

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
 * Generates a flat-colour PNG at seed time rather than committing binary
 * placeholder assets to a template repo.
 */
export async function placeholderImage(
  payload: Payload,
  options: {
    filename: string
    alt: Localized<string>
    width?: number
    height?: number
    color?: string
  }
) {
  const { filename, alt, width = 1600, height = 900, color = '#2b2b2b' } = options

  const existing = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
  })

  if (existing.docs[0]) {
    return existing.docs[0]
  }

  const buffer = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: color,
    },
  })
    .png()
    .toBuffer()

  const doc = await payload.create({
    collection: 'media',
    locale: asLocale(defaultLocale),
    data: { alt: pick(alt, defaultLocale) },
    file: {
      data: buffer,
      mimetype: 'image/png',
      name: filename,
      size: buffer.byteLength,
    },
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

  for (const locale of seedLocales) {
    const localeData = { ...data(locale), slug }

    if (id === undefined) {
      const created = await payload.create({
        collection,
        locale: asLocale(locale),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: localeData as any,
      })
      id = created.id
    } else {
      await payload.update({
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
  for (const locale of seedLocales) {
    await payload.updateGlobal({
      slug: 'site',
      locale: asLocale(locale),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: data(locale) as any,
    })
  }
}
