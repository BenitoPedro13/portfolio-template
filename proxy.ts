import { NextResponse, type NextRequest } from 'next/server'

import { defaultLocale, locales } from '@/lib/locales'

/**
 * Picks the best locale from `Accept-Language`, ignoring quality weights beyond
 * their ordering — enough for a two or three language portfolio, and avoids
 * pulling in a negotiation dependency.
 */
function negotiateLocale(header: string | null): string {
  if (!header) return defaultLocale

  const accepted = header
    .split(',')
    .map((part) => {
      const [tag, ...params] = part.trim().split(';')
      const q = params.find((p) => p.trim().startsWith('q='))
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split('=')[1]) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of accepted) {
    const language = tag.split('-')[0]
    const match = locales.find((locale) => locale === tag || locale === language)
    if (match) return match
  }

  return defaultLocale
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl

  const hasLocale = locales.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
  )

  if (hasLocale) return NextResponse.next()

  const locale = negotiateLocale(request.headers.get('accept-language'))
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname === '/' ? '' : pathname}`
  url.search = search

  return NextResponse.redirect(url)
}

export const config = {
  /**
   * Skip Payload's admin and API routes, Next internals, uploaded media, and
   * anything with a file extension. Getting this wrong takes the admin panel
   * down, so keep the exclusions in sync with `payload.config.ts` routes.
   */
  matcher: ['/((?!admin|api|_next|media|.*\\.[\\w]+$).*)'],
}
