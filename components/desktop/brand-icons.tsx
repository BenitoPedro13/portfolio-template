import type { SVGProps } from 'react'

import { HugeiconsIcon } from '@hugeicons/react'
import {
  Delete02Icon,
  Image01Icon,
  Mail01Icon,
  Call02Icon,
} from '@hugeicons/core-free-icons'

/**
 * The free hugeicons set has no dependable brand marks, so the social glyphs
 * are inlined here. Everything else routes through `HugeiconsIcon`.
 */

function Svg({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

export function YoutubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
      <path d="m10 15 5-3-5-3z" />
    </svg>
  )
}

export function TiktokIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.75a8.18 8.18 0 0 0 3.76.92V6.69Z" />
    </Svg>
  )
}

export function WhatsappIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M12.04 2c-5.5 0-9.96 4.46-9.96 9.96 0 1.76.46 3.48 1.34 5L2 22l5.2-1.36a9.92 9.92 0 0 0 4.84 1.24h.01c5.49 0 9.95-4.46 9.95-9.96 0-2.66-1.04-5.16-2.92-7.04A9.87 9.87 0 0 0 12.04 2Zm0 18.18h-.01a8.25 8.25 0 0 1-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.22 8.22 0 0 1-1.26-4.36c0-4.56 3.71-8.27 8.27-8.27a8.2 8.2 0 0 1 5.84 2.43 8.2 8.2 0 0 1 2.42 5.85c0 4.56-3.71 8.21-8.27 8.21Zm4.53-6.15c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.13-.16.24-.64.8-.78.97-.15.16-.29.18-.53.06-.25-.13-1.05-.39-1.99-1.23a7.4 7.4 0 0 1-1.38-1.71c-.14-.25-.01-.38.11-.5.11-.11.25-.29.37-.44.13-.14.17-.24.25-.41.09-.16.04-.31-.02-.43-.06-.13-.56-1.35-.77-1.84-.2-.49-.4-.42-.55-.43h-.48c-.16 0-.43.06-.65.31-.23.24-.86.84-.86 2.05s.88 2.38 1 2.54c.13.17 1.74 2.65 4.21 3.72.59.25 1.05.4 1.4.52.59.18 1.13.16 1.55.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.29Z" />
    </Svg>
  )
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M18.24 2.25h3.31l-7.23 8.26 8.5 11.24h-6.65l-5.22-6.82-5.96 6.82H1.68l7.73-8.84L1.25 2.25h6.82l4.71 6.23 5.46-6.23Zm-1.16 17.52h1.83L7.08 4.13H5.11l11.97 15.64Z" />
    </Svg>
  )
}

export function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <Svg {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5ZM2.75 9.75h4.46V21H2.75V9.75Zm7.02 0h4.28v1.54h.06c.6-1.07 2.05-2.2 4.22-2.2 4.5 0 5.34 2.82 5.34 6.5V21h-4.46v-4.86c0-1.16-.02-2.65-1.7-2.65-1.7 0-1.96 1.26-1.96 2.57V21H9.77V9.75Z" />
    </Svg>
  )
}

const BRAND_ICONS = {
  instagram: InstagramIcon,
  youtube: YoutubeIcon,
  tiktok: TiktokIcon,
  whatsapp: WhatsappIcon,
  x: XIcon,
  linkedin: LinkedinIcon,
} as const

const HUGE_ICONS = {
  photos: Image01Icon,
  mail: Mail01Icon,
  trash: Delete02Icon,
  phone: Call02Icon,
} as const

export type IconName = keyof typeof BRAND_ICONS | keyof typeof HUGE_ICONS

/** Renders a dock / social / contact icon by its CMS value. */
export function PlatformIcon({ name, className }: { name: string; className?: string }) {
  if (name in BRAND_ICONS) {
    const Brand = BRAND_ICONS[name as keyof typeof BRAND_ICONS]
    return <Brand className={className} />
  }

  if (name in HUGE_ICONS) {
    return <HugeiconsIcon icon={HUGE_ICONS[name as keyof typeof HUGE_ICONS]} className={className} />
  }

  return <HugeiconsIcon icon={Image01Icon} className={className} />
}
