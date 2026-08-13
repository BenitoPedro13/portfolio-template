import type { GlobalConfig } from 'payload'

/**
 * Every chrome element on the desktop lives here, so a template user can make
 * the site theirs without touching code.
 */
export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site',
  access: {
    read: () => true,
  },
  admin: {
    description: 'Identity, menu bar, dock, calendar, contact and lock screen.',
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        // ------------------------------------------------------------------
        {
          label: 'Identity',
          fields: [
            {
              name: 'ownerName',
              type: 'text',
              required: true,
              defaultValue: 'Your Name',
              admin: {
                description: 'Shown in the menu bar and on the lock screen.',
              },
            },
            {
              name: 'tagline',
              type: 'text',
              localized: true,
              admin: {
                description: 'Optional short line under the name on the lock screen.',
              },
            },
            {
              name: 'avatar',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'backgroundVideoUrl',
              type: 'text',
              label: 'Background video URL',
              admin: {
                description:
                  'Looping background for the desktop and lock screen, e.g. /videos/background.mp4 or a full URL. Leave blank to use only the poster image.',
              },
            },
            {
              name: 'backgroundVideoPlayback',
              type: 'select',
              defaultValue: 'normal',
              admin: {
                description:
                  'Boomerang plays forward, then reverses back to the start and repeats, instead of cutting straight back to frame one.',
                condition: (data) => Boolean(data?.backgroundVideoUrl),
              },
              options: [
                { label: 'Normal', value: 'normal' },
                { label: 'Boomerang (reverse loop)', value: 'boomerang' },
              ],
            },
            {
              name: 'backgroundPoster',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Still image shown while the video loads, or instead of it.',
              },
            },
          ],
        },

        // ------------------------------------------------------------------
        {
          label: 'Menu bar',
          fields: [
            {
              name: 'menuBar',
              type: 'group',
              label: false,
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'showNav',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'showClock',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { width: '33%' },
                    },
                    {
                      name: 'showLanguageSwitcher',
                      type: 'checkbox',
                      defaultValue: true,
                      admin: { width: '33%' },
                    },
                  ],
                },
              ],
            },
            {
              name: 'nav',
              type: 'array',
              label: 'Navigation links',
              admin: {
                description:
                  'Each link either opens one of your desktop items, closes everything, or goes to a URL.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                },
                {
                  name: 'action',
                  type: 'select',
                  required: true,
                  defaultValue: 'openItem',
                  options: [
                    { label: 'Open a desktop item', value: 'openItem' },
                    { label: 'Close all windows (home)', value: 'home' },
                    { label: 'Go to a URL', value: 'url' },
                  ],
                },
                {
                  name: 'item',
                  type: 'relationship',
                  relationTo: 'desktop-items',
                  admin: {
                    condition: (_, siblingData) => siblingData?.action === 'openItem',
                  },
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => siblingData?.action === 'url',
                  },
                },
              ],
            },
          ],
        },

        // ------------------------------------------------------------------
        {
          label: 'Dock',
          fields: [
            {
              name: 'dock',
              type: 'array',
              label: 'Dock items',
              admin: {
                description: 'The bar at the bottom of the desktop, in this order.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                  required: true,
                  localized: true,
                  admin: {
                    description: 'Tooltip shown on hover.',
                  },
                },
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  defaultValue: 'photos',
                  options: [
                    { label: 'Photos', value: 'photos' },
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'X', value: 'x' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Mail', value: 'mail' },
                    { label: 'Trash', value: 'trash' },
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
                  name: 'action',
                  type: 'select',
                  required: true,
                  defaultValue: 'link',
                  options: [
                    { label: 'Open a URL', value: 'link' },
                    { label: 'Open a desktop item', value: 'openItem' },
                    { label: 'Open the contact panel', value: 'contact' },
                    { label: 'Do nothing (decorative)', value: 'none' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  admin: {
                    condition: (_, siblingData) => siblingData?.action === 'link',
                  },
                },
                {
                  name: 'item',
                  type: 'relationship',
                  relationTo: 'desktop-items',
                  admin: {
                    condition: (_, siblingData) => siblingData?.action === 'openItem',
                  },
                },
                {
                  name: 'dividerBefore',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description: 'Draw a separator to the left of this item.',
                  },
                },
              ],
            },
          ],
        },

        // ------------------------------------------------------------------
        {
          label: 'Widgets',
          fields: [
            {
              name: 'lockScreen',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'startLabel',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Start',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'showOncePerSession',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Skip the lock screen if the visitor has already dismissed it.',
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
              ],
            },
            {
              name: 'calendar',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                },
                {
                  name: 'highlightColor',
                  type: 'text',
                  defaultValue: '#ef4444',
                  admin: {
                    description: 'Colour of today’s date. Any CSS colour.',
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
              ],
            },
          ],
        },

        // ------------------------------------------------------------------
        {
          label: 'Contact & socials',
          fields: [
            {
              name: 'contact',
              type: 'group',
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: true,
                  admin: {
                    description: 'Show the floating contact button.',
                  },
                },
                {
                  name: 'title',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Contact',
                },
                {
                  name: 'rows',
                  type: 'array',
                  label: 'Contact options',
                  fields: [
                    {
                      name: 'icon',
                      type: 'select',
                      required: true,
                      defaultValue: 'mail',
                      options: [
                        { label: 'WhatsApp', value: 'whatsapp' },
                        { label: 'Mail', value: 'mail' },
                        { label: 'Instagram', value: 'instagram' },
                        { label: 'Phone', value: 'phone' },
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
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                    {
                      name: 'subtitle',
                      type: 'text',
                      localized: true,
                    },
                    {
                      name: 'href',
                      type: 'text',
                      required: true,
                      admin: {
                        description: 'e.g. https://wa.me/351900000000 or mailto:you@example.com',
                      },
                    },
                    {
                      name: 'tint',
                      type: 'select',
                      defaultValue: 'neutral',
                      options: [
                        { label: 'Neutral', value: 'neutral' },
                        { label: 'Green', value: 'green' },
                        { label: 'Blue', value: 'blue' },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              name: 'form',
              type: 'group',
              label: 'Contact form',
              admin: {
                description:
                  'A composed message sent to your inbox by email, instead of a visitor having to open their own mail app.',
              },
              fields: [
                {
                  name: 'enabled',
                  type: 'checkbox',
                  defaultValue: false,
                  admin: {
                    description:
                      'Also requires SMTP_HOST, SMTP_PORT, SMTP_USER and SMTP_PASS to be set — see .env.example.',
                  },
                },
                {
                  name: 'recipient',
                  type: 'email',
                  admin: {
                    description: 'Where submissions are sent.',
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'heading',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Send a message',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'intro',
                  type: 'textarea',
                  localized: true,
                  admin: {
                    description: 'Optional short line above the form.',
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
                {
                  name: 'reasons',
                  type: 'array',
                  label: 'Subject options',
                  admin: {
                    description:
                      'The dropdown a visitor picks from, e.g. Partnership, Project, Contract, Other. Leave empty to hide the dropdown and just collect a message.',
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                  fields: [
                    {
                      name: 'label',
                      type: 'text',
                      required: true,
                      localized: true,
                    },
                  ],
                },
                {
                  name: 'successMessage',
                  type: 'text',
                  localized: true,
                  defaultValue: 'Thanks — message sent. I’ll get back to you soon.',
                  admin: {
                    condition: (_, siblingData) => Boolean(siblingData?.enabled),
                  },
                },
              ],
            },
            {
              name: 'socials',
              type: 'array',
              label: 'Social links',
              admin: {
                description: 'Shown at the bottom of text windows.',
              },
              fields: [
                {
                  name: 'platform',
                  type: 'select',
                  required: true,
                  options: [
                    { label: 'Instagram', value: 'instagram' },
                    { label: 'YouTube', value: 'youtube' },
                    { label: 'TikTok', value: 'tiktok' },
                    { label: 'X', value: 'x' },
                    { label: 'LinkedIn', value: 'linkedin' },
                    { label: 'WhatsApp', value: 'whatsapp' },
                    { label: 'Mail', value: 'mail' },
                  ],
                },
                {
                  name: 'url',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },

        // ------------------------------------------------------------------
        {
          label: 'SEO',
          fields: [
            {
              name: 'seo',
              type: 'group',
              label: false,
              fields: [
                {
                  name: 'siteTitle',
                  type: 'text',
                  localized: true,
                  admin: {
                    description: 'Browser tab title. Falls back to the owner name.',
                  },
                },
                {
                  name: 'siteDescription',
                  type: 'textarea',
                  localized: true,
                },
                {
                  name: 'ogImage',
                  type: 'upload',
                  relationTo: 'media',
                  label: 'Social share image',
                },
              ],
            },
          ],
        },
      ],
    },
  ],
}
