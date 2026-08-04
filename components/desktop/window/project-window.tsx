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
 * the writing, then the stills. Credits sit above the description because on a
 * film piece the role and format are the first thing a client scans for.
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

      <div className="px-6 pt-7 pb-2 sm:px-10">
        <h2 className="font-heading text-3xl leading-[1.05] font-bold tracking-tight text-balance sm:text-[2.75rem]">
          {project.title}
        </h2>

        {(project.year || credits.length > 0) && (
          <p className="font-data mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-foreground/45">
            {project.year ? <span>{project.year}</span> : null}
            {credits.map((credit, index) => (
              <Fragment key={credit.id ?? index}>
                {(project.year || index > 0) && <span aria-hidden="true">·</span>}
                <span>
                  <span className="text-foreground/30">{credit.label}</span>{' '}
                  <span className="text-foreground/60">{credit.value}</span>
                </span>
              </Fragment>
            ))}
          </p>
        )}

        <RichText
          value={project.description}
          className="mt-6 max-w-[68ch] text-[15px] leading-[1.7] text-foreground/75"
        />
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-1 gap-2.5 px-6 pt-4 pb-8 sm:grid-cols-2 sm:px-10">
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
                  className="object-cover"
                />
              </AspectRatio>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
