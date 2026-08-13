'use client'

import Image from 'next/image'
import { HugeiconsIcon } from '@hugeicons/react'
import { BubbleChatIcon } from '@hugeicons/core-free-icons'

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer'
import { Item, ItemContent, ItemDescription, ItemMedia, ItemTitle } from '@/components/ui/item'
import { Separator } from '@/components/ui/separator'
import { useIsMobile } from '@/hooks/use-mobile'
import type { Dictionary } from '@/lib/i18n'
import type { Site } from '@/payload-types'
import { mediaUrl } from '@/lib/media'
import { cn } from '@/lib/utils'
import { PlatformIcon } from './brand-icons'
import { ContactForm } from './contact-form'

type ContactRow = NonNullable<NonNullable<Site['contact']>['rows']>[number]

const TINTS = {
  green: {
    row: 'bg-emerald-500/10 hover:bg-emerald-500/15',
    badge: 'bg-emerald-500 text-white',
  },
  blue: {
    row: 'bg-sky-500/10 hover:bg-sky-500/15',
    badge: 'bg-sky-500 text-white',
  },
  neutral: {
    row: 'bg-foreground/[0.04] hover:bg-foreground/[0.08]',
    badge: 'bg-foreground text-background',
  },
} as const

function Row({ row }: { row: ContactRow }) {
  const tint = TINTS[row.tint ?? 'neutral']
  const customIcon = row.icon === 'custom' ? mediaUrl(row.customIcon, 'thumbnail') : null

  return (
    <Item
      render={
        <a
          href={row.href}
          target={row.href.startsWith('http') ? '_blank' : undefined}
          rel="noopener noreferrer"
        />
      }
      className={cn(
        'cursor-pointer rounded-2xl px-4 py-4 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        tint.row
      )}
    >
      <ItemMedia>
        <span className={cn('flex size-11 items-center justify-center rounded-full', tint.badge)}>
          {customIcon ? (
            <Image src={customIcon} alt="" width={44} height={44} className="size-6 object-contain" />
          ) : (
            <PlatformIcon name={row.icon} className="size-5" />
          )}
        </span>
      </ItemMedia>
      <ItemContent>
        <ItemTitle className="text-lg font-semibold">{row.label}</ItemTitle>
        {row.subtitle ? (
          <ItemDescription className="text-base">{row.subtitle}</ItemDescription>
        ) : null}
      </ItemContent>
    </Item>
  )
}

export function ContactDialog({
  contact,
  form,
  dictionary,
  open,
  onOpenChange,
}: {
  contact: NonNullable<Site['contact']>
  form?: Site['form']
  dictionary: Dictionary
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const isMobile = useIsMobile()
  const rows = contact.rows ?? []
  const title = contact.title ?? ''
  const showForm = form?.enabled === true

  const body = (
    <div className="flex flex-col gap-3 px-5 pt-2 pb-6">
      {rows.map((row) => (
        <Row key={row.id ?? row.href} row={row} />
      ))}

      {rows.length > 0 && showForm ? <Separator className="my-2" /> : null}

      {showForm && form ? (
        <div className="flex flex-col gap-3 px-1 py-2">
          <div>
            <h3 className="text-lg font-semibold text-foreground">{form.heading}</h3>
            {form.intro ? <p className="mt-1 text-sm text-foreground/60">{form.intro}</p> : null}
          </div>
          <ContactForm form={form} dictionary={dictionary} />
        </div>
      ) : null}
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="p-0">
          <div className="flex h-14 items-center px-5">
            <DrawerTitle className="text-xl font-bold">{title}</DrawerTitle>
          </div>
          <Separator />
          {body}
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="gap-0 overflow-hidden p-0 sm:max-w-lg">
        <div className="flex h-16 items-center px-6">
          <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        </div>
        <Separator />
        {body}
      </DialogContent>
    </Dialog>
  )
}

/** The floating button that opens the panel. */
export function ContactButton({
  label,
  onClick,
}: {
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="absolute right-4 bottom-24 z-40 flex size-12 cursor-pointer items-center justify-center rounded-full border border-white/30 bg-white/80 text-neutral-700 shadow-lg backdrop-blur-xl transition-shadow hover:shadow-xl focus-visible:ring-2 focus-visible:ring-white focus-visible:outline-none sm:right-6"
    >
      <HugeiconsIcon icon={BubbleChatIcon} className="size-5" />
    </button>
  )
}
