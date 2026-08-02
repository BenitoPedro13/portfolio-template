'use client'

import Image from 'next/image'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Project } from '@/payload-types'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { ProjectCard } from './project-card'

/**
 * Folder contents. On desktop the first project fills a hero and the rest sit
 * in a filmstrip below; on mobile everything stacks, since a horizontal strip
 * is awkward on a narrow screen.
 */
export function FolderWindow({
  projects,
  onOpenProject,
}: {
  projects: Project[]
  onOpenProject: (slug: string) => void
}) {
  const isMobile = useIsMobile()

  if (projects.length === 0) return null

  const [hero, ...rest] = projects

  function open(project: Project) {
    if (project.slug) onOpenProject(project.slug)
  }

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 p-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} onSelect={() => open(project)} />
        ))}
      </div>
    )
  }

  const heroCover = mediaUrl(hero.cover, 'hero')

  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        type="button"
        onClick={() => open(hero)}
        className="group block w-full cursor-pointer overflow-hidden rounded-2xl focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      >
        <AspectRatio ratio={16 / 9} className="bg-muted">
          {heroCover ? (
            <Image
              src={heroCover}
              alt={mediaAlt(hero.cover, hero.title)}
              fill
              sizes="(max-width: 1200px) 100vw, 1140px"
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
          ) : null}
        </AspectRatio>
      </button>

      {rest.length > 0 ? (
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {rest.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onSelect={() => open(project)}
              className="w-[280px] shrink-0"
            />
          ))}
        </div>
      ) : null}
    </div>
  )
}
