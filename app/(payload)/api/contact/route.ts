import { NextResponse } from 'next/server'

import { getPayloadClient } from '@/lib/payload'
import { isMailConfigured, sendMail } from '@/lib/mail'

export const dynamic = 'force-dynamic'

type ContactPayload = {
  name?: unknown
  email?: unknown
  reason?: unknown
  message?: unknown
  /** Hidden field a real visitor never fills in; a bot usually does. */
  company?: unknown
}

const MAX_MESSAGE_LENGTH = 4000
const MAX_SHORT_FIELD_LENGTH = 200

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

/**
 * Sends the contact panel's composed form as an email — the alternative to
 * the raw `mailto:` rows, for visitors who would not otherwise open a mail
 * app. Requires SMTP env vars (lib/mail.ts) and the form to be turned on in
 * /admin under Site → Contact & socials.
 */
export async function POST(request: Request) {
  let body: ContactPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid_body' }, { status: 400 })
  }

  if (asString(body.company)) {
    // Honeypot tripped: pretend success so the bot moves on.
    return NextResponse.json({ ok: true })
  }

  const name = asString(body.name)
  const email = asString(body.email)
  const reason = asString(body.reason)
  const message = asString(body.message)

  if (!name || !email || !message) {
    return NextResponse.json({ error: 'missing_fields' }, { status: 400 })
  }
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'invalid_email' }, { status: 400 })
  }
  if (
    name.length > MAX_SHORT_FIELD_LENGTH ||
    reason.length > MAX_SHORT_FIELD_LENGTH ||
    message.length > MAX_MESSAGE_LENGTH
  ) {
    return NextResponse.json({ error: 'too_long' }, { status: 400 })
  }

  if (!isMailConfigured()) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const payload = await getPayloadClient()
  const site = await payload.findGlobal({ slug: 'site', depth: 0 })
  const recipient = site.form?.recipient

  if (!site.form?.enabled || !recipient) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 })
  }

  const lines = [
    `Name: ${name}`,
    `Email: ${email}`,
    reason ? `Subject: ${reason}` : null,
    '',
    message,
  ].filter((line): line is string => line !== null)

  try {
    await sendMail({
      to: recipient,
      subject: reason ? `${reason} — ${name}` : `New message from ${name}`,
      text: lines.join('\n'),
      replyTo: email,
    })
  } catch (error) {
    console.error('[contact] failed to send:', error)
    return NextResponse.json({ error: 'send_failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
