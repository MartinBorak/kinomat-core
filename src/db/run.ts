import { connectToDatabase } from './client'
import { migrateDatabase } from './migrate'
import { seedCinemas } from './seed'

/*
 * Brings a database up to date and mirrors the cinema registry into it. Both steps are idempotent,
 * so this is what a fresh clone runs once and what a schema change runs again.
 */
async function main(): Promise<void> {
  await migrateDatabase()
  console.log('Applied every migration in drizzle/')

  const database = connectToDatabase()

  try {
    await seedCinemas(database)
    console.log('Seeded the cinema registry')
  } finally {
    await database.close()
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exitCode = 1
})
