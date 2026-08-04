'use client'

import { useState } from 'react'

import type { DesktopItem, Site } from '@/payload-types'
import type { Dictionary } from '@/lib/i18n'
import { mediaUrl, resolveItem } from '@/lib/media'
import { Background } from './background'
import { CalendarWidget } from './calendar-widget'
import { ContactButton, ContactDialog } from './contact-dialog'
import { DesktopIcon } from './desktop-icon'
import { Dock } from './dock'
import { LockScreen } from './lock-screen'
import { MenuBar } from './menu-bar'
import { Spotlight } from './spotlight'
import { useWindows } from './use-windows'
import { WindowRouter } from './window/window-router'

type NavLink = NonNullable<Site['nav']>[number]

export function Desktop({
  site,
  items,
  locale,
  dictionary,
}: {
  site: Site
  items: DesktopItem[]
  locale: string
  dictionary: Dictionary
}) {
  const { openWindow, open, closeAll } = useWindows()
  const [contactOpen, setContactOpen] = useState(false)

  const stacked = items.filter((item) => item.placement !== 'free')
  const free = items.filter((item) => item.placement === 'free')

  const contact = site.contact
  const showContact = contact?.enabled !== false && (contact?.rows?.length ?? 0) > 0

  function openItem(item: DesktopItem) {
    // Link items leave the site instead of opening a window.
    if (item.type === 'link') {
      if (item.url) window.open(item.url, '_blank', 'noopener,noreferrer')
      return
    }

    if (item.slug) open(item.slug)
  }

  function handleNavigate(link: NavLink) {
    if (link.action === 'home') return closeAll()
    if (link.action === 'url') {
      if (link.url) window.open(link.url, '_blank', 'noopener,noreferrer')
      return
    }

    const target = resolveItem(link.item)
    if (target) openItem(target)
  }

  function openBySlug(slug: string) {
    const target = items.find((item) => item.slug === slug)
    if (target) openItem(target)
  }

  return (
    <div className="relative h-dvh w-full overflow-hidden">
      <Background
        videoUrl={site.backgroundVideoUrl}
        posterUrl={mediaUrl(site.backgroundPoster, 'hero')}
      />

      <MenuBar
        site={site}
        locale={locale}
        dictionary={dictionary}
        activeSlug={openWindow}
        onNavigate={handleNavigate}
      />

      {/* Icons anchored to the top-left, below the menu bar. */}
      <div className="absolute top-16 left-4 flex flex-col items-start gap-2 sm:left-8">
        {stacked.map((item) => (
          <DesktopIcon
            key={item.id}
            item={item}
            active={item.slug === openWindow}
            onOpen={() => openItem(item)}
          />
        ))}
      </div>

      {/* Free-placed icons, positioned as a percentage of the viewport. */}
      {free.map((item) => (
        <div
          key={item.id}
          className="absolute -translate-x-1/2"
          style={{ left: `${item.x ?? 60}%`, top: `${item.y ?? 40}%` }}
        >
          <DesktopIcon
            item={item}
            active={item.slug === openWindow}
            onOpen={() => openItem(item)}
          />
        </div>
      ))}

      {site.calendar?.enabled !== false ? (
        <CalendarWidget
          locale={locale}
          dictionary={dictionary}
          highlightColor={site.calendar?.highlightColor}
          className="absolute top-16 right-6 hidden sm:block"
        />
      ) : null}

      {showContact ? (
        <ContactButton label={contact!.title ?? ''} onClick={() => setContactOpen(true)} />
      ) : null}

      <Dock
        items={site.dock ?? []}
        onOpenItem={openBySlug}
        onOpenContact={() => setContactOpen(true)}
      />

      <WindowRouter items={items} site={site} dictionary={dictionary} />

      {showContact ? (
        <ContactDialog contact={contact!} open={contactOpen} onOpenChange={setContactOpen} />
      ) : null}

      {/* Spotlight: ⌘K / Ctrl+K opens a searchable window launcher. */}
      <Spotlight
        items={items}
        onSelect={openBySlug}
        onContact={() => setContactOpen(true)}
      />

      <LockScreen site={site} locale={locale} hasOpenWindow={openWindow !== null} />
    </div>
  )
}
