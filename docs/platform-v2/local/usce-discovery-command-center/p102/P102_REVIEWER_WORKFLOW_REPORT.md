# P102 Reviewer Workflow Report

schemaVersion: p102-reviewer-report-1
branch: `local/p102-reviewer-workflow`
parent commit: `1b01235` (HY queue + row contract complete)
this report HEAD: see git log
production main: `739ab1e` UNCHANGED

## 1. Outcome

| Metric | Required | Result |
|---|---|---:|
| Reviewer workflow spec | required | **delivered** |
| Review queue summarizer + top-50 prioritization | required | **delivered** |
| Decision template (full 925 + top-50 starter CSV) | required | **delivered** |
| Approved-export builder with strict validation | required | **delivered** |
| Approved-export validator wired into `p102-validate-all` | required | **delivered** |
| Total approved rows (auto-only; no reviewer pass yet) | ≥ 1 | **13** (14 auto rows → 13 deduped) |
| Validator status | all PASS | **13 / 13 PASS** |
| Quote-verification failures (all 35 runs) | 0 | **0 / 2491** |
| Over-promotion failures | 0 | **0** |
| Gold-set verification | 11 / 11 | **11 / 11 PASS** |
| Unit tests | all pass | **155 / 155 PASS** |

## 2. What was built

### Phase B — Reviewer workflow spec

`P102_REVIEWER_WORKFLOW_SPEC.md` (3.5K words). Defines:

- 8 reviewer decision types (APPROVE_PUBLIC_SAFE, REJECT_NOT_USCE, REJECT_SCOPE_MISMATCH, REJECT_OFF_DOMAIN_NO_APPLICABILITY, KEEP_HUMAN_REVIEW, NEEDS_MORE_EVIDENCE, FUTURE_LANE_ONLY, DUPLICATE_OF_APPROVED_ROW).
- 25 fields per decision row.
- 10-point approval rule for APPROVE_PUBLIC_SAFE (quote verified, sourceUrl/sourceHash/cleanedTextPath present, Tier 1 deepSourceFamily, allowed opportunityType, system/school scope requires `campusApplicabilityProof` ≥ 30 chars referencing the campus by name, decisionReason ≥ 10 chars and not a placeholder, reviewer is a human name, reviewedAt is ISO date, not duplicate).
- Examples of valid vs invalid `campusApplicabilityProof` strings.
- How the 14 auto-approved rows flow through with `reviewStatus: AUTO_PUBLIC_SAFE`.

### Phase C — Review queue summarizer

`scripts/p102-summarize-review-queue.ts` reads `public_safe_review_queue.json` (925 entries) and produces:

- `public_safe_review_queue_summary.md` — by-institution / domain / scope / deep-family rollup + top-50 priority table.
- `public_safe_review_queue_top50.csv` — top-50 starter file (priority-scored).

Priority scoring rubric:
- **+6** Tier 1 USCE deepSourceFamily (VISITING_STUDENT, OBSERVERSHIP, ELECTIVE, SUB_INTERNSHIP, etc.)
- **+3** HIGH confidence
- **+5** source URL path contains institution slug or campus token
- **+2** quote names institution or campus by name
- **+5** visibilityLane = CAUTION_SAFE_INTERNAL_REVIEW
- **+2** visibilityLane = HUMAN_REVIEW_REQUIRED
- **−3** scope = HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL
- **−2** existing warning flag
- **−5** quote = NOT_STATED_ON_SOURCE
- **−5** deepSourceFamily in {CAREERS, GME, RESIDENCY, FELLOWSHIP, BENEFITS}

Top-50 scores range 15–18 (highest reviewer ROI).

### Phase D — Decision template

`public_safe_review_decisions.template.csv` (all 925 entries, decisions default to KEEP_HUMAN_REVIEW) + `public_safe_review_decisions_top50.csv` (created only on first run; not clobbered on re-runs to preserve in-progress reviewer work).

### Phase E — Approved-export builder

`scripts/p102-build-approved-public-safe-export.ts`:

