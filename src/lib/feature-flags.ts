const DEV_EMAILS = ["admin@uscehub.com"];

export function isDevMode(email?: string | null): boolean {
  if (process.env.NEXT_PUBLIC_ENABLE_PHASES === "1") return true;
  if (!email) return false;
  return DEV_EMAILS.includes(email.toLowerCase());
}

export function isPhasesEnabled(email?: string | null): boolean {
  return isDevMode(email);
}
