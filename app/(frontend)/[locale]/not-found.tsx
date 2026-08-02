import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { defaultLocale, getDictionary } from '@/lib/i18n'

/**
 * `not-found.tsx` does not receive route params, so it renders in the default
 * locale — by the time we are here the locale segment was invalid anyway.
 */
export default function NotFound() {
  const t = getDictionary(defaultLocale)

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-black px-6 text-center">
      <div className="space-y-2">
        <p className="font-mono text-sm tracking-widest text-white/40">{t.notFoundCode}</p>
        <h1 className="text-2xl font-medium text-white">{t.notFoundTitle}</h1>
      </div>
      <Button
        render={<Link href={`/${defaultLocale}`} />}
        variant="outline"
        className="border-white/20 bg-white/10 text-white hover:bg-white/20"
      >
        {t.notFoundAction}
      </Button>
    </main>
  )
}
