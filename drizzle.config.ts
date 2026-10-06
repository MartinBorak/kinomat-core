import { defineConfig } from 'drizzle-kit'

/*
 * Migrations are generated from the schema and committed, rather than pushed straight at a running
 * database: a migration is reviewable in a diff, and a push is not.
 */
export default defineConfig({
  dialect: 'postgresql',
  schema: './src/db/schema.ts',
  out: './drizzle',
  dbCredentials: { url: process.env.DATABASE_URL ?? '' },
})
