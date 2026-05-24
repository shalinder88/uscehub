# P102 Reviewer Workflow Specification

schemaVersion: p102-reviewer-1
branch: `local/p102-reviewer-workflow`
parent commit: `1b01235` (HY queue + row contract complete)
production main: `739ab1e` UNCHANGED

## 1. Why this workflow is needed

After the gold → P102-FIX → positive-control → Florida Batch 1 → High-Yield Batch 1 sprint sequence:

- **9 institutions** produce automatic PUBLIC_SAFE_USCE rows (14 deduplicated opportunity rows).
- **925 entries** are correctly held to HUMAN_REVIEW_REQUIRED / CAUTION_SAFE_INTERNAL_REVIEW by scope discipline.
- The framework's safety discipline is doing exactly what it was designed to do: refusing to auto-promote Tier 1 candidates from multi-campus health systems and multi-affiliate medical schools to any specific hospital without proof of campus applicability.

The bottleneck is no longer "can we extract" — it's "can we approve safe evidence into website-ready rows efficiently".

This sprint builds the **local reviewer workflow** that turns the 925-entry review queue into approved opportunity rows by adding `campusApplicabilityProof` — proof that a system-level or school-level source page does apply to a specific named hospital/campus.

## 2. What the workflow IS

- **Local-only.** No DB, no Prisma, no public import, no auto-publish, no deploy.
- **Source-evidence preserving.** Every approved row keeps its verbatim quote, source URL, source hash, cleaned-text path.
- **Reviewer-authored.** A human (or carefully-curated automated pass) explicitly assigns a decision per review-queue entry. No auto-approve.
- **Audit-trail bearing.** Decisions live in a versioned CSV with reviewer name, timestamp, decision, reason, and campus-applicability proof.
- **Idempotent.** Re-running the approved-export builder against the same decision file produces the same output.
- **Validator-gated.** A dedicated validator rejects fake approvals (TBD / TODO / unknown), system-scope rows without proof, NOT_STATED evidence quotes, duplicates.

## 3. What the workflow IS NOT

- **Not auto-publishing.** Approved entries land in `public_safe_opportunity_rows_approved.json` — a local JSON file. A separate (next-sprint) minimal display surface reads that file.
- **Not a database.** No row enters Prisma, no UI is built in this sprint.
- **Not extraction.** No model calls, no A0/A1/A2/A3 phases. Pure read + transform + write.
- **Not weakening safety.** Every existing safety gate (quote-verify, scope discipline, NOT_STATED guard, off-domain refusal, HIDDEN_REJECTED preservation) is preserved. The reviewer adds explicit campus-applicability evidence; the validator enforces it.
- **Not GME-first.** GME / residency / fellowship / careers stay FUTURE_LANE_ONLY. They cannot be approved as PUBLIC_SAFE_USCE.

## 4. Reviewer decisions

The reviewer assigns exactly one decision per review-queue entry:

