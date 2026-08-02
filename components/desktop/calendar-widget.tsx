'use client'

import { useMemo, useState } from 'react'
import { addMonths, eachDayOfInterval, endOfMonth, isSameDay, startOfMonth } from 'date-fns'
import { HugeiconsIcon } from '@hugeicons/react'
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons'

import type { Dictionary } from '@/lib/i18n'
import { intlLocale } from '@/lib/i18n'
import { cn } from '@/lib/utils'
import { useNow } from './use-now'

/**
 * Hand-built rather than wrapping `components/ui/calendar.tsx`: this widget is
 * display-only, sits on a translucent dark surface, and needs no selection
 * behaviour, so react-day-picker's chrome would be more to override than write.
 */
export function CalendarWidget({
  locale,
  dictionary,
  highlightColor,
  className,
}: {
  locale: string
  dictionary: Dictionary
  highlightColor?: string | null
  className?: string
}) {
  const now = useNow(60_000)
  const [monthOffset, setMonthOffset] = useState(0)

  const tag = intlLocale(locale)

  const weekdayNames = useMemo(() => {
    // `timeZone: 'UTC'` is essential: without it these UTC midnights are
    // formatted in local time, and any timezone behind UTC shifts every label
    // back a day so the header starts on Saturday.
    const formatter = new Intl.DateTimeFormat(tag, { weekday: 'short', timeZone: 'UTC' })

    // 2023-01-01 was a Sunday, so this walks Sun → Sat.
    return Array.from({ length: 7 }, (_, i) => {
      const name = formatter.format(new Date(Date.UTC(2023, 0, 1 + i)))
      // Some locales return a full weekday for 'short' ("segunda-feira"), which
      // will not fit a 7-column grid — trim to the conventional 3 letters.
      return name.replace(/\.$/, '').slice(0, 3)
    })
  }, [tag])

  const monthFormatter = useMemo(
    () => new Intl.DateTimeFormat(tag, { month: 'long', year: 'numeric' }),
    [tag]
  )

  // Rendering nothing until the clock mounts keeps the server and client markup
  // identical; the widget is decorative so a brief gap is fine.
  if (!now) {
    return <div className={cn('h-[268px] w-[220px]', className)} aria-hidden="true" />
  }

  const month = addMonths(startOfMonth(now), monthOffset)
  const days = eachDayOfInterval({ start: month, end: endOfMonth(month) })
  const leadingBlanks = month.getDay()

  return (
    <div
      className={cn(
        'w-[220px] overflow-hidden rounded-2xl shadow-2xl backdrop-blur-xl',
        className
      )}
      style={{ background: 'rgba(30, 30, 30, 0.78)' }}
    >
      <div className="flex items-center justify-between px-3 pt-3 pb-1">
        <button
          type="button"
          onClick={() => setMonthOffset((value) => value - 1)}
          aria-label={dictionary.previous}
          className="cursor-pointer rounded-md p-0.5 text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" />
        </button>
        {/* `capitalize` would title-case every word, giving "Agosto De 2026";
            only the first letter should change. */}
        <span className="truncate text-xs font-semibold tracking-wide text-white/90 first-letter:uppercase">
          {monthFormatter.format(month)}
        </span>
        <button
          type="button"
          onClick={() => setMonthOffset((value) => value + 1)}
          aria-label={dictionary.next}
          className="cursor-pointer rounded-md p-0.5 text-white/60 transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:outline-none"
        >
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5" />
        </button>
      </div>

      <div className="grid grid-cols-7 px-3 pt-2">
        {weekdayNames.map((name, index) => (
          // `min-w-0` lets the grid track shrink below the text's intrinsic
          // width; without it a long locale name overflows its cell and prints
          // on top of its neighbours.
          <span
            key={index}
            className="min-w-0 truncate text-center text-[10px] font-medium text-white/40 first-letter:uppercase"
          >
            {name}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5 px-3 pt-1 pb-3">
        {Array.from({ length: leadingBlanks }, (_, i) => (
          <div key={`blank-${i}`} className="h-6" />
        ))}

        {days.map((day) => {
          const isToday = isSameDay(day, now)

          return (
            <div key={day.toISOString()} className="flex h-6 items-center justify-center">
              <span
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-medium transition-colors',
                  isToday ? 'text-white' : 'text-white/80 hover:bg-white/10'
                )}
                style={isToday ? { backgroundColor: highlightColor || '#ef4444' } : undefined}
              >
                {day.getDate()}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
