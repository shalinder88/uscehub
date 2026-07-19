/**
 * Visa & Jobs (`/career/*`) is fully built and still reachable by direct URL,
 * but it is deliberately not surfaced anywhere on the main site: no homepage
 * lane module, no nav entry, no footer link. `career/layout.tsx` separately
 * keeps the whole section `noindex`, so it stays out of search results too.
 *
 * Flip this to `true` to bring every entry point back at once — nothing was
 * deleted, so re-surfacing it is a one-line change.
 */
export const SHOW_VISA_JOBS_LANE = false;
