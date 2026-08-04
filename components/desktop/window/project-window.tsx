'use client'

import { Fragment } from 'react'
import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { Project } from '@/payload-types'
import { mediaAlt, mediaUrl, resolveMedia } from '@/lib/media'
import { RichText } from '@/lib/rich-text'
import { VideoPlayer } from './video-player'

/**
 * A single project: the work first at full width, then the credits line, then
 * the writing, then the stills.
 *
 * Credits are rendered in the orange accent colour so they read as metadata
 * (data class, orange tint) rather than body copy.
 */
export function ProjectWindow({ project }: { project: Project }) {
  const cover = mediaUrl(project.cover, 'hero')
  const gallery = (project.gallery ?? []).filter((entry) => resolveMedia(entry.image))
  const credits = project.meta ?? []

  const player = <VideoPlayer url={project.videoUrl} poster={cover} title={project.title} />

  return (
    <div className="flex flex-col">
      {player ?? (
        <AspectRatio ratio={16 / 9} className="bg-foreground/8">
          {cover ? (
            <Image
              src={cover}
              alt={mediaAlt(project.cover, project.title)}
              fill
              sizes="(max-width: 1200px) 100vw, 1140px"
              priority
              className="object-cover"
            />
          ) : null}
        </AspectRatio>
      )}

      <div className="px-7 pt-8 pb-3 sm:px-12 sm:pt-10">
        <h2 className="font-heading text-[2rem] leading-[1.05] font-bold tracking-tight text-balance text-foreground sm:text-[2.75rem]">
          {project.title}
        </h2>

        {(project.year || credits.length > 0) && (
          <p className="font-data mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px]">
            {project.year ? (
              <span className="text-primary">{project.year}</span>
            ) : null}
            {credits.map((credit, index) => (
              <Fragment key={credit.id ?? index}>
                {(project.year || index > 0) && (
                  <span className="text-foreground/25" aria-hidden="true">·</span>
                )}
                <span>
                  <span className="text-foreground/35">{credit.label}</span>{' '}
                  <span className="text-foreground/65">{credit.value}</span>
                </span>
              </Fragment>
            ))}
          </p>
        )}

        <RichText
          value={project.description}
          className="mt-7 max-w-[68ch] text-[15px] leading-[1.8] text-foreground/75 [&_p:not(:last-child)]:mb-4 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3"
        />
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-1 gap-2 px-7 pt-5 pb-10 sm:grid-cols-2 sm:px-12">
          {gallery.map((entry, index) => {
            const url = mediaUrl(entry.image, 'card')
            if (!url) return null

            return (
              <AspectRatio
                key={entry.id ?? index}
                ratio={16 / 10}
                className="overflow-hidden rounded-lg bg-foreground/8"
              >
                <Image
                  src={url}
                  alt={mediaAlt(entry.image, project.title)}
                  fill
                  sizes="(max-width: 640px) 100vw, 545px"
                  className="object-cover transition-transform duration-700 ease-window hover:scale-[1.03]"
                />
              </AspectRatio>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
