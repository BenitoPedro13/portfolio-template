'use client'

import { useEffect, useRef } from 'react'
import Image from 'next/image'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon, Cancel01Icon } from '@hugeicons/core-free-icons'

import type { Dictionary } from '@/lib/i18n'

export type LightboxImage = {
  src: string
  alt: string
  width: number
  height: number
}

/**
 * Full-screen photo viewer, stacked above the window dialog it was opened
 * from. Project thumbnails are deliberately cropped to fill a grid tile; this
 * is where the whole, uncropped photo actually gets seen.
 */
export function Lightbox({
  images,
  index,
  onIndexChange,
  onClose,
  dictionary,
}: {
  images: LightboxImage[]
  /** `null` means closed. */
  index: number | null
  onIndexChange: (index: number) => void
  onClose: () => void
  dictionary: Dictionary
}) {
  const closeRef = useRef<HTMLButtonElement>(null)
  const open = index !== null
  const count = images.length
  const current = open ? images[index] : null

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (!open) return

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      } else if (event.key === 'ArrowRight' && count > 1) {
        event.preventDefault()
        onIndexChange(((index as number) + 1) % count)
      } else if (event.key === 'ArrowLeft' && count > 1) {
        event.preventDefault()
        onIndexChange(((index as number) - 1 + count) % count)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, index, count, onClose, onIndexChange])

  if (!open || !current) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[70] flex flex-col bg-black/95 duration-150 animate-in fade-in"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <button
        ref={closeRef}
        type="button"
        onClick={onClose}
        aria-label={dictionary.close}
        className="absolute top-4 right-4 z-10 flex size-10 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none"
      >
        <HugeiconsIcon icon={Cancel01Icon} className="size-5" />
      </button>

      {count > 1 ? (
        <>
          <button
            type="button"
            onClick={() => onIndexChange((index + count - 1) % count)}
            aria-label={dictionary.previous}
            className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:left-4"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-5" />
          </button>
          <button
            type="button"
            onClick={() => onIndexChange((index + 1) % count)}
            aria-label={dictionary.next}
            className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-4"
          >
            <HugeiconsIcon icon={ArrowRight01Icon} className="size-5" />
          </button>
        </>
      ) : null}

      <div className="relative flex flex-1 items-center justify-center p-6 sm:p-12">
        <div className="relative h-full max-h-full w-full max-w-full">
          <Image
            key={current.src}
            src={current.src}
            alt={current.alt}
            fill
            sizes="100vw"
            priority
            className="animate-in fade-in object-contain duration-200"
          />
        </div>
      </div>

      {count > 1 ? (
        <p className="font-data pb-6 text-center text-[11px] text-white/50">
          {index + 1} / {count}
        </p>
      ) : null}
    </div>
  )
}
