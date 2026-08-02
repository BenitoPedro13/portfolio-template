import type { Field, FieldHook } from 'payload'

export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Falls back to a slugified version of `sourceField` when the editor leaves the
 * slug blank. The slug is intentionally not localized — it is a URL parameter.
 */
function fillFromSource(sourceField: string): FieldHook {
  return ({ data, value }) => {
    if (typeof value === 'string' && value.length > 0) {
      return slugify(value)
    }

    const source = data?.[sourceField]

    return typeof source === 'string' ? slugify(source) : value
  }
}

export function slugField(sourceField: string): Field {
  return {
    name: 'slug',
    type: 'text',
    unique: true,
    index: true,
    admin: {
      position: 'sidebar',
      description: 'Used in the URL. Leave blank to generate it automatically.',
    },
    hooks: {
      beforeValidate: [fillFromSource(sourceField)],
    },
  }
}
