'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'

import type { Site } from '@/payload-types'
import { intlLocale } from '@/lib/i18n'
import { INTRO_DISMISSED_KEY } from '@/lib/intro'
import { mediaAlt, mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { Background } from './background'
import { useNow } from './use-now'

/** True when this session already dismissed the lock screen. */
function alreadyDismissed(): boolean {
  try {
    return window.sessionStorage.getItem(INTRO_DISMISSED_KEY) === '1'
  } catch {
    // Private browsing or blocked storage: fail open and show the screen.
    return false
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
  /**
   * Starts visible so the lock screen is in the very first painted frame —
   * deciding this in an effect made the desktop flash before it appeared.
   * The value is deterministic on server and client; the sessionStorage part
   * is handled pre-paint by CSS keyed off the attribute set in <head>.
   */
  const showsAtAll = site.lockScreen?.enabled !== false && !hasOpenWindow
  const [visible, setVisible] = useState(showsAtAll)
  const [leaving, setLeaving] = useState(false)
  const now = useNow()

  useEffect(() => {
    // The blocking script already hid this visually; unmount it so it cannot
    // trap focus or swallow clicks. Deferred a frame so the state change does
    // not cascade out of the effect body.
    const frame = window.requestAnimationFrame(() => {
      if (showsAtAll && site.lockScreen?.showOncePerSession !== false && alreadyDismissed()) {
        setVisible(false)
      }
    })

    return () => window.cancelAnimationFrame(frame)
    // Decided once on mount: opening a window later must not re-lock the site.
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
      window.sessionStorage.setItem(INTRO_DISMISSED_KEY, '1')
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
      data-lock-screen=""
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
