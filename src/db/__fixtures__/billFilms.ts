import { parseBratislavaTime } from '../../lib/time'
import { type Database } from '../client'
import { films, programmeFilms, programmes, screenings } from '../schema'
import { seedCinemas } from '../seed'
import { toFilmValues } from './filmValues'

/*
 * One bill: the films on it, in the order they play, and the wall-clock times it is screened at.
 * Bookable unless a test says otherwise, since a sold-out showing is read by nothing.
 */
export type Billing = {
  titles: string[]
  cinemaId?: string
  times: string[]
  isSoldOut?: boolean
}

/*
 * The bills given, each screened in Bratislava wall-clock time. A film named on two bills is stored
 * once and shared between them, which is what lets a test say the same film plays in two cinemas.
 * The ids come back by title, since that is what a test has to hand to a query.
 */
export async function billFilms(
  database: Database,
  billings: Billing[],
): Promise<Map<string, number>> {
  // A screening needs a cinema to belong to before it can be stored at all.
  await seedCinemas(database)

  const titles = [...new Set(billings.flatMap((billing) => billing.titles))]
  const stored = await database
    .insert(films)
    .values(titles.map((titleSk) => toFilmValues({ titleSk })))
    .returning({ id: films.id, titleSk: films.titleSk })
  const filmIdByTitle = new Map(stored.map((film) => [film.titleSk, film.id]))

  for (const { titles, cinemaId = 'kino-lumiere', times, isSoldOut = false } of billings) {
    const [programme] = await database
      .insert(programmes)
      .values({})
      .returning({ id: programmes.id })

    await database.insert(programmeFilms).values(
      titles.map((title, position) => ({
        programmeId: programme.id,
        filmId: filmIdByTitle.get(title)!,
        position,
      })),
    )
    await database.insert(screenings).values(
      times.map((time) => ({
        cinemaId,
        programmeId: programme.id,
        startsAt: parseBratislavaTime(time),
        rawTitle: titles.join(' + '),
        bookingUrl: isSoldOut ? '' : `https://example.test/${encodeURIComponent(time)}`,
      })),
    )
  }

  return filmIdByTitle
}
