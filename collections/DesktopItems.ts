import type { CollectionConfig } from 'payload'

import { slugField } from './fields/slug'

export const DesktopItems: CollectionConfig = {
  slug: 'desktop-items',
  labels: {
    singular: 'Desktop item',
    plural: 'Desktop items',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'type', 'placement', 'order', 'visible'],
    description: 'The icons sitting on the desktop. Each one opens a window when clicked.',
  },
  access: {
    read: () => true,
  },
  defaultSort: 'order',
  fields: [
    {
      name: 'label',
      type: 'text',
      required: true,
      localized: true,
      admin: {
        description: 'Caption under the icon, and the window title.',
      },
    },
    slugField('label'),
    {
      name: 'type',
      type: 'select',
      required: true,
      defaultValue: 'folder',
      options: [
        { label: 'Folder (a list of projects)', value: 'folder' },
        { label: 'Text file (rich text)', value: 'text' },
        { label: 'Image', value: 'image' },
        { label: 'Link (opens a URL instead of a window)', value: 'link' },
      ],
    },

    // --- Appearance -------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Appearance',
      fields: [
        {
          name: 'icon',
          type: 'select',
          required: true,
          defaultValue: 'folder',
          options: [
            { label: 'Folder', value: 'folder' },
            { label: 'File', value: 'file' },
            { label: 'Use this item’s own image', value: 'self' },
            { label: 'Custom upload', value: 'custom' },
          ],
        },
        {
          name: 'customIcon',
          type: 'upload',
          relationTo: 'media',
          admin: {
            condition: (_, siblingData) => siblingData?.icon === 'custom',
          },
        },
        {
          name: 'iconColor',
          type: 'text',
          defaultValue: '#f04a3f',
          admin: {
            description: 'Tint for the built-in folder and file icons. Any CSS colour.',
            condition: (_, siblingData) =>
              siblingData?.icon === 'folder' || siblingData?.icon === 'file',
          },
        },
      ],
    },

    // --- Placement --------------------------------------------------------
    {
      type: 'collapsible',
      label: 'Placement',
      fields: [
        {
          name: 'placement',
          type: 'select',
          required: true,
          defaultValue: 'stack',
          options: [
            { label: 'Stack (top-left column)', value: 'stack' },
            { label: 'Free (anywhere on the desktop)', value: 'free' },
          ],
        },
        {
          type: 'row',
          admin: {
            condition: (_, siblingData) => siblingData?.placement === 'free',
          },
          fields: [
            {
              name: 'x',
              type: 'number',
              defaultValue: 60,
              min: 0,
              max: 100,
              admin: {
                width: '50%',
                description: 'Horizontal position, % from the left.',
              },
            },
            {
              name: 'y',
              type: 'number',
              defaultValue: 40,
              min: 0,
              max: 100,
              admin: {
                width: '50%',
                description: 'Vertical position, % from the top.',
              },
            },
          ],
        },
      ],
    },

    // --- Content, per type ------------------------------------------------
    {
      name: 'projects',
      type: 'relationship',
      relationTo: 'projects',
      hasMany: true,
      admin: {
        condition: (data) => data?.type === 'folder',
        description: 'Projects shown inside this folder, in this order.',
      },
    },
    {
      name: 'body',
      type: 'richText',
      localized: true,
      admin: {
        condition: (data) => data?.type === 'text',
      },
    },
    {
      name: 'showSocials',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        condition: (data) => data?.type === 'text',
        description: 'Show the social links row at the bottom of this window.',
      },
    },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (data) => data?.type === 'image',
      },
    },
    {
      name: 'url',
      type: 'text',
      admin: {
        condition: (data) => data?.type === 'link',
      },
    },

    // --- Sidebar ----------------------------------------------------------
    {
      name: 'order',
      type: 'number',
      defaultValue: 0,
      admin: {
        position: 'sidebar',
        description: 'Lower numbers appear first in the stack.',
      },
    },
    {
      name: 'visible',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}
