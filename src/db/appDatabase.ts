import { connectToDatabase, type Database } from './client'

/*
 * One connection for the whole server, where a script owns one per run. It hangs off globalThis
 * because `next dev` re-evaluates modules on every edit, and a module-scoped one would strand a
 * pool per reload until Postgres refused the next.
 */
const runtime = globalThis as typeof globalThis & { kinomatDatabase?: Database }

export function getDatabase(): Database {
  runtime.kinomatDatabase ??= connectToDatabase()

  return runtime.kinomatDatabase
}
