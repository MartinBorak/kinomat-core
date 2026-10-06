import { eq, sql } from 'drizzle-orm'
import { describe, expect } from 'vitest'

import { CINEMAS } from '../types/cinema'
import { toFilmValues } from './__fixtures__/filmValues'
import { databaseUrl, it } from './__fixtures__/testDatabase'
import { cinemas, films, programmeFilms, programmes, screenings } from './schema'
import { seedCinemas } from './seed'

describe.skipIf(!databaseUrl)('the schema, against a real database', () => {
  // The whole point of the model: one showing, reachable from its cinema and its ordered films.
  it('stores a screening and reads back the film it is a screening of', async ({ database }) => {
    await seedCinemas(database)
    const [film] = await database
      .insert(films)
      .values(
        toFilmValues({ tmdbId: 1384216, titleSk: 'Psie hviezdy', originalTitle: 'The Dog Stars' }),
      )
      .returning()
    const [programme] = await database.insert(programmes).values({}).returning()
    await database
      .insert(programmeFilms)
      .values({ programmeId: programme.id, filmId: film.id, position: 0 })

    await database.insert(screenings).values({
      cinemaId: 'kino-lumiere',
      programmeId: programme.id,
      startsAt: new Date('2026-09-10T18:30:00Z'),
      rawTitle: 'Psie hviezdy',
      priceMin: '6.00',
      priceMax: '6.00',
    })

    const stored = await database.query.screenings.findFirst({
      with: { cinema: true, programme: { with: { films: { with: { film: true } } } } },
    })

    expect(stored?.cinema.name).toBe('Kino Lumière')
    expect(stored?.programme.films.map(({ film: { titleSk } }) => titleSk)).toEqual([
      'Psie hviezdy',
    ])
    expect(stored?.startsAt).toEqual(new Date('2026-09-10T18:30:00Z'))
  })

  /*
   * A double feature is one programme of two films in order, which is the case that would appear
   * twice in the schedule if screenings joined straight to films.
   */
  it('keeps a double feature as one programme of two ordered films', async ({ database }) => {
    await seedCinemas(database)
    const inserted = await database
      .insert(films)
      .values([
        toFilmValues({ titleSk: 'Pozdravy z Rodosu' }),
        toFilmValues({ titleSk: 'Zakorenení vo vode' }),
      ])
      .returning()
    const [programme] = await database.insert(programmes).values({}).returning()
    await database.insert(programmeFilms).values(
      inserted.map((film, position) => ({
        programmeId: programme.id,
        filmId: film.id,
        position,
      })),
    )

    const stored = await database.query.programmes.findFirst({
      with: { films: { with: { film: true }, orderBy: programmeFilms.position } },
    })

    expect(stored?.films.map(({ film: { titleSk } }) => titleSk)).toEqual([
      'Pozdravy z Rodosu',
      'Zakorenení vo vode',
    ])
  })

  /*
   * The reason every catalogue id is nullable and unique rather than a key: many films have no TMDB
   * id, and Postgres counts nulls as distinct, so they coexist while no two films claim one entry.
   */
  it('allows many films with no TMDB id but only one claiming a given id', async ({ database }) => {
    await database
      .insert(films)
      .values([
        toFilmValues({ titleSk: 'Kuzma' }),
        toFilmValues({ titleSk: 'Toxic' }),
        toFilmValues({ titleSk: 'Šiesta veta' }),
      ])

    const unresolved = await database.select().from(films)

    expect(unresolved).toHaveLength(3)

    await database.insert(films).values(toFilmValues({ titleSk: 'Odysea', tmdbId: 42 }))

    await expect(
      database.insert(films).values(toFilmValues({ titleSk: 'ODYSEA', tmdbId: 42 })),
    ).rejects.toThrow()
  })

  // A screening must belong to a cinema we actually know, which is what the registry mirror is for.
  it('refuses a screening at a cinema that is not in the registry', async ({ database }) => {
    const [programme] = await database.insert(programmes).values({}).returning()

    await expect(
      database.insert(screenings).values({
        cinemaId: 'kino-neexistuje',
        programmeId: programme.id,
        startsAt: new Date('2026-09-10T18:30:00Z'),
        rawTitle: 'Nič',
      }),
    ).rejects.toThrow()
  })

  /*
   * What a refresh replaces on. The same source id at the same cinema, time and programme is the
   * same showing reported again, and must update rather than accumulate a duplicate every night.
   */
  it('replaces a showing reported twice rather than storing it twice', async ({ database }) => {
    await seedCinemas(database)
    const [programme] = await database.insert(programmes).values({}).returning()
    const showing = {
      cinemaId: 'kino-lumiere' as const,
      programmeId: programme.id,
      startsAt: new Date('2026-09-10T18:30:00Z'),
      sourceId: 'lumiere-4821',
      rawTitle: 'Psie hviezdy',
    }

    await database.insert(screenings).values(showing)
    await database
      .insert(screenings)
      .values({ ...showing, screenName: 'Kino 1' })
      .onConflictDoUpdate({
        target: [
          screenings.cinemaId,
          screenings.sourceId,
          screenings.startsAt,
          screenings.programmeId,
        ],
        set: { screenName: sql`excluded.screen_name` },
      })

    const stored = await database.select().from(screenings)

    expect(stored).toHaveLength(1)
    expect(stored[0].screenName).toBe('Kino 1')
  })

  // The registry is the source of truth, so re-seeding a renamed cinema updates rather than fails.
  it('re-seeds the cinemas without duplicating them', async ({ database }) => {
    await seedCinemas(database)
    await database.update(cinemas).set({ name: 'Stale name' }).where(eq(cinemas.id, 'kino-lumiere'))

    await seedCinemas(database)

    const stored = await database.select().from(cinemas)

    expect(stored).toHaveLength(CINEMAS.length)
    expect(stored.find(({ id }) => id === 'kino-lumiere')?.name).toBe('Kino Lumière')
  })
})
