// The catalogues' own pages, off the bare stored id. ČSFD redirects to the film's slug itself.
export function toTmdbHref(tmdbId: number | string): string {
  return `https://www.themoviedb.org/movie/${tmdbId}`
}
export function toWikidataHref(wikidataId: string): string {
  return `https://www.wikidata.org/wiki/${wikidataId}`
}
export function toImdbHref(imdbId: string): string {
  return `https://www.imdb.com/title/${imdbId}/`
}
export function toCsfdHref(csfdId: string): string {
  return `https://www.csfd.sk/film/${csfdId}/`
}
