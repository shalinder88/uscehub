# P99-P97 Staged Runtime Batch 3 — Report-Issue Mapping Sprint Report

**Sprint ID:** `P99-P97-STAGED-RUNTIME-BATCH-3-REPORT-ISSUE-MAPPING`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `1ba1da0cddde0861810db78ca26d807b4a0d617f`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Build report-issue / correction mapping for the 7 new staged batch-3 rows (`pilot-013` … `pilot-019`). Docs + 1 small validator. No active runtime change. No UI. No production.

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| New rows mapped | **7** (pilot-013 … pilot-019) |
| Evidence joins created | 7 |
| Correction payload maps created | 7 |
| Active runtime card count | **5 — UNCHANGED** |
| Production public card count | **0 — UNCHANGED** |
| Imports of batch 3 by app code | 0 |
| Validators run | All PASS (12) |
| New validator added | `scripts/validate-p99-staged-runtime-batch-3-report-mapping.ts` |
| `validate-no-secrets.ts` | 0 findings |

## 2. Why this sprint matters

Before any of the 7 new staged batch-3 rows can be safely activated, each must have:
1. A unique, deterministic `report_ref` and report URL pattern (so a user can flag bad data).
2. An evidence join key that points back to the on-disk source pack (HTML + PNG + Wayback + verbatim quote).
3. A correction payload contract — what hidden fields the form must include, and what fields it must NEVER collect.

This sprint builds those three artifacts for all 7 new rows. It is narrow launch-safety work. It does NOT activate, deploy, or wire any UI.

## 3. Listing map summary

`staged_runtime_batch_3_report_issue_listing_map.csv` — 7 rows, each with the pattern:

```
runtime_status:                STAGED_NOT_PUBLIC
report_ref:                    pilot-listing
report_url (reserved):         /contact?ref=pilot-listing&listing_id=<listing_id>
correction_intake_listing_id:  <listing_id>
evidence_join_key:             <listing_id>
contact_payload_required_fields: listing_id;ref;runtime_source;evidence_join_key;page_url;submitted_at
```

This mirrors the mapping-1 contract for active 5 + prior staged 2 (UPMC + Lincoln). The deterministic `?ref=pilot-listing&listing_id=<id>` pattern is reserved for activation; today the `/contact` UI does not yet parse those parameters (audited blocker B-001 / B-002 / B-003).

## 4. Evidence join summary

`staged_runtime_batch_3_evidence_join_map.csv` — 7 rows, each pointing to:
- HTML snapshot under `docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/html-snapshots/<slug>.html`
- PNG screenshot under `…/screenshots/<slug>-source.png`
- Verbatim quote under `…/quotes/<slug>-quote.txt`
- Wayback `archive_url` (sprint-fresh for 6 of 7; 2024-08-26 prior-verified for Jackson)

Evidence tier for all 7 = **TIER_A_PLUS**. Source strength is `STRONG_LCME_AOA_ONLY` for 6 of 7 and `PARTIAL_AUDIENCE_PARTIAL_APPLICATION` for Methodist San Antonio (HCA GME multi-site source); the partial detail is honestly recorded in known_limitations.

## 5. Correction payload summary

`staged_runtime_batch_3_correction_payload_map.csv` — 7 rows, each defining:

| Field | Value |
|-------|-------|
| `default_issue_type` | `other` |
| `allowed_issue_types` | `wrong_audience;wrong_visa;wrong_application;wrong_cost;wrong_site_scope;outdated_link;general_correction;other` |
| `required_hidden_fields` | `listing_id;ref;runtime_source;evidence_join_key;page_url;submitted_at` |
| `forbidden_fields` (denylist) | `SSN;passport_number;visa_document;medical_record_number;payment_card;uploaded_sensitive_document` |
| `queue_priority_default` | `P3_COPY_OR_MINOR` |
| `reviewer_routing` | `curator_lane_pilot_data` |

The forbidden-fields denylist matches the existing correction-intake validator's contract. The required-hidden-fields list ensures `/contact` UI work (when it lands) wires the right context to the queue.

## 6. Known blockers

| Blocker | Severity | Description | Required for activation? |
|---------|----------|-------------|--------------------------|
| **B-001 / B-002 / B-003** | HIGH | `/contact` UI does not parse `listing_id` / `ref` query params from the report URL. Same gap as for active 5 + prior staged 2. | YES — must fix before any noindex activation |
| Correction endpoint env-flag-off | MEDIUM | `POST /api/usce/corrections` is gated and intentionally OFF in production. | NO — acceptable for noindex pilot activation; flip flag only after rate-limit + UI wiring |
| Methodist San Antonio source detail PARTIAL | MEDIUM | HCA GME multi-site source — less per-site detail than ideal | NO — system-level caveat is already in `card.campus_name`; activation defensible without per-site source landed |

