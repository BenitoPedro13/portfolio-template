/**
 * What each seed owns.
 *
 * Running one seed after the other used to leave both sets on the desktop —
 * duplicate icons, and stale media pointing at files the current storage
 * backend never received. Each seed now removes the other's documents.
 *
 * Deliberately a fixed list rather than "delete everything not in this seed":
 * content you created in /admin must survive a re-seed.
 */
export type SeedSet = {
  desktopItems: string[]
  projects: string[]
  mediaPrefix: string
}

export const PLACEHOLDER_SET: SeedSet = {
  desktopItems: ['work', 'about', 'photo'],
  projects: ['sample-project-one', 'sample-project-two', 'sample-project-three'],
  mediaPrefix: 'placeholder-',
}

export const DEMO_SET: SeedSet = {
  desktopItems: ['trabalhos', 'sobre-mim', 'eu'],
  projects: ['the-problem', 'proximo-milionario', 'iv-iv', 'obaa-sima', 'vertigo'],
  mediaPrefix: 'demo-',
}