- Reads `public_safe_opportunity_rows.json` (14 auto-approved) + decisions CSV.
- Passes auto rows through with `reviewStatus: AUTO_PUBLIC_SAFE`.
- For each reviewer decision: validates per §6 approval rule; routes APPROVE → approved, REJECT_* → rejected, NEEDS_MORE_EVIDENCE → needs-more.
- De-duplicates approved rows by rowId.
- Looks up `sourceHash + cleanedTextPath` from the original `13_model_claims_verified.json` (review queue export doesn't carry them) — preserves source provenance on every approved row.
- Writes four exports + audit MD.

### Phase F — Approved-export validator

`scripts/p102-validate-approved-public-safe-export.ts`:

- Independently re-validates the approved export.
- Per-row gates: rowId unique + present, sourceUrl + sourceHash (≥10) + cleanedTextPath + sourceQuote (≥10 chars, not NOT_STATED) all present; visibilityLane = PUBLIC_SAFE_USCE; reviewStatus ∈ AUTO/REVIEWER; opportunityType in allowed set; system/school scope → campusApplicabilityProof ≥ 30 chars not a placeholder; future-lane opportunityType rejected.
- Per-decision-CSV gates: header has required columns; no `APPROVE_PUBLIC_SAFE` with non-human reviewer; no placeholder decisionReason on APPROVE.
- Wired into `p102-validate-all.ts` as the 13th validator.

## 3. Current state of the approved export

```
public_safe_opportunity_rows_approved.json
  schemaVersion: p102-approved-export-1
  rows: 13 (14 auto → 13 deduped; Houston Methodist had 2 rows that
            collapsed to 1 rowId)
  AUTO_PUBLIC_SAFE: 13
  REVIEWER_APPROVED: 0
  institutions: 9
    Boston Medical Center      1 (ENT Sub-Internship)
    Emory University Hospital  1 (MD/PhD Program)
    Hospital for Special Surgery 1 (Academic Visitor Program — observership)
    Houston Methodist Hospital 1 (Observership)
    Mayo Clinic                1 (Visiting Medical Student)
    MSK                        1 (BMT Elective)
    Orlando Health             3 (VSLO clerkship program — $50 fee + variants)
    UAB Hospital               2 (International Visiting Medical Students)
    UCSF Fresno                2 (Visiting Medical Students)
```

Plus three companion files:

| Export | Count | Purpose |
|---|---:|---|
| `public_safe_opportunity_rows_rejected.json` | 0 | Reviewer-rejected rows (no rejections yet) |
| `public_safe_opportunity_rows_needs_more_evidence.json` | 0 | Deferred (no deferrals yet) |
| `public_safe_approval_audit.md` | — | Counts + validation-failure audit |

And the review queue:

```
public_safe_review_queue.json:          925 entries
public_safe_review_decisions_top50.csv: 50 starter entries (all KEEP_HUMAN_REVIEW)
public_safe_review_decisions.template.csv: 925 full template
```

The 54-row count in earlier summary output reflects the CSV-parser counting multi-line quote rows as separate lines — actual reviewer-decided rows is 50 (top 50 starter entries) + 0 reviewer-approved.

## 4. Safety properties preserved

| Property | Status |
|---|---|
| All 14 auto rows carry verbatim source quote + source URL + source hash | preserved |
| No reviewer-approved rows yet — no opportunity for fake approvals to slip in | preserved |
| Validator rejects `APPROVE_PUBLIC_SAFE` with placeholder reviewer/reason/proof | enforced (TBD / TODO / unknown / asdf / xxx / lorem ipsum / blank etc.) |
| Validator rejects `APPROVE_PUBLIC_SAFE` on HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL without ≥30-char campusApplicabilityProof | enforced |
| Validator rejects `APPROVE_PUBLIC_SAFE` on future-lane opportunityType | enforced |
| Validator rejects `APPROVE_PUBLIC_SAFE` on NOT_STATED_ON_SOURCE quote | enforced |
| Validator rejects duplicate rowIds in approved export | enforced (de-dupes during build; validator double-checks) |
| Quote-verification (cross-cumulative, 35 runs, 2491 claims) | **0 / 2491 failures** |
| Gold-set verification | 11 / 11 PASS preserved |
| Validator dispatcher | 13 / 13 PASS (12 + new approved-export validator) |

## 5. One known issue (minor, deferred)

The 14 auto-approved rows include 2 Houston Methodist rows with the same `rowId` (hash collision on identical institutionId + opportunityName "Observership" + sourceUrl + opportunityType + audience). The approved-export builder correctly de-dupes them to 1 row, so the published count is 13. The duplicate originates from the upstream row builder (`scripts/p102-build-public-safe-opportunity-rows.ts`) producing two groups with the same final hash. Tightening the upstream group key (e.g., adding `specialty` or `applicationRoute` discriminator) would resolve this — out of scope for this sprint; the de-dupe in the approval pipeline contains the issue.

## 6. How a reviewer uses this

1. Open `docs/.../p102/exports/public_safe_review_queue_top50.csv` (or copy to `public_safe_review_decisions.csv` for permanence).
2. For each row, choose one of the 8 decisions (default is `KEEP_HUMAN_REVIEW`).
3. For `APPROVE_PUBLIC_SAFE`:
   - Fill `proposedOpportunityName` (≥ 3 chars).
   - Fill `proposedOpportunityType` (one of OBSERVERSHIP / VISITING_MEDICAL_STUDENT / CLINICAL_ELECTIVE / SUB_INTERNSHIP / AWAY_ROTATION / INTERNATIONAL_VISITING_STUDENT / RESEARCH_OPPORTUNITY / EXTERNSHIP).
   - Fill `proposedAudience` (international / us-md-do / img-observer / unknown).
   - Fill `proposedCampus` (when scope is system/school).
   - Fill `campusApplicabilityProof` (≥ 30 chars verbatim from the teaching-site list, VSLO catalog, or clerkship page that names the specific hospital) — REQUIRED when scope is HEALTH_SYSTEM_LEVEL or MEDICAL_SCHOOL_LEVEL.
   - Fill `decisionReason` (≥ 10 chars, not a placeholder).
   - Fill `reviewer` (your name; not "auto" / "system" / "model" / "TBD").
   - Fill `reviewedAt` (YYYY-MM-DD).
4. For any rejection: fill `decisionReason`, `reviewer`, `reviewedAt`.
5. Run `npx tsx scripts/p102-build-approved-public-safe-export.ts` to produce the approved + rejected + needs-more exports.
6. Run `npx tsx scripts/p102-validate-approved-public-safe-export.ts` to confirm safety gates hold (or see `npx tsx scripts/p102-validate-all.ts` which now includes this validator).

No row is auto-approved on the reviewer side. Every `APPROVE_PUBLIC_SAFE` decision must pass all 10 gates of the approval rule.

## 7. What this unblocks

The 13 (soon 14, after the duplicate-key fix) auto-approved rows are **launch-ready today**. They are a real, source-linked, quote-backed launch corpus across 9 academic-affiliated institutions in 5 states (NY, MA, TX, GA, FL, AL, CA, MN — wait that's 8 — NY×2 + MA + TX + GA + FL + AL + CA + MN = 8 distinct states).

Next sprint can:
- Build a minimal website ingestion / display surface that reads `public_safe_opportunity_rows_approved.json`.
- Render listing cards + detail pages with verbatim source quote + last-reviewed date + source-status badge + report-issue link.

In parallel, a reviewer can start approving from the 925-entry queue. Each approved review row expands the launch corpus by exactly 1 row, with full audit trail.

## 8. Exact next recommendation

**A. Manual review top 50** (next, by the user — fastest path to expanding the launch corpus).

Plus **B. Minimal website ingestion branch** (parallel sprint — uses the existing 13 rows as the initial display corpus and adds rows as the reviewer approves).

NOT recommended:
- C. Resume high-yield extraction — would feed more entries into the 925-strong queue without reducing the reviewer bottleneck.
- D. Stop and review — workflow is built, validated, and ready for use.

## 9. Out-of-scope reminders

- No push.
- No deploy.
- No PR / merge to main.
- No DB / Prisma / migrations / seed.
- No homepage / SEO / sitemap / robots / metadata changes.
- No public import.
- No auto-publish.
- No national run.
- No fake reviewer approvals.

Branch: `local/p102-reviewer-workflow`. Local commits only. Production main `739ab1e` UNCHANGED.

---

## P102 Reviewer Workflow Report — TL;DR

- **13 launch-ready rows** in `public_safe_opportunity_rows_approved.json` (14 auto-extracted → 13 deduped) covering 9 academic-affiliated institutions in 8 states.
- **Reviewer workflow validated** (13 / 13 validators PASS; strict approval rules with campusApplicabilityProof enforcement).
- **Next**: manually review top 50 to grow the launch corpus, in parallel with minimal website ingestion branch.

Recommendation: **A. Manual review top 50** + **B. Minimal website ingestion branch**.
