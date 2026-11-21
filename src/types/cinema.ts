import type { CityId } from './city'

// A physical cinema we aggregate showtimes for.
export type Cinema = {
  id: string
  name: string
  address: string
  cityId: CityId
  // The page the cinema publishes for itself, which is where a reader should be sent to book.
  website: string
}

// The cinemas currently supported by the aggregator.
export const CINEMAS = [
  {
    id: 'artkino-za-zrkadlom',
    name: 'Artkino Za zrkadlom',
    address: 'Rovniankova 3, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.kzp.sk/podujatia/kino?place=78',
  },
  {
    id: 'artkino-metro',
    name: 'Artkino Metro',
    address: 'KKC Hviezda, Kniežaťa Pribinu 3, Trenčín',
    cityId: 'trencin',
    // Plain http: the site's certificate names another host.
    website: 'http://www.lampart.sk/',
  },
  {
    id: 'cinema-city-aupark',
    name: 'Cinema City Aupark',
    address: 'Einsteinova 20, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.cinemacity.sk/cinemas/cinema-city-aupark/1010',
  },
  {
    id: 'cinema-city-eurovea',
    name: 'Cinema City Eurovea',
    address: 'Pribinova 8, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.cinemacity.sk/cinemas/cinema-city-eurovea/1012',
  },
  {
    id: 'cinema-city-polus',
    name: 'Cinema City Polus (VIVO!)',
    address: 'Vajnorská 100, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.cinemacity.sk/cinemas/cinema-city-polus/1011',
  },
  {
    id: 'cinemax-bory-mall',
    name: 'Cinemax Bory Mall',
    address: 'OC Bory Mall, Lamač, Bratislava',
    cityId: 'bratislava',
    // Cinemax has no page of its own per venue: its programme is picked from a menu on the front page.
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-city-arena',
    name: 'Cinemax City Arena',
    address: 'Kollárova 20, Trnava',
    cityId: 'trnava',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-europa-sc',
    name: 'Cinemax Europa SC',
    address: 'Na Troskách 25, Banská Bystrica',
    cityId: 'banska-bystrica',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-max-nitra',
    name: 'Cinemax OC Max',
    address: 'Chrenovská 30, Nitra',
    cityId: 'nitra',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-max-presov',
    name: 'Cinemax OC Max',
    address: 'Vihorlatská 2, Prešov',
    cityId: 'presov',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-max-trencin',
    name: 'Cinemax OC Max',
    address: 'Gen. M. R. Štefánika 426, Trenčín',
    cityId: 'trencin',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-max-trnava',
    name: 'Cinemax OC Max',
    address: 'Františka Urbánka 11, Trnava',
    cityId: 'trnava',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-max-zilina',
    name: 'Cinemax OC Max',
    address: 'Prielohy 979, Žilina',
    cityId: 'zilina',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-novum',
    name: 'Cinemax Novum',
    address: 'Námestie legionárov 15267/1, Prešov',
    cityId: 'presov',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'cinemax-optima',
    name: 'Cinemax Optima',
    address: 'Moldavská cesta 32, Košice',
    cityId: 'kosice',
    website: 'https://www.cine-max.sk/',
  },
  {
    id: 'edison-filmhub',
    name: 'Edison Filmhub',
    address: 'Baštová 348/6A, Bratislava',
    cityId: 'bratislava',
    website: 'https://edisonfilmhub.sk/program',
  },
  {
    id: 'filmovy-klub-banska-bystrica',
    name: 'Filmový klub v Múzeu SNP',
    address: 'Kapitulská 23, Banská Bystrica',
    cityId: 'banska-bystrica',
    // fkbb.sk forwards here: the club keeps no programme of its own beside its ticket seller's.
    website: 'https://www.ticketlive.sk/sk/event/filmovy-klub-banska-bystrica',
  },
  {
    id: 'kino-film-europe',
    name: 'Kino Film Europe',
    address: 'Štefánikova 25, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.kfe.sk/cely-program',
  },
  {
    id: 'kino-hviezda',
    name: 'Kino Hviezda',
    address: 'Paulínska 1, Trnava',
    cityId: 'trnava',
    website: 'http://www.kinohviezda.trnava.sk/',
  },
  {
    id: 'kino-lamac',
    name: 'Kino Lamač',
    address: 'Malokarpatské námestie 3, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.lamac.sk/kino-lamac',
  },
  {
    id: 'kino-luky',
    name: 'Kino Lúky',
    address: 'Vígľašská 1, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.kzp.sk/podujatia/kino?place=80',
  },
  {
    id: 'kino-lumiere',
    name: 'Kino Lumière',
    address: 'Špitálska 4, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.kino-lumiere.sk/',
  },
  {
    id: 'kino-mladost',
    name: 'Kino Mladosť',
    address: 'Hviezdoslavovo námestie 17, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.kinomladost.sk/',
  },
  {
    id: 'kino-nostalgia',
    name: 'Kino Nostalgia',
    address: 'Súťažná 18, Bratislava',
    cityId: 'bratislava',
    website: 'https://www.nostalgia.sk/program',
  },
  {
    id: 'kino-pocity',
    name: 'Kino Pocity',
    address: 'Klub Stromoradie, Kmeťovo stromoradie, Prešov',
    cityId: 'presov',
    website: 'https://www.kinopocity.sk/',
  },
  {
    id: 'kino-sluk',
    name: 'Kino SĽUK',
    address: 'Balkánska 31/66, Bratislava-Rusovce',
    cityId: 'bratislava',
    website: 'https://www.sluk.sk/',
  },
  {
    id: 'kino-sud',
    name: 'Kino SUD',
    address: 'Ovsištské námestie 1, Bratislava-Petržalka',
    cityId: 'bratislava',
    website: 'https://slovenskyumeleckydvor.sk/kino/',
  },
  {
    id: 'kino-usmev',
    name: 'Kino Úsmev',
    address: 'Kasárenské námestie 1, Košice',
    cityId: 'kosice',
    website: 'https://kinousmev.sk/program/',
  },
  {
    id: 'kinoklub-nitra',
    name: 'Kinoklub Nitra',
    address: 'Kino Palace, Radlinského 108/9, Nitra',
    cityId: 'nitra',
    website: 'https://www.kinoklubnitra.sk/',
  },
  {
    id: 'mlyny-cinemas',
    name: 'Mlyny Cinemas',
    address: 'Štefánikova trieda 61, Nitra',
    cityId: 'nitra',
    website: 'https://www.mlyny-cinemas.sk/',
  },
  {
    id: 'stanica-zilina',
    name: 'Stanica Žilina-Záriečie',
    address: 'Závodská cesta 3/2844, Žilina',
    cityId: 'zilina',
    website: 'https://www.stanica.sk/program/',
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
