/**
 * Locale configuration shared by `payload.config.ts` and the frontend.
 *
 * Kept dependency-free so it can be imported from the Payload config, from
 * server components, from client components, and from `proxy.ts` alike.
 *
 * Configure with env vars so a template user never has to edit code:
 *   PORTFOLIO_LOCALES=pt,en
 *   PORTFOLIO_DEFAULT_LOCALE=pt
 */

const DEFAULT_LOCALES = 'pt,en'

function parseLocales(raw: string | undefined): string[] {
  const parsed = (raw ?? DEFAULT_LOCALES)
    .split(',')
    .map((code) => code.trim().toLowerCase())
    .filter(Boolean)

  return parsed.length > 0 ? Array.from(new Set(parsed)) : ['en']
}

export const locales = parseLocales(process.env.PORTFOLIO_LOCALES)

export const defaultLocale =
  process.env.PORTFOLIO_DEFAULT_LOCALE &&
  locales.includes(process.env.PORTFOLIO_DEFAULT_LOCALE.trim().toLowerCase())
    ? process.env.PORTFOLIO_DEFAULT_LOCALE.trim().toLowerCase()
    : locales[0]

export type Locale = string

export function isLocale(value: string | undefined | null): value is Locale {
  return typeof value === 'string' && locales.includes(value)
}

/**
 * `payload-types.ts` narrows `locale` to a union generated from whatever
 * `PORTFOLIO_LOCALES` held at the time types were generated. Locales are
 * configured at runtime here, so the two cannot be reconciled statically —
 * this is the single place that bridges them.
 *
 * Callers must pass a value already validated by `isLocale`.
 */
export function toPayloadLocale<T extends string>(locale: Locale): T {
  return locale as T
}
