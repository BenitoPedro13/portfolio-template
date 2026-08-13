'use client'

import { Fragment, useState } from 'react'
import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import type { Project } from '@/payload-types'
import type { Dictionary } from '@/lib/i18n'
import { mediaAlt, mediaDimensions, mediaUrl, resolveMedia } from '@/lib/media'
import { RichText } from '@/lib/rich-text'
import { Lightbox, type LightboxImage } from './lightbox'
import { VideoPlayer } from './video-player'

/**
 * A single project: the work first at full width, then the credits line, then
 * the writing, then the stills. Credits sit above the description because on a
 * film piece the role and format are the first thing a client scans for.
 *
 * Cover and gallery photos render cropped to fill their tiles, so clicking any
 * of them opens the full, uncropped frame in a lightbox rather than leaving
 * the crop as the only view.
 */
export function ProjectWindow({
  project,
  dictionary,
}: {
  project: Project
  dictionary: Dictionary
}) {
  const cover = mediaUrl(project.cover, 'hero')
  const gallery = (project.gallery ?? []).filter((entry) => resolveMedia(entry.image))
  const credits = project.meta ?? []
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const lightboxImages: LightboxImage[] = [
    ...(cover
      ? [
          {
            src: mediaUrl(project.cover) ?? cover,
            alt: mediaAlt(project.cover, project.title),
            ...mediaDimensions(project.cover),
          },
        ]
      : []),
    ...gallery.map((entry) => ({
      src: mediaUrl(entry.image) ?? '',
      alt: mediaAlt(entry.image, project.title),
      ...mediaDimensions(entry.image),
    })),
  ].filter((image) => image.src)

  // The cover only takes lightbox slot 0 when there is no video in front of
  // it — with a video playing, the cover is never shown, so it is not in the
  // gallery grid either and gallery images start at index 0.
  const hasVideo = Boolean(project.videoUrl)
  const galleryIndexOffset = !hasVideo && cover ? 1 : 0

  return (
    <div className="flex flex-col">
      {hasVideo ? (
        <VideoPlayer
          url={project.videoUrl}
          poster={cover}
          title={project.title}
          playback={project.videoPlayback}
        />
      ) : (
        <AspectRatio ratio={16 / 9} className="bg-foreground/8">
          {cover ? (
            <button
              type="button"
              onClick={() => setLightboxIndex(0)}
              aria-label={project.title}
              className="group block size-full cursor-zoom-in"
            >
              <Image
                src={cover}
                alt={mediaAlt(project.cover, project.title)}
                fill
                sizes="(max-width: 1200px) 100vw, 1140px"
                priority
                className="object-cover transition-opacity group-hover:opacity-90"
              />
            </button>
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
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index + galleryIndexOffset)}
                  aria-label={project.title}
                  className="group block size-full cursor-zoom-in"
                >
                  <Image
                    src={url}
                    alt={mediaAlt(entry.image, project.title)}
                    fill
                    sizes="(max-width: 640px) 100vw, 545px"
                    className="object-cover transition-opacity group-hover:opacity-90"
                  />
                </button>
              </AspectRatio>
            )
          })}
        </div>
      ) : null}

      <Lightbox
        images={lightboxImages}
        index={lightboxIndex}
        onIndexChange={setLightboxIndex}
        onClose={() => setLightboxIndex(null)}
        dictionary={dictionary}
      />
    </div>
  )
}
