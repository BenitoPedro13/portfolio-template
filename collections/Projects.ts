import type { CollectionConfig } from 'payload'

import { slugField } from './fields/slug'

export const Projects: CollectionConfig = {
  slug: 'projects',
  labels: {
    singular: 'Project',
    plural: 'Projects',
  },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'year', 'order'],
    description: 'Individual works shown inside a folder window.',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      localized: true,
    },
    slugField('title'),
    {
      name: 'year',
      type: 'text',
      admin: {
        description: 'Shown under the title on the project card.',
      },
    },
    {
      name: 'cover',
      type: 'upload',
      relationTo: 'media',
      required: true,
      admin: {
        description: 'Thumbnail used in the folder window and as the video poster.',
      },
    },
    {
      name: 'videoUrl',
      type: 'text',
      label: 'Video URL',
      admin: {
        description: 'Wistia, YouTube or Vimeo link. Leave blank to show the cover image instead.',
      },
    },
    {
      name: 'meta',
      type: 'array',
      label: 'Credits',
      labels: {
        singular: 'Credit',
        plural: 'Credits',
      },
      admin: {
        description:
          'Shown as a single line under the title, e.g. Role · Direction, Client · Nike, Format · 4K.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '40%' },
            },
            {
              name: 'value',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '60%' },
            },
          ],
        },
      ],
    },
    {
      name: 'description',
      type: 'richText',
      localized: true,
    },
    {
      name: 'gallery',
      type: 'array',
      labels: {
        singular: 'Image',
        plural: 'Images',
      },
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
          required: true,
        },
      ],
    },
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first.',
      },
    },
  ],
}
