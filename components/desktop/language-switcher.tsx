'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { type Dictionary, localeLabel, localeShortLabel, locales } from '@/lib/i18n'
import { cn } from '@/lib/utils'

/**
 * Swaps the locale segment while preserving the open-window search params, so
 * switching language keeps you on the same window.
 */
export function LanguageSwitcher({
  locale,
  dictionary,
  className,
}: {
  locale: string
  dictionary: Dictionary
  className?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (locales.length < 2) return null

  function switchTo(next: string) {
    const rest = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '')
    const query = searchParams.toString()

    router.push(`/${next}${rest}${query ? `?${query}` : ''}`, { scroll: false })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={dictionary.language}
        className={cn(
          'flex cursor-pointer items-center rounded-lg border border-white/30 bg-white px-2 py-0.5 text-xs font-medium text-neutral-700 transition-colors hover:bg-white/90 focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none',
          className
        )}
      >
        {localeShortLabel(locale)}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[8rem]">
        {locales.map((code) => (
          <DropdownMenuItem key={code} onClick={() => switchTo(code)}>
            <span className="font-mono text-xs opacity-60">{localeShortLabel(code)}</span>
            {localeLabel(code)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
