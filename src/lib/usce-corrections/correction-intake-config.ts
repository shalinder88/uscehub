/**
 * P99-P97 Correction Intake — Server-side config + flag helpers
 * SERVER-ONLY.
 */

import * as path from "node:path";

export const MAX_PAYLOAD_BYTES = 16384;
export const MAX_USER_MESSAGE_LEN = 4000;
export const MIN_USER_MESSAGE_LEN = 5;

export const ALLOWED_REPORT_REFS = [
  "pilot-listing",
  "pilot-feedback",
  "pilot-source-link-broken",
  "pilot-eligibility",
  "pilot-visa",
  "pilot-cost",
  "pilot-application",
  "pilot-program-closed",
  "pilot-duplicate",
  "pilot-other",
] as const;

export const ALLOWED_ISSUE_TYPES = [
  "source_link_broken",
  "eligibility_incorrect",
  "visa_information_incorrect",
  "cost_or_fee_incorrect",
  "application_process_incorrect",
  "program_closed",
  "duplicate_listing",
  "wrong_institution",
  "outdated_information",
  "source_does_not_support_claim",
  "other",
] as const;

export const ALLOWED_RUNTIME_SETS = [
  "active",
  "staged",
  "bridge_draft",
  "maine",
  "unknown",
] as const;

export const ALLOWED_FIELD_REPORTED = [
  "audience",
  "visa",
  "fee_or_stipend",
  "application_process",
  "site_specificity",
  "specialty",
  "source_link",
  "general",
] as const;

export const ALLOWED_PAYLOAD_KEYS = new Set<string>([
  "schema_version",
  "listing_id",
  "report_ref",
  "runtime_set",
  "page_url",
  "issue_type",
  "user_message",
  "submitted_at",
  "source_context",
  "user_email",
  "suggested_correction",
  "source_url",
  "institution_name_displayed",
  "field_reported",
  "client_timestamp",
  "honeypot_field",
]);

/**
 * Forbidden top-level keys. Case-insensitive, exact-key match.
 * Mirrors the spec's intake_payload_schema forbidden_fields list.
 */
export const FORBIDDEN_PAYLOAD_KEYS_LOWER = new Set<string>([
  "passport_number",
  "passport_document",
  "passport_image",
  "visa_number",
  "visa_document",
  "visa_image",
  "ecfmg_id",
  "ecfmg_document",
  "usmle_id",
  "nrmp_id",
  "aamc_id",
  "acgme_id",
  "ssn",
  "social_security_number",
  "tax_id",
  "ein",
  "date_of_birth",
  "dob",
  "medical_record",
  "mrn",
  "phi",
  "patient_identifier",
  "immigration_document",
  "i20_document",
  "ds2019_document",
  "credential_document",
  "diploma_image",
  "transcript_image",
  "cv_upload",
  "resume_upload",
  "photo_id_upload",
  "headshot_upload",
  "drivers_license",
  "card_number",
  "credit_card",
  "bank_account_number",
  "iban",
  "payment_token",
]);

/**
 * Listing ID regex from the staged-runtime mapping.
 * Format: pilot-NNN-SS-kebab-slug   OR empty (only valid when report_ref is pilot-feedback).
 */
export const LISTING_ID_REGEX = /^pilot-\d{3}-[A-Z]{2}-[a-z0-9-]+$/;

export const ISO_Z_REGEX = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export const HTTP_URL_REGEX = /^https?:\/\//;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isCorrectionIntakeEnabled(): boolean {
  return process.env.USCE_CORRECTION_INTAKE_ENABLED === "true";
}

/**
 * Resolve the queue root directory. Default: docs/platform-v2/local/usce-corrections
 * relative to the current working directory (the repo root in normal use).
 *
 * Override with USCE_CORRECTION_QUEUE_ROOT for testing.
 */
export function getQueueRoot(): string {
  const override = process.env.USCE_CORRECTION_QUEUE_ROOT;
  if (override && override.trim() !== "") {
    return path.resolve(override);
  }
  return path.resolve(
    process.cwd(),
    "docs/platform-v2/local/usce-corrections"
  );
}
