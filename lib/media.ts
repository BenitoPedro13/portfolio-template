import type { DesktopItem, Media } from '@/payload-types'

/**
 * Payload relationship fields come back either populated or as a bare id,
 * depending on `depth`. These narrow that union at the call site.
 */
export function resolveMedia(value: number | Media | null | undefined): Media | null {
  return value && typeof value === 'object' ? value : null
}

export function resolveItem(
  value: number | DesktopItem | null | undefined
): DesktopItem | null {
  return value && typeof value === 'object' ? value : null
}

export type MediaSize = 'thumbnail' | 'card' | 'hero'

/** URL for a media doc, preferring a generated size when one exists. */
export function mediaUrl(
  value: number | Media | null | undefined,
  size?: MediaSize
): string | null {
  const media = resolveMedia(value)
  if (!media) return null

  if (size) {
    const sized = media.sizes?.[size]?.url
    if (sized) return sized
  }

  return media.url ?? null
}

export function mediaAlt(value: number | Media | null | undefined, fallback = ''): string {
  return resolveMedia(value)?.alt ?? fallback
}

export function mediaDimensions(value: number | Media | null | undefined) {
  const media = resolveMedia(value)

  return {
    width: media?.width ?? 1600,
    height: media?.height ?? 900,
  }
}
