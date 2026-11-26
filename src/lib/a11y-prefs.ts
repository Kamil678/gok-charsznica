/**
 * Accessibility preferences (text size, contrast mode) stored in a cookie,
 * so the server can render <html> with the right attributes on the first request.
 */

export const TEXT_SIZES = ['base', 'lg', 'xl'] as const
export type TextSize = (typeof TEXT_SIZES)[number]

export type A11yPrefs = { textSize: TextSize; highContrast: boolean }

export const A11Y_COOKIE = 'gok_a11y'

export const DEFAULT_A11Y: Readonly<A11yPrefs> = Object.freeze({
  textSize: 'base',
  highContrast: false,
})

function isTextSize(value: string): value is TextSize {
  return (TEXT_SIZES as readonly string[]).includes(value)
}

/**
 * Parses the cookie value ("<textSize>.<0|1>"). Never throws: anything unexpected
 * (tampered value, old or foreign format) falls back to the defaults.
 */
export function parseA11yPrefs(raw: string | undefined): A11yPrefs {
  const parts = raw?.split('.') ?? []
  if (parts.length !== 2) return { ...DEFAULT_A11Y }

  const [size, contrast] = parts
  return {
    textSize: isTextSize(size) ? size : DEFAULT_A11Y.textSize,
    highContrast: contrast === '1',
  }
}

export function serializeA11yPrefs(prefs: A11yPrefs): string {
  return `${prefs.textSize}.${prefs.highContrast ? '1' : '0'}`
}

/** Attributes for <html>; read by the CSS in src/app/(frontend)/styles.css. */
export function htmlAttrs(prefs: A11yPrefs): {
  'data-text-size': TextSize
  'data-contrast'?: 'high'
} {
  return prefs.highContrast
    ? { 'data-text-size': prefs.textSize, 'data-contrast': 'high' }
    : { 'data-text-size': prefs.textSize }
}
