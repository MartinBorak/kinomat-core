import { sql } from 'drizzle-orm'

import { CINEMAS } from '../types/cinema'
import { CITIES } from '../types/city'
import { type Database } from './client'
import { cinemas, cities } from './schema'

/*
 * Mirrors the CITIES and CINEMAS registries into the tables that cinemas and screenings key
 * against, cities first since a cinema names one. Idempotent, because the registries supply the
 * ids: re-running updates what was renamed in code rather than duplicating it.
 */
export async function seedCinemas(database: Database): Promise<void> {
  await database
    .insert(cities)
    .values(CITIES.map(({ id, name }) => ({ id, name })))
    .onConflictDoUpdate({ target: cities.id, set: { name: sql`excluded.name` } })

  await database
    .insert(cinemas)
    .values([...CINEMAS])
    .onConflictDoUpdate({
      target: cinemas.id,
      // `excluded` is the row that was proposed; naming the columns would write them back unchanged.
      set: {
        name: sql`excluded.name`,
        address: sql`excluded.address`,
        cityId: sql`excluded.city_id`,
      },
    })
}
