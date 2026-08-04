'use client'

import type { DesktopItem, Site } from '@/payload-types'
import { RichText } from '@/lib/rich-text'
import { PlatformIcon } from '../brand-icons'

/**
 * Rich-text file window.
 *
 * Typography: generous top padding, max prose width, and a social row that
 * sits at the very bottom with a faint rule separating it from the body.
 * The icon buttons pick up `--color-signal` on hover to keep brand colour
 * consistent without adding an extra class variant.
 */
export function TextWindow({
  item,
  socials,
}: {
  item: DesktopItem
  socials: NonNullable<Site['socials']>
}) {
  const showSocials = item.showSocials !== false && socials.length > 0

  return (
    <div className="flex flex-col px-6 py-10 sm:px-14 sm:py-14">
      <RichText
        value={item.body}
        className="max-w-[62ch] text-[15px] leading-[1.8] text-foreground/80 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-6 [&_h1]:text-foreground [&_h2]:font-heading [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:text-foreground [&_p:not(:last-child)]:mb-4 [&_strong]:text-foreground [&_strong]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-3 [&_a:hover]:text-primary/80"
      />

      {showSocials ? (
        <div className="mt-10 flex flex-wrap items-center gap-2">
          {socials.map((social) => (
            <a
              key={social.id ?? social.platform}
              href={social.url}
              target={social.url.startsWith('http') ? '_blank' : undefined}
              rel="noopener noreferrer"
              aria-label={social.platform}
              className="flex size-9 items-center justify-center rounded-full border border-foreground/10 text-foreground/40 transition-all duration-200 hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              <PlatformIcon name={social.platform} className="size-4" />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
