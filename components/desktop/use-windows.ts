'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

/** Search param holding the open desktop item. */
export const WINDOW_PARAM = 'w'
/** Search param holding the open project inside a folder window. */
export const PROJECT_PARAM = 'p'

/**
 * Window state lives in the URL so windows are deep-linkable and the browser
 * back button closes them.
 */
export function useWindows() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const openWindow = searchParams.get(WINDOW_PARAM)
  const openProject = searchParams.get(PROJECT_PARAM)

  const navigate = useCallback(
    (next: { window?: string | null; project?: string | null }, replace = false) => {
      const params = new URLSearchParams(searchParams.toString())

      if ('window' in next) {
        if (next.window) params.set(WINDOW_PARAM, next.window)
        else params.delete(WINDOW_PARAM)
      }

      if ('project' in next) {
        if (next.project) params.set(PROJECT_PARAM, next.project)
        else params.delete(PROJECT_PARAM)
      }

      // Closing a window always closes whatever was open inside it.
      if ('window' in next && !next.window) params.delete(PROJECT_PARAM)

      const query = params.toString()
      const href = query ? `${pathname}?${query}` : pathname

      if (replace) router.replace(href, { scroll: false })
      else router.push(href, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  const open = useCallback((slug: string) => navigate({ window: slug, project: null }), [navigate])

  const openProjectBySlug = useCallback(
    (slug: string) => navigate({ project: slug }),
    [navigate]
  )

  const closeProject = useCallback(() => navigate({ project: null }), [navigate])

  const closeAll = useCallback(() => navigate({ window: null, project: null }), [navigate])

  return {
    openWindow,
    openProject,
    open,
    openProjectBySlug,
    closeProject,
    closeAll,
  }
}
