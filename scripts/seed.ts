/**
 * Default template seed — neutral placeholder content.
 *
 *   pnpm seed
 *
 * Safe to re-run: everything is upserted by slug. Replace all of it from
 * /admin once you have your own content, or run `pnpm seed:demo` to see the
 * template filled in with example work.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import {
  placeholderImage,
  pick,
  removeSeedSet,
  richText,
  upsertBySlug,
  upsertSite,
} from './lib/seed-helpers'
import { DEMO_SET } from './lib/seed-sets'

const t = {
  work: { pt: 'Trabalhos', en: 'Work' },
  about: { pt: 'sobre.txt', en: 'about.txt' },
  photo: { pt: 'foto.png', en: 'photo.png' },
  home: { pt: 'Início', en: 'Home' },
  start: { pt: 'Iniciar', en: 'Start' },
  contact: { pt: 'Contacto', en: 'Contact' },
  email: { pt: 'Email', en: 'Email' },
  whatsapp: { pt: 'WhatsApp', en: 'WhatsApp' },
  quickReply: { pt: 'Resposta rápida', en: 'Quick reply' },
  photos: { pt: 'Fotos', en: 'Photos' },
  trash: { pt: 'Reciclagem', en: 'Trash' },
  tagline: { pt: 'Portefólio', en: 'Portfolio' },
  description: {
    pt: 'Portefólio pessoal. Substitua este texto no painel de administração.',
    en: 'Personal portfolio. Replace this text in the admin panel.',
  },
}

const aboutBody = {
  pt: [
    { heading: 'Sobre mim' } as const,
    'Escreva aqui a sua apresentação. Este texto vem do painel de administração, em Desktop items → sobre.txt.',
    'Pode usar vários parágrafos, títulos, negrito e ligações. Tudo o que escrever aqui aparece nesta janela.',
  ],
  en: [
    { heading: 'About me' } as const,
    'Write your introduction here. This text comes from the admin panel, under Desktop items → about.txt.',
    'You can use several paragraphs, headings, bold text and links. Everything you write here shows up in this window.',
  ],
}

const projects = [
  {
    slug: 'sample-project-one',
    title: { pt: 'Projeto Um', en: 'Sample Project One' },
    year: '2026',
    from: '#101013', to: '#3b3b44',
    description: {
      pt: 'Uma breve descrição do projeto. Adicione um vídeo, uma galeria e o texto que quiser.',
      en: 'A short description of the project. Add a video, a gallery and whatever copy you like.',
    },
  },
  {
    slug: 'sample-project-two',
    title: { pt: 'Projeto Dois', en: 'Sample Project Two' },
    year: '2026',
    from: '#12100f', to: '#46403a',
    description: {
      pt: 'Cada projeto pode ter um vídeo do Wistia, YouTube ou Vimeo, além de uma galeria de imagens.',
      en: 'Each project can carry a Wistia, YouTube or Vimeo video, plus an image gallery.',
    },
  },
  {
    slug: 'sample-project-three',
    title: { pt: 'Projeto Três', en: 'Sample Project Three' },
    year: '2025',
    from: '#0e1113', to: '#39454b',
    description: {
      pt: 'Reordene os projetos com o campo "order" na barra lateral.',
      en: 'Reorder projects with the "order" field in the sidebar.',
    },
  },
]

async function seed() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding placeholder content…')

  // Replace the demo desktop rather than stacking on top of it.
  await removeSeedSet(payload, DEMO_SET)

  // --- Media ---------------------------------------------------------------
  const background = await placeholderImage(payload, {
    filename: 'placeholder-background.png',
    alt: { pt: 'Fundo', en: 'Background' },
    width: 1920,
    height: 1080,
    from: '#0a0a0b',
    to: '#2a2a2f',
  })

  const avatar = await placeholderImage(payload, {
    filename: 'placeholder-avatar.png',
    alt: { pt: 'Retrato', en: 'Portrait' },
    width: 600,
    height: 600,
    from: '#26262b',
    to: '#5c5c66',
  })

  const covers = await Promise.all(
    projects.map((project) =>
      placeholderImage(payload, {
        filename: `placeholder-${project.slug}.png`,
        alt: project.title,
        from: project.from,
        to: project.to,
      })
    )
  )

  // --- Projects ------------------------------------------------------------
  const projectIds: number[] = []

  for (const [index, project] of projects.entries()) {
    const id = await upsertBySlug(payload, 'projects', project.slug, (locale) => ({
      title: pick(project.title, locale),
      year: project.year,
      cover: covers[index].id,
      description: richText([pick(project.description, locale)]),
      order: index,
    }))

    projectIds.push(id)
  }

  // --- Desktop items -------------------------------------------------------
  const workId = await upsertBySlug(payload, 'desktop-items', 'work', (locale) => ({
    label: pick(t.work, locale),
    type: 'folder',
    icon: 'folder',
    iconColor: '#f04a3f',
    placement: 'stack',
    order: 0,
    visible: true,
    projects: projectIds,
  }))

  const aboutId = await upsertBySlug(payload, 'desktop-items', 'about', (locale) => ({
    label: pick(t.about, locale),
    type: 'text',
    icon: 'file',
    iconColor: '#f04a3f',
    placement: 'stack',
    order: 1,
    visible: true,
    showSocials: true,
    body: richText(pick(aboutBody, locale)),
  }))

  const photoId = await upsertBySlug(payload, 'desktop-items', 'photo', (locale) => ({
    label: pick(t.photo, locale),
    type: 'image',
    icon: 'self',
    placement: 'free',
    x: 62,
    y: 42,
    order: 2,
    visible: true,
    image: avatar.id,
  }))

  // --- Site ----------------------------------------------------------------
  await upsertSite(payload, (locale) => ({
    ownerName: 'Your Name',
    tagline: pick(t.tagline, locale),
    avatar: avatar.id,
    backgroundVideoUrl: '',
    backgroundPoster: background.id,
    menuBar: {
      showNav: true,
      showClock: true,
      showLanguageSwitcher: true,
    },
    nav: [
      { label: pick(t.home, locale), action: 'home' },
      { label: pick(t.work, locale), action: 'openItem', item: workId },
      { label: pick(t.about, locale), action: 'openItem', item: aboutId },
    ],
    dock: [
      { label: pick(t.photos, locale), icon: 'photos', action: 'openItem', item: photoId },
      { label: 'Instagram', icon: 'instagram', action: 'link', url: 'https://instagram.com/' },
      { label: 'YouTube', icon: 'youtube', action: 'link', url: 'https://youtube.com/' },
      { label: 'TikTok', icon: 'tiktok', action: 'link', url: 'https://tiktok.com/' },
      { label: pick(t.email, locale), icon: 'mail', action: 'link', url: 'mailto:you@example.com' },
      { label: pick(t.trash, locale), icon: 'trash', action: 'none', dividerBefore: true },
    ],
    lockScreen: {
      enabled: true,
      startLabel: pick(t.start, locale),
      showOncePerSession: true,
    },
    calendar: {
      enabled: true,
      highlightColor: '#ef4444',
    },
    contact: {
      enabled: true,
      title: pick(t.contact, locale),
      rows: [
        {
          icon: 'whatsapp',
          label: pick(t.whatsapp, locale),
          subtitle: pick(t.quickReply, locale),
          href: 'https://wa.me/000000000000',
          tint: 'green',
        },
        {
          icon: 'mail',
          label: pick(t.email, locale),
          subtitle: 'you@example.com',
          href: 'mailto:you@example.com',
          tint: 'neutral',
        },
      ],
    },
    socials: [
      { platform: 'instagram', url: 'https://instagram.com/' },
      { platform: 'youtube', url: 'https://youtube.com/' },
      { platform: 'tiktok', url: 'https://tiktok.com/' },
      { platform: 'mail', url: 'mailto:you@example.com' },
    ],
    seo: {
      siteTitle: 'Your Name',
      siteDescription: pick(t.description, locale),
      ogImage: background.id,
    },
  }))

  payload.logger.info('Done. Open /admin to replace this with your own content.')
  process.exit(0)
}

await seed()
