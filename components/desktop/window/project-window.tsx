'use client'

import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { Project } from '@/payload-types'
import { mediaAlt, mediaUrl, resolveMedia } from '@/lib/media'
import { RichText } from '@/lib/rich-text'
import { VideoPlayer } from './video-player'

/** A single project: video (or cover), title, description, then the gallery. */
export function ProjectWindow({ project }: { project: Project }) {
  const cover = mediaUrl(project.cover, 'hero')
  const gallery = (project.gallery ?? []).filter((entry) => resolveMedia(entry.image))

  const player = (
    <VideoPlayer url={project.videoUrl} poster={cover} title={project.title} />
  )

  return (
    <div className="flex flex-col">
      {player ?? (
        <AspectRatio ratio={16 / 9} className="bg-muted">
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

      <div className="px-5 py-6 sm:px-8">
        <h2 className="font-heading text-2xl font-bold tracking-tight sm:text-3xl">
          {project.title}
        </h2>
        {project.year ? (
          <p className="mt-1 text-sm text-muted-foreground">{project.year}</p>
        ) : null}

        <RichText
          value={project.description}
          className="mt-4 text-base leading-relaxed text-foreground/80"
        />
      </div>

      {gallery.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 px-5 pb-6 sm:grid-cols-2 sm:px-8">
          {gallery.map((entry, index) => {
            const url = mediaUrl(entry.image, 'card')
            if (!url) return null

            return (
              <AspectRatio
                key={entry.id ?? index}
                ratio={16 / 10}
                className="overflow-hidden rounded-xl bg-muted"
              >
                <Image
                  src={url}
                  alt={mediaAlt(entry.image, project.title)}
                  fill
                  sizes="(max-width: 640px) 100vw, 560px"
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
