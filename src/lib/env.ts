/**
 * Server-side environment variable helpers.
 *
 * Centralizes required + optional env reads so callers don't repeat the
 * same `process.env.X` pattern with subtly different fallbacks. Throws
 * with a clear message when a required value is missing — beats silent
 * `Bearer undefined` or empty-string comparisons that the audit found
 * in cron-route auth (P1-10).
 *
 * IMPORTANT: do NOT import this module from a `"use client"` component
 * or anything bundled into the browser. The helpers here read env
 * values that should never reach the client. The repo doesn't depend
 * on the `server-only` package, so this convention is enforced by
 * import discipline + code review.
 *
 * `NEXT_PUBLIC_*` variables (which Next.js intentionally inlines into
 * the client bundle) are NOT read here. They're read directly at their
 * call sites (e.g. `src/lib/feature-flags.ts`) — that pattern is fine
 * because Next.js statically replaces them at build time.
 */

export class MissingEnvError extends Error {
  constructor(name: string, hint?: string) {
    const lines = [
      `Missing required environment variable: ${name}`,
      hint ? `  Hint: ${hint}` : null,
      "  See .env.example for the full list of expected variables.",
    ].filter(Boolean);
    super(lines.join("\n"));
    this.name = "MissingEnvError";
  }
}

/**
 * Read a required server-only env var. Throws `MissingEnvError` if the
 * value is unset, empty, or not a string. Use this for anything that
 * must be configured before the server can serve a request safely.
 */
export function requiredServerEnv(name: string, hint?: string): string {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) {
    throw new MissingEnvError(name, hint);
  }
  return value;
}

/**
 * Read an optional server-only env var. Returns `undefined` (not an
 * empty string) when unset, so callers can use `??` for fallbacks
 * without the empty-string footgun.
 */
export function optionalServerEnv(name: string): string | undefined {
  const value = process.env[name];
  if (typeof value !== "string" || value.length === 0) return undefined;
  return value;
}

/**
 * Returns the cron bearer secret.
 *
 * In production: required. Throws `MissingEnvError` so a missing
 * `CRON_SECRET` fails loudly at boot/cron-invocation time instead of
 * silently allowing `Bearer undefined` requests through (the failure
 * mode the audit flagged).
 *
 * In development: optional — local cron testing without a real secret
 * is allowed.
 */
export function getCronSecret(): string | undefined {
  if (process.env.NODE_ENV === "production") {
    return requiredServerEnv(
      "CRON_SECRET",
      "Required in production for /api/cron/* bearer-token auth.",
    );
  }
  return optionalServerEnv("CRON_SECRET");
}

/**
 * Resend transactional-email config. All fields are optional — email
 * sending gracefully no-ops when `apiKey` or `notifyTo` is missing
 * (preserves the existing degrade-don't-crash behavior in
 * `src/lib/email.ts`).
 */
export interface ResendConfig {
  apiKey: string | undefined;
  from: string;
  notifyTo: string | undefined;
}

const DEFAULT_RESEND_FROM = "USCEHub <onboarding@resend.dev>";

export function getResendConfig(): ResendConfig {
  return {
    apiKey: optionalServerEnv("RESEND_API_KEY"),
    from: optionalServerEnv("RESEND_FROM") ?? DEFAULT_RESEND_FROM,
    notifyTo: optionalServerEnv("NOTIFY_TO"),
  };
}

/**
 * Returns the canonical site URL for server-side use (admin links in
 * notification emails, etc). Falls back to the provided constant when
 * `NEXTAUTH_URL` is unset. Pass `SITE_URL` from `src/lib/site-config.ts`
 * as the fallback — that constant is the canonical hardcoded source.
 */
export function getSiteUrlFromEnv(fallback: string): string {
  return optionalServerEnv("NEXTAUTH_URL") ?? fallback;
}

/**
 * Admin-seed credentials. Both required — the seed script must NEVER
 * hardcode an admin password (audit P0-1). Set these in `.env` for
 * local seeding or in CI secrets for any environment that runs seed.
 */
export interface SeedAdminCredentials {
  email: string;
  password: string;
}

export function getSeedAdminCredentials(): SeedAdminCredentials {
  return {
    email: requiredServerEnv(
      "SEED_ADMIN_EMAIL",
      "Required to seed the admin user. Set in .env (local) or CI secrets.",
    ),
    password: requiredServerEnv(
      "SEED_ADMIN_PASSWORD",
      "Required to seed the admin user. NEVER hardcode this. Use a long random string for any DB that may face the public.",
    ),
  };
}

/**
 * Returns true when seed should create an admin user. Opt-in only —
 * admin creation is OFF by default so a stray `npx prisma db seed`
 * never silently creates a privileged account.
 *
 * Caller must still call `getSeedAdminCredentials()` to read the
 * required email/password env vars; that helper throws if either is
 * missing. Together they ensure: (1) admin creation is intentional,
 * and (2) when intentional, no default password can be used.
 */
export function shouldSeedCreateAdmin(): boolean {
  return optionalServerEnv("SEED_CREATE_ADMIN") === "1";
}
