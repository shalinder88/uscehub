# Correction Intake — Implementation Plan

**Date:** 2026-05-09
**Sprint:** P99-P97-CORRECTION-INTAKE-BACKSITE-SPEC-2
**Status:** docs-only sequencing plan; not implementation; not active

---

## 1. Sequencing principle

Each implementation sprint must:
- Stay backend-or-data-only until the correction system is end-to-end provable.
- Land docs + tests before code where possible.
- Touch the `/contact` UI only after the backend can accept a real payload safely.
- Not deploy production until the full chain (intake → queue → audit → validator → review) has been smoke-tested locally.

The active 5-card pilot route on `/clerkships/pilot` stays untouched until **after** all 5 sprints below land OR the user explicitly authorizes a partial path.

## 2. Recommended sprint sequence

### Sprint 1 — `P99-P97-CORRECTION-INTAKE-FILE-QUEUE-IMPLEMENTATION-1`

**Goal:** Implement the server-side intake endpoint and the file-based queue.

Files touched:
- `src/app/api/correction-intake/route.ts` (new) OR a Next.js server action wired into a future contact-page sprint (see Sprint 2 — for now this can be a CLI-fed test endpoint behind an env-flag).
- `src/lib/correction-intake/schema.ts` (new) — TypeScript types mirroring the v2 payload schema.
- `src/lib/correction-intake/redact.ts` (new) — server-side redaction pass.
- `src/lib/correction-intake/rate-limit.ts` (new) — sha256-IP cache, ≤24h.
- `src/lib/correction-intake/queue-write.ts` (new) — temp-file-then-rename to `docs/platform-v2/local/usce-corrections/inbox/YYYY/MM/<correction_id>.json`.
- `scripts/cli-correction-intake-smoke.ts` (new) — CLI smoke tool that POSTs a synthetic payload locally.

Validation commands:
```
npx tsc --noEmit
npx tsx scripts/cli-correction-intake-smoke.ts
ls docs/platform-v2/local/usce-corrections/inbox/  # confirm one file landed
```

Rollback plan:
- Endpoint is gated behind `CORRECTION_INTAKE_ENABLED=true` env flag, defaulting to off.
- If anything misbehaves, set the flag to false; no UI wires the endpoint yet.
- File-queue artifacts live entirely under `docs/` — easy to delete.

No production merge.

### Sprint 2 — `P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1`

**Goal:** Wire `/contact/page.tsx` to read `searchParams.ref` and `searchParams.listing_id`, echo the listing being reported, and submit through Sprint 1's endpoint.

Files touched:
- `src/app/contact/page.tsx` (modify — convert to server component reading searchParams, OR wrap in a client island that pulls them via useSearchParams).
- `src/app/contact/ContactForm.tsx` (new client component).
- `src/lib/usce-pilot-data.ts` (extend — expose a public helper `lookupListingForReport(listing_id)` that reads BOTH active and staged runtimes for runtime_set resolution; staged_only flag enforced).
- `scripts/validate-usce-contact-listing-prefill.ts` (new validator — confirms searchParams parsed; listing_id echo present; hidden inputs correct).

Validation commands:
```
npx tsc --noEmit
npx tsx scripts/validate-usce-contact-listing-prefill.ts
# manual: visit /contact?ref=pilot-listing&listing_id=pilot-001-NJ-morristown-medical-center
#         confirm institution name visible; confirm hidden listing_id input present in DOM
```

Rollback plan:
- Form fallback path: if endpoint not configured, form shows a friendly "report received locally" message; payload also written to localStorage for the user's reference.
- Existing contact form behavior preserved as default; ref/listing_id detection is additive.

Still no production merge.

### Sprint 3 — `P99-P97-CORRECTION-QUEUE-VALIDATOR-1`

**Goal:** Author the validator that checks queue items against the file_queue schema + audit log integrity.

