import { ne, type SQL } from 'drizzle-orm'

import { screenings } from './schema'

/*
 * A showing a ticket can still be bought for. Edison prints VYPREDANÉ in place of the link when one
 * sells out, and a card that leads nowhere offers a seat that is gone - so the schedule asks for
 * this. What is playing does not: a sold-out film is still playing until its last showing is past.
 */
export const IS_BOOKABLE: SQL = ne(screenings.bookingUrl, '')
