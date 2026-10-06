import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

import * as schema from './schema'

/*
 * The connection string is read per call rather than at module load, so importing anything from
 * here stays safe in the Next build and in tests that never touch a database - the same reason the
 * TMDB token is read per request.
 */
function requireDatabaseUrl(): string {
  const url = process.env.DATABASE_URL

  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Start the local database with `docker compose up -d` and add its connection string to .env.local',
    )
  }

  return url
}

export type Database = ReturnType<typeof connectToDatabase>

/*
 * One connection to one database. Callers own it and close it, which suits scripts and tests; a
 * long-lived pool for the app is the deploy phase's problem, not this slice's.
 */
export function connectToDatabase(databaseUrl: string = requireDatabaseUrl()) {
  const client = postgres(databaseUrl)

  return Object.assign(drizzle(client, { schema }), {
    close: async (): Promise<void> => client.end(),
  })
}
