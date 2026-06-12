// Shared utilities for per-employer sponsor pages.

export function employerSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/, "")
    .slice(0, 80);
}

// Parse "$435,000" → { value: 435000, unitText: "YEAR" }
// Parse "$156.25 per hour" → { value: 156.25, unitText: "HOUR" }
export function parseSalaryForSchema(
  text: string
): { value: number; unitText: string } | null {
  const annual = text.match(/^\$([0-9,]+)$/);
  if (annual) return { value: parseInt(annual[1].replace(/,/g, ""), 10), unitText: "YEAR" };
  const hourly = text.match(/\$([0-9.]+)\s*per\s*hour/i);
  if (hourly) return { value: parseFloat(hourly[1]), unitText: "HOUR" };
  return null;
}

// Extract end date from periodText for validThrough.
// "from 13 Jul 2026 to 12 Jul 2029" → "2029-07-12"
// "from 9/1/2026 to 8/31/2029" → "2029-08-31"
export function parseValidThrough(periodText: string): string | null {
  // "to DD Mon YYYY"
  const fmt1 = periodText.match(/to\s+(\d{1,2})\s+(\w{3})\s+(\d{4})/i);
  if (fmt1) {
    const MONTHS: Record<string, string> = {
      jan:"01",feb:"02",mar:"03",apr:"04",may:"05",jun:"06",
      jul:"07",aug:"08",sep:"09",oct:"10",nov:"11",dec:"12",
    };
    const m = MONTHS[fmt1[2].toLowerCase()];
    if (m) return `${fmt1[3]}-${m}-${fmt1[1].padStart(2, "0")}`;
  }
  // "to M/D/YYYY"
  const fmt2 = periodText.match(/to\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (fmt2) {
    return `${fmt2[3]}-${fmt2[1].padStart(2, "0")}-${fmt2[2].padStart(2, "0")}`;
  }
  return null;
}
