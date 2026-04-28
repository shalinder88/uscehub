/**
 * Single source of truth for the site's public origin.
 *
 * Used by canonical URLs, JSON-LD, sitemap, and OG metadata so the
 * `https://uscehub.com` vs `https://www.uscehub.com` split that the
 * audit found in src/app/layout.tsx (P1-7) cannot recur.
 *
 * If you need to change the canonical host, change it here only.
 */
export const SITE_URL = "https://uscehub.com" as const;

/**
 * Build a fully-qualified site URL for a path.
 * Accepts either "/foo" or "foo".
 */
export function siteUrl(path: string = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}
