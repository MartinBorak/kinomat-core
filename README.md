# kinomat-core

The database contract of [Kinomat](https://kinomat.sk), the Bratislava cinema programme: the Postgres schema and its migrations, the Drizzle client, the cinema registry, the film type with its public id, and the small helpers both sides of the project share. The public site reads through it; the pipeline that scrapes the cinemas writes through it.

It ships TypeScript source, not a build. Consumers list it as a git dependency and transpile it themselves (`transpilePackages` in Next, `tsx` for scripts).

## Using it

```sh
pnpm add github:MartinBorak/kinomat-core#main
```

```ts
import { getDatabase } from 'kinomat-core/db/appDatabase'
import { films } from 'kinomat-core/db/schema'
```

Every export is a subpath listed in `package.json`. `drizzle-orm`, `postgres` and `temporal-polyfill` are peer dependencies. After a change here, `pnpm update kinomat-core` in each consumer moves its lockfile to the new commit.

## Developing

```sh
pnpm install
pnpm hooks            # installs the pre-commit hook once
pnpm lint && pnpm typecheck && pnpm test
```

The database tests need a Postgres and truncate it between tests, so point `DATABASE_URL` in `.env.local` at a database nothing else uses. `compose.yaml` starts one locally with the credentials in `.env`.

```sh
docker compose up -d --wait
pnpm db:setup         # migrates and seeds the cinema registry
pnpm test:db
```

## Changing the schema

Edit `src/db/schema.ts`, then generate a named migration and commit both:

```sh
pnpm db:generate --name=add_screening_language
```

Consumers apply migrations by calling `migrateDatabase` from `kinomat-core/db/migrate`; the folder is resolved from the package, so it works wherever the package is installed.

## Licence

MIT.
