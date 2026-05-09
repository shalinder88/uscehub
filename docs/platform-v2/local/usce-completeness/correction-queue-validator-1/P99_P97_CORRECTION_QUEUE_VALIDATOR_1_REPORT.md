# P99-P97 Correction Queue Validator (Cross-Join) — Sprint 1 Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-CORRECTION-QUEUE-VALIDATOR-1`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `c8e7f6b P99: implement correction intake file queue`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Author a strict cross-join validator that walks the full correction chain — queue item ↔ audit log ↔ listing/report mapping ↔ active+staged runtime ↔ evidence join. **No UI. No app code. No production. No runtime activation.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Cross-join validator authored | YES — `scripts/validate-p99-correction-queue-cross-join.ts` |
| Queue item ↔ audit log join | enforced |
| Listing ↔ active+staged runtime join | enforced |
| Listing ↔ listing-map (report_ref) join | enforced |
| Listing ↔ evidence-join-map join | enforced |
| Forbidden field key/value/path/IP scan | enforced |
| Valid fixtures | **4/4 PASS** (active Morristown + staged UPMC + staged Lincoln + generic feedback) |
| Invalid fixtures | **4/4 caught with the expected failure reason** |
| Existing validators (10) | ALL passing |
| Production touched | **NO** ✅ |
| UI touched | **NO** ✅ |
| App code touched (route / lib / runtime) | **NO** ✅ |

## 2. What the validator checks

Walks every queue item under a queue-root and joins it against:

1. **Audit log JSONL** — file must exist at the audit_log_path-implied location; first event must have matching correction_id, action `intake_received`, transition `NONE → RECEIVED`.
2. **Active runtime** (`src/data/usce/public-listings-pilot.generated.json`) — listing_id existence.
3. **Staged runtime** (`src/data/usce/public-listings-pilot-staged-batch-2.generated.json`) — listing_id existence.
4. **Listing map CSV** (`staged_runtime_report_issue_mapping_1_listing_map.csv`) — listing_id presence + report_ref column matches the queue item's report_ref.
5. **Evidence join map CSV** (`staged_runtime_report_issue_mapping_1_evidence_join_map.csv`) — listing_id presence.
6. **Deep field scan** — forbidden field keys (38 names from intake schema), forbidden status tokens (`PUBLIC_NOW` / `IMPORT_READY` / `BRIDGE_READY_TO_RUNTIME` / `APPROVED_FOR_PUBLICATION`) outside `NO_<token>` safe phrasing, internal evidence path fragments (`/screenshots/`, `manual-png-landing-1`, `batch-3-evidence-landing`), raw IPv4/IPv6 patterns.
7. **Orphan audit logs** — audit JSONL files with no matching queue item are flagged.
8. **Schema enums** — status / priority / issue_type / runtime_set / report_ref must all be in their declared enums.

The validator also reports two non-fatal warnings:
- `ROW_MAPS_TO_STAGED_NOT_ACTIVE` — listing_id resolves only in staged runtime (the row is not yet active/public).
- `ACTIVE_5_EVIDENCE_T7_LANE` — for active card rows, the evidence files live on the T7 lane (B-005 cosmetic).

## 3. Valid fixture results

Run: `npx tsx scripts/validate-p99-correction-queue-cross-join.ts docs/platform-v2/local/usce-completeness/correction-queue-validator-1/test-output-valid`

```
Queue items: 4
Audit logs: 4
Active runtime listing IDs: 5
Staged runtime listing IDs: 7
Listing-map rows: 7
Evidence-map rows: 7
  [PASS] 053b1b2c566f494899e8f222cf82e495: GENERIC_FEEDBACK_NO_LISTING / OK
  [PASS] 49a6ce1cd895414db991bb3ccc10a274: ACTIVE_AND_STAGED / OK
  [PASS] 9e3c45301074453b89fa1a1ac5f61165: STAGED_ONLY / OK   (warning)
  [PASS] f96d386e19bf4cfea00b2414abb40f5c: STAGED_ONLY / OK   (warning)

Warnings: 2 ROW_MAPS_TO_STAGED_NOT_ACTIVE (UPMC + Lincoln) — expected.

Overall: PASSED — 4 item(s) cross-joined cleanly.
```

The active 5-card rows are intentionally also present in the staged 7-card runtime; the validator reports them as `ACTIVE_AND_STAGED`, not as a runtime-set mismatch.

## 4. Invalid fixture results

Each invalid sub-root is its own queue root, isolating one failure mode. All four caught at the expected rule.

| Sub-root | Expected error(s) | Actual error(s) | Status |
|----------|--------------------|------------------|--------|
| `unknown-listing/` | LISTING_ID_NOT_IN_ANY_RUNTIME + LISTING_NOT_IN_LISTING_MAP + LISTING_NOT_IN_EVIDENCE_MAP | identical | ✅ |
| `report-ref-mismatch/` | REPORT_REF_MISMATCH | identical | ✅ |
| `missing-audit/` | AUDIT_LOG_MISSING | identical | ✅ |
| `public-now-leak/` | FORBIDDEN_TOKEN_IN_QUEUE_ITEM | identical | ✅ |

Detail in `correction_queue_validator_1_test_matrix.csv` and `correction_queue_validator_1_validation_results.csv`.

## 5. Active vs staged listing behavior

