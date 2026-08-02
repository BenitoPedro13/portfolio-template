'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import type { Site } from '@/payload-types'
import { intlLocale } from '@/lib/i18n'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Background } from './background'
import { useNow } from './use-now'

const SESSION_KEY = 'portfolio:intro-dismissed'

/**
 * Whether the lock screen should be shown on this load. Kept out of render so
 * the server and the first client paint agree: it always starts hidden and is
 * revealed in an effect.
 */
function shouldShow(site: Site, hasOpenWindow: boolean): boolean {
  if (site.lockScreen?.enabled === false) return false
  // A deep link to a window means the visitor is not arriving at the front door.
  if (hasOpenWindow) return false
  if (site.lockScreen?.showOncePerSession === false) return true

  try {
    return window.sessionStorage.getItem(SESSION_KEY) !== '1'
  } catch {
    // Private browsing and blocked storage: fail open, showing the screen.
    return true
  }
}

export function LockScreen({
  site,
  locale,
  hasOpenWindow,
}: {
  site: Site
  locale: string
  hasOpenWindow: boolean
}) {
  const [visible, setVisible] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const now = useNow()

  useEffect(() => {
    setVisible(shouldShow(site, hasOpenWindow))
    // Only decided on mount: reopening a window later must not re-lock the site.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const tag = intlLocale(locale)

  const timeFormatter = useMemo(
    () => new Intl.DateTimeFormat(tag, { hour: '2-digit', minute: '2-digit' }),
    [tag]
  )
  const dateFormatter = useMemo(
    () => new Intl.DateTimeFormat(tag, { weekday: 'long', month: 'long', day: 'numeric' }),
    [tag]
  )

  function dismiss() {
    setLeaving(true)
    try {
      window.sessionStorage.setItem(SESSION_KEY, '1')
    } catch {
      // Ignore: dismissing still works, it just will not be remembered.
    }
    window.setTimeout(() => setVisible(false), 500)
  }

  if (!visible) return null

  const avatarSrc = mediaUrl(site.avatar, 'thumbnail')
  const startLabel = site.lockScreen?.startLabel

  return (
    <div
      className={cn(
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center select-none',
        'transition-opacity duration-500',
        leaving ? 'pointer-events-none opacity-0' : 'opacity-100'
      )}
    >
      <Background
        videoUrl={site.backgroundVideoUrl}
        posterUrl={mediaUrl(site.backgroundPoster, 'hero')}
        blurred
      />

      <div className="relative z-10 mb-12 px-6 text-center">
        <p className="text-5xl font-light tracking-tight text-white/90 tabular-nums sm:text-7xl">
          {now ? timeFormatter.format(now) : ' '}
        </p>
        <p className="mt-1 text-base font-light text-white/70 capitalize sm:text-xl">
          {now ? dateFormatter.format(now) : ' '}
        </p>
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        {avatarSrc ? (
          <div className="h-[120px] w-[120px] overflow-hidden rounded-full border-2 border-white/30 shadow-[0_0_40px_rgba(0,0,0,0.4)]">
            <Image
              src={avatarSrc}
              alt={mediaAlt(site.avatar, site.ownerName)}
              width={240}
              height={240}
              priority
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}

        <p className="text-lg font-medium tracking-wide text-white">{site.ownerName}</p>
        {site.tagline ? <p className="text-sm text-white/60">{site.tagline}</p> : null}

        {startLabel ? (
          <button
            type="button"
            onClick={dismiss}
            className="mt-4 cursor-pointer rounded-full border border-white/30 bg-white/20 px-8 py-2.5 text-sm font-medium text-white backdrop-blur-md transition-all duration-300 hover:bg-white/30 hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:outline-none active:scale-95"
          >
            {startLabel}
          </button>
        ) : null}
      </div>
    </div>
  )
}
