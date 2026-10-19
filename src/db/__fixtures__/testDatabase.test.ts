import { describe, expect, it } from 'vitest'

import { assertTestDatabase } from './testDatabase'

describe('the test database guard', () => {
  it('accepts a database named for tests', () => {
    expect(() =>
      assertTestDatabase('postgres://cinema:secret@localhost:5432/kinomat_core_test'),
    ).not.toThrow()
  })

  it('refuses the development corpus', () => {
    expect(() =>
      assertTestDatabase('postgres://cinema:secret@localhost:5432/cinema_aggregator'),
    ).toThrow(/"cinema_aggregator", which does not end in _test/)
  })

  it('refuses a hosted database whose name hides behind query parameters', () => {
    expect(() =>
      assertTestDatabase(
        'postgresql://owner:secret@ep-example.eu-central-1.aws.neon.tech/neondb?sslmode=require',
      ),
    ).toThrow(/"neondb"/)
  })
})
