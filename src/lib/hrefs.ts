/*
 * The parameters a link carries, with the defaults left out - Slovak and an empty query are what an
 * absent parameter already means, so writing them would only lengthen the link. A comma is legal
 * in a query as it stands, and a list of genres reads better without the %2C the form encoding
 * gives it.
 */
export function toQueryString(entries: string[][]): string {
  const parameters = new URLSearchParams(entries)

  return parameters.size === 0 ? '' : `?${parameters.toString().replaceAll('%2C', ',')}`
}
