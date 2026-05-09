/**
 * P99-P97 Correction Intake — Redaction helpers
 * SERVER-ONLY.
 *
 * Redacts SSN-shaped, credit-card-shaped, passport-shaped, and stray-email
 * patterns from user_message before persistence. The original raw message
 * is never stored on disk; only the redacted version is written.
 */

import { MAX_USER_MESSAGE_LEN } from "./correction-intake-config";

const SSN_REGEX = /\b\d{3}-?\d{2}-?\d{4}\b/g;
// Credit-card-shaped: 13–19 digits, possibly with separators
const CC_REGEX = /\b(?:\d[ -]?){13,19}\b/g;
// Passport-shaped: 1 letter + 7–9 digits (very common pattern, intentionally broad)
const PASSPORT_REGEX = /\b[A-Z][0-9]{7,9}\b/g;
// Email pattern (any email in free text — the user_email field has its own slot)
const EMAIL_IN_TEXT_REGEX = /\b[^\s@]+@[^\s@]+\.[^\s@]+\b/g;

export function redactUserMessage(raw: string): string {
  if (typeof raw !== "string") return "";
  let s = raw.replace(/\r\n/g, "\n").trim();
  if (s.length === 0) return "";
  s = s.replace(SSN_REGEX, "[redacted]");
  s = s.replace(CC_REGEX, (m) => {
    // Don't redact short numeric strings that happen to fall under 13 chars
    const digitOnly = m.replace(/[ -]/g, "");
    return digitOnly.length >= 13 && digitOnly.length <= 19 ? "[redacted]" : m;
  });
  s = s.replace(PASSPORT_REGEX, "[redacted]");
  s = s.replace(EMAIL_IN_TEXT_REGEX, "[redacted-email]");
  // Collapse repeated whitespace
  s = s.replace(/[ \t]{3,}/g, "  ");
  if (s.length > MAX_USER_MESSAGE_LEN) {
    s = s.slice(0, MAX_USER_MESSAGE_LEN) + "…[truncated]";
  }
  return s;
}

/**
 * Strip any keys not in the allow-list. Used as a defense layer in the
 * writer step in addition to the validator's reject-on-forbidden-key rule.
 */
export function stripToAllowList<T extends Record<string, unknown>>(
  obj: T,
  allowList: ReadonlySet<string>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (allowList.has(k)) out[k] = v;
  }
  return out;
}
