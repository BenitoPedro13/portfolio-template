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
    <div className="px-6 py-9 sm:px-12 sm:py-12">
      <RichText
        value={item.body}
        className="max-w-[64ch] text-[15px] leading-[1.75] text-foreground/75"
      />

      {showSocials ? (
        <div className="mt-10 flex flex-wrap items-center gap-2.5">
          {socials.map((social) => (
            <a
              key={social.id ?? social.platform}
              href={social.url}
              target={social.url.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="flex size-9 items-center justify-center rounded-full border border-foreground/12 text-foreground/50 transition-colors hover:border-foreground/25 hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <PlatformIcon name={social.platform} className="size-4" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
