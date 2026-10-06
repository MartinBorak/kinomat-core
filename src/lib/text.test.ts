import { describe, expect, it } from 'vitest'

import { normalizeWhitespace } from './text'

describe('normalizeWhitespace', () => {
  it('trims surrounding whitespace', () => {
    expect(normalizeWhitespace('  Dune  ')).toBe('Dune')
  })

  it('collapses a run of spaces into one', () => {
    expect(normalizeWhitespace('Dune   Part   Two')).toBe('Dune Part Two')
  })

  it('collapses tabs and newlines, which HTML sources indent their markup with', () => {
    expect(normalizeWhitespace('\n\t\tDune\n\t\tPart Two\n\t')).toBe('Dune Part Two')
  })

  /*
   * The bug this whole choke point exists for. Slovak typography puts a non-breaking space after
   * single-letter words ("a", "i", "o", "v", "k", "s", "z") to stop them stranding at a line end,
   * so titles from every Slovak source arrive with one hiding inside them - invisible in logs and
   * JSON, but enough to break the exact string equality that matching titles across sources needs.
   */
  it('collapses a non-breaking space, which trimming alone cannot reach mid-string', () => {
    expect(normalizeWhitespace('film o láske')).toBe('film o láske')
  })

  it('collapses a mixed run of ordinary and non-breaking whitespace into a single space', () => {
    expect(normalizeWhitespace('A  \t B')).toBe('A B')
  })

  /*
   * Guards the deliberate limit on what this does. Diacritics and letter case are what distinguish
   * one Slovak word from another, so folding them here would destroy information at the storage
   * boundary; reconciling titles that differ in them is the matching layer's job, not this one's.
   */
  it('preserves diacritics and letter case', () => {
    expect(normalizeWhitespace('Šťastný Nový Rok')).toBe('Šťastný Nový Rok')
  })

  it('leaves a blank string empty rather than failing on it', () => {
    expect(normalizeWhitespace('   ')).toBe('')
  })
})
