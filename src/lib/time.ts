import { Temporal } from 'temporal-polyfill'

// Exported because a query that has to group instants into calendar days needs the zone by name too.
export const BRATISLAVA_TIME_ZONE = 'Europe/Bratislava'

// Converts a zoned moment back to the plain Date a ScrapedScreening carries for an absolute instant.
function toDate(zonedDateTime: Temporal.ZonedDateTime): Date {
  return new Date(zonedDateTime.epochMilliseconds)
}

// Formats an instant's Bratislava wall-clock time as a 24-hour, zero-padded "HH:mm" string.
export function formatTimeOfDay(time: Date): string {
  return Temporal.Instant.fromEpochMilliseconds(time.getTime())
    .toZonedDateTimeISO(BRATISLAVA_TIME_ZONE)
    .toPlainTime()
    .toString({ smallestUnit: 'minute' })
}

// The instant with its Bratislava offset written out, which is how a machine-readable date says "local".
export function formatBratislavaDateTime(time: Date): string {
  return Temporal.Instant.fromEpochMilliseconds(time.getTime())
    .toZonedDateTimeISO(BRATISLAVA_TIME_ZONE)
    .toString({ timeZoneName: 'never' })
}

/*
 * The year a screening falls in on Bratislava's calendar. A late screening on New Year's Eve is
 * still that year's, though UTC has already moved on, and the year is what dates a film against
 * the screening that shows it.
 */
export function toBratislavaYear(time: Date): number {
  return Temporal.Instant.fromEpochMilliseconds(time.getTime()).toZonedDateTimeISO(
    BRATISLAVA_TIME_ZONE,
  ).year
}

/*
 * The Bratislava calendar day a screening falls on, which is the day a cinema bills it under and
 * the file a run saves it in. Late shows are why this is taken from the zone rather than from UTC.
 */
export function toBratislavaDate(time: Date): Temporal.PlainDate {
  return Temporal.Instant.fromEpochMilliseconds(time.getTime())
    .toZonedDateTimeISO(BRATISLAVA_TIME_ZONE)
    .toPlainDate()
}

/*
 * Interprets a timezone-less local datetime string (e.g. "2026-08-27T10:00:00") as Europe/Bratislava
 * wall-clock time and returns the correct absolute Date, accounting for CET/CEST daylight saving.
 */
export function parseBratislavaTime(localDateTime: string): Date {
  return toDate(Temporal.PlainDateTime.from(localDateTime).toZonedDateTime(BRATISLAVA_TIME_ZONE))
}

/*
 * Today's date on Bratislava's calendar, which is what "today" means for a Bratislava cinema's
 * listing regardless of where this code happens to run.
 */
export function getBratislavaToday(): Temporal.PlainDate {
  return Temporal.Now.plainDateISO(BRATISLAVA_TIME_ZONE)
}

/*
 * The day a URL asks for, in the ISO form a cache entry is keyed by. A value nobody can parse is
 * not an error worth a page: a listing falls back to a day it can show.
 */
export function parseDay(value: string | string[] | undefined, fallback: string): string {
  try {
    return typeof value === 'string' ? Temporal.PlainDate.from(value).toString() : fallback
  } catch {
    return fallback
  }
}

/*
 * The instant a Bratislava calendar day begins - the boundary a day's screenings are replaced on,
 * and the one the past is dropped at. Taken from the zone rather than assumed to be midnight,
 * since a day that starts at 01:00 is exactly what a daylight-saving change makes.
 */
export function toBratislavaDayStart(date: Temporal.PlainDate): Date {
  return toDate(date.toZonedDateTime(BRATISLAVA_TIME_ZONE))
}

/*
 * Combines a Bratislava calendar date with a wall-clock "HH:mm" into the absolute instant it names.
 * Most sources list a date and a bare time separately, so this is where the two are put back
 * together - and the only place that has to know which of CET/CEST applies on that date.
 */
export function toBratislavaInstant(date: Temporal.PlainDate, timeOfDay: string): Date {
  return toDate(
    date.toPlainDateTime(Temporal.PlainTime.from(timeOfDay)).toZonedDateTime(BRATISLAVA_TIME_ZONE),
  )
}
