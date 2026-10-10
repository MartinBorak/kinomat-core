import { describe, expect, it } from 'vitest'

import {
  isFilmAlias,
  isFilmPublicId,
  toFilmAlias,
  toFilmIdentity,
  toFilmPublicId,
  type Film,
} from './film'

// A film nothing catalogues, so each test can add just the ids it is about.
function buildFilm(overrides: Partial<Film> & Pick<Film, 'titleSk'>): Film {
  return {
    tmdbId: null,
    imdbId: null,
    csfdId: null,
    wikidataId: null,
    titleEn: overrides.titleSk,
    originalTitle: '',
    releaseYear: null,
    runtimeMinutes: null,
    posterPath: null,
    directors: [],
    genreIds: [],
    ...overrides,
  }
}

describe('toFilmIdentity', () => {
  // The order is the decision: an item added to Wikidata next month must not move the identity.
  it('names a film by its TMDB id even where Wikidata also holds it', () => {
    const film = buildFilm({
      tmdbId: 660120,
      wikidataId: 'Q107089587',
      titleSk: 'Najhorší človek na svete',
    })

    expect(toFilmIdentity(film)).toBe('tmdb:660120')
  })

  // Štefan Uher, 1986. The film that is the whole reason a second catalogue can name one.
  it('names a film TMDB does not hold by its Wikidata id', () => {
    const film = buildFilm({ wikidataId: 'Q17167680', titleSk: 'Šiesta veta' })

    expect(toFilmIdentity(film)).toBe('wikidata:Q17167680')
  })

  it('names a film no catalogue holds by its Slovak title', () => {
    const film = buildFilm({ titleSk: 'Zakorenení vo vode' })

    expect(toFilmIdentity(film)).toBe('uncatalogued:Zakorenení vo vode')
  })

  // backfillFilmIds adds links after films are grouped and stored, so one must not rename a film.
  it('keeps the identity a film already had when a backfilled link arrives', () => {
    const matched = buildFilm({ tmdbId: 660120, titleSk: 'Najhorší človek na svete' })
    const backfilled = { ...matched, csfdId: '975420', wikidataId: 'Q107089587' }

    expect(toFilmIdentity(backfilled)).toBe(toFilmIdentity(matched))
  })

  // The same where there is no id to fall back on. The store's index has to agree, and once did not.
  it('keeps naming a film by its title when only a link, not an identifying id, is known', () => {
    const film = buildFilm({ imdbId: 'tt0176139', titleSk: 'Šiesta veta' })

    expect(toFilmIdentity(film)).toBe('uncatalogued:Šiesta veta')
  })
})

describe('toFilmPublicId', () => {
  /*
   * The whole point of deriving it: the table is rebuilt from scratch often, and a saved link has
   * to keep meaning the film it meant. A serial id cannot promise that; this is what replaced it.
   */
  it('names the same film the same way however often it is stored', () => {
    const film = buildFilm({ tmdbId: 660120, titleSk: 'Najhorší človek na svete' })

    expect(toFilmPublicId(film)).toBe(toFilmPublicId({ ...film, posterPath: '/new.jpg' }))
  })

  it('gives two films two names', () => {
    expect(toFilmPublicId(buildFilm({ titleSk: 'Vlny' }))).not.toBe(
      toFilmPublicId(buildFilm({ titleSk: 'Zajatci' })),
    )
  })

  // Twelve hex characters, which is what a URL carries and what the route lets past.
  it('is twelve characters an eye can read back', () => {
    const publicId = toFilmPublicId(buildFilm({ titleSk: 'Vlny' }))

    expect(publicId).toMatch(/^[0-9a-f]{12}$/)
    expect(isFilmPublicId(publicId)).toBe(true)
  })

  it('turns away a segment no film could be called', () => {
    expect(isFilmPublicId('47')).toBe(false)
    expect(isFilmPublicId('illusionously')).toBe(false)
    // Same digits, wrong case: one spelling per film.
    expect(isFilmPublicId('09824CBDAD88')).toBe(false)
  })
})

describe('toFilmAlias', () => {
  it('is the Slovak title as a slug', () => {
    expect(toFilmAlias(buildFilm({ titleSk: 'Duna: Časť tretia' }))).toBe('duna-cast-tretia')
  })

  it('is nothing for a title that leaves no slug', () => {
    expect(toFilmAlias(buildFilm({ titleSk: '???' }))).toBeNull()
  })
})

describe('isFilmAlias', () => {
  it('accepts what toFilmAlias produces, and a hand-written name of the same shape', () => {
    expect(isFilmAlias('duna-cast-tretia')).toBe(true)
    expect(isFilmAlias('duna-3')).toBe(true)
  })

  // One spelling per film, as with the public id; a stray hyphen or capital is a different string.
  it('turns away capitals, diacritics, spaces and loose hyphens', () => {
    expect(isFilmAlias('Duna')).toBe(false)
    expect(isFilmAlias('duna časť')).toBe(false)
    expect(isFilmAlias('duna cast')).toBe(false)
    expect(isFilmAlias('-duna')).toBe(false)
    expect(isFilmAlias('duna--3')).toBe(false)
    expect(isFilmAlias('')).toBe(false)
  })
})
