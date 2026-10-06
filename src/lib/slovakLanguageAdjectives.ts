/*
 * Slovak names a language with an adjective, and the ending agrees with the noun it stands before:
 * masculine "-ý" with dabing, neuter plural "-é" with titulky. Read both ways - a scraper turns
 * the word into a code, the interface turns a code back into the word. Not exhaustive by design.
 */
export const SLOVAK_LANGUAGE_ADJECTIVES: Record<string, { masculine: string; neuter: string }> = {
  sk: { masculine: 'slovenský', neuter: 'slovenské' },
  cs: { masculine: 'český', neuter: 'české' },
  en: { masculine: 'anglický', neuter: 'anglické' },
}
