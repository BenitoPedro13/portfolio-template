'use client'

import type { DesktopItem, Site } from '@/payload-types'
import { RichText } from '@/lib/rich-text'
import { PlatformIcon } from '../brand-icons'

/** Rich-text file window, with the optional social row from the Site global. */
export function TextWindow({
  item,
  socials,
}: {
  item: DesktopItem
  socials: NonNullable<Site['socials']>
}) {
  const showSocials = item.showSocials !== false && socials.length > 0

  return (
    <div className="px-6 py-8 sm:px-10 sm:py-10">
      <RichText value={item.body} className="text-base leading-relaxed text-foreground/85" />

      {showSocials ? (
        <div className="mt-8 flex flex-wrap items-center gap-3">
          {socials.map((social) => (
            <a
              key={social.id ?? social.platform}
              href={social.url}
              target={social.url.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="flex size-10 items-center justify-center rounded-full border border-foreground/15 text-foreground/70 transition-colors hover:border-foreground/30 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <PlatformIcon name={social.platform} className="size-4" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
