export type VideoEmbed = {
  /** `file` plays in a native <video>; everything else renders in an iframe. */
  provider: 'wistia' | 'youtube' | 'vimeo' | 'iframe' | 'file'
  src: string
}

/**
 * Turns a pasted share link into something embeddable, so an editor can drop in
 * any Wistia / YouTube / Vimeo URL without knowing embed syntax. Direct video
 * files are passed through for a native `<video>` element.
 */
export function parseVideoUrl(raw: string | null | undefined): VideoEmbed | null {
  if (!raw) return null

  const url = raw.trim()
  if (!url) return null

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) {
    return { provider: 'file', src: url }
  }

  // YouTube: youtu.be/ID, /watch?v=ID, /embed/ID, /shorts/ID
  const youtube = url.match(
    /(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{6,})/i
  )
  if (youtube) {
    return { provider: 'youtube', src: `https://www.youtube.com/embed/${youtube[1]}` }
  }

  // Vimeo: vimeo.com/ID or player.vimeo.com/video/ID
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeo) {
    return { provider: 'vimeo', src: `https://player.vimeo.com/video/${vimeo[1]}` }
  }

  // Wistia: <sub>.wistia.com/medias/ID, wistia.com/embed/ID, fast.wistia.net/embed/iframe/ID
  const wistia = url.match(/wistia\.(?:com|net)\/(?:medias|embed(?:\/iframe)?)\/([\w-]+)/i)
  if (wistia) {
    return { provider: 'wistia', src: `https://fast.wistia.net/embed/iframe/${wistia[1]}` }
  }

  // Unrecognised host: assume it is already an embed URL rather than dropping it.
  if (/^https?:\/\//i.test(url)) {
    return { provider: 'iframe', src: url }
  }

  return null
}
