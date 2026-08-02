'use client'

import { useEffect, useState } from 'react'

/**
 * Ticking clock that stays `null` until mounted, so the server never renders a
 * timestamp the client would immediately disagree with.
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    // Deferred to the next frame rather than set synchronously: the first
    // value only needs to land after the initial paint, and doing it inline
    // forces a cascading re-render.
    const frame = window.requestAnimationFrame(() => setNow(new Date()))
    const id = window.setInterval(() => setNow(new Date()), intervalMs)

    return () => {
      window.cancelAnimationFrame(frame)
      window.clearInterval(id)
    }
  }, [intervalMs])

  return now
}
