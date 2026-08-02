'use client'

import type { DesktopItem, Project, Site } from '@/payload-types'
import type { Dictionary } from '@/lib/i18n'
import { useWindows } from '../use-windows'
import { FolderWindow } from './folder-window'
import { ImageWindow } from './image-window'
import { ProjectWindow } from './project-window'
import { TextWindow } from './text-window'
import { WindowFrame } from './window-frame'

/** Projects come back as ids when `depth` runs out; only populated ones render. */
function populatedProjects(item: DesktopItem | null): Project[] {
  if (!item?.projects) return []

  return item.projects.filter((entry): entry is Project => typeof entry === 'object')
}

/**
 * Renders whichever window the URL asks for. A project deep link
 * (`?w=work&p=slug`) takes precedence over the folder itself, and closing it
 * falls back to the folder rather than the desktop.
 */
export function WindowRouter({
  items,
  site,
  dictionary,
}: {
  items: DesktopItem[]
  site: Site
  dictionary: Dictionary
}) {
  const { openWindow, openProject, openProjectBySlug, closeProject, closeAll } = useWindows()

  const item = items.find((candidate) => candidate.slug === openWindow) ?? null
  const projects = populatedProjects(item)
  const project = openProject
    ? (projects.find((candidate) => candidate.slug === openProject) ?? null)
    : null

  // A project view replaces the folder in the same frame, with the back arrow
  // returning to the folder listing.
  if (item && project) {
    return (
      <WindowFrame
        open
        size="wide"
        title={project.title}
        dictionary={dictionary}
        onBack={closeProject}
        onClose={closeAll}
      >
        <ProjectWindow project={project} />
      </WindowFrame>
    )
  }

  if (!item || item.type === 'link') return null

  return (
    <WindowFrame
      open
      size={item.type === 'folder' ? 'wide' : 'default'}
      title={item.label}
      dictionary={dictionary}
      onClose={closeAll}
    >
      {item.type === 'folder' ? (
        <FolderWindow projects={projects} onOpenProject={openProjectBySlug} />
      ) : item.type === 'text' ? (
        <TextWindow item={item} socials={site.socials ?? []} />
      ) : (
        <ImageWindow item={item} />
      )}
    </WindowFrame>
  )
}
