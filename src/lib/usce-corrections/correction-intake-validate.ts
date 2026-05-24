/**
 * P99-P97 Correction Intake — Payload validation
 * SERVER-ONLY.
 *
 * Strict allow-list + enum + shape checks. Returns a discriminated union;
 * never throws on bad input. The reject reasons are intentionally coarse —
 * the endpoint never echoes which exact field tripped.
 */

import {
  ALLOWED_FIELD_REPORTED,
  ALLOWED_ISSUE_TYPES,
  ALLOWED_PAYLOAD_KEYS,
  ALLOWED_REPORT_REFS,
  ALLOWED_RUNTIME_SETS,
  EMAIL_REGEX,
  FORBIDDEN_PAYLOAD_KEYS_LOWER,
  HTTP_URL_REGEX,
  ISO_Z_REGEX,
  LISTING_ID_REGEX,
  MAX_PAYLOAD_BYTES,
  MAX_USER_MESSAGE_LEN,
  MIN_USER_MESSAGE_LEN,
} from "./correction-intake-config";
import {
  INTAKE_SCHEMA_VERSION,
  type IntakePayload,
  type ValidationResult,
} from "./correction-intake-types";

function isPlainObject(x: unknown): x is Record<string, unknown> {
  return !!x && typeof x === "object" && !Array.isArray(x);
}

export function validateIntakePayload(raw: unknown): ValidationResult {
  // Size check — caller should have already gated, but defense in depth.
  let serializedSize: number;
  try {
    serializedSize = Buffer.byteLength(JSON.stringify(raw), "utf8");
  } catch {
    return { ok: false, rejected_reason: "schema_violation" };
  }
  if (serializedSize > MAX_PAYLOAD_BYTES) {
    return { ok: false, rejected_reason: "too_large" };
  }
  if (!isPlainObject(raw)) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // Forbidden field detection — case-insensitive, exact-key match.
  for (const k of Object.keys(raw)) {
    if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) {
      return { ok: false, rejected_reason: "forbidden_field" };
    }
  }

  // Honeypot
  const honey = raw["honeypot_field"];
  if (typeof honey === "string" && honey.length > 0) {
    return { ok: false, rejected_reason: "honeypot_tripped" };
  }

  // Reject any unknown top-level key (allow-list).
  for (const k of Object.keys(raw)) {
    if (!ALLOWED_PAYLOAD_KEYS.has(k)) {
      return { ok: false, rejected_reason: "schema_violation" };
    }
  }

  // schema_version
  if (raw["schema_version"] !== INTAKE_SCHEMA_VERSION) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // report_ref
  const report_ref = raw["report_ref"];
  if (typeof report_ref !== "string" || !ALLOWED_REPORT_REFS.includes(report_ref as never)) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // listing_id (allow empty when report_ref === pilot-feedback)
  const listing_id = raw["listing_id"];
  if (typeof listing_id !== "string") {
    return { ok: false, rejected_reason: "schema_violation" };
  }
  if (listing_id === "") {
    if (report_ref !== "pilot-feedback") {
      return { ok: false, rejected_reason: "schema_violation" };
    }
  } else {
    if (!LISTING_ID_REGEX.test(listing_id) || listing_id.length > 120) {
      return { ok: false, rejected_reason: "schema_violation" };
    }
  }

  // runtime_set
  const runtime_set = raw["runtime_set"];
  if (typeof runtime_set !== "string" || !ALLOWED_RUNTIME_SETS.includes(runtime_set as never)) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // page_url
  const page_url = raw["page_url"];
  if (typeof page_url !== "string" || !HTTP_URL_REGEX.test(page_url) || page_url.length > 500) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // issue_type
  const issue_type = raw["issue_type"];
  if (typeof issue_type !== "string" || !ALLOWED_ISSUE_TYPES.includes(issue_type as never)) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // user_message
  const user_message = raw["user_message"];
  if (
    typeof user_message !== "string" ||
    user_message.length < MIN_USER_MESSAGE_LEN ||
    user_message.length > MAX_USER_MESSAGE_LEN
  ) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // submitted_at
  const submitted_at = raw["submitted_at"];
  if (typeof submitted_at !== "string" || !ISO_Z_REGEX.test(submitted_at)) {
    return { ok: false, rejected_reason: "schema_violation" };
  }

  // source_context
  const source_context = raw["source_context"];
  if (!isPlainObject(source_context)) {
    return { ok: false, rejected_reason: "schema_violation" };
  }
  for (const [k, v] of Object.entries(source_context)) {
    if (FORBIDDEN_PAYLOAD_KEYS_LOWER.has(k.toLowerCase())) {
      return { ok: false, rejected_reason: "forbidden_field" };
    }
    if (typeof v !== "string" || v.length > 500) {
      return { ok: false, rejected_reason: "schema_violation" };
    }
  }

  // Optional fields — if present, validate shape.
  if ("user_email" in raw) {
    const ue = raw["user_email"];
    if (ue !== undefined && ue !== null && ue !== "") {
      if (typeof ue !== "string" || !EMAIL_REGEX.test(ue) || ue.length > 254) {
        return { ok: false, rejected_reason: "schema_violation" };
      }
    }
  }
  if ("suggested_correction" in raw) {
    const sc = raw["suggested_correction"];
    if (sc !== undefined && sc !== null && sc !== "") {
      if (typeof sc !== "string" || sc.length > 2000) {
        return { ok: false, rejected_reason: "schema_violation" };
      }
    }
  }
  if ("source_url" in raw) {
    const su = raw["source_url"];
    if (su !== undefined && su !== null && su !== "") {
      if (typeof su !== "string" || !HTTP_URL_REGEX.test(su) || su.length > 500) {
        return { ok: false, rejected_reason: "schema_violation" };
      }
    }
  }
  if ("institution_name_displayed" in raw) {
    const v = raw["institution_name_displayed"];
    if (v !== undefined && v !== null && v !== "") {
      if (typeof v !== "string" || v.length > 200) {
        return { ok: false, rejected_reason: "schema_violation" };
      }
    }
  }
  if ("field_reported" in raw) {
    const v = raw["field_reported"];
    if (v !== undefined && v !== null && v !== "") {
      if (typeof v !== "string" || !ALLOWED_FIELD_REPORTED.includes(v as never)) {
        return { ok: false, rejected_reason: "schema_violation" };
      }
    }
  }
  if ("client_timestamp" in raw) {
    const v = raw["client_timestamp"];
    if (v !== undefined && v !== null && v !== "") {
      if (typeof v !== "string" || !ISO_Z_REGEX.test(v)) {
        return { ok: false, rejected_reason: "schema_violation" };
      }
    }
  }

  // All checks passed.
  return { ok: true, payload: raw as unknown as IntakePayload };
}
