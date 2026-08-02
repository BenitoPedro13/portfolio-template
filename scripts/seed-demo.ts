/**
 * Demo seed — fills the template with example work so you can see it finished.
 *
 *   pnpm seed:demo
 *
 * This is the ONLY file in the repo carrying example personal content. Run
 * `pnpm seed` to go back to neutral placeholders, and delete this file once you
 * have your own content in place.
 *
 * Images are generated locally (see `placeholderImage`) — swap them for real
 * stills in /admin. Videos point at Google's public sample bucket and a
 * Creative Commons YouTube upload purely to exercise the native, iframe and
 * no-video code paths.
 */
import { getPayload } from 'payload'

import config from '../payload.config'
import { placeholderImage, pick, richText, upsertBySlug, upsertSite } from './lib/seed-helpers'

const SAMPLE_MP4 =
  'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
const SAMPLE_YOUTUBE = 'https://www.youtube.com/watch?v=aqz-KE-bpKQ'

const t = {
  work: { pt: 'Trabalhos', en: 'Work' },
  about: { pt: 'sobre_mim.txt', en: 'about_me.txt' },
  photo: { pt: 'Eu.png', en: 'Me.png' },
  home: { pt: 'Início', en: 'Home' },
  portfolio: { pt: 'Portfólio', en: 'Portfolio' },
  aboutNav: { pt: 'Sobre', en: 'About' },
  start: { pt: 'Iniciar', en: 'Start' },
  contact: { pt: 'Contacto', en: 'Contact' },
  email: { pt: 'Email', en: 'Email' },
  quickReply: { pt: 'Resposta rápida', en: 'Quick reply' },
  photos: { pt: 'Fotos', en: 'Photos' },
  trash: { pt: 'Reciclagem', en: 'Trash' },
  tagline: { pt: 'Videógrafo & Fotógrafo', en: 'Videographer & Photographer' },
  seoDescription: {
    pt: 'Videógrafo, fotógrafo e criador de conteúdo. Narrativas visuais com impacto.',
    en: 'Videographer, photographer and content creator. Visual storytelling with impact.',
  },
  role: { pt: 'Direção', en: 'Direction' },
  format: { pt: 'Formato', en: 'Format' },
  client: { pt: 'Cliente', en: 'Client' },
}

const OWNER = 'Herence Júnior'
const EMAIL = 'herencejunior1@gmail.com'
const INSTAGRAM = 'https://instagram.com/herenceoficial'
const YOUTUBE = 'https://youtube.com/@herenceoficial'
const TIKTOK = 'https://tiktok.com/@herenceoficial'

const aboutBody = {
  pt: [
    { heading: 'Sobre mim' } as const,
    'Sou Herence Júnior, videógrafo, fotógrafo e criador de conteúdo focado em transformar ideias em narrativas visuais com impacto.',
    'A minha base está no vídeo, mas o meu olhar também passa pela fotografia, direção criativa e construção de identidade visual. Gosto de criar imagens que não servem apenas para serem vistas, mas para comunicar, conectar e deixar marca.',
    'Trabalho com artistas, marcas e projetos criativos que procuram mais do que estética: procuram intenção, linguagem e presença. Para mim, cada projeto é uma oportunidade de contar uma história de forma autêntica, cinematográfica e estratégica.',
    'Assino o meu trabalho com autenticidade, criatividade e propósito — porque acredito que uma boa imagem não só chama atenção, mas também transmite identidade.',
  ],
  en: [
    { heading: 'About me' } as const,
    'I am Herence Júnior, a videographer, photographer and content creator focused on turning ideas into visual stories with impact.',
    'Video is my foundation, but my eye also covers photography, creative direction and visual identity. I like making images that do not just get looked at, but communicate, connect and leave a mark.',
    'I work with artists, brands and creative projects that want more than aesthetics: they want intent, language and presence. Every project is a chance to tell a story authentically, cinematically and strategically.',
    'I sign my work with authenticity, creativity and purpose — because a good image does not only draw attention, it carries identity.',
  ],
}

