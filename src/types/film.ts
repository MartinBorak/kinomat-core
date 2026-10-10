import { createHash } from 'node:crypto'

import { toSlug } from '../lib/text'

/*
 * A film, as whichever catalogue could describe it: what every cinema's spelling resolves to, and
 * what a schedule groups by. Kept to the fields a listing needs, of the thirty-odd TMDB carries.
 *
 * Every id is nullable, TMDB's included, because a real film can be missing from any one catalogue:
 * Šiesta veta (1986) is in Wikidata and ČSFD and not in TMDB at all.
 */
export type Film = {
  tmdbId: number | null
  imdbId: string | null
  csfdId: string | null
  wikidataId: string | null
  titleSk: string
  /*
   * Never empty: a film nobody translated is called its original title in English, which is what
   * TMDB means by leaving a translation blank rather than what an absent field would mean.
   */
  titleEn: string
  originalTitle: string
  releaseYear: number | null
  runtimeMinutes: number | null
  posterPath: string | null
  // Both empty where no catalogue describes the film: an empty list is "nobody said", not "none".
  directors: string[]
  genreIds: number[]
}

// One home for the grammar, since an override builds an identity from a row rather than a Film.
export function toTmdbIdentity(tmdbId: number): string {
  return `tmdb:${tmdbId}`
}
export function toWikidataIdentity(wikidataId: string): string {
  return `wikidata:${wikidataId}`
}
export function toUncataloguedIdentity(titleSk: string): string {
  return `uncatalogued:${titleSk}`
}

/*
 * What tells one film from another: whichever of the two searchable ids it has, and failing that its
 * Slovak title. An IMDb or ČSFD id never arrives alone, so neither can name a film these two cannot.
 * TMDB first, so a film it holds keeps this identity whether or not Wikidata later adds an item.
 */
export function toFilmIdentity(film: Pick<Film, 'tmdbId' | 'wikidataId' | 'titleSk'>): string {
  if (film.tmdbId !== null) {
    return toTmdbIdentity(film.tmdbId)
  } else if (film.wikidataId !== null) {
    return toWikidataIdentity(film.wikidataId)
  } else {
    return toUncataloguedIdentity(film.titleSk)
  }
}

/*
 * Twelve hex characters, which is forty-eight bits of the digest. The id is a name rather than a
 * secret - the catalogue it points into is public - so the only thing length has to buy is room
 * against a collision: at ten thousand films ever seen, the chance of one is under two in ten
 * million, and a collision would be refused by the unique index rather than quietly served.
 */
const PUBLIC_ID_LENGTH = 12

const PUBLIC_ID_PATTERN = new RegExp(`^[0-9a-f]{${PUBLIC_ID_LENGTH}}$`)

/*
 * The name a film is known by outside the database. Derived from the identity rather than handed
 * out, so a film that is stored, dropped and stored again is the same film to a link somebody
 * saved - which a serial id is not, since a rebuilt table hands its numbers out afresh.
 */
export function toFilmPublicId(film: Film): string {
  return createHash('sha256').update(toFilmIdentity(film)).digest('hex').slice(0, PUBLIC_ID_LENGTH)
}

// Whether a URL segment could name a film at all, which is worth knowing before asking the database.
export function isFilmPublicId(value: string): boolean {
  return PUBLIC_ID_PATTERN.test(value)
}

// What toSlug produces: hyphenated words of bare letters and digits. The booth holds an edit to it.
const ALIAS_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isFilmAlias(value: string): boolean {
  return ALIAS_PATTERN.test(value)
}

/*
 * The alias a film gets unless somebody rules otherwise: its Slovak title as a slug, which is what
 * a reader would guess. Null for a title that leaves no slug, such as one made of symbols. Two
 * films may share a title, so this is the start of a name and the store settles collisions.
 */
export function toFilmAlias(film: Pick<Film, 'titleSk'>): string | null {
  const slug = toSlug(film.titleSk)

  return slug === '' ? null : slug
}
