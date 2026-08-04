'use client'

import { useCallback, useEffect, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Folder01Icon, File01Icon, Image01Icon, ExternalLinkIcon, BubbleChatIcon } from '@hugeicons/core-free-icons'

import {
  CommandDialog,
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from '@/components/ui/command'
import type { DesktopItem } from '@/payload-types'
import { cn } from '@/lib/utils'

const TYPE_ICON = {
  folder: Folder01Icon,
  text: File01Icon,
  image: Image01Icon,
  link: ExternalLinkIcon,
} as const

/**
 * Spotlight-style command palette (⌘K / Ctrl+K).
 *
 * Shows all visible desktop items and lets the visitor jump straight to any
 * window from the keyboard. The orange `--color-signal` accent threads through:
 * the title gradient, the icon badge on hover, and the active selection ring,
 * keeping this feature consistent with every other active-state in the shell.
 */
export function Spotlight({
  items,
  onSelect,
  onContact,
}: {
  items: DesktopItem[]
  onSelect: (slug: string) => void
  onContact: () => void
}) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen((prev) => !prev), [])

  useEffect(() => {
    function down(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggle()
      }
    }

    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [toggle])

  const visible = items.filter((item) => item.visible !== false)

  function handleSelect(item: DesktopItem) {
    setOpen(false)
    // Links open in a new tab; everything else is handled by the window router.
    if (item.type === 'link' && item.url) {
      window.open(item.url, '_blank', 'noopener,noreferrer')
    } else if (item.slug) {
      onSelect(item.slug)
    }
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Spotlight"
      description="Search desktop items"
    >
      <Command className="rounded-none bg-transparent">
        <CommandInput placeholder="Open a window…" autoFocus />
        <CommandList className="max-h-80">
          <CommandEmpty>
            <span className="text-muted-foreground">No results.</span>
          </CommandEmpty>

          {visible.length > 0 && (
            <CommandGroup heading="Desktop">
              {visible.map((item) => {
                const Icon = TYPE_ICON[item.type] ?? Folder01Icon
                return (
                  <CommandItem
                    key={item.id}
                    value={item.label}
                    onSelect={() => handleSelect(item)}
                    className="gap-3 rounded-xl data-selected:bg-primary/15"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/8 text-foreground/50 transition-colors group-data-selected/command-item:bg-primary/20 group-data-selected/command-item:text-primary">
                      <HugeiconsIcon icon={Icon} className="size-3.5" strokeWidth={1.5} />
                    </span>
                    <span className="truncate text-sm">{item.label}</span>
                    <span className="font-data ml-auto shrink-0 text-[10px] text-foreground/30 uppercase">
                      {item.type}
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          )}

          <CommandGroup heading="Actions">
            <CommandItem
              value="contact"
              onSelect={() => { setOpen(false); onContact() }}
              className="gap-3 rounded-xl data-selected:bg-primary/15"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-foreground/8 text-foreground/50 transition-colors group-data-selected/command-item:bg-primary/20 group-data-selected/command-item:text-primary">
                <HugeiconsIcon icon={BubbleChatIcon} className="size-3.5" strokeWidth={1.5} />
              </span>
              <span className="truncate text-sm">Get in touch</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  )
}

/**
 * Small keyboard shortcut badge that lives in the menu bar to hint at Spotlight.
 * Renders nothing on touch devices.
 */
export function SpotlightHint({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'hidden items-center gap-0.5 rounded-md border border-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white/35 md:flex',
        className
      )}
      aria-hidden="true"
    >
      <span className="text-[11px]">⌘</span>K
    </span>
  )
}
