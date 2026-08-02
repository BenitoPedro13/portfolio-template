'use client'

import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { Project } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'

/** Cover thumbnail with the title/year overlay, used in folder windows. */
export function ProjectCard({
  project,
  active,
  onSelect,
  className,
}: {
  project: Project
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
        'group relative block w-full cursor-pointer overflow-hidden rounded-2xl text-left transition-all',
        'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none',
        active ? 'ring-2 ring-foreground/40' : 'hover:brightness-110',
        className
      )}
    >
      <AspectRatio ratio={16 / 10} className="bg-muted">
        {cover ? (
          <Image
            src={cover}
            alt={mediaAlt(project.cover, project.title)}
            fill
            sizes="(max-width: 768px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : null}
        <span className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />
      </AspectRatio>

      <span className="absolute inset-x-0 bottom-0 flex flex-col p-4">
        <span className="text-base font-semibold text-white drop-shadow-sm">{project.title}</span>
        {project.year ? <span className="text-sm text-white/70">{project.year}</span> : null}
      </span>
    </button>
  )
}
