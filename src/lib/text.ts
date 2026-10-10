/*
 * Slovak typography puts a non-breaking space after every single-letter word, so one arrives
 * mid-string from every Slovak source, out of trim's reach, breaking string equality while looking
 * identical in logs, JSON and a page alike. \s catches it. Whitespace is all this touches, and
 * diacritics and case stay as the source wrote them.
 */
export function normalizeWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

/*
 * Slovak is written with diacritics and typed without them, so both sides are folded to bare
 * lowercase letters before they are compared.
 */
export function foldForSearch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}

// Letters NFD leaves whole, each being a letter of its own rather than a base plus a mark.
const UNDECOMPOSED: Record<string, string> = {
  ł: 'l',
  đ: 'd',
  ø: 'o',
  ß: 'ss',
  æ: 'ae',
  œ: 'oe',
}

/*
 * Text as a URL segment: bare lowercase letters and digits, one hyphen for every run of anything
 * else. "Duna: Časť tretia" becomes "duna-cast-tretia". Empty where nothing survives, which a
 * caller reads as "no slug" rather than as a name.
 */
export function toSlug(text: string): string {
  return foldForSearch(text)
    .replace(/[łđøßæœ]/g, (letter) => UNDECOMPOSED[letter])
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
