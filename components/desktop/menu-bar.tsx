'use client'

import { useMemo, useState } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { Menu01Icon } from '@hugeicons/core-free-icons'

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import type { Site } from '@/payload-types'
import { type Dictionary, intlLocale } from '@/lib/i18n'
import { resolveItem } from '@/lib/media'
import { cn } from '@/lib/utils'
import { LanguageSwitcher } from './language-switcher'
import { SpotlightHint } from './spotlight'
import { useNow } from './use-now'

type NavLink = NonNullable<Site['nav']>[number]

/** Live "Sunday 2 Aug 15:47" clock, mounted-only to avoid hydration drift. */
function Clock({ locale }: { locale: string }) {
  const now = useNow()

  const formatter = useMemo(
    () =>
      new Intl.DateTimeFormat(intlLocale(locale), {
        weekday: 'long',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      }),
    [locale]
  )

  return (
    <span className="min-w-[11rem] text-right text-sm font-light tracking-wide text-white/80 capitalize tabular-nums">
      {now ? formatter.format(now) : ' '}
    </span>
  )
}

export function MenuBar({
  site,
  locale,
  dictionary,
  activeSlug,
  onNavigate,
}: {
  site: Site
  locale: string
  dictionary: Dictionary
  activeSlug: string | null
  onNavigate: (link: NavLink) => void
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const nav = site.nav ?? []
  const showNav = site.menuBar?.showNav !== false && nav.length > 0
  const showClock = site.menuBar?.showClock !== false
  const showLanguage = site.menuBar?.showLanguageSwitcher !== false

  function isActive(link: NavLink) {
    if (link.action === 'home') return activeSlug === null
    if (link.action === 'openItem') return resolveItem(link.item)?.slug === activeSlug
    return false
  }

  function handleNavigate(link: NavLink) {
    setMobileMenuOpen(false)
    onNavigate(link)
  }

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-transparent transition-all duration-500">
      <div className="px-4 md:px-6">
        <div className="flex h-12 items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="size-4 shrink-0 rounded-full bg-white" aria-hidden="true" />
            <span className="text-sm font-medium tracking-wide text-white">{site.ownerName}</span>

            {showNav ? (
              <nav className="ml-2 hidden items-center gap-4 md:flex">
                {nav.map((link) => (
                  <button
                    key={link.id ?? link.label}
                    type="button"
                    onClick={() => handleNavigate(link)}
                    className={cn(
                      'cursor-pointer rounded-sm text-sm font-light tracking-wide transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none',
                      isActive(link) ? 'text-white' : 'text-white/70'
                    )}
                  >
                    {link.label}
                  </button>
                ))}
              </nav>
            ) : null}
          </div>

          <div className="hidden items-center gap-3 md:flex">
            {showLanguage ? <LanguageSwitcher locale={locale} dictionary={dictionary} /> : null}
            <SpotlightHint />
            {showClock ? <Clock locale={locale} /> : null}
          </div>

          <div className="md:hidden">
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger
                aria-label={dictionary.openMenu}
                className="inline-flex size-9 cursor-pointer items-center justify-center rounded-md text-white transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
              >
                <HugeiconsIcon icon={Menu01Icon} className="size-5" />
              </SheetTrigger>
              <SheetContent side="right" className="w-72">
                <SheetHeader>
                  <SheetTitle>{dictionary.menu}</SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col gap-1 px-4">
                  {nav.map((link) => (
                    <button
                      key={link.id ?? link.label}
                      type="button"
                      onClick={() => handleNavigate(link)}
                      className={cn(
                        'cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
                        isActive(link) ? 'bg-muted font-medium' : 'text-muted-foreground'
                      )}
                    >
                      {link.label}
                    </button>
                  ))}
                </nav>

                {showLanguage ? (
                  <>
                    <Separator className="my-2" />
                    <div className="flex items-center justify-between px-7 py-2">
                      <span className="text-sm text-muted-foreground">{dictionary.language}</span>
                      <LanguageSwitcher
                        locale={locale}
                        dictionary={dictionary}
                        className="border-border bg-foreground text-background"
                      />
                    </div>
                  </>
                ) : null}
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
