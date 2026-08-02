import { defaultLocale, isLocale, locales, type Locale } from './locales'

export { defaultLocale, isLocale, locales }
export type { Locale }

/** Display names for the language switcher; unlisted codes fall back to uppercase. */
const LOCALE_LABELS: Record<string, string> = {
  pt: 'Português',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  nl: 'Nederlands',
}

export function localeLabel(locale: string): string {
  return LOCALE_LABELS[locale] ?? locale.toUpperCase()
}

export function localeShortLabel(locale: string): string {
  return locale.toUpperCase()
}

/**
 * Every user-visible string that is NOT editable in the CMS lives here.
 *
 * Anything an editor would plausibly want to change (names, labels, body copy,
 * button captions) belongs in Payload instead — see `globals/Site.ts`. What is
 * left is chrome: accessible labels, window controls, and error pages.
 *
 * `Dictionary` is declared up front on purpose: adding a key here is a type
 * error in every locale until it is translated, so nothing can be silently
 * left in English. Never inline a literal in a component — add it here first.
 */
export type Dictionary = {
  back: string
  close: string
  openMenu: string
  closeMenu: string
  menu: string
  language: string
  previous: string
  next: string
  desktop: string
  loading: string
  notFoundCode: string
  notFoundTitle: string
  notFoundAction: string
  /** Finder-style readout in the window title bar. */
  kindFolder: string
  kindText: string
  kindImage: string
  /** Pluralised item count; `{n}` is replaced with the number. */
  itemCountOne: string
  itemCountMany: string
  nowShowing: string
}

const STRINGS: Record<string, Dictionary> = {
  en: {
    back: 'Back',
    close: 'Close',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
    menu: 'Menu',
    language: 'Language',
    previous: 'Previous',
    next: 'Next',
    desktop: 'Desktop',
    loading: 'Loading',
    notFoundCode: '404',
    notFoundTitle: 'This page doesn’t exist',
    notFoundAction: 'Back to the desktop',
    kindFolder: 'Folder',
    kindText: 'Text',
    kindImage: 'Image',
    itemCountOne: '{n} item',
    itemCountMany: '{n} items',
    nowShowing: 'Now showing',
  },
  pt: {
    back: 'Voltar',
    close: 'Fechar',
    openMenu: 'Abrir menu',
    closeMenu: 'Fechar menu',
    menu: 'Menu',
    language: 'Idioma',
    previous: 'Anterior',
    next: 'Seguinte',
    desktop: 'Ambiente de trabalho',
    loading: 'A carregar',
    notFoundCode: '404',
    notFoundTitle: 'Esta página não existe',
    notFoundAction: 'Voltar ao ambiente de trabalho',
    kindFolder: 'Pasta',
    kindText: 'Texto',
    kindImage: 'Imagem',
    itemCountOne: '{n} item',
    itemCountMany: '{n} itens',
    nowShowing: 'A mostrar',
  },
  es: {
    back: 'Volver',
    close: 'Cerrar',
    openMenu: 'Abrir menú',
    closeMenu: 'Cerrar menú',
    menu: 'Menú',
    language: 'Idioma',
    previous: 'Anterior',
    next: 'Siguiente',
    desktop: 'Escritorio',
    loading: 'Cargando',
    notFoundCode: '404',
    notFoundTitle: 'Esta página no existe',
    notFoundAction: 'Volver al escritorio',
    kindFolder: 'Carpeta',
    kindText: 'Texto',
    kindImage: 'Imagen',
    itemCountOne: '{n} elemento',
    itemCountMany: '{n} elementos',
    nowShowing: 'Mostrando',
  },
  fr: {
    back: 'Retour',
    close: 'Fermer',
    openMenu: 'Ouvrir le menu',
    closeMenu: 'Fermer le menu',
    menu: 'Menu',
    language: 'Langue',
    previous: 'Précédent',
    next: 'Suivant',
    desktop: 'Bureau',
    loading: 'Chargement',
    notFoundCode: '404',
    notFoundTitle: 'Cette page n’existe pas',
    notFoundAction: 'Retour au bureau',
    kindFolder: 'Dossier',
    kindText: 'Texte',
    kindImage: 'Image',
    itemCountOne: '{n} élément',
    itemCountMany: '{n} éléments',
    nowShowing: 'À l’affiche',
  },
}

export function getDictionary(locale: string): Dictionary {
  return STRINGS[locale] ?? STRINGS[defaultLocale] ?? STRINGS.en
}

/**
 * BCP 47 tag for `Intl`. Payload locale codes are plain languages, so region
 * hints are added where the difference is visible in date formatting.
 */
const INTL_TAGS: Record<string, string> = {
  pt: 'pt-PT',
  en: 'en-GB',
}

export function intlLocale(locale: string): string {
  return INTL_TAGS[locale] ?? locale
}

/** Fills `{n}` in a count string and picks the right plural form. */
export function formatCount(dictionary: Dictionary, n: number): string {
  const template = n === 1 ? dictionary.itemCountOne : dictionary.itemCountMany

  return template.replace('{n}', String(n))
}
