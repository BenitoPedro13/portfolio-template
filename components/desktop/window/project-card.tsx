'use client'

import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { Project } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

/**
 * One frame in the reel. The index is not decoration — a portfolio is an
 * ordered body of work, and `order` is the thing being shown.
 *
 * The active state uses the brand orange ring (`--color-signal`) to tie the
 * scrubber selection back to the same signal colour used for focus rings,
 * the close button, and today's date on the calendar.
 */
export function ProjectCard({
  project,
  index,
  active,
  onSelect,
  className,
}: {
  project: Project
  index: number
  active?: boolean
  onSelect: () => void
  className?: string
}) {
  const cover = mediaUrl(project.cover, 'card')

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'group relative block w-full cursor-pointer overflow-hidden rounded-lg text-left',
        'transition-[opacity,box-shadow] duration-300 ease-window',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        active
          ? 'ring-2 ring-signal shadow-[0_0_20px_rgba(249,115,22,0.15)]'
          : 'opacity-70 hover:opacity-100',
        className
      )}
    >
      <AspectRatio ratio={16 / 10} className="bg-foreground/8">
        {cover ? (
          <Image
            src={cover}
            alt={mediaAlt(project.cover, project.title)}
            fill
            sizes="(max-width: 768px) 100vw, 320px"
            className="object-cover transition-transform duration-700 ease-window group-hover:scale-[1.04]"
          />
        ) : null}
        {/* Stronger gradient so text is always legible on any cover. */}
        <span className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
      </AspectRatio>

      <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-3">
        <span className="flex min-w-0 flex-col">
          <span className="font-heading truncate text-[15px] leading-tight font-semibold text-white">
            {project.title}
          </span>
          {project.year ? (
            <span className="font-data mt-1 text-[10px] text-white/55">{project.year}</span>
          ) : null}
        </span>
        <span
          className={cn(
            'font-data shrink-0 text-[10px] transition-colors',
            active ? 'text-signal' : 'text-white/35 group-hover:text-white/60'
          )}
        >
          {String(index + 1).padStart(2, '0')}
        </span>
      </span>
    </button>
  )
}
