// A city whose cinemas Kinomat covers. Its id is the path segment: /kosice/program.
export type City = {
  id: string
  // The same in Slovak and English, which keeps the diacritics: Košice, not Kosice.
  name: string
  // "In the city", preposition included, since both the case ending and the preposition vary by name.
  slovakLocative: string
  // The adjective as "kín" and "kinách" both take it; no rule derives bratislavských from Bratislava.
  slovakPluralAdjective: string
}

export const CITIES = [
  {
    id: 'banska-bystrica',
    name: 'Banská Bystrica',
    slovakLocative: 'v Banskej Bystrici',
    slovakPluralAdjective: 'banskobystrických',
  },
  {
    id: 'bratislava',
    name: 'Bratislava',
    slovakLocative: 'v Bratislave',
    slovakPluralAdjective: 'bratislavských',
  },
  {
    id: 'kosice',
    name: 'Košice',
    slovakLocative: 'v Košiciach',
    slovakPluralAdjective: 'košických',
  },
  { id: 'nitra', name: 'Nitra', slovakLocative: 'v Nitre', slovakPluralAdjective: 'nitrianskych' },
  {
    id: 'presov',
    name: 'Prešov',
    slovakLocative: 'v Prešove',
    slovakPluralAdjective: 'prešovských',
  },
  {
    id: 'trencin',
    name: 'Trenčín',
    slovakLocative: 'v Trenčíne',
    slovakPluralAdjective: 'trenčianskych',
  },
  { id: 'trnava', name: 'Trnava', slovakLocative: 'v Trnave', slovakPluralAdjective: 'trnavských' },
  { id: 'zilina', name: 'Žilina', slovakLocative: 'v Žiline', slovakPluralAdjective: 'žilinských' },
] as const satisfies City[]

export type SupportedCity = (typeof CITIES)[number]

export type CityId = SupportedCity['id']

// Where a visitor lands before they have picked a city, and where Kinomat started.
export const DEFAULT_CITY: CityId = 'bratislava'

// The city a route segment names, where it names one of ours - anything else is not a page.
export function findCity(id: string): SupportedCity | null {
  return CITIES.find((city) => city.id === id) ?? null
}

export function isCityId(value: string): value is CityId {
  return findCity(value) !== null
}

/*
 * What a city's path starts with. A page outside any city (a film, About) links to the bare path
 * instead, and the proxy sends the reader on to the city they last looked at.
 */
export function toCityPrefix(city: CityId | null): string {
  return city === null ? '' : `/${city}`
}
