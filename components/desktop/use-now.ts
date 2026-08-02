'use client'

import { useEffect, useState } from 'react'

/**
 * Ticking clock that stays `null` until mounted, so the server never renders a
 * timestamp the client would immediately disagree with.
 */
export function useNow(intervalMs = 1000): Date | null {
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setNow(new Date())

    const id = window.setInterval(() => setNow(new Date()), intervalMs)

    return () => window.clearInterval(id)
  }, [intervalMs])

  return now
}
