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
