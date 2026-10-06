// A physical cinema we aggregate showtimes for.
export type Cinema = {
  id: string
  name: string
  address: string
  // The page the cinema publishes for itself, which is where a reader should be sent to book.
  website: string
}

// The cinemas currently supported by the aggregator.
export const CINEMAS = [
  {
    id: 'artkino-za-zrkadlom',
    name: 'Artkino Za zrkadlom',
    address: 'Rovniankova 3, Bratislava',
    website: 'https://www.kzp.sk/podujatia/kino?place=78',
  },
  {
    id: 'cinema-city-aupark',
    name: 'Cinema City Aupark',
    address: 'Einsteinova 20, Bratislava',
    website: 'https://www.cinemacity.sk/cinemas/cinema-city-aupark/1010',
  },
  {
    id: 'cinema-city-eurovea',
    name: 'Cinema City Eurovea',
    address: 'Pribinova 8, Bratislava',
    website: 'https://www.cinemacity.sk/cinemas/cinema-city-eurovea/1012',
  },
  {
    id: 'cinema-city-polus',
    name: 'Cinema City Polus (VIVO!)',
    address: 'Vajnorská 100, Bratislava',
    website: 'https://www.cinemacity.sk/cinemas/cinema-city-polus/1011',
  },
  {
    id: 'cinemax-bory-mall',
    name: 'Cinemax Bory Mall',
    address: 'OC Bory Mall, Lamač, Bratislava',
    // Cinemax has no page of its own per venue: its programme is picked from a menu on the front page.
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'edison-filmhub',
    name: 'Edison Filmhub',
    address: 'Baštová 348/6A, Bratislava',
    website: 'https://edisonfilmhub.sk/program',
  },
  {
    id: 'kino-film-europe',
    name: 'Kino Film Europe',
    address: 'Štefánikova 25, Bratislava',
    website: 'https://www.kfe.sk/cely-program',
  },
  {
    id: 'kino-lamac',
    name: 'Kino Lamač',
    address: 'Malokarpatské námestie 3, Bratislava',
    website: 'https://www.lamac.sk/kino-lamac',
  },
  {
    id: 'kino-luky',
    name: 'Kino Lúky',
    address: 'Vígľašská 1, Bratislava',
    website: 'https://www.kzp.sk/podujatia/kino?place=80',
  },
  {
    id: 'kino-lumiere',
    name: 'Kino Lumière',
    address: 'Špitálska 4, Bratislava',
    website: 'https://www.kino-lumiere.sk/',
  },
  {
    id: 'kino-mladost',
    name: 'Kino Mladosť',
    address: 'Hviezdoslavovo námestie 17, Bratislava',
    website: 'https://www.kinomladost.sk/',
  },
  {
    id: 'kino-nostalgia',
    name: 'Kino Nostalgia',
    address: 'Súťažná 18, Bratislava',
    website: 'https://www.nostalgia.sk/program',
  },
  {
    id: 'kino-sluk',
    name: 'Kino SĽUK',
    address: 'Balkánska 31/66, Bratislava-Rusovce',
    website: 'https://www.sluk.sk/',
  },
] as const satisfies Cinema[]

// One of our cinemas as the registry knows it, which is a Cinema with its id narrowed to its own.
export type SupportedCinema = (typeof CINEMAS)[number]

/*
 * The id of one of our supported cinemas - a union of string literals derived from CINEMAS
 * itself (one source of truth), so a mistyped id is caught at compile time, not just at runtime.
 */
export type CinemaId = SupportedCinema['id']

// The cinema a route segment names, where it names one of ours - anything else is not a page.
export function findCinema(id: string): SupportedCinema | null {
  return CINEMAS.find((cinema) => cinema.id === id) ?? null
}
