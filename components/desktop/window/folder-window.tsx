'use client'

import { useState } from 'react'
import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Project } from '@/payload-types'
import type { Dictionary } from '@/lib/i18n'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ProjectCard } from './project-card'

/**
 * Folder contents as a reel: one frame held large, the rest indexed in a strip
 * below. Hovering a strip frame previews it in the hero, so the strip behaves
 * like a scrubber rather than a list of links; clicking opens the project.
 *
 * On small screens the strip would be a cramped scroll, so everything stacks.
 */
export function FolderWindow({
  projects,
  dictionary,
  onOpenProject,
}: {
  projects: Project[]
  dictionary: Dictionary
  onOpenProject: (slug: string) => void
}) {
  const isMobile = useIsMobile()
  const [previewIndex, setPreviewIndex] = useState(0)

  if (projects.length === 0) return null

  function open(project: Project) {
    if (project.slug) onOpenProject(project.slug)
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-3 p-3">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            project={project}
            index={index}
            onSelect={() => open(project)}
          />
        ))}
      </div>
    )
  }

  const hero = projects[previewIndex] ?? projects[0]
  const heroCover = mediaUrl(hero.cover, 'hero')

  return (
    <div className="flex flex-col gap-3 p-3">
      <button
        type="button"
        onClick={() => open(hero)}
        className="group relative block w-full cursor-pointer overflow-hidden rounded-lg focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        {/* Cinemascope rather than 16:9 — it matches how the work is shot, and
            keeps the hero short enough that the strip below stays in view
            without scrolling. */}
        <AspectRatio ratio={21 / 9} className="bg-foreground/8">
          {heroCover ? (
            <Image
              key={heroCover}
              src={heroCover}
              alt={mediaAlt(hero.cover, hero.title)}
              fill
              sizes="(max-width: 1200px) 100vw, 1140px"
              priority
              className="animate-in fade-in object-cover duration-500"
            />
          ) : null}
          <span className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />
        </AspectRatio>

        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5">
          <span className="flex flex-col text-left">
            <span className="font-data text-[10px] text-white/50">{dictionary.nowShowing}</span>
            <span className="font-heading mt-1 text-2xl leading-none font-bold text-white">
              {hero.title}
            </span>
          </span>
          {hero.year ? (
            <span className="font-data text-[11px] text-white/60">{hero.year}</span>
          ) : null}
        </span>
      </button>

      {projects.length > 1 ? (
        <div className="flex gap-2.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {projects.map((project, index) => (
            <div
              key={project.id}
              onMouseEnter={() => setPreviewIndex(index)}
              onFocusCapture={() => setPreviewIndex(index)}
              className="w-[236px] shrink-0"
            >
              <ProjectCard
                project={project}
                index={index}
                active={index === previewIndex}
                onSelect={() => open(project)}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  )
}
