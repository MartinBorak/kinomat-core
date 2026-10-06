import { type Film, toFilmPublicId } from '../../types/film'

const NOTHING_KNOWN: Film = {
  tmdbId: null,
  imdbId: null,
  csfdId: null,
  wikidataId: null,
  titleSk: '',
  titleEn: '',
  originalTitle: '',
  releaseYear: null,
  runtimeMinutes: null,
  posterPath: null,
  directors: [],
  genreIds: [],
}

/*
 * A film row's values, with the public id its identity derives. Every insert goes through this, so
 * a test never states an id the application would have computed for it.
 */
export function toFilmValues(
  film: Partial<Film> & { titleSk: string },
): Film & { publicId: string } {
  const complete = { ...NOTHING_KNOWN, ...film }

  return { ...complete, publicId: toFilmPublicId(complete) }
}
