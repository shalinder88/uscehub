/**
 * Formats a Date as conservative relative time for trust UI: "today",
 * "yesterday", "5 days ago", "3 weeks ago", "4 months ago", "2 years ago".
 *
 * Designed for `lastVerifiedAt` rendering on listing cards/detail. The
 * doctrine (RULES.md, PHASE3 plan §4) is that we never display a fake
 * verification date — so this helper accepts `null`/`undefined` and
 * returns `null` rather than guessing.
 *
 * Pure function. SSR-safe. No deps.
 */

const MS_PER_MIN = 60 * 1000;
const MS_PER_HOUR = 60 * MS_PER_MIN;
const MS_PER_DAY = 24 * MS_PER_HOUR;
const MS_PER_WEEK = 7 * MS_PER_DAY;
const MS_PER_MONTH = 30 * MS_PER_DAY; // approximate — fine for trust UI
const MS_PER_YEAR = 365 * MS_PER_DAY;

export function formatRelativeTime(
  input: Date | string | null | undefined,
  now: Date = new Date(),
): string | null {
  if (input == null) return null;
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return null;

  const diffMs = now.getTime() - d.getTime();
  if (diffMs < 0) return "just now"; // future date — clamp to "just now"

  if (diffMs < MS_PER_MIN) return "just now";
  if (diffMs < MS_PER_HOUR) {
    const mins = Math.floor(diffMs / MS_PER_MIN);
    return mins === 1 ? "1 minute ago" : `${mins} minutes ago`;
  }
  if (diffMs < MS_PER_DAY) {
    const hours = Math.floor(diffMs / MS_PER_HOUR);
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`;
  }
  if (diffMs < 2 * MS_PER_DAY) return "yesterday";
  if (diffMs < MS_PER_WEEK) {
    const days = Math.floor(diffMs / MS_PER_DAY);
    return `${days} days ago`;
  }
  if (diffMs < MS_PER_MONTH) {
    const weeks = Math.floor(diffMs / MS_PER_WEEK);
    return weeks === 1 ? "1 week ago" : `${weeks} weeks ago`;
  }
  if (diffMs < MS_PER_YEAR) {
    const months = Math.floor(diffMs / MS_PER_MONTH);
    return months === 1 ? "1 month ago" : `${months} months ago`;
  }
  const years = Math.floor(diffMs / MS_PER_YEAR);
  return years === 1 ? "1 year ago" : `${years} years ago`;
}