- `ACTIVE_AND_STAGED` (5 listings: Morristown / Overlook / CCF Mercy / CC Hillcrest / Highland) → `ACTIVE_PUBLIC_OK`. Reports against these rows are immediately joinable with the live pilot route data.
- `STAGED_ONLY` (2 listings: UPMC Western Psychiatric / Lincoln) → `STAGED_NOT_PUBLIC_OK`. Reports against these rows are joinable but **the row is not yet public**, so a future report would only enter the queue under the staged-runtime evidence set. The validator emits an explicit `ROW_MAPS_TO_STAGED_NOT_ACTIVE` warning every time.
- `GENERIC_FEEDBACK_NO_LISTING` (`pilot-feedback` ref with empty listing_id) → `GENERIC_OK`. No listing context required.
- Anything else → `FAIL`.

This means: a future activation of the staged 7-card runtime would NOT change cross-join behavior for active 5 rows; it would only change the warning class for UPMC/Lincoln. The validator continues to enforce safety in either world.

## 6. Evidence join behavior

The validator joins listing_id against the evidence-join-map CSV produced by the prior mapping sprint. Both UPMC and Lincoln map cleanly (Tier-A+ evidence rows). The active 5 join cleanly to evidence-map rows pointing at the T7 lane (B-005 warning). Generic feedback rows have no evidence-join requirement.

## 7. Privacy / sensitive-field behavior

Confirmed via the `public-now-leak` invalid fixture and via deep-walk over all valid fixtures:

- **Forbidden keys** (any of 38 from the intake schema) anywhere in the queue item → hard fail.
- **Forbidden status tokens** (`PUBLIC_NOW` / `IMPORT_READY` / `BRIDGE_READY_TO_RUNTIME` / `APPROVED_FOR_PUBLICATION`) outside `NO_<token>` phrasing → hard fail.
- **Internal evidence path fragments** (`/screenshots/`, `manual-png-landing-1`, `batch-3-evidence-landing`) → hard fail. (This protects against a future bug where a reviewer's CLI accidentally surfaces internal paths in a user-facing field.)
- **Raw IPv4/IPv6 patterns** anywhere → hard fail. Reinforces the no-raw-IP doctrine from the spec.

The valid fixtures all passed the forbidden-field scan with `forbidden_field_status=CLEAN`, confirming the writer's redaction layer + allow-list strip work correctly end-to-end.

## 8. Remaining blockers

| Blocker | Status |
|---------|--------|
| B-001 `/contact` ignores listing_id/ref | Still open; surfaced as advisory by `validate-p99-report-issue-mapping` |
| B-002 form has no submit handler | Still open |
| B-003 listing_id missing from form payload | Still open |
| B-004 no intake backend endpoint | RESOLVED in Sprint 1 (env-flag gated) |
| B-005 active 5 evidence on T7 lane | Still open; validator emits `ACTIVE_5_EVIDENCE_T7_LANE` warning per active-row queue item |
| B-006 no rate limit / spam guard | Still open; validator does NOT enforce rate-limit (out of its scope) |

No NEW blockers introduced by this sprint. Detail in `correction_queue_validator_1_blockers.csv`.

## 9. What this sprint did NOT do

- Did NOT modify any app route, page, or component.
- Did NOT modify the intake endpoint (`/api/usce/corrections/route.ts`).
- Did NOT modify the file-queue writer or any helper in `src/lib/usce-corrections/`.
- Did NOT modify the existing 3 correction validators (`payload`, `queue-item`, `audit-log`).
- Did NOT modify the active runtime data file.
- Did NOT modify the staged runtime data file.
- Did NOT modify the bridge DRAFT.
- Did NOT modify the report-issue mapping CSVs or schema.
- Did NOT add a database table or migration.
- Did NOT add any external SaaS dependency.
- Did NOT add any new npm dependency.
- Did NOT add an email pathway.
- Did NOT add rate limiting (out of scope).
- Did NOT add file-upload handling.
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form or contact request.
- Did NOT write to the canonical queue root (`docs/platform-v2/local/usce-corrections/`).
- Did NOT broaden audience eligibility.
- Did NOT remove any caveat.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 10. Recommended next step

Two non-conflicting paths, depending on the user's preference:

1. **`P99-P97-CORRECTION-INTAKE-RATE-LIMIT-1`** — implement the rate-limit + Turnstile (or equivalent) layer per the spec's rate-limit section. Keeps the sprint pure-backend / no UI; closes the last remaining backend blocker (B-006) before any contact-page work. **Recommended per the user's "rate-limit first, contact UI later" preference.**

2. **`P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1`** — wire `/contact/page.tsx` to read `searchParams.ref` + `searchParams.listing_id`, echo the listing being reported, and submit through `/api/usce/corrections`. Resolves B-001/B-002/B-003. UI-adjacent.

Per the user's standing "backsite-trust-first" doctrine, **Option 1** (rate-limit) is the safer continuation. The cross-validator now ensures that any future correction file that reaches the queue, however it gets there, will be cross-checked against the canonical maps; rate-limit closes the remaining "open backend door" for spam.

## 11. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime activation | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged runtime change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No new external service / npm dependency | CONFIRMED |
| No email pathway added | CONFIRMED |
| No upload handling added | CONFIRMED |
| No forbidden-field VALUE ever stored | CONFIRMED — validator hard-blocks |
| No raw IP captured | CONFIRMED — validator hard-blocks |
| No internal evidence path leaked | CONFIRMED — validator hard-blocks |
| No existing validator weakened | CONFIRMED — only AUTHORED a new strict validator |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No site-specific guarantee added | CONFIRMED |
| No fake source / fake evidence / fake PNG | CONFIRMED |
| No login / CAPTCHA / credentialed scraping | CONFIRMED |
| No staged runtime imported by app code | CONFIRMED |
| No real queue items written outside sprint sandbox | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