const projects = [
  {
    slug: 'the-problem',
    title: { pt: 'The Problem', en: 'The Problem' },
    year: '2025',
    from: '#151217',
    to: '#4a3f4c',
    videoUrl: SAMPLE_MP4,
    meta: [
      { label: t.role, value: { pt: 'Direção & Câmara', en: 'Direction & Camera' } },
      { label: t.format, value: { pt: '4K · 2.39:1', en: '4K · 2.39:1' } },
    ],
    description: {
      pt: 'Um retrato íntimo construído com luz suave e enquadramentos apertados. A ideia era deixar o silêncio fazer o trabalho pesado.',
      en: 'An intimate portrait built on soft light and tight framing. The idea was to let silence do the heavy lifting.',
    },
  },
  {
    slug: 'proximo-milionario',
    title: { pt: 'Próximo Milionário', en: 'Next Millionaire' },
    year: '2025',
    from: '#101711',
    to: '#3d4c33',
    videoUrl: SAMPLE_YOUTUBE,
    meta: [
      { label: t.role, value: { pt: 'Videoclipe', en: 'Music video' } },
      { label: t.client, value: { pt: 'Artista independente', en: 'Independent artist' } },
    ],
    description: {
      pt: 'Rodado ao pôr do sol, numa única tarde, com uma equipa de duas pessoas. Movimento constante, sem tripé.',
      en: 'Shot at golden hour in a single afternoon with a two-person crew. Constant movement, no tripod.',
    },
  },
  {
    slug: 'iv-iv',
    title: { pt: 'IV/IV', en: 'IV/IV' },
    year: '2025',
    from: '#0d1114',
    to: '#37454e',
    videoUrl: SAMPLE_MP4,
    meta: [
      { label: t.role, value: { pt: 'Direção', en: 'Direction' } },
      { label: t.format, value: { pt: '4K · 16:9', en: '4K · 16:9' } },
    ],
    description: {
      pt: 'Na calma da noite, onde muitos veem apenas escuridão, aprendi a reconhecer pequenas luzes — aquelas que não fazem barulho, mas guiam. Neste 4 de abril, não celebro só mais um ano… celebro a jornada. As quedas, os recomeços, as orações feitas em silêncio, e a graça de ainda estar aqui.',
      en: 'In the calm of the night, where many see only darkness, I learned to notice small lights — the ones that make no noise but still guide you. This 4 April I am not marking another year, I am marking the journey. The falls, the restarts, the prayers said in silence, and the grace of still being here.',
    },
  },
  {
    slug: 'obaa-sima',
    title: { pt: 'Obaa Sima', en: 'Obaa Sima' },
    year: '2025',
    from: '#131313',
    to: '#3e3a35',
    videoUrl: null,
    meta: [
      { label: t.role, value: { pt: 'Fotografia', en: 'Photography' } },
      { label: t.format, value: { pt: 'Stills · 3:2', en: 'Stills · 3:2' } },
    ],
    description: {
      pt: 'Série fotográfica em preto e branco. Sem vídeo — mostra como a janela se comporta quando um projeto é só imagem.',
      en: 'A black and white photo series. No video — this shows how the window behaves when a project is stills only.',
    },
  },
  {
    slug: 'vertigo',
    title: { pt: 'Vertigo', en: 'Vertigo' },
    year: '2024',
    from: '#17121a',
    to: '#463650',
    videoUrl: SAMPLE_MP4,
    meta: [
      { label: t.role, value: { pt: 'Direção & Montagem', en: 'Direction & Edit' } },
      { label: t.format, value: { pt: '6K · 4:3', en: '6K · 4:3' } },
    ],
    description: {
      pt: 'Experiência mais solta, quase toda à mão livre, com foco em textura e grão.',
      en: 'A looser experiment, almost entirely handheld, focused on texture and grain.',
    },
  },
]

