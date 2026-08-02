import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Geist_Mono, Outfit, Raleway } from 'next/font/google'

import '../globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { isLocale, locales } from '@/lib/i18n'
import { getSite } from '@/lib/payload'
import { mediaUrl } from '@/lib/media'

const ralewayHeading = Raleway({ subsets: ['latin'], variable: '--font-heading' })

const outfit = Outfit({ subsets: ['latin'], variable: '--font-sans' })

const fontMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
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

  const site = await getSite(locale)
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
      className={cn(
        'antialiased',
        fontMono.variable,
        'font-sans',
        outfit.variable,
        ralewayHeading.variable
      )}
    >
      <body className="bg-black">
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
