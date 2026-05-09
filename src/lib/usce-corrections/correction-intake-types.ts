/**
 * P99-P97 Correction Intake — Server-side types
 * Spec: docs/platform-v2/local/usce-completeness/correction-intake-backsite-spec-2/
 *
 * SERVER-ONLY. Do not import from any client component, page, or layout.
 */

export const INTAKE_SCHEMA_VERSION = "v2" as const;

export type IntakeReportRef =
  | "pilot-listing"
  | "pilot-feedback"
  | "pilot-source-link-broken"
  | "pilot-eligibility"
  | "pilot-visa"
  | "pilot-cost"
  | "pilot-application"
  | "pilot-program-closed"
  | "pilot-duplicate"
  | "pilot-other";

export type IntakeIssueType =
  | "source_link_broken"
  | "eligibility_incorrect"
  | "visa_information_incorrect"
  | "cost_or_fee_incorrect"
  | "application_process_incorrect"
  | "program_closed"
  | "duplicate_listing"
  | "wrong_institution"
  | "outdated_information"
  | "source_does_not_support_claim"
  | "other";

export type IntakeRuntimeSet = "active" | "staged" | "bridge_draft" | "maine" | "unknown";

export type IntakeFieldReported =
  | "audience"
  | "visa"
  | "fee_or_stipend"
  | "application_process"
  | "site_specificity"
  | "specialty"
  | "source_link"
  | "general";

export interface IntakeSourceContext {
  primary_source_url?: string;
  specialty_displayed?: string;
  audience_displayed?: string;
  visa_displayed?: string;
  fee_displayed?: string;
  site_specificity_displayed?: string;
}

export interface IntakePayload {
  schema_version: typeof INTAKE_SCHEMA_VERSION;
  listing_id: string;
  report_ref: IntakeReportRef;
  runtime_set: IntakeRuntimeSet;
  page_url: string;
  issue_type: IntakeIssueType;
  user_message: string;
  submitted_at: string;
  source_context: IntakeSourceContext;
  user_email?: string;
  suggested_correction?: string;
  source_url?: string;
  institution_name_displayed?: string;
  field_reported?: IntakeFieldReported;
  client_timestamp?: string;
  honeypot_field?: string;
}

export type QueueStatus =
  | "RECEIVED"
  | "TRIAGED"
  | "SOURCE_RECHECK_PENDING"
  | "SOURCE_RECHECK_COMPLETE"
  | "NEEDS_COPY_UPDATE"
  | "NEEDS_SOURCE_URL_UPDATE"
  | "NEEDS_DELIST"
  | "NO_CHANGE"
  | "NEEDS_INSTITUTION_CONFIRMATION_LATER"
  | "STAGED_CORRECTION"
  | "VALIDATED_CORRECTION"
  | "CLOSED";

export type QueuePriority =
  | "P0_SAFETY_OR_LEGAL"
  | "P1_MATERIAL_ELIGIBILITY_OR_APPLICATION"
  | "P2_SOURCE_LINK_OR_FEE"
  | "P3_COPY_OR_MINOR"
  | "P4_SPAM_OR_UNACTIONABLE";

export interface QueueItem {
  correction_id: string;
  schema_version: "v1";
  status: QueueStatus;
  priority: QueuePriority;
  listing_id: string;
  report_ref: IntakeReportRef;
  runtime_set: IntakeRuntimeSet;
  issue_type: IntakeIssueType;
  submitted_at: string;
  received_at: string;
  received_channel: "web_form" | "email_relay" | "manual_curator_entry";
  user_message_redacted: string;
  source_context: IntakeSourceContext;
  evidence_join_key: string;
  assigned_reviewer: string | null;
  review_due_date: string | null;
  audit_log_path: string;
  user_email_present: boolean;
}

export type AuditAction =
  | "intake_received"
  | "triaged"
  | "source_recheck_started"
  | "source_recheck_completed"
  | "evidence_captured"
  | "decision_made"
  | "correction_staged"
  | "validator_run"
  | "qa_review_started"
  | "qa_review_completed"
  | "closed"
  | "reopened_with_audit";

export type AuditDecision =
  | "no_decision_yet"
  | "no_change"
  | "copy_correction"
  | "source_url_update"
  | "eligibility_caveat_update"
  | "delist_or_hide"
  | "needs_institution_confirmation_later"
  | "marked_spam"
  | "rejected_forbidden_field";

export interface AuditEvent {
  audit_event_id: string;
  correction_id: string;
  timestamp: string;
  actor_role:
    | "intake_endpoint"
    | "viewer"
    | "curator"
    | "source_reviewer"
    | "senior_reviewer"
    | "qa_reviewer"
    | "admin"
    | "automated_validator";
  actor_id_or_placeholder: string;
  action: AuditAction;
  previous_status: QueueStatus | "NONE";
  new_status: QueueStatus | "NONE";
  evidence_checked: string[];
  source_urls_checked: string[];
  archive_urls_checked: string[];
  decision: AuditDecision;
  decision_reason: string;
  changed_fields: Record<string, { previous?: unknown; new?: unknown }>;
  validator_results: Record<string, "PASS" | "FAIL" | "NOT_RUN" | { result: string; detail?: string }>;
  next_required_action: string;
}

export interface ValidationOk {
  ok: true;
  payload: IntakePayload;
}

export interface ValidationErr {
  ok: false;
  rejected_reason: "schema_violation" | "forbidden_field" | "honeypot_tripped" | "too_large";
}

export type ValidationResult = ValidationOk | ValidationErr;
