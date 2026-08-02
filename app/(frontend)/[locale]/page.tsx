import { notFound } from 'next/navigation'

import { Desktop } from '@/components/desktop/desktop'
import { getDictionary, isLocale } from '@/lib/i18n'
import { getDesktopItems, getSite } from '@/lib/payload'

/**
 * Rendered per request rather than prerendered.
 *
 * Two reasons: the build machine has no reason to hold database credentials,
 * and an editor changing content in /admin should see it live without waiting
 * for a redeploy.
 */
export const dynamic = 'force-dynamic'

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
