import { spawnSync } from 'node:child_process'

import { findMigrationName } from './migrationName'

// Generates a migration, refusing to without a name; see findMigrationName for why one is required.
function main(): void {
  const args = process.argv.slice(2)

  if (findMigrationName(args) === null) {
    console.error(
      'A migration needs a name in lower_snake_case, saying what it does:\n' +
        '  pnpm db:generate --name=add_screening_language\n' +
        'Add --custom for an empty migration to hand-write SQL into.',
    )
    process.exitCode = 1

    return
  }

  const { status } = spawnSync('drizzle-kit', ['generate', ...args], { stdio: 'inherit' })

  process.exitCode = status ?? 1
}

main()
