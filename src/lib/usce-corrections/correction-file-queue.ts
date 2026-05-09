/**
 * P99-P97 Correction Intake — File queue writer
 * SERVER-ONLY.
 *
 * Atomic write of:
 *   - inbox/YYYY/MM/<correction_id>.json   (the queue item)
 *   - audit/YYYY/MM/<correction_id>.jsonl  (the append-only audit log)
 *
 * Writes are gated by isCorrectionIntakeEnabled() — the writer refuses to
 * touch the filesystem when the flag is off, even if a future caller forgets
 * the route-level guard. Defense in depth.
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { randomUUID, randomBytes } from "node:crypto";

import {
  ALLOWED_PAYLOAD_KEYS,
  getQueueRoot,
  isCorrectionIntakeEnabled,
} from "./correction-intake-config";
import { redactUserMessage, stripToAllowList } from "./correction-intake-redact";
import {
  type AuditEvent,
  type IntakePayload,
  type QueueItem,
  type QueuePriority,
  type QueueStatus,
} from "./correction-intake-types";

function uuidHexNoDashes(): string {
  // Prefer randomUUID() when available; otherwise build one from randomBytes.
  if (typeof randomUUID === "function") {
    return randomUUID().replace(/-/g, "");
  }
  return randomBytes(16).toString("hex");
}

function ensureDirSync(dirAbs: string): void {
  fs.mkdirSync(dirAbs, { recursive: true });
}

function atomicWriteSync(targetAbs: string, contents: string): void {
  const dir = path.dirname(targetAbs);
  ensureDirSync(dir);
  // Write to a temp sibling, then rename. POSIX rename is atomic within the same FS.
  const tmp = path.join(dir, `.${path.basename(targetAbs)}.${process.pid}.${Date.now()}.tmp`);
  fs.writeFileSync(tmp, contents, { encoding: "utf8", mode: 0o600 });
  fs.renameSync(tmp, targetAbs);
}

function priorityForIssue(issue_type: IntakePayload["issue_type"]): QueuePriority {
  switch (issue_type) {
    case "program_closed":
      return "P0_SAFETY_OR_LEGAL";
    case "eligibility_incorrect":
    case "visa_information_incorrect":
    case "application_process_incorrect":
    case "wrong_institution":
    case "source_does_not_support_claim":
      return "P1_MATERIAL_ELIGIBILITY_OR_APPLICATION";
    case "source_link_broken":
    case "cost_or_fee_incorrect":
      return "P2_SOURCE_LINK_OR_FEE";
    case "duplicate_listing":
    case "outdated_information":
    case "other":
    default:
      return "P3_COPY_OR_MINOR";
  }
}

function ymPathFromIso(iso: string): { year: string; month: string } {
  // iso is server-controlled (received_at), so we can trust this slice.
  return { year: iso.slice(0, 4), month: iso.slice(5, 7) };
}

export interface WriteResult {
  ok: true;
  correction_id: string;
  queue_item_path_relative: string;
  audit_log_path_relative: string;
}

export interface WriteSkipped {
  ok: false;
  skipped_reason: "intake_disabled";
}

export type WriteOutcome = WriteResult | WriteSkipped;

/**
 * Write a validated payload to the file queue.
 *
 * Caller must have already validated the payload via validateIntakePayload().
 * This function applies redaction + allow-list strip as a defense layer.
 */
export function writeCorrectionToQueue(payload: IntakePayload): WriteOutcome {
  if (!isCorrectionIntakeEnabled()) {
    return { ok: false, skipped_reason: "intake_disabled" };
  }

  const correction_id = uuidHexNoDashes();
  const received_at = new Date().toISOString().replace(/\.\d+Z$/, "Z");
  const { year, month } = ymPathFromIso(received_at);

  const queueRoot = getQueueRoot();
  const queueItemAbs = path.join(queueRoot, "inbox", year, month, `${correction_id}.json`);
  const auditLogAbs = path.join(queueRoot, "audit", year, month, `${correction_id}.jsonl`);

  // Build redacted source_context (defense in depth: strip any unknown keys).
  const safeSourceContext = stripToAllowList(
    (payload.source_context ?? {}) as Record<string, unknown>,
    new Set([
      "primary_source_url",
      "specialty_displayed",
      "audience_displayed",
      "visa_displayed",
      "fee_displayed",
      "site_specificity_displayed",
    ])
  );

  // Build the queue item.
  const queueItem: QueueItem = {
    correction_id,
    schema_version: "v1",
    status: "RECEIVED" as QueueStatus,
    priority: priorityForIssue(payload.issue_type),
    listing_id: payload.listing_id,
    report_ref: payload.report_ref,
    runtime_set: payload.runtime_set,
    issue_type: payload.issue_type,
    submitted_at: payload.submitted_at,
    received_at,
    received_channel: "web_form",
    user_message_redacted: redactUserMessage(payload.user_message),
    source_context: safeSourceContext,
    evidence_join_key: payload.listing_id,
    assigned_reviewer: null,
    review_due_date: null,
    audit_log_path: path.relative(queueRoot, auditLogAbs).split(path.sep).join("/"),
    user_email_present: !!payload.user_email && payload.user_email.length > 0,
  };

  // Defense layer: strip any forbidden top-level keys. (Validator already rejects;
  // this guards against future drift between the validator and the type.)
  const allowList = new Set<string>(ALLOWED_PAYLOAD_KEYS);
  void stripToAllowList(payload as unknown as Record<string, unknown>, allowList);

  // Build the initial audit event.
  const auditEvent: AuditEvent = {
    audit_event_id: uuidHexNoDashes(),
    correction_id,
    timestamp: received_at,
    actor_role: "intake_endpoint",
    actor_id_or_placeholder: "system",
    action: "intake_received",
    previous_status: "NONE",
    new_status: "RECEIVED",
    evidence_checked: [],
    source_urls_checked: [],
    archive_urls_checked: [],
    decision: "no_decision_yet",
    decision_reason: "Initial intake; awaiting triage.",
    changed_fields: {},
    validator_results: {},
    next_required_action: "triage",
  };

  // Atomic writes.
  atomicWriteSync(queueItemAbs, JSON.stringify(queueItem, null, 2) + "\n");
  // JSONL: append a single line. Use atomic temp-then-rename for the FIRST event;
  // subsequent appends must use a separate path that is documented in the spec but
  // is NOT exposed by this writer (which only writes the very first event).
  atomicWriteSync(auditLogAbs, JSON.stringify(auditEvent) + "\n");

  return {
    ok: true,
    correction_id,
    queue_item_path_relative: path.relative(queueRoot, queueItemAbs).split(path.sep).join("/"),
    audit_log_path_relative: path.relative(queueRoot, auditLogAbs).split(path.sep).join("/"),
  };
}
