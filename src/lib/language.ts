// The two languages the interface is written in. Slovak is what the cinemas print, so it leads.
export type Language = 'sk' | 'en'

export const LANGUAGES: readonly Language[] = ['sk', 'en']

// Written bare in a URL, where every other language is a path prefix: /kina is Slovak, /en/kina English.
export const DEFAULT_LANGUAGE: Language = 'sk'

// The locale each of them formats dates and counts in.
export const LOCALE_BY_LANGUAGE: Record<Language, string> = { sk: 'sk-SK', en: 'en-GB' }

export function isLanguage(value: string): value is Language {
  return LANGUAGES.some((language) => language === value)
}

/*
 * The same page in both languages, which is what a link that switches language needs. Built here
 * rather than per page so that adding a third language is one edit.
 */
export function toHrefByLanguage(toHref: (language: Language) => string): Record<Language, string> {
  return { sk: toHref('sk'), en: toHref('en') }
}

// What a path starts with in this language: nothing for the default, so Slovak links stay as they were.
export function toLanguagePrefix(language: Language): string {
  return language === DEFAULT_LANGUAGE ? '' : `/${language}`
}
