import { notFound } from 'next/navigation'

import { Desktop } from '@/components/desktop/desktop'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getDesktopItems, getSite } from '@/lib/payload'

export default async function DesktopPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  if (!isLocale(locale)) {
    notFound()
  }

  const [site, items] = await Promise.all([getSite(locale), getDesktopItems(locale)])

  return <Desktop site={site} items={items} locale={locale} dictionary={getDictionary(locale)} />
}
