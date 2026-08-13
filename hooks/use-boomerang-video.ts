'use client'

import { useEffect, useRef } from 'react'

/**
 * HTML5 video has no native reverse playback, so a boomerang loop is faked:
 * when the clip ends, `currentTime` is stepped backwards on every frame until
 * it reaches 0, then normal forward playback resumes. Requires the video NOT
 * have the native `loop` attribute — `loop` seeks back to 0 without ever
 * firing `ended`, so this effect would never see the end of the clip.
 */
export function useBoomerangVideo(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!enabled) return

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
  }, [enabled])

  return videoRef
}
