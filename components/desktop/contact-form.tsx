'use client'

import { useId, useState, type FormEvent } from 'react'
import { HugeiconsIcon } from '@hugeicons/react'
import { CheckmarkCircle02Icon } from '@hugeicons/core-free-icons'

import { Button } from '@/components/ui/button'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import type { Dictionary } from '@/lib/i18n'
import type { Site } from '@/payload-types'

type FormConfig = NonNullable<Site['form']>
type Status = 'idle' | 'submitting' | 'success' | 'error'

/**
 * The composed alternative to the raw contact rows: a name, an optional
 * subject picked from CMS-configured options, and a message, posted to
 * /api/contact which emails it to the owner. Arthur asked for this so a
 * visitor has a shape to fill in for a partnership/project/contract inquiry,
 * rather than opening their own mail app from scratch.
 */
export function ContactForm({
  form,
  dictionary,
}: {
  form: FormConfig
  dictionary: Dictionary
}) {
  const formId = useId()
  const [status, setStatus] = useState<Status>('idle')
  const reasons = form.reasons ?? []

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    // The browser nulls out `currentTarget` once the event finishes
    // dispatching, so it must be captured now — using it after the `await`
    // below throws on a successful submit and masks it as a failure.
    const formEl = event.currentTarget
    const data = new FormData(formEl)

    setStatus('submitting')

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          reason: data.get('reason'),
          message: data.get('message'),
          company: data.get('company'),
        }),
      })

      if (!response.ok) throw new Error('request_failed')

      setStatus('success')
      formEl.reset()
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <span className="flex size-11 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
          <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-6" />
        </span>
        <p className="text-base font-medium text-foreground">{form.successMessage}</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Honeypot: visually hidden from real visitors, invisible to screen
          readers, but a form-filling bot will still find and fill it in. */}
      <input
        type="text"
        name="company"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="absolute -left-[9999px] h-0 w-0 opacity-0"
      />

      <Field>
        <FieldLabel htmlFor={`${formId}-name`}>{dictionary.formName}</FieldLabel>
        <Input id={`${formId}-name`} name="name" required maxLength={200} autoComplete="name" />
      </Field>

      <Field>
        <FieldLabel htmlFor={`${formId}-email`}>{dictionary.formEmail}</FieldLabel>
        <Input
          id={`${formId}-email`}
          name="email"
          type="email"
          required
          maxLength={254}
          autoComplete="email"
        />
      </Field>

      {reasons.length > 0 ? (
        <Field>
          <FieldLabel htmlFor={`${formId}-reason`}>{dictionary.formSubject}</FieldLabel>
          <NativeSelect id={`${formId}-reason`} name="reason" defaultValue="">
            <NativeSelectOption value="" disabled>
              {dictionary.formSubjectPlaceholder}
            </NativeSelectOption>
            {reasons.map((reason) => (
              <NativeSelectOption key={reason.id ?? reason.label} value={reason.label}>
                {reason.label}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </Field>
      ) : null}

      <Field>
        <FieldLabel htmlFor={`${formId}-message`}>{dictionary.formMessage}</FieldLabel>
        <Textarea
          id={`${formId}-message`}
          name="message"
          required
          maxLength={4000}
          rows={5}
          className="min-h-32"
        />
      </Field>

      {status === 'error' ? <p className="text-sm text-destructive">{dictionary.formError}</p> : null}

      <Button type="submit" disabled={status === 'submitting'} className="mt-1 self-start">
        {status === 'submitting' ? dictionary.formSending : dictionary.formSend}
      </Button>
    </form>
  )
}
