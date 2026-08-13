'use client'

import { useEffect, useRef } from 'react'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { parseVideoUrl } from '@/lib/video'

/**
 * Renders a project's video as an iframe or a native player depending on the
 * URL the editor pasted. Returns `null` when there is nothing to play, so the
 * caller can fall back to the cover image.
 */
export function VideoPlayer({
  url,
  poster,
  title,
  playback,
}: {
  url?: string | null
  poster?: string | null
  title: string
  /** 'boomerang' only has an effect on a direct video file, not an embed. */
  playback?: 'normal' | 'boomerang' | null
}) {
  const embed = parseVideoUrl(url)
  const isBoomerang = playback === 'boomerang' && embed?.provider === 'file'
  const videoRef = useRef<HTMLVideoElement>(null)

  // HTML5 video has no native reverse playback, so a boomerang loop is faked:
  // when the clip ends, step `currentTime` backwards on every frame until it
  // reaches 0, then let it play forward again. `loop` is left off in this
  // mode since `ended` is what drives the reverse leg.
  useEffect(() => {
    if (!isBoomerang) return

    const video = videoRef.current
    if (!video) return

    let frame: number | null = null
    let lastTimestamp: number | null = null

    function stepReverse(timestamp: number) {
      if (!video) return

      if (lastTimestamp === null) lastTimestamp = timestamp
      const deltaSeconds = (timestamp - lastTimestamp) / 1000
      lastTimestamp = timestamp

      const next = video.currentTime - deltaSeconds
      if (next <= 0) {
        video.currentTime = 0
        frame = null
        void video.play()
        return
      }

      video.currentTime = next
      frame = requestAnimationFrame(stepReverse)
    }

    function handleEnded() {
      if (!video) return
      video.pause()
      lastTimestamp = null
      frame = requestAnimationFrame(stepReverse)
    }

    video.addEventListener('ended', handleEnded)
    return () => {
      video.removeEventListener('ended', handleEnded)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [isBoomerang])

  if (!embed) return null

  return (
    <AspectRatio ratio={16 / 9} className="overflow-hidden bg-black">
      {embed.provider === 'file' ? (
        <video
          ref={videoRef}
          src={embed.src}
          poster={poster ?? undefined}
          controls
          playsInline
          preload="metadata"
          className="h-full w-full object-contain"
        />
      ) : (
        <iframe
          src={embed.src}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          loading="lazy"
          className="h-full w-full border-0"
        />
      )}
    </AspectRatio>
  )
}
