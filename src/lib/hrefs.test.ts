import { describe, expect, it } from 'vitest'

import { toQueryString } from './hrefs'

describe('toQueryString', () => {
  it('writes nothing for no parameters', () => {
    expect(toQueryString([])).toBe('')
  })

  it('leaves a list’s commas bare, and still encodes what a query cannot hold', () => {
    expect(toQueryString([['zaner', 'drama,komedia']])).toBe('?zaner=drama,komedia')
    expect(toQueryString([['q', 'a&b, c']])).toBe('?q=a%26b,+c')
  })

  it('reads back to the same values', () => {
    const query = toQueryString([['q', 'duna, časť 2']])

    expect(new URLSearchParams(query).get('q')).toBe('duna, časť 2')
  })
})
