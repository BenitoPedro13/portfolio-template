import nodemailer from 'nodemailer'

/**
 * SMTP transport for the contact form, built from whatever mail account the
 * site owner already has (Gmail, a hosting provider, Postmark's SMTP
 * endpoint, …) rather than a dedicated email-sending service.
 *
 * All of SMTP_HOST / SMTP_PORT / SMTP_USER / SMTP_PASS must be set for the
 * contact form to actually send; see .env.example.
 */
function transportConfig() {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) return null

  return {
    host,
    port,
    // 465 is implicit TLS; every other port (587, 25, …) upgrades via STARTTLS.
    secure: port === 465,
    auth: { user, pass },
  }
}

export function isMailConfigured(): boolean {
  return transportConfig() !== null
}

export async function sendMail(options: {
  to: string
  subject: string
  text: string
  replyTo?: string
}): Promise<void> {
  const config = transportConfig()
  if (!config) {
    throw new Error(
      'SMTP is not configured — set SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS.'
    )
  }

  const transporter = nodemailer.createTransport(config)
  const from = process.env.SMTP_FROM || config.auth.user

  await transporter.sendMail({
    from,
    to: options.to,
    replyTo: options.replyTo,
    subject: options.subject,
    text: options.text,
  })
}
