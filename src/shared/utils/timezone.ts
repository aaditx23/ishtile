/**
 * Timezone utilities for Bangladesh Standard Time (BST = UTC+6, no DST).
 *
 * The server stores and compares promo dates in UTC.
 * These helpers ensure we always send correctly offset timestamps.
 */

const BDT_OFFSET_MS = 6 * 60 * 60 * 1000; // UTC+6

/**
 * Returns the current moment as a UTC ISO string.
 * `new Date()` in JS is always UTC-based, but this function makes
 * the intent explicit and is the single source of truth for "now".
 */
export function nowUtc(): string {
  return new Date().toISOString();
}

/**
 * Converts a Bangladesh local datetime (treated as UTC+6) to a UTC ISO string.
 *
 * Use this when the user enters a date/time in a form and is thinking in BDT,
 * but the server expects UTC (e.g. promo startsAt / expiresAt in the admin panel).
 *
 * @param bdtDate - A Date object or ISO string assumed to represent BDT local time
 */
export function bdtToUtc(bdtDate: Date | string): string {
  const ms = (typeof bdtDate === 'string' ? new Date(bdtDate) : bdtDate).getTime();
  const date = new Date(ms - BDT_OFFSET_MS).toISOString();
  console.log(date)
  return date;
}

/**
 * Converts a UTC ISO string to the equivalent Bangladesh local time as a Date.
 *
 * Useful for displaying stored UTC timestamps in the admin UI as BDT.
 *
 * @param utcDate - A Date object or ISO string in UTC
 */
export function utcToBdt(utcDate: Date | string): Date {
  const ms = (typeof utcDate === 'string' ? new Date(utcDate) : utcDate).getTime();
  return new Date(ms + BDT_OFFSET_MS);
}

/**
 * Formats a UTC date as a human-readable BDT string.
 * e.g. "07 Mar 2026, 06:30 PM"
 */
export function formatBdt(utcDate: Date | string): string {
  return utcToBdt(utcDate).toLocaleString('en-GB', {
    day:    '2-digit',
    month:  'short',
    year:   'numeric',
    hour:   '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}
