import { connectToDatabase, type Database } from './client'

/*
 * One connection for the whole server, where a script owns one per run. It hangs off globalThis
 * because `next dev` re-evaluates modules on every edit, and a module-scoped one would strand a
 * pool per reload until Postgres refused the next.
 */
const runtime = globalThis as typeof globalThis & { kinomatDatabase?: Database }

/*
 * A server's share of the database: a few connections, let go when idle, and no named prepared
 * statements where a pooler sits in between, since Neon's pooler hands each statement to whichever
 * connection is free and a statement prepared on one is unknown to the next.
 */
export function getDatabase(): Database {
  runtime.kinomatDatabase ??= connectToDatabase(undefined, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: !(process.env.DATABASE_URL ?? '').includes('-pooler'),
  })

  return runtime.kinomatDatabase
}
