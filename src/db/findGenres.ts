import { asc, sql, type SQL } from 'drizzle-orm'

import { type Language } from '../lib/language'
import { type Database } from './client'
import { genres, films as filmTable } from './schema'

/*
 * A genre as a film carries it: TMDB's id, which is what a filter keeps in a URL, and its name in
 * both languages, the way a film carries both of its titles rather than the one a reader asked for.
 */
export type FilmGenre = { id: number; nameSk: string; nameEn: string }

/*
 * The genres of the film row being selected, named. A subquery rather than a join, so a film with
 * three genres stays one row; ordered by the Slovak name, since that is the order they are read in.
 */
export function selectFilmGenres(): SQL<FilmGenre[]> {
  return sql<FilmGenre[]>`coalesce((
    select json_agg(json_build_object('id', ${genres.id}, 'nameSk', ${genres.nameSk}, 'nameEn', ${genres.nameEn}) order by ${genres.nameSk})
    from ${genres}
    where ${genres.id} = any(${filmTable.genreIds})
  ), '[]'::json)`
}

export function formatGenre(genre: FilmGenre, language: Language): string {
  return language === 'en' ? genre.nameEn : genre.nameSk
}

/*
 * The whole vocabulary rather than one film's, which is what a tick-list of genres has to offer.
 * Twenty rows, so it is read whole; the pages read theirs off the films they already hold.
 */
export async function findGenres(database: Database): Promise<FilmGenre[]> {
  return database
    .select({ id: genres.id, nameSk: genres.nameSk, nameEn: genres.nameEn })
    .from(genres)
    .orderBy(asc(genres.nameSk))
}
