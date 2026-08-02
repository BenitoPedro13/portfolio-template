/** sessionStorage key recording that the visitor dismissed the lock screen. */
export const INTRO_DISMISSED_KEY = 'portfolio:intro-dismissed'

/** Set on <html> before first paint when the lock screen has been dismissed. */
export const INTRO_SEEN_ATTR = 'data-intro-seen'

/**
 * Runs synchronously in <head>, before the browser paints anything.
 *
 * The lock screen renders on the server so it is present in the very first
 * frame — otherwise the desktop flashes before it appears. But whether a
 * returning visitor should see it lives in sessionStorage, which the server
 * cannot read. This marks the document up front so CSS can hide the lock
 * screen pre-paint, giving neither audience a flash.
 */
export const introBlockingScript = `
try {
  if (sessionStorage.getItem(${JSON.stringify(INTRO_DISMISSED_KEY)}) === '1') {
    document.documentElement.setAttribute(${JSON.stringify(INTRO_SEEN_ATTR)}, '');
  }
} catch (e) {}
`.trim()
