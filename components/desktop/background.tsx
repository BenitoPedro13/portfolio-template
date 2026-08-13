'use client'

import { useBoomerangVideo } from '@/hooks/use-boomerang-video'
import { cn } from '@/lib/utils'

/**
 * Shared looping background for the desktop and the lock screen. Falls back to
 * the poster image alone when no video URL is configured.
 */
export function Background({
  videoUrl,
  posterUrl,
  className,
  blurred = false,
  playback,
}: {
  videoUrl?: string | null
  posterUrl?: string | null
  className?: string
  blurred?: boolean
  /** 'boomerang' reverses back to the start instead of cutting to it. */
  playback?: 'normal' | 'boomerang' | null
}) {
  const isBoomerang = playback === 'boomerang'
  const videoRef = useBoomerangVideo(isBoomerang)

  return (
    <div className={cn('absolute inset-0 overflow-hidden bg-neutral-950', className)}>
      {videoUrl ? (
        <video
          ref={videoRef}
          src={videoUrl}
          poster={posterUrl ?? undefined}
          autoPlay
          loop={!isBoomerang}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="h-full w-full object-cover"
        />
      ) : posterUrl ? (
        // A CSS background rather than <img>: the wallpaper is decorative, and
        // a failed <img> paints the browser's broken-image glyph over the
        // desktop, which looks like a bug rather than a missing file.
        <div
          aria-hidden="true"
          className="h-full w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${JSON.stringify(posterUrl)})` }}
        />
      ) : null}

      {blurred ? <div className="absolute inset-0 bg-black/30 backdrop-blur-[15px]" /> : null}
    </div>
  )
}
