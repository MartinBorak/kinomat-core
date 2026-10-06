import { relations, sql } from 'drizzle-orm'
import {
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core'

/*
 * A mirror of the CINEMAS registry in src/types/cinema.ts, which stays the source of truth because
 * CinemaId is derived from it. This table exists so a screening can carry a foreign key.
 */
export const cinemas = pgTable('cinema', {
  // The registry's own id, not a generated one, so the seed is idempotent and the code reads the same.
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  address: text('address').notNull(),
})

/*
 * An identity plus what a listing shows. The key is local because every catalogue id can be absent:
 * Šiesta veta has no TMDB id, and a film nothing resolved has none of them.
 *
 * The TMDB id is unique where present. Postgres treats nulls as distinct in a unique index, so any
 * number of unresolved films coexist while no two films claim one TMDB entry; the other three ids
 * are unique only where no TMDB id identifies the row, for the reason their own comment gives.
 */
export const films = pgTable(
  'film',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    /*
     * The name this film is known by outside the database - in a URL, and in a link somebody saved.
     * Derived from its identity rather than handed out, so a rebuilt table names the same films the
     * same way, which the serial id above cannot promise. See toFilmPublicId.
     */
    publicId: text('public_id').notNull().unique(),
    tmdbId: integer('tmdb_id'),
    csfdId: text('csfd_id'),
    imdbId: text('imdb_id'),
    wikidataId: text('wikidata_id'),
    // Slovak is what the cinemas print; English arrives from TMDB's translations and is often absent.
    titleSk: text('title_sk').notNull(),
    titleEn: text('title_en').notNull().default(''),
    originalTitle: text('original_title').notNull().default(''),
    releaseYear: integer('release_year'),
    runtimeMinutes: integer('runtime_minutes'),
    posterPath: text('poster_path'),
    // Names, since a person is called the same thing in both languages; empty where none is known.
    directors: text('director').array().notNull().default([]),
    /*
     * TMDB's own genre ids rather than its names: the names arrive already translated, so storing
     * them would store one language, and an id is what a filter can keep in a URL either way.
     */
    genreIds: integer('genre_id').array().notNull().default([]),
    /*
     * What "newest" means in the booth. A re-store never restates it, so it dates the row's arrival
     * rather than the last run; a film that stops playing is deleted and dates afresh on return.
     */
    firstSeenAt: timestamp('first_seen_at', { withTimezone: true, mode: 'date' })
      .notNull()
      .defaultNow(),
  },
  (film) => [
    uniqueIndex('film_tmdb_id_key').on(film.tmdbId),
    /*
     * Unique only where TMDB does not identify the film, because these three name the work and TMDB
     * names the cut: Wikidata's Mistress of Atlantis states one ČSFD id and three TMDB ids, its
     * German, French and English versions. Two of them screening would be two rows sharing a link,
     * which is the truth about them rather than a collision.
     */
    uniqueIndex('film_csfd_id_key')
      .on(film.csfdId)
      .where(sql`${film.tmdbId} is null`),
    uniqueIndex('film_imdb_id_key')
      .on(film.imdbId)
      .where(sql`${film.tmdbId} is null`),
    uniqueIndex('film_wikidata_id_key')
      .on(film.wikidataId)
      .where(sql`${film.tmdbId} is null`),
    /*
     * A film no catalogue holds is its title: there is nothing else to tell two of them apart by.
     * Partial, so it constrains only those films - two catalogued films may well share a title.
     * The predicate is toFilmIdentity's, so every row the code calls uncatalogued is one it covers.
     */
    uniqueIndex('film_uncatalogued_title_key')
      .on(film.titleSk)
      .where(sql`${film.tmdbId} is null and ${film.wikidataId} is null`),
  ],
)

/*
 * What is being put on. Its whole content is its ordered films, and it has no stored title: the
 * display name is those films' titles joined, which has to be derived per language anyway.
 *
 * A programme exists so the schedule can group by what is playing. Grouping by film instead would
 * list a double feature twice, once under each of its films, as if either were screening alone.
 */
export const programmes = pgTable('programme', {
  id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
})

