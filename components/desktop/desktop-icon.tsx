'use client'

import Image from 'next/image'

import type { DesktopItem } from '@/payload-types'
import { mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

const DEFAULT_ICON_COLOR = '#f04a3f'

/** macOS-ish folder glyph, tinted from the CMS. */
function FolderGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-lg" aria-hidden="true">
      <path
        d="M4 16a4 4 0 0 1 4-4h14l5 5h29a4 4 0 0 1 4 4v27a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V16Z"
        fill={color}
      />
      <path d="M4 20h56v-1a4 4 0 0 0-4-4H27l-5-5H8a4 4 0 0 0-4 4v6Z" fill="#000" opacity="0.12" />
    </svg>
  )
}

/** Text-file glyph with a folded corner. */
function FileGlyph({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 64 64" className="h-full w-full drop-shadow-lg" aria-hidden="true">
      <path d="M12 6h26l14 14v38a2 2 0 0 1-2 2H12a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" fill={color} />
      <path d="M38 6v12a2 2 0 0 0 2 2h12L38 6Z" fill="#000" opacity="0.18" />
    </svg>
  )
}

function iconSource(item: DesktopItem): string | null {
  if (item.icon === 'custom') return mediaUrl(item.customIcon, 'thumbnail')
  if (item.icon === 'self') return mediaUrl(item.image, 'thumbnail')
  return null
}

export function DesktopIcon({
  item,
  active,
  onOpen,
}: {
  item: DesktopItem
  active: boolean
  onOpen: () => void
}) {
  const src = iconSource(item)
  const color = item.iconColor || DEFAULT_ICON_COLOR
  const isPhoto = src !== null

  return (
    <button
      type="button"
      onClick={onOpen}
      onDoubleClick={onOpen}
      aria-current={active ? 'true' : undefined}
      className={cn(
        'group flex w-24 cursor-pointer flex-col items-center gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors duration-150',
        'focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
        active ? 'bg-white/20' : 'hover:bg-white/10'
      )}
    >
      <span className="size-14 transition-transform group-hover:scale-105">
        {isPhoto ? (
          <Image
            src={src}
            alt=""
            width={112}
            height={112}
            className="h-full w-full rounded-lg object-cover drop-shadow-lg"
          />
        ) : // An item whose icon should be its own artwork must never fall back
        // to a folder — that misreports what opening it will do. A file glyph
        // is the honest stand-in while the image is missing.
        item.type === 'folder' ? (
          <FolderGlyph color={color} />
        ) : (
          <FileGlyph color={color} />
        )}
      </span>
      <span className="line-clamp-2 text-center text-xs font-medium tracking-wide text-white/90 drop-shadow-md">
        {item.label}
      </span>
    </button>
  )
}
