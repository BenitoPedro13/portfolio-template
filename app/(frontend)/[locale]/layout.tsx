import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Bricolage_Grotesque, Geist, Geist_Mono } from 'next/font/google'

import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isLocale, locales } from '@/lib/i18n'
import { getSite } from '@/lib/payload'
import { introBlockingScript } from '@/lib/intro'
import { mediaUrl } from '@/lib/media'

/**
 * Three type roles, each with a job:
 *  - Geist carries the OS chrome, because a desktop pastiche should feel systemy.
 *  - Bricolage Grotesque carries project titles and headings; its variable width
 *    gives the work a voice the neutral UI face deliberately withholds.
 *  - Geist Mono carries every number — years, frame indices, metadata.
 */
const fontDisplay = Bricolage_Grotesque({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
})

const fontSans = Geist({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params

  if (!isLocale(locale)) return {}

  // Metadata must never take the whole page down — if the database is briefly
  // unreachable the desktop should still render with a bare title.
  let site: Awaited<ReturnType<typeof getSite>>
  try {
    site = await getSite(locale)
  } catch {
    return {}
  }

  const title = site.seo?.siteTitle || site.ownerName
  const description = site.seo?.siteDescription || undefined
  const ogImage = mediaUrl(site.seo?.ogImage)

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      locale,
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
  }
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode
  params: Promise<{ locale: string }>
}>) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      // `dark` forces the shadcn dark token set globally — the windows are lit
      // surfaces inside a dark room, so there is no light mode on this site.
      className={cn(
        'dark antialiased',
        'font-sans',
        // The dark surface must sit on <html>, not just <body>: the browser
        // paints html's background in the canvas margins, and a body-only
        // background leaves a white frame around the viewport edges.
        'bg-void',
        fontSans.variable,
        fontDisplay.variable,
        fontMono.variable
      )}
    >
      <head>
        {/* Must run before first paint; see lib/intro.ts. */}
        <script dangerouslySetInnerHTML={{ __html: introBlockingScript }} />
      </head>
      <body className="bg-void">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