| Decision | Meaning | Routes to |
|---|---|---|
| `APPROVE_PUBLIC_SAFE` | Quote-backed, on-domain or campus-applicability-proven, Tier 1 USCE. Promote to opportunity-row export. | `public_safe_opportunity_rows_approved.json` |
| `REJECT_NOT_USCE` | Quote does not describe a USCE/observership/visiting-student opportunity. | `public_safe_opportunity_rows_rejected.json` |
| `REJECT_SCOPE_MISMATCH` | Quote describes a different campus / wrong institution (Cohen Children's-style). | `public_safe_opportunity_rows_rejected.json` |
| `REJECT_OFF_DOMAIN_NO_APPLICABILITY` | Source is off-domain medical-school content; no proof that the named hospital uses this program. | `public_safe_opportunity_rows_rejected.json` |
| `KEEP_HUMAN_REVIEW` | Default — needs a reviewer pass. (Starter CSV begins all entries at this.) | stays in review queue |
| `NEEDS_MORE_EVIDENCE` | Decision deferred; reviewer wants additional sources before approving. | `public_safe_opportunity_rows_needs_more_evidence.json` |
| `FUTURE_LANE_ONLY` | Reviewer downgrades to future-lane archive (Tier 2/3 only). | `future_lane_archive.json` (existing) |
| `DUPLICATE_OF_APPROVED_ROW` | Same opportunity as an already-approved row. Records `duplicateOfRowId`. | `public_safe_opportunity_rows_rejected.json` with linkback |

## 5. Required fields per decision

Every CSV row in `public_safe_review_decisions.csv` must contain:

| Field | Type | Required for |
|---|---|---|
| `reviewId` | string | all |
| `sourceQueueId` | string (claimId from `public_safe_review_queue.json`) | all |
| `runId` | string | all |
| `institutionId` | string | all |
| `institutionName` | string | all |
| `sourceUrl` | string | all |
| `sourceScope` | enum | all |
| `deepSourceFamily` | enum | all |
| `quote` | string (verbatim from review queue) | all |
| `proposedOpportunityName` | string | APPROVE only |
| `proposedOpportunityType` | enum | APPROVE only |
| `proposedAudience` | enum (international \| us-md-do \| img-observer \| unknown) | APPROVE only |
| `proposedCampus` | string | APPROVE only when scope is system/school |
| `reviewerDecision` | enum (one of §4 above) | all |
| `decisionReason` | string (≥10 chars; "TBD"/"TODO"/"unknown" rejected) | all non-KEEP_HUMAN_REVIEW |
| `campusApplicabilityProof` | string (≥30 chars; verbatim quote or named-list reference) | APPROVE for HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL sources |
| `approvedOpportunityRowId` | string (hash) | APPROVE only — written by export builder |
| `duplicateOfRowId` | string | DUPLICATE_OF_APPROVED_ROW only |
| `reviewer` | string (human name, not "auto" / "model") | all non-KEEP_HUMAN_REVIEW |
| `reviewedAt` | ISO date | all non-KEEP_HUMAN_REVIEW |
| `notes` | string | optional |

## 6. Approval rule — when `APPROVE_PUBLIC_SAFE` is valid

A reviewer may set `APPROVE_PUBLIC_SAFE` only when ALL of:

1. `quote` is verified (the quote-verify validator already ran on the source claim).
2. `quote !== 'NOT_STATED_ON_SOURCE'`.
3. `sourceUrl`, `sourceHash`, `cleanedTextPath` are all present.
4. The claim's deepSourceFamily is a Tier 1 USCE family (ELECTIVE / OBSERVERSHIP / VISITING_STUDENT / SUB_INTERNSHIP / AWAY_ROTATION / MEDICAL_EDUCATION / etc.) — NOT GME / RESIDENCY / FELLOWSHIP / CAREERS.
5. `proposedOpportunityType` is one of (OBSERVERSHIP, VISITING_MEDICAL_STUDENT, CLINICAL_ELECTIVE, SUB_INTERNSHIP, AWAY_ROTATION, INTERNATIONAL_VISITING_STUDENT, RESEARCH_OPPORTUNITY, EXTERNSHIP).
6. If `sourceScope` is `HEALTH_SYSTEM_LEVEL` or `MEDICAL_SCHOOL_LEVEL`: `campusApplicabilityProof` is non-empty AND references the named campus/hospital (validator checks substring of `proposedCampus` OR `institutionName` in the proof string).
7. `decisionReason` is ≥ 10 characters, not a placeholder.
8. `reviewer` is set to a human name (not "auto" / "model" / "system" / "TBD").
9. `reviewedAt` is a valid ISO date in the past.
10. Not duplicate of an already-approved `rowId` (cross-checked by the export builder).

The validator (`scripts/p102-validate-approved-public-safe-export.ts`) enforces all of these.

## 7. campusApplicabilityProof examples

Valid proofs (≥ 30 chars, references the campus/hospital):

- `"Teaching site list at https://medschool.example.edu/clinical-affiliates names Memorial Regional Hollywood as a primary teaching hospital for OB/GYN and Family Medicine clerkships."`
- `"VSLO catalog entry shows the elective at Memorial Regional Hollywood — quote: 'Visiting students rotate at Memorial Regional Hollywood (Hollywood, FL).'"`
- `"Clerkship page lists Memorial Regional Hollywood: 'Rotations occur at the following Memorial Healthcare System sites: Memorial Regional, Memorial Hollywood, Memorial Pembroke.'"`
- `"Department page links Memorial Regional Hollywood as the campus for the General Surgery sub-internship."`

Invalid proofs (validator rejects):

- `"TBD"` / `"TODO"` / `"unknown"` / `""` / `null`
- `"applies to all campuses"` (no specific campus named — fails substring check)
- `"system-wide program"` (does not prove campus applicability)
- Any string < 30 chars

## 8. Where the 14 automatic rows fit

The 14 automatic PUBLIC_SAFE_USCE opportunity rows produced by `scripts/p102-build-public-safe-opportunity-rows.ts` (committed at `1b01235`) are passed through to the approved export with:

- `reviewStatus: AUTO_PUBLIC_SAFE`
- `autoApproved: true`
- `reviewer: null` (not human-reviewed; framework-asserted)
- `campusApplicabilityProof: null` (these are all single-campus / on-domain rows where applicability is implicit)

They are eligible for launch display alongside reviewer-APPROVED rows. The downstream display surface (next sprint) renders both with a small badge distinguishing AUTO vs REVIEWED.

## 9. Files produced

| File | Schema | Phase |
|---|---|---|
| `docs/.../p102/exports/public_safe_review_queue_summary.md` | human-readable summary by institution / domain / scope / family | C |
| `docs/.../p102/exports/public_safe_review_queue_top50.csv` | top-50 priority subset (machine-prioritized) | C |
| `docs/.../p102/exports/public_safe_review_decisions.template.csv` | blank template with all 925 entries, decision=KEEP_HUMAN_REVIEW | D |
| `docs/.../p102/exports/public_safe_review_decisions_top50.csv` | top-50 starter file, all decisions=KEEP_HUMAN_REVIEW | D |
| `docs/.../p102/exports/public_safe_opportunity_rows_approved.json` | 14 auto + reviewer-approved rows | E |
| `docs/.../p102/exports/public_safe_opportunity_rows_rejected.json` | rejected rows with reasons | E |
| `docs/.../p102/exports/public_safe_opportunity_rows_needs_more_evidence.json` | deferred rows | E |
| `docs/.../p102/exports/public_safe_approval_audit.md` | counts + audit trail | E |

## 10. Validator (Phase F)

`scripts/p102-validate-approved-public-safe-export.ts`:

- Parses approved / rejected / needs-more-evidence JSON.
- Parses decision CSV.
- Enforces approval rule §6 for every APPROVE_PUBLIC_SAFE entry.
- Rejects fake placeholder text (TBD / TODO / unknown / lorem ipsum / asdf etc.) in `decisionReason`, `campusApplicabilityProof`, `reviewer`.
- Confirms no duplicate `rowId`s in the approved export.
- Confirms no GME / residency / fellowship / careers `deepSourceFamily` in approved rows.
- Confirms no `NOT_STATED_ON_SOURCE` evidence quote in approved rows.
- Confirms approved rows have `sourceUrl + sourceQuote + sourceHash`.
- Wires into `scripts/p102-validate-all.ts` if safe.

## 11. After this sprint

Once the workflow is built and validated:

- **Manual review pass on top 50** (next, by the user).
- **P102-INGESTION-MIN** (sprint after): minimal local display surface that loads `public_safe_opportunity_rows_approved.json` and renders listing + detail pages with source quote + last-reviewed badge + report-issue link. No DB. No homepage redesign.
- **P102-HY-BATCH-2** (parallel): resume high-yield extraction once the reviewer pipeline is proven; new evidence flows into the same review queue.

## 12. Out-of-scope reminders

- No push.
- No deploy.
- No PR / merge.
- No DB / Prisma / migrations / seed.
- No homepage redesign / SEO / sitemap / robots / metadata changes.
- No public import.
- No auto-publish.
- No national run.
- No broad crawler.
- No GME promotion into PUBLIC_SAFE_USCE.
- No fake reviewer approvals.
- No inferred campus applicability without verbatim proof.

Branch: `local/p102-reviewer-workflow`. Local commits only. Production main `739ab1e` UNCHANGED.
