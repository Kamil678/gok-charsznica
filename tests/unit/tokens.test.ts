import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/contrast'

const TOKENS = [
  'ink',
  'ink-muted',
  'bg',
  'surface',
  'primary',
  'primary-hover',
  'on-primary',
  'accent',
  'on-accent',
  'pastel-sage',
  'pastel-apricot',
  'pastel-butter',
  'pastel-lavender',
  'border',
  'border-strong',
  'focus',
] as const

type Token = (typeof TOKENS)[number]
type Palette = Record<string, string>

const css = readFileSync(resolve(__dirname, '../../src/app/(frontend)/styles.css'), 'utf8')

function block(selector: RegExp): string {
  const match = new RegExp(`${selector.source}\\s*\\{([^}]*)\\}`).exec(css)
  if (!match) throw new Error(`Block not found: ${selector}`)
  return match[1]
}

function colors(body: string): Palette {
  const out: Palette = {}
  for (const m of body.matchAll(/--color-([a-z-]+)\s*:\s*(#[0-9a-fA-F]{6})\s*;/g)) {
    out[m[1]] = m[2]
  }
  return out
}

const base = colors(block(/@theme/))
const high: Palette = { ...base, ...colors(block(/html\[data-contrast=['"]high['"]\]/)) }

const ratio = (p: Palette, fg: Token, bg: Token) => contrastRatio(p[fg], p[bg])

describe('design tokens', () => {
  it('defines every token from the visual direction', () => {
    for (const t of TOKENS) expect(base[t], t).toMatch(/^#[0-9A-F]{6}$/i)
  })

  describe('default mode', () => {
    it.each<[Token, Token]>([
      ['ink', 'bg'],
      ['ink', 'surface'],
      ['ink-muted', 'bg'],
      ['ink-muted', 'surface'],
      ['ink', 'pastel-sage'],
      ['ink', 'pastel-apricot'],
      ['ink', 'pastel-butter'],
      ['ink', 'pastel-lavender'],
      ['on-primary', 'primary'],
      ['on-primary', 'primary-hover'],
      ['primary', 'bg'],
      ['primary', 'surface'],
      ['on-accent', 'accent'],
      ['accent', 'bg'],
    ])('text %s on %s ≥ 4.5', (fg, bg) => {
      expect(ratio(base, fg, bg)).toBeGreaterThanOrEqual(4.5)
    })

    it.each<[Token, Token]>([
      ['border-strong', 'bg'],
      ['border-strong', 'surface'],
      ['focus', 'bg'],
    ])('UI %s on %s ≥ 3', (fg, bg) => {
      expect(ratio(base, fg, bg)).toBeGreaterThanOrEqual(3)
    })
  })

  describe('high contrast mode', () => {
    it.each<[Token, Token]>([
      ['ink', 'bg'],
      ['ink-muted', 'surface'],
      ['primary', 'bg'],
      ['accent', 'bg'],
      ['on-primary', 'primary'],
      ['on-accent', 'accent'],
    ])('%s on %s ≥ 7', (fg, bg) => {
      expect(ratio(high, fg, bg)).toBeGreaterThanOrEqual(7)
    })

    it.each<[Token, Token]>([
      ['focus', 'bg'],
      ['border-strong', 'bg'],
    ])('UI %s on %s ≥ 3', (fg, bg) => {
      expect(ratio(high, fg, bg)).toBeGreaterThanOrEqual(3)
    })
  })
})
