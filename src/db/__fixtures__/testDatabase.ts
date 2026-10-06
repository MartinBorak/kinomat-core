import { sql } from 'drizzle-orm'
import { it as baseIt } from 'vitest'

import { connectToDatabase, type Database } from '../client'
import { migrateDatabase } from '../migrate'
import {
  cinemas,
  films,
  programmeFilms,
  programmePages,
  programmes,
  screenings,
  titleResolutions,
} from '../schema'

/*
 * A real Postgres, not a fake: a foreign key, a partial-null unique index and an upsert's conflict
 * target are what these tests are about, and a stand-in would agree to all of them. `pnpm test:db`
 * supplies the string and runs the files serially, since they share one database each empties.
 * Without a string they skip, so the ordinary suite never assumes a database is running.
 */
export const databaseUrl = process.env.DATABASE_URL

/*
 * Truncating rather than dropping keeps the migration cost off each test, and RESTART IDENTITY
 * means generated ids do not drift between runs.
 */
async function emptyDatabase(database: Database): Promise<void> {
  await database.execute(
    sql`TRUNCATE ${titleResolutions}, ${screenings}, ${programmeFilms}, ${programmes}, ${programmePages}, ${films}, ${cinemas} RESTART IDENTITY CASCADE`,
  )
}

/*
 * One migrated connection per file. Opened only when a test actually asks for a database, so a
 * suite skipped for want of a connection string never tries to reach one.
 */
const withConnection = baseIt.extend('connection', { scope: 'file' }, async ({}, { onCleanup }) => {
  await migrateDatabase(databaseUrl)
  const database = connectToDatabase(databaseUrl)

  onCleanup(async () => {
    await emptyDatabase(database)
    await database.close()
  })

  return database
})

/*
 * An empty, already-migrated database, for a test that declares it. Emptied after the last test as
 * well as before each one: the same database is the one `pnpm db:store` writes to in development,
 * and rows left behind by a test read exactly like rows a run stored.
 */
export const it = withConnection.extend('database', async ({ connection }) => {
  await emptyDatabase(connection)

  return connection
})
