import { Temporal } from 'temporal-polyfill'
import { describe, expect, it } from 'vitest'

import {
  formatTimeOfDay,
  getBratislavaToday,
  parseBratislavaTime,
  toBratislavaInstant,
  toBratislavaYear,
} from './time'

describe('formatTimeOfDay', () => {
  /*
   * Built from explicit UTC instants rather than local components: the point of this function is
   * that it renders Bratislava's wall clock, so a host running in UTC (as most servers do) must
   * still see the Bratislava time, not its own.
   */
  it('renders a summer (CEST, UTC+2) instant as Bratislava wall-clock time', () => {
    expect(formatTimeOfDay(new Date('2026-08-27T07:05:00.000Z'))).toBe('09:05')
  })

  it('renders a winter (CET, UTC+1) instant as Bratislava wall-clock time', () => {
    expect(formatTimeOfDay(new Date('2026-01-15T17:30:00.000Z'))).toBe('18:30')
  })

  it('formats midnight as 00:00', () => {
    expect(formatTimeOfDay(new Date('2026-01-14T23:00:00.000Z'))).toBe('00:00')
  })
})

describe('parseBratislavaTime', () => {
  it('interprets a summer (CEST, UTC+2) local time correctly', () => {
    expect(parseBratislavaTime('2026-08-27T10:00:00').toISOString()).toBe(
      '2026-08-27T08:00:00.000Z',
    )
  })

  it('interprets a winter (CET, UTC+1) local time correctly', () => {
    expect(parseBratislavaTime('2026-01-15T10:00:00').toISOString()).toBe(
      '2026-01-15T09:00:00.000Z',
    )
  })
})

describe('toBratislavaYear', () => {
  it('returns the year the screening falls in', () => {
    expect(toBratislavaYear(new Date('2026-08-27T07:05:00.000Z'))).toBe(2026)
  })

  // The case a UTC year would get wrong: a late screening whose own calendar has not turned over.
  it('returns the Bratislava year for a screening UTC still dates to the previous one', () => {
    expect(toBratislavaYear(new Date('2025-12-31T23:30:00.000Z'))).toBe(2026)
  })
})

describe('toBratislavaInstant', () => {
  it('resolves a summer (CEST, UTC+2) date and time to the right instant', () => {
    const instant = toBratislavaInstant(Temporal.PlainDate.from('2026-08-27'), '19:00')

    expect(instant.toISOString()).toBe('2026-08-27T17:00:00.000Z')
  })

  it('resolves a winter (CET, UTC+1) date and time to the right instant', () => {
    const instant = toBratislavaInstant(Temporal.PlainDate.from('2026-01-15'), '19:00')

    expect(instant.toISOString()).toBe('2026-01-15T18:00:00.000Z')
  })

  /*
   * The daylight-saving switch happens overnight, so a showing later that same evening is already
   * on the new offset - the reason this conversion has to know the date, not just the time.
   */
  it('uses the offset in force on the given date, across a daylight-saving switch', () => {
    const beforeSwitch = toBratislavaInstant(Temporal.PlainDate.from('2026-03-28'), '19:00')
    const afterSwitch = toBratislavaInstant(Temporal.PlainDate.from('2026-03-29'), '19:00')

    expect(beforeSwitch.toISOString()).toBe('2026-03-28T18:00:00.000Z')
    expect(afterSwitch.toISOString()).toBe('2026-03-29T17:00:00.000Z')
  })
})

describe('getBratislavaToday', () => {
  /*
   * Can't assert a fixed value without freezing the clock, but it must agree with what the same
   * instant looks like on Bratislava's calendar - which is what would break on a UTC host if this
   * read the host's own calendar day instead.
   */
  it("returns the current date on Bratislava's calendar", () => {
    const expected = Temporal.Now.instant().toZonedDateTimeISO('Europe/Bratislava').toPlainDate()

    expect(getBratislavaToday().equals(expected)).toBe(true)
  })
})
