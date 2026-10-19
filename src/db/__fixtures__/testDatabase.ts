import { sql } from 'drizzle-orm'
import { it as baseIt } from 'vitest'

import { connectToDatabase, type Database } from '../client'
import { migrateDatabase } from '../migrate'
import {
  cinemas,
  cinemaxFilms,
  films,
  pipelineRuns,
  programmeFilms,
  programmePages,
  programmes,
  publications,
  scrapedDays,
  screenings,
  titleResolutions,
} from '../schema'

/*
 * A real Postgres, not a fake: a foreign key, a partial-null unique index and an upsert's conflict
 * target are what these tests are about, and a stand-in would agree to all of them. `pnpm test:db`
 * supplies the string and runs the files serially, since they share one database each empties.
 * Without a string they skip, so the ordinary suite never assumes a database is running.
 * Its own variable, never DATABASE_URL: that names a developer's corpus, emptied twice this way.
 */
export const databaseUrl = process.env.TEST_DATABASE_URL

/* The name is the last line of defence: a database that is not called *_test is never emptied. */
export function assertTestDatabase(url: string): void {
  const name = new URL(url).pathname.slice(1)
  if (!name.endsWith('_test')) {
    throw new Error(
      `TEST_DATABASE_URL names "${name}", which does not end in _test. These tests empty the database they are given, so they refuse one that may hold work.`,
    )
  }
}

/*
 * Truncating rather than dropping keeps the migration cost off each test, and RESTART IDENTITY
 * means generated ids do not drift between runs.
 */
async function emptyDatabase(database: Database): Promise<void> {
  await database.execute(
    sql`TRUNCATE ${titleResolutions}, ${screenings}, ${programmeFilms}, ${programmes}, ${programmePages}, ${scrapedDays}, ${cinemaxFilms}, ${pipelineRuns}, ${publications}, ${films}, ${cinemas} RESTART IDENTITY CASCADE`,
  )
}

/*
 * One migrated connection per file. Opened only when a test actually asks for a database, so a
 * suite skipped for want of a connection string never tries to reach one.
 */
const withConnection = baseIt.extend('connection', { scope: 'file' }, async ({}, { onCleanup }) => {
  if (databaseUrl === undefined) {
    throw new Error('TEST_DATABASE_URL is not set')
  }
  assertTestDatabase(databaseUrl)
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
 * well as before each one, so no test ever reads what another left behind.
 */
export const it = withConnection.extend('database', async ({ connection }) => {
  await emptyDatabase(connection)

  return connection
})
