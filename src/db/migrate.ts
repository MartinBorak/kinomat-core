import { migrate } from 'drizzle-orm/postgres-js/migrator'
import { fileURLToPath } from 'node:url'

import { connectToDatabase } from './client'

// Resolved from this file, so the folder is found wherever a consumer installed the package.
const MIGRATIONS_FOLDER = fileURLToPath(new URL('../../drizzle', import.meta.url))

/*
 * Applies every migration the schema has generated so far. Safe to re-run: Drizzle records what it
 * has applied, so this is what brings a fresh database and a stale one to the same place.
 */
export async function migrateDatabase(databaseUrl?: string): Promise<void> {
  const database = connectToDatabase(databaseUrl)

  try {
    await migrate(database, { migrationsFolder: MIGRATIONS_FOLDER })
  } finally {
    await database.close()
  }
}
