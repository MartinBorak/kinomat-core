import { describe, expect, it } from 'vitest'

import { findMigrationName } from './migrationName'

describe('findMigrationName', () => {
  it('reads a name written either way a flag can be', () => {
    expect(findMigrationName(['--name=add_screening_language'])).toBe('add_screening_language')
    expect(findMigrationName(['--name', 'add_screening_language'])).toBe('add_screening_language')
  })

  it('reads a name given alongside other flags', () => {
    expect(findMigrationName(['--custom', '--name=backfill_csfd_ids'])).toBe('backfill_csfd_ids')
  })

  /*
   * The whole reason this exists: with no name drizzle-kit invents one from a wordlist of Marvel
   * characters, and 0000_early_shinobi_shaw tells nobody what the migration did.
   */
  it('finds no name where none was given', () => {
    expect(findMigrationName([])).toBeNull()
    expect(findMigrationName(['--custom'])).toBeNull()
  })

  // An empty or absent value is the flag typed and then forgotten, which is not a name either.
  it('finds no name in a flag with nothing after it', () => {
    expect(findMigrationName(['--name='])).toBeNull()
    expect(findMigrationName(['--name'])).toBeNull()
  })

  // The next option is the next option, never this one's value.
  it('does not take a following flag as the name', () => {
    expect(findMigrationName(['--name', '--custom'])).toBeNull()
  })

  // A name has to survive being a filename, and match the lower_snake_case the index prefix reads as.
  it('refuses a name that would not make a sensible filename', () => {
    expect(findMigrationName(['--name=Add Screening Language'])).toBeNull()
    expect(findMigrationName(['--name=add-screening-language'])).toBeNull()
    expect(findMigrationName(['--name=AddScreeningLanguage'])).toBeNull()
    expect(findMigrationName(['--name=add__screening'])).toBeNull()
  })
})
