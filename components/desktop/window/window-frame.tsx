'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Dictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The window chrome every window shares.
 *
 * The title bar is treated as a real file-manager bar rather than a decorative
 * header: a back arrow, the file name, a mono `KIND · COUNT` readout, and the
 * close dot. On desktop it is a centred dialog, on small screens a drawer.
 */
export function WindowFrame({
  open,
  title,
  meta,
  dictionary,
  onClose,
  onBack,
  children,
  size = 'default',
}: {
  open: boolean
  title: string
  /** Mono readout under the title, e.g. "Folder · 5 items". */
  meta?: string
  dictionary: Dictionary
  onClose: () => void
  onBack?: () => void
  children: ReactNode
  size?: 'default' | 'wide'
}) {
  const isMobile = useIsMobile()

  const header = (
    <div className="relative flex shrink-0 items-center justify-center border-b border-foreground/8 bg-foreground/[0.03] px-14 py-2.5">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          aria-label={dictionary.back}
          className="absolute left-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground/50 transition-colors hover:bg-foreground/8 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
        </button>
      ) : null}

      <div className="flex min-w-0 flex-col items-center">
        <WindowTitle isMobile={isMobile}>{title}</WindowTitle>
        {meta ? (
          <span className="font-data mt-0.5 text-[10px] text-foreground/40">{meta}</span>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onClose}
        aria-label={dictionary.close}
        className="absolute right-4 size-3.5 cursor-pointer rounded-full bg-[--color-signal] transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
      />
    </div>
  )

  const body = (
    <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
      {children}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
        <DrawerContent className="flex max-h-[88dvh] flex-col overflow-hidden p-0">
          {header}
          {body}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          'flex max-h-[86vh] w-[calc(100%-3rem)] flex-col gap-0 overflow-hidden rounded-2xl p-0',
          'shadow-[0_32px_80px_-12px_rgb(0_0_0_/_0.5)] ring-1 ring-black/10',
          'duration-300 ease-window',
          size === 'wide' ? 'sm:max-w-[1180px]' : 'sm:max-w-[860px]'
        )}
      >
        {header}
        {body}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Dialog and Drawer expose different title primitives and both need one for
 * screen readers, so the frame picks the right one for the surface in use.
 */
function WindowTitle({ isMobile, children }: { isMobile: boolean; children: ReactNode }) {
  const className = 'max-w-full truncate text-center text-sm font-semibold text-foreground'

  return isMobile ? (
    <DrawerTitle className={className}>{children}</DrawerTitle>
  ) : (
    <DialogTitle className={className}>{children}</DialogTitle>
  )
}
