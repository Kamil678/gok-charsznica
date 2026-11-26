import { describe, expect, it } from 'vitest'

import {
  A11Y_COOKIE,
  DEFAULT_A11Y,
  htmlAttrs,
  parseA11yPrefs,
  serializeA11yPrefs,
} from '@/lib/a11y-prefs'

describe('parseA11yPrefs', () => {
  it('returns defaults when the cookie is missing or empty', () => {
    expect(parseA11yPrefs(undefined)).toEqual(DEFAULT_A11Y)
    expect(parseA11yPrefs('')).toEqual(DEFAULT_A11Y)
  })

  it('reads text size and contrast', () => {
    expect(parseA11yPrefs('lg.1')).toEqual({ textSize: 'lg', highContrast: true })
    expect(parseA11yPrefs('xl.0')).toEqual({ textSize: 'xl', highContrast: false })
  })

  it('falls back per part when one part is invalid', () => {
    expect(parseA11yPrefs('huge.1')).toEqual({ textSize: 'base', highContrast: true })
    expect(parseA11yPrefs('lg.2')).toEqual({ textSize: 'lg', highContrast: false })
  })

  it('returns defaults for garbage and foreign formats', () => {
    expect(parseA11yPrefs('garbage')).toEqual(DEFAULT_A11Y)
    expect(parseA11yPrefs('{"textSize":"lg"}')).toEqual(DEFAULT_A11Y)
    expect(parseA11yPrefs('lg.1.x')).toEqual(DEFAULT_A11Y)
  })

  it('returns a fresh object, never the shared defaults', () => {
    const prefs = parseA11yPrefs(undefined)
    expect(prefs).not.toBe(DEFAULT_A11Y)
    prefs.textSize = 'xl'
    expect(DEFAULT_A11Y.textSize).toBe('base')
  })
})

describe('serializeA11yPrefs', () => {
  it('uses the "<textSize>.<0|1>" format', () => {
    expect(serializeA11yPrefs(DEFAULT_A11Y)).toBe('base.0')
    expect(serializeA11yPrefs({ textSize: 'lg', highContrast: true })).toBe('lg.1')
  })

  it('round-trips through parseA11yPrefs', () => {
    const prefs = { textSize: 'xl', highContrast: true } as const
    expect(parseA11yPrefs(serializeA11yPrefs(prefs))).toEqual(prefs)
  })
})

describe('htmlAttrs', () => {
  it('sets only the text size without contrast mode', () => {
    expect(htmlAttrs({ textSize: 'lg', highContrast: false })).toStrictEqual({
      'data-text-size': 'lg',
    })
  })

  it('adds data-contrast in contrast mode', () => {
    expect(htmlAttrs({ textSize: 'base', highContrast: true })).toStrictEqual({
      'data-text-size': 'base',
      'data-contrast': 'high',
    })
  })
})

it('uses the agreed cookie name', () => {
  expect(A11Y_COOKIE).toBe('gok_a11y')
})