// The ordered films of one programme. Position is what makes a double feature a sequence, not a set.
export const programmeFilms = pgTable(
  'programme_film',
  {
    programmeId: integer('programme_id')
      .notNull()
      .references(() => programmes.id, { onDelete: 'cascade' }),
    filmId: integer('film_id')
      .notNull()
      .references(() => films.id),
    position: integer('position').notNull(),
  },
  (programmeFilm) => [
    primaryKey({ columns: [programmeFilm.programmeId, programmeFilm.position] }),
    index('programme_film_film_id_idx').on(programmeFilm.filmId),
  ],
)

/*
 * One showing at one cinema. The event and strand fields live here rather than on the programme
 * because a Q&A is a property of the date, not of the content: the director turns up on Thursday
 * and the film screens again on Friday without them.
 */
export const screenings = pgTable(
  'screening',
  {
    id: integer('id').generatedAlwaysAsIdentity().primaryKey(),
    cinemaId: text('cinema_id')
      .notNull()
      .references(() => cinemas.id),
    programmeId: integer('programme_id')
      .notNull()
      .references(() => programmes.id),
    // The instant, stored with its zone. Bratislava's wall clock is presentation, not storage.
    startsAt: timestamp('starts_at', { withTimezone: true, mode: 'date' }).notNull(),
    screenName: text('screen_name').notNull().default(''),
    format: text('format').array().notNull().default([]),
    language: text('language').notNull().default(''),
    subtitles: text('subtitles').notNull().default(''),
    /*
     * The language the film was made in, as this cinema stated it - which is not the language this
     * showing is heard in, and is stored beside it rather than on the film because it is the
     * cinema's claim: Cinema City calls the Latvian Laimīgie Czech, and a wrong claim must not
     * become the film's own.
     */
    originalLanguage: text('original_language').notNull().default(''),
    /*
     * From the cheapest ticket sold online to the full adult one, both null where the source states
     * no price - not 0, which is a real price (Kino Lamač screens for free). Numeric rather than a
     * float, since money in binary floating point is a bug waiting for a rounding.
     */
    priceMin: numeric('price_min', { precision: 6, scale: 2 }),
    priceMax: numeric('price_max', { precision: 6, scale: 2 }),
    bookingUrl: text('booking_url').notNull().default(''),
    /*
     * The source's own id for this showing, which is what a refresh upserts on. Empty where a source
     * publishes none, so it cannot be assumed unique on its own.
     */
    sourceId: text('source_id').notNull().default(''),
    // The words the cinema itself printed: the audit trail, and what a user compares against.
    rawTitle: text('raw_title').notNull(),
    /*
     * The cinema's blurb for this showing, kept beside the raw title for the same reason: it is
     * the cinema's claim about what is playing, and what a person names the film from.
     */
    synopsis: text('synopsis').notNull().default(''),
    /*
     * Who the cinema said made it and when, kept for the same reason again: a match the cinema's
     * own facts agree with needs nobody to confirm it, and only the cinema can say so.
     */
    statedDirectors: text('stated_director').array().notNull().default([]),
    statedYear: integer('stated_year'),
    eventNote: text('event_note').notNull().default(''),
    strand: text('strand').notNull().default(''),
  },
  (screening) => [
    /*
     * What a refresh replaces on. A source with no id of its own falls back to the time, which is
     * why the fallback columns are part of the key rather than the id alone.
     */
    uniqueIndex('screening_source_key').on(
      screening.cinemaId,
      screening.sourceId,
      screening.startsAt,
      screening.programmeId,
    ),
    // The listing's own query: what is on, from now, in date order.
    index('screening_starts_at_idx').on(screening.startsAt),
    index('screening_programme_id_idx').on(screening.programmeId),
  ],
)

/*
 * The programme page of a cinema no script can fetch, as a person saved it from their browser. One
 * per cinema, replaced by the next paste; the run reads it in place of an HTTP response. Held here
 * rather than on disk because the paste happens in the booth and the run happens wherever it runs.
 */
export const programmePages = pgTable('programme_page', {
  cinemaId: text('cinema_id')
    .primaryKey()
    .references(() => cinemas.id),
  html: text('html').notNull(),
  savedAt: timestamp('saved_at', { withTimezone: true, mode: 'date' }).notNull(),
})

/*
 * A settled identity, cached so a nightly refresh costs nothing for titles already settled. Keyed
 * on one component of a bill, since "Pozdravy z Rodosu + Zakorenení vo vode" is two films and one
 * film_id cannot say so. Only identities nothing else answers: caching an unmatched title would
 * stop looking for a film that reaches TMDB next month, and an override has to stay free to change.
 */
