import { toSlug } from '../lib/text'

// The Slovak rights holder of a film, as the distributors' union names it.
export type Distributor = {
  name: string
  // Empty where the union lists no website, which it does only for its members.
  website: string
}

// Derived rather than handed out, so a rebuilt table names the same distributor the same way.
export function toDistributorId(distributor: Pick<Distributor, 'name'>): string {
  return toSlug(distributor.name)
}
