/*
 * What a seat costs, from the cheapest tier a cinema sells online to the full one. The tiers are
 * audience groups (a reduced ticket to an adult one) rather than seat classes, and both ends are
 * what the buyer actually pays, fees included. One number where the cinema sells one ticket.
 */
export type PriceRange = { min: number; max: number }

// The range the tiers span; null for a showing whose source states no price at all.
export function toPriceRange(prices: readonly number[]): PriceRange | null {
  return prices.length === 0 ? null : { min: Math.min(...prices), max: Math.max(...prices) }
}
