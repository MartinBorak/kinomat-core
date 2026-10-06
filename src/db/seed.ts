import { sql } from 'drizzle-orm'

import { CINEMAS } from '../types/cinema'
import { type Database } from './client'
import { cinemas } from './schema'

/*
 * Mirrors the CINEMAS registry into the table that screenings key against. Idempotent, because the
 * registry supplies the ids: re-running updates the names and addresses rather than duplicating a
 * cinema that was renamed in code.
 */
export async function seedCinemas(database: Database): Promise<void> {
  await database
    .insert(cinemas)
    .values([...CINEMAS])
    .onConflictDoUpdate({
      target: cinemas.id,
      // `excluded` is the row that was proposed; naming the columns would write them back unchanged.
      set: { name: sql`excluded.name`, address: sql`excluded.address` },
    })
}
