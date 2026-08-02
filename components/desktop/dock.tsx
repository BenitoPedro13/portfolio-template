'use client'

import Image from 'next/image'
import { Fragment } from 'react'

import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { Site } from '@/payload-types'
import { mediaUrl, resolveItem } from '@/lib/media'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './brand-icons'

type DockItem = NonNullable<Site['dock']>[number]

const TILE_STYLE = {
  background:
    'linear-gradient(145deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
  boxShadow: 'rgba(0, 0, 0, 0.2) 0px 2px 8px',
} as const

function DockTile({ item }: { item: DockItem }) {
  const customIcon = item.icon === 'custom' ? mediaUrl(item.customIcon, 'thumbnail') : null

  return (
    <span
      className="flex size-11 items-center justify-center rounded-xl text-white/90"
      style={TILE_STYLE}
    >
      {customIcon ? (
        <Image src={customIcon} alt="" width={44} height={44} className="size-6 object-contain" />
      ) : (
        <PlatformIcon name={item.icon} className="size-6" />
      )}
    </span>
  )
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
  if (items.length === 0) return null

  return (
    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 flex justify-center px-2 pb-2 sm:pb-4">
      <div
        className="pointer-events-auto flex max-w-full items-end gap-1.5 overflow-x-auto rounded-2xl px-3 py-2 backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{
          background: 'rgba(30, 30, 30, 0.55)',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
        }}
      >
        {items.map((item) => {
          const target = resolveItem(item.item)

          const content =
            item.action === 'link' && item.url ? (
              <a
                href={item.url}
                target={item.url.startsWith('http') ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="shrink-0 cursor-pointer rounded-xl focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none"
              >
                <DockTile item={item} />
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
                <DockTile item={item} />
              </button>
            )

          return (
            <Fragment key={item.id ?? item.label}>
              {item.dividerBefore ? (
                <span className="mx-1 h-8 w-px shrink-0 self-center bg-white/15" aria-hidden="true" />
              ) : null}
              <Tooltip>
                <TooltipTrigger render={content} />
                <TooltipContent side="top" className="hidden sm:block">
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
