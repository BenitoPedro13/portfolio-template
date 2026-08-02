'use client'

import type { ReactNode } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Dictionary } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * The macOS-style window chrome shared by every window: an optional back arrow,
 * a centred title, and a red close dot. Rendered as a centred dialog on desktop
 * and a bottom drawer on small screens.
 */
export function WindowFrame({
  open,
  title,
  dictionary,
  onClose,
  onBack,
  children,
  size = 'default',
}: {
  open: boolean
  title: string
  dictionary: Dictionary
  onClose: () => void
  onBack?: () => void
  children: ReactNode
  size?: 'default' | 'wide'
}) {
  const isMobile = useIsMobile()

  const header = (
    <>
      <div className="relative flex h-12 shrink-0 items-center justify-center px-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            aria-label={dictionary.back}
            className="absolute left-3 flex size-8 cursor-pointer items-center justify-center rounded-full text-foreground/60 transition-colors hover:bg-foreground/5 hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" />
          </button>
        ) : null}

        <TitleText isMobile={isMobile}>{title}</TitleText>

        <button
          type="button"
          onClick={onClose}
          aria-label={dictionary.close}
          className="absolute right-4 size-3.5 cursor-pointer rounded-full bg-[#ef4444] transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
        />
      </div>
      <Separator />
    </>
  )

  const body = (
    <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto overscroll-contain">
      {children}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()}>
        <DrawerContent className="flex max-h-[88dvh] flex-col p-0">
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
          'flex max-h-[86vh] w-[calc(100%-3rem)] flex-col gap-0 overflow-hidden p-0',
          size === 'wide' ? 'sm:max-w-[1200px]' : 'sm:max-w-[880px]'
        )}
      >
        {header}
        {body}
      </DialogContent>
    </Dialog>
  )
}

/**
 * Dialog and Drawer expose different title primitives, and both need one for
 * screen readers, so the frame picks the right one for the surface in use.
 */
function TitleText({ isMobile, children }: { isMobile: boolean; children: ReactNode }) {
  const className = 'truncate px-10 text-center text-base font-semibold text-foreground'

  return isMobile ? (
    <DrawerTitle className={className}>{children}</DrawerTitle>
  ) : (
    <DialogTitle className={className}>{children}</DialogTitle>
  )
}
