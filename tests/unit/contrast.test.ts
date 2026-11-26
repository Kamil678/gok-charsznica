import { describe, expect, it } from 'vitest'

import { contrastRatio } from '@/lib/contrast'

describe('contrastRatio', () => {
  it('returns 21 for black on white', () => {
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 1)
  })

  it('matches the measured brand contrast', () => {
    expect(contrastRatio('#FFFFFF', '#2E6A4E')).toBeCloseTo(6.39, 1)
  })

  it('is case-insensitive and symmetric', () => {
    expect(contrastRatio('#2e6a4e', '#ffffff')).toBeCloseTo(6.39, 1)
  })

  it('returns 1 for identical colors', () => {
    expect(contrastRatio('#FBF8F2', '#FBF8F2')).toBe(1)
  })

  it('rejects values that are not #RRGGBB', () => {
    expect(() => contrastRatio('#FFF', '#000000')).toThrow()
    expect(() => contrastRatio('red', '#000000')).toThrow()
    expect(() => contrastRatio('#GGGGGG', '#000000')).toThrow()
  })
})