Detail in `staged_runtime_batch_3_report_issue_gap_audit.csv`.

## 7. Activation readiness

**Now ready (per row):**
- [x] Listing exists in staged batch 3 JSON
- [x] Evidence on disk: HTML + PNG + quote + Wayback
- [x] Listing map row with deterministic report_ref + report_url
- [x] Evidence join key + path manifest
- [x] Correction payload contract defined
- [x] No banned phrase / no forbidden token
- [x] No app code imports the staged file (validator-enforced)

**Still blocking activation:**
- [ ] `/contact` UI must parse `listing_id` and `ref` and prefill hidden context
- [ ] Curator final approval of which subset (if any) to promote first

Detail in `staged_runtime_batch_3_activation_readiness_delta.csv`.

## 8. Validator results

All 12 validators PASS. Detail in `staged_runtime_batch_3_mapping_validation_results.csv`.

```
validate-no-secrets:                                        PASS (1131 / 0)
tsc --noEmit:                                               PASS
validate-micro-pilot-runtime:                               PASS (5/5)
validate-p99-staged-runtime-batch-2:                        PASS
validate-p99-staged-runtime-batch-3:                        PASS (14/14)
validate-p99-staged-runtime-batch-3-report-mapping:         PASS (7/7) — NEW
validate-p99-report-issue-mapping (mapping-1):              PASS (1 carry-forward warning)
validate-p99-correction-intake-payload:                     PASS (8 samples)
validate-p99-correction-queue-item:                         PASS (4)
validate-p99-correction-audit-log:                          PASS (4)
import-safety-grep (paths):                                 PASS
import-safety-grep (symbols):                               PASS
```

GitHub open alerts: NOT_VERIFIED_THIS_TURN (gh CLI is logged out from the prior P0 token-rotation cleanup; last verified state = 0 open / alert #1 resolved as `wont_fix`).

## 9. What this sprint did NOT do

- No active runtime mutation.
- No `/clerkships/pilot` route change.
- No `/contact` UI change.
- No production deploy. No PR. No merge to main.
- No DB / schema / Prisma / seed / cron.
- No new evidence capture.
- No new screening, no Queue 4 work.
- No correction endpoint logic change.
- No correction endpoint env-flag flip.
- No app import of staged batch 3.
- No public copy expansion.
- No PUBLIC_NOW / IMPORT_READY token.

## 10. Recommended next sprint

**`P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1`** (recommended).

Rationale: report-issue URLs are now reserved deterministically for 14 staged rows (5 active + 2 prior staged + 7 new). Every one of those URLs points to `/contact?ref=…&listing_id=…`, but `/contact` ignores those query parameters. Until that UI gap closes (B-001 / B-002 / B-003), no staged row can safely activate — there is no path for a user to flag bad data with the right context attached. This sprint unblocks every staged row at once, not one row at a time.

Alternative: `P99-P97-STAGED-RUNTIME-BATCH-3-PROMOTION-CANDIDATE-AUDIT` — pick 1–3 safest rows for first activation. **Defer until the contact UI is wired** so the activation isn't blocked by a missing report channel.

Strategic-checkpoint guidance from the previous sprint stands: stop mapping after this; the next sprint should either fix the UI blocker or pick activation candidates. Continued mapping work past this point would be drift.

## 11. Strategic checkpoint

> Are we moving toward a big product?

Yes. We have 14 staged rows fully mapped for report-issue / correction. The activation step is one well-scoped UI sprint away.

> Did this reduce the 347 → 5 bottleneck?

Yes — indirectly. The bottleneck has multiple gates: screening → validation → staging → report-mapping → UI wiring → curator activation. Today we cleared the report-mapping gate for the 7 new rows. The next gate (UI wiring) blocks every staged row, so it has high leverage.

> Are we drifting?

No. This sprint produced one validator + 6 docs in a single named folder. No app code touched.

> What must stop?

Mapping more cards in advance of UI wiring. Until `/contact` parses the params, additional mapping is documentation that points at a broken pipe.

> What must continue?

The "validate, stage, audit, then activate" discipline. Today's sprint is the audit step before any activation candidate audit.

## 12. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY token | CONFIRMED |
| No active runtime change | CONFIRMED |
| No batch 2 staged change | CONFIRMED |
| No batch 3 staged data change | CONFIRMED — only docs + validator added |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No app code change | CONFIRMED |
| No banned phrase | CONFIRMED — validator deep-walk PASS |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED — `.claude/launch.json`, `public-listings.generated.{json,ts}`, NPPES, redesign-mockups, frozen-internal READMEs all UNTOUCHED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No weakening of existing validators | CONFIRMED — added new validator only |
