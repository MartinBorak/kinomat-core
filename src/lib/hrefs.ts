/*
 * The parameters a link carries, with the defaults left out - Slovak and an empty query are what an
 * absent parameter already means, so writing them would only lengthen the link.
 */
export function toQueryString(entries: string[][]): string {
  const parameters = new URLSearchParams(entries)

  return parameters.size === 0 ? '' : `?${parameters}`
}
