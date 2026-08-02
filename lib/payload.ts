import { getPayload } from 'payload'

import config from '@/payload.config'
import type { Config, DesktopItem, Site } from '@/payload-types'
import { toPayloadLocale, type Locale } from './locales'

type PayloadLocale = Config['locale']

export async function getPayloadClient() {
  return getPayload({ config: await config })
}

export async function getSite(locale: Locale): Promise<Site> {
  const payload = await getPayloadClient()

  return payload.findGlobal({
    slug: 'site',
    locale: toPayloadLocale<PayloadLocale>(locale),
    depth: 2,
  })
}

export async function getDesktopItems(locale: Locale): Promise<DesktopItem[]> {
  const payload = await getPayloadClient()

  const { docs } = await payload.find({
    collection: 'desktop-items',
    where: { visible: { equals: true } },
    sort: 'order',
    limit: 100,
    depth: 3,
    locale: toPayloadLocale<PayloadLocale>(locale),
  })

  return docs
}
