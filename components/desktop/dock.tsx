'use client'

import Image from 'next/image'
import { Fragment, useCallback, useRef, useState } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Site } from '@/payload-types'
import { mediaUrl, resolveItem } from '@/lib/media'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './brand-icons'

type DockItem = NonNullable<Site['dock']>[number]

const TILE_STYLE = {
  background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 8px',
} as const

/** Base tile size in px; magnification scales up from here. */
const TILE_SIZE = 44
const MAX_SCALE = 1.6
/** How far the cursor's influence reaches, in tile widths. */
const INFLUENCE = 2.2

/**
 * macOS dock magnification: each tile scales by its horizontal distance from
 * the cursor, so neighbours swell in a curve rather than the hovered tile
 * popping alone. Falls back to a flat dock on touch, where there is no cursor
 * to track and the effect would only cost work.
 */
function useMagnification(enabled: boolean) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [cursorX, setCursorX] = useState<number | null>(null)

  const onMouseMove = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      if (!enabled) return
      const rect = containerRef.current?.getBoundingClientRect()
      if (rect) setCursorX(event.clientX - rect.left)
    },
    [enabled]
  )

  const onMouseLeave = useCallback(() => setCursorX(null), [])

  /** Scale for a tile whose centre sits at `centerX` within the container. */
  const scaleFor = useCallback(
    (centerX: number) => {
      if (cursorX === null) return 1

      const distance = Math.abs(cursorX - centerX) / TILE_SIZE
      if (distance > INFLUENCE) return 1

      // Cosine falloff: full magnification under the cursor, easing to 1 at the
      // edge of the influence radius with no seam.
      const falloff = (Math.cos((distance / INFLUENCE) * Math.PI) + 1) / 2

      return 1 + (MAX_SCALE - 1) * falloff
    },
    [cursorX]
  )

  return { containerRef, onMouseMove, onMouseLeave, scaleFor, active: cursorX !== null }
}

function DockTile({ item, size }: { item: DockItem; size: number }) {
  const customIcon = item.icon === 'custom' ? mediaUrl(item.customIcon, 'thumbnail') : null
  const iconSize = Math.round(size * 0.55)

  return (
    <span
      className="flex items-center justify-center rounded-xl text-white/90"
      // Sizing the element rather than transforming it is what makes
      // neighbours move aside; a scale transform leaves layout untouched and
      // magnified tiles simply overlap.
      style={{ ...TILE_STYLE, width: size, height: size, borderRadius: size * 0.26 }}
    >
      {customIcon ? (
        <Image
          src={customIcon}
          alt=""
          width={88}
          height={88}
          className="object-contain"
          style={{ width: iconSize, height: iconSize }}
        />
      ) : (
        <PlatformIcon
          name={item.icon}
          className="shrink-0"
          style={{ width: iconSize, height: iconSize }}
        />
      )}
    </span>
  )
}

/**
 * Horizontal centre of each tile at rest. Tiles sit on a fixed pitch, so these
 * can be computed rather than measured — no layout reads while the pointer
 * moves. Lives outside the component so the running offset is never a
 * render-scope mutation.
 */
function tileCenters(items: DockItem[]): number[] {
  const pitch = TILE_SIZE + 6
  let column = 0

  return items.map((item) => {
    if (item.dividerBefore) column += 0.25
    const centerX = 12 + column * pitch + TILE_SIZE / 2
    column += 1
    return centerX
  })
}

/**
 * Bottom dock. Every slot — icon, order, divider and behaviour — comes from
 * `site.dock`, so the whole bar is editable in the admin.
 */
export function Dock({
  items,
  onOpenItem,
  onOpenContact,
}: {
  items: DockItem[]
  onOpenItem: (slug: string) => void
  onOpenContact: () => void
}) {
  const isMobile = useIsMobile()
  const { containerRef, onMouseMove, onMouseLeave, scaleFor } = useMagnification(!isMobile)

  if (items.length === 0) return null

  const centers = tileCenters(items)

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-2 sm:pb-4">
      <div
        ref={containerRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="pointer-events-auto flex max-w-full items-center gap-1.5 overflow-x-auto rounded-2xl px-3 backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          background: 'rgba(30, 30, 30, 0.55)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          // Sized for the largest a tile can get, so magnification grows the
          // tiles symmetrically about the centre line without the bar itself
          // jumping in height.
          height: TILE_SIZE * MAX_SCALE + 16,
        }}
      >
        {items.map((item, index) => {
          const target = resolveItem(item.item)
          const size = Math.round(TILE_SIZE * scaleFor(centers[index]))

          const tile = (
            <span className="block transition-[width,height] duration-150 ease-out">
              <DockTile item={item} size={size} />
            </span>
          )

          const control =
            item.action === 'link' && item.url ? (
              <a
                href={item.url}
                target={item.url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="shrink-0 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
              >
                {tile}
              </a>
            ) : (
              <button
                type="button"
                disabled={item.action === 'none'}
                onClick={() => {
                  if (item.action === 'contact') onOpenContact()
                  else if (item.action === 'openItem' && target?.slug) onOpenItem(target.slug)
                }}
                className={cn(
                  'shrink-0 rounded-xl focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none',
                  item.action === 'none' ? 'cursor-default' : 'cursor-pointer'
                )}
              >
                {tile}
              </button>
            )

          return (
            <Fragment key={item.id ?? item.label}>
              {item.dividerBefore ? (
                <span
                  className="mx-1 h-8 w-px shrink-0 self-center bg-white/15"
                  aria-hidden="true"
                />
              ) : null}
              <Tooltip>
                <TooltipTrigger render={control} />
                <TooltipContent
                  side="top"
                  sideOffset={12}
                  className="hidden border border-white/10 bg-neutral-900/95 text-white shadow-lg sm:block [&_[data-slot=tooltip-arrow]]:bg-neutral-900"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