async function seed() {
  const payload = await getPayload({ config })

  payload.logger.info('Seeding demo content…')

  const background = await placeholderImage(payload, {
    filename: 'demo-background.png',
    alt: { pt: 'Paisagem ao anoitecer', en: 'Landscape at dusk' },
    width: 1920,
    height: 1080,
    from: '#08080a',
    to: '#31313a',
  })

  const avatar = await placeholderImage(payload, {
    filename: 'demo-avatar.png',
    alt: { pt: 'Retrato de Herence Júnior', en: 'Portrait of Herence Júnior' },
    width: 600,
    height: 600,
    from: '#1e1e22',
    to: '#61616c',
  })

  // Covers plus two gallery stills per project, so the gallery grid is exercised.
  const media = await Promise.all(
    projects.map(async (project) => ({
      cover: await placeholderImage(payload, {
        filename: `demo-${project.slug}.png`,
        alt: project.title,
        from: project.from,
        to: project.to,
      }),
      gallery: await Promise.all(
        [1, 2].map((n) =>
          placeholderImage(payload, {
            filename: `demo-${project.slug}-still-${n}.png`,
            alt: project.title,
            width: 1400,
            height: 900,
            from: project.to,
            to: project.from,
          })
        )
      ),
    }))
  )

  const projectIds: number[] = []

  for (const [index, project] of projects.entries()) {
    const id = await upsertBySlug(payload, 'projects', project.slug, (locale) => ({
      title: pick(project.title, locale),
      year: project.year,
      cover: media[index].cover.id,
      videoUrl: project.videoUrl,
      meta: project.meta.map((entry) => ({
        label: pick(entry.label, locale),
        value: pick(entry.value, locale),
      })),
      description: richText([pick(project.description, locale)]),
      gallery: media[index].gallery.map((image) => ({ image: image.id })),
      order: index,
    }))

    projectIds.push(id)
  }

  const workId = await upsertBySlug(payload, 'desktop-items', 'trabalhos', (locale) => ({
    label: pick(t.work, locale),
    type: 'folder',
    icon: 'folder',
    iconColor: '#f04a3f',
    placement: 'stack',
    order: 0,
    visible: true,
    projects: projectIds,
  }))

  const aboutId = await upsertBySlug(payload, 'desktop-items', 'sobre-mim', (locale) => ({
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

  const photoId = await upsertBySlug(payload, 'desktop-items', 'eu', (locale) => ({
    label: pick(t.photo, locale),
    type: 'image',
    icon: 'self',
    placement: 'free',
    x: 62,
    y: 40,
    order: 2,
    visible: true,
    image: avatar.id,
  }))

  await upsertSite(payload, (locale) => ({
    ownerName: OWNER,
    tagline: pick(t.tagline, locale),
    avatar: avatar.id,
    backgroundVideoUrl: '',
    backgroundPoster: background.id,
    menuBar: { showNav: true, showClock: true, showLanguageSwitcher: true },
    nav: [
      { label: pick(t.home, locale), action: 'home' },
      { label: pick(t.portfolio, locale), action: 'openItem', item: workId },
      { label: pick(t.aboutNav, locale), action: 'openItem', item: aboutId },
    ],
    dock: [
      { label: pick(t.photos, locale), icon: 'photos', action: 'openItem', item: photoId },
      { label: 'Instagram', icon: 'instagram', action: 'link', url: INSTAGRAM },
      { label: 'YouTube', icon: 'youtube', action: 'link', url: YOUTUBE },
      { label: 'TikTok', icon: 'tiktok', action: 'link', url: TIKTOK },
      { label: pick(t.email, locale), icon: 'mail', action: 'link', url: `mailto:${EMAIL}` },
      { label: pick(t.trash, locale), icon: 'trash', action: 'none', dividerBefore: true },
    ],
    lockScreen: {
      enabled: true,
      startLabel: pick(t.start, locale),
      showOncePerSession: true,
    },
    calendar: { enabled: true, highlightColor: '#ef4444' },
    contact: {
      enabled: true,
      title: pick(t.contact, locale),
      rows: [
        {
          icon: 'whatsapp',
          label: 'WhatsApp',
          subtitle: pick(t.quickReply, locale),
          href: 'https://wa.me/351900000000',
          tint: 'green',
        },
        {
          icon: 'mail',
          label: pick(t.email, locale),
          subtitle: EMAIL,
          href: `mailto:${EMAIL}`,
          tint: 'neutral',
        },
      ],
    },
    socials: [
      { platform: 'instagram', url: INSTAGRAM },
      { platform: 'youtube', url: YOUTUBE },
      { platform: 'tiktok', url: TIKTOK },
      { platform: 'mail', url: `mailto:${EMAIL}` },
    ],
    seo: {
      siteTitle: OWNER,
      siteDescription: pick(t.seoDescription, locale),
      ogImage: background.id,
    },
  }))

  payload.logger.info('Demo content ready. Run `pnpm seed` to return to placeholders.')
  process.exit(0)
}

await seed()
