'use client'

import { AspectRatio } from '@/components/ui/aspect-ratio'
import { useBoomerangVideo } from '@/hooks/use-boomerang-video'
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
  const videoRef = useBoomerangVideo(isBoomerang)

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
