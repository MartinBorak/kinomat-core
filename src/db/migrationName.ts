/*
 * Lowercase and underscores, which is what the index prefix already reads as and what keeps a
 * filename a filename: --name="add screening language" would otherwise produce one with spaces in.
 */
const MIGRATION_NAME = /^[a-z0-9]+(_[a-z0-9]+)*$/u

// The value of a flag written either way, since both forms are ordinary on a command line.
function findFlagValue(args: string[], flag: string): string | null {
  const inline = args.find((arg) => arg.startsWith(`${flag}=`))

  if (inline !== undefined) {
    return inline.slice(flag.length + 1) || null
  }

  const flagIndex = args.indexOf(flag)
  const value = flagIndex === -1 ? undefined : args[flagIndex + 1]

  // A following flag is the next option, not this one's value, so --name --custom names nothing.
  return value !== undefined && !value.startsWith('-') ? value : null
}

/*
 * The name a migration was asked for, or null where none was given or it is not a usable filename.
 * Required because drizzle-kit's fallback is a random adjective and Marvel character, and the
 * filename is the only thing a git log, a pull request and the drizzle/ listing ever show of it.
 */
export function findMigrationName(args: string[]): string | null {
  const name = findFlagValue(args, '--name')

  return name !== null && MIGRATION_NAME.test(name) ? name : null
}
