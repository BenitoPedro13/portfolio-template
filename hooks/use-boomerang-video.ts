'use client'

import { useEffect, useRef } from 'react'

/**
 * HTML5 video has no native reverse playback, so a boomerang loop is faked:
 * when the clip ends, `currentTime` is stepped backwards until it reaches 0,
 * then normal forward playback resumes. Requires the video NOT have the
 * native `loop` attribute — `loop` seeks back to 0 without ever firing
 * `ended`, so this effect would never see the end of the clip.
 *
 * Each `currentTime` write is an async seek: on a compressed video the
 * decoder has to walk forward from the nearest keyframe to reach the target
 * frame, which does not finish inside a single animation frame. Writing a
 * new value every rAF before the previous seek resolves piles up requests
 * the decoder drops, so playback only ever renders a couple of them and
 * appears to jump between two frames instead of scrubbing smoothly. Gating
 * each step behind the browser's own `seeked` event paces requests to
 * whatever rate the decoder can actually keep up with.
 */
export function useBoomerangVideo(enabled: boolean) {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (!enabled) return

    const video = videoRef.current
    if (!video) return

    let reversing = false
    let seeking = false
    let frame: number | null = null
    let lastTimestamp: number | null = null

    function stepReverse(timestamp: number) {
      if (!video || !reversing) return

      if (seeking) {
        frame = requestAnimationFrame(stepReverse)
        return
      }

      if (lastTimestamp === null) lastTimestamp = timestamp
      const deltaSeconds = (timestamp - lastTimestamp) / 1000
      lastTimestamp = timestamp

      const next = video.currentTime - deltaSeconds
      if (next <= 0) {
        reversing = false
        video.currentTime = 0
        frame = null
        void video.play()
        return
      }

      seeking = true
      video.currentTime = next
      frame = requestAnimationFrame(stepReverse)
    }

    function handleSeeked() {
      seeking = false
    }

    function handleEnded() {
      if (!video) return
      video.pause()
      reversing = true
      seeking = false
      lastTimestamp = null
      frame = requestAnimationFrame(stepReverse)
    }

    video.addEventListener('ended', handleEnded)
    video.addEventListener('seeked', handleSeeked)
    return () => {
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('seeked', handleSeeked)
      if (frame !== null) cancelAnimationFrame(frame)
    }
  }, [enabled])

  return videoRef
}