export const titleResolutions = pgTable('title_resolution', {
  // One component, spelled exactly as the cinema printed it, since that is what it will print again.
  title: text('title').primaryKey(),
  filmId: integer('film_id')
    .notNull()
    .references(() => films.id),
  // Which layer settled it: tmdb, wikidata or override. See FilmMatch in types/film.ts.
  evidence: text('evidence').notNull(),
  resolvedAt: timestamp('resolved_at', { withTimezone: true, mode: 'date' }).notNull().defaultNow(),
})

/*
 * What a person decided about a title the automated layers get wrong or cannot answer: which film
 * it is, in which catalogue, or that it is no film at all. In the database rather than in the code
 * so it can be ruled on without a deploy; rulings.json is the copy that is reviewed and restored from.
 */
export const titleOverrides = pgTable('title_override', {
  // One raw title, spelled exactly as the cinema printed it, since that is what it will print again.
  rawTitle: text('raw_title').primaryKey(),
  // Which kind of ruling: tmdb, wikidata, uncatalogued, notAFilm or bill. See TitleOverride.
  kind: text('kind').notNull(),
  tmdbId: integer('tmdb_id'),
  wikidataId: text('wikidata_id'),
  // What an uncatalogued film is called and when it came out, no catalogue stating either.
  title: text('title'),
  releaseYear: integer('release_year'),
  // The titles a bill puts on, in the printed order, each resolved as a title of its own.
  titles: text('billed_title').array(),
  // Why the row exists, which is the whole of its review: a ruling nobody can audit is a guess.
  note: text('note').notNull().default(''),
})

/*
 * What a person corrected about a film the catalogues describe badly or not at all: a missing year,
 * a poster nobody uploaded, a title printed differently everywhere. Keyed on the film's identity
 * rather than its row id, since a rebuild hands out new row ids and this has to outlive one.
 *
 * A null column is a field nobody corrected. Nothing here can change which film a row is: the two
 * ids that decide that are settled by a ruling about a title, not by an edit to a description.
 */
export const filmOverrides = pgTable('film_override', {
  // tmdb:1671297, wikidata:Q17167680, or uncatalogued:<title>. See toFilmIdentity.
  identity: text('identity').primaryKey(),
  titleSk: text('title_sk'),
  titleEn: text('title_en'),
  originalTitle: text('original_title'),
  releaseYear: integer('release_year'),
  runtimeMinutes: integer('runtime_minutes'),
  posterPath: text('poster_path'),
  imdbId: text('imdb_id'),
  csfdId: text('csfd_id'),
  // Null like every other column here, which is the field nobody corrected.
  directors: text('director').array(),
  genreIds: integer('genre_id').array(),
})

/*
 * The Wikidata item a TMDB film is, where Wikidata states no TMDB id and the link backfill has
 * nothing to join on. Only the item is decided by hand; what it says is still read from Wikidata.
 */
export const wikidataItems = pgTable('wikidata_item', {
  tmdbId: integer('tmdb_id').primaryKey(),
  wikidataId: text('wikidata_id').notNull(),
  note: text('note').notNull().default(''),
})

/*
 * What TMDB's genre ids are called, in both languages the site reads in. Fetched from TMDB rather
 * than written down here, so a genre it renames or adds arrives with the next store run.
 */
export const genres = pgTable('genre', {
  // TMDB's own id, which is what a film's genre_id array holds and what a filter puts in the URL.
  id: integer('id').primaryKey(),
  nameSk: text('name_sk').notNull(),
  nameEn: text('name_en').notNull(),
})

export const programmeRelations = relations(programmes, ({ many }) => ({
  films: many(programmeFilms),
  screenings: many(screenings),
}))

export const programmeFilmRelations = relations(programmeFilms, ({ one }) => ({
  programme: one(programmes, {
    fields: [programmeFilms.programmeId],
    references: [programmes.id],
  }),
  film: one(films, { fields: [programmeFilms.filmId], references: [films.id] }),
}))

export const screeningRelations = relations(screenings, ({ one }) => ({
  cinema: one(cinemas, { fields: [screenings.cinemaId], references: [cinemas.id] }),
  programme: one(programmes, { fields: [screenings.programmeId], references: [programmes.id] }),
}))
