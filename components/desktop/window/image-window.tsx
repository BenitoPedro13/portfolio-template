'use client'

import Image from 'next/image'

import type { DesktopItem } from '@/payload-types'
import { mediaAlt, mediaDimensions, mediaUrl } from '@/lib/media'

/** Full-bleed image preview, letterboxed so tall photos are never cropped. */
export function ImageWindow({ item }: { item: DesktopItem }) {
  const url = mediaUrl(item.image, 'hero')

  if (!url) return null

  const { width, height } = mediaDimensions(item.image)

  return (
    <div className="flex items-center justify-center bg-black p-2 sm:p-4">
      <Image
        src={url}
        alt={mediaAlt(item.image, item.label)}
        width={width}
        height={height}
        priority
        className="max-h-[70vh] w-auto rounded-lg object-contain"
      />
    </div>
  )
}