Files touched:
- `scripts/validate-p99-correction-queue-item.ts` (new) — validates a single queue item file or a directory of items.
- `scripts/validate-p99-correction-audit-log.ts` (new) — validates JSONL audit logs for append-only invariants.

Validation commands:
```
npx tsc --noEmit
npx tsx scripts/validate-p99-correction-queue-item.ts docs/platform-v2/local/usce-corrections/inbox/
npx tsx scripts/validate-p99-correction-audit-log.ts docs/platform-v2/local/usce-corrections/audit/
```

Validators MUST be strict:
- Reject queue items missing required fields.
- Reject queue items with forbidden fields (mirrors intake schema's forbidden_fields).
- Reject queue items with invalid status transitions.
- Reject audit logs that show the same audit_event_id twice.
- Reject audit logs that show a state regression without a `reopened_with_audit` event.

No production merge.

### Sprint 4 — `P99-P97-CORRECTION-REVIEW-CLI-1`

**Goal:** Provide a reviewer CLI for listing queue items, viewing redacted content, recording state transitions, and triggering the validators.

Files touched:
- `scripts/correction-review-cli.ts` (new) — `list / show / triage / decide / close / reopen`.
- `scripts/correction-review-cli-helpers.ts` (new) — helpers for atomic file rewrites, audit-event append, role-aware permission checks (using a local CSV of internal-ID-to-role).

Validation commands:
```
npx tsc --noEmit
npx tsx scripts/correction-review-cli.ts list --status RECEIVED
npx tsx scripts/correction-review-cli.ts show <correction_id>
# Dry-run mode mandatory before any actual decision
npx tsx scripts/correction-review-cli.ts triage <correction_id> --priority P3 --dry-run
```

CLI MUST:
- Refuse to mutate any active runtime data.
- Refuse to bypass dual-signoff rules.
- Append an audit event for every state transition.
- Default to `--dry-run` mode; require an explicit `--commit` flag to actually write.

No production merge.

### Sprint 5 (later) — `P99-P97-CORRECTION-ADMIN-BACKSITE-INTERFACE-1`

**Goal:** A minimal back-site interface (still NOT public-route; behind auth) that visualizes the queue and decisions.

Files touched:
- New under-`/admin` route or a separate non-public surface.
- Must be gated behind real authentication (not just a flag).

Out of scope until Sprints 1–4 are committed and smoke-tested.

## 3. Validation summary

| Sprint | Validators that must PASS post-implementation |
|--------|------------------------------------------------|
| 1 | `tsc --noEmit`, intake redaction unit tests, queue-write atomicity test, rate-limit sha256-IP test |
| 2 | `tsc --noEmit`, contact-listing-prefill validator, no app import of staged-runtime file (per existing staged validator) |
| 3 | `tsc --noEmit`, queue-item validator on synthetic items, audit-log validator on synthetic logs |
| 4 | `tsc --noEmit`, CLI dry-run output stable, dual-signoff enforcement test |
| 5 | All of the above + auth integration test |

## 4. Rollback plans (cumulative)

- All file-queue data lives under `docs/platform-v2/local/usce-corrections/` — never under `src/`.
- Endpoint is env-flag gated until Sprint 5.
- Active runtime files are never edited by any of the 5 sprints.
- The active `/clerkships/pilot` route does not change.
- If any sprint introduces a regression, revert the sprint's commit; the file-queue data and audit logs persist for forensic review.

## 5. No-production-merge rule

**No production merge** for any of Sprints 1–5 without:

1. Explicit user instruction (the typed-out word "push" rule).
2. A separate scope audit covering the cumulative diff.
3. Re-run of all existing USCE/P99 validators on the merged set.
4. Existing 47-commit branch's blast-radius audit completed first.

## 6. What this plan does NOT authorize

- Any code changes today.
- Any UI change today.
- Any production deploy today.
- Any DB / external SaaS dependency today.
- Any uploads today.
