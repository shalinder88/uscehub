# P102 Top-50 Review Instructions

schemaVersion: p102-top50-review-1
branch: `local/p102-approved-rows-website-ingestion`
parent commit: `90fd1eb` (reviewer workflow complete)
production main: `739ab1e` UNCHANGED

## 1. What this is

A guide for a human reviewer to convert the priority-scored top 50 entries of `public_safe_review_decisions_top50.csv` into approved opportunity rows that the website can render. Each approved row is one quote-backed USCE opportunity carrying its own audit trail.

**Hard rule before you start: do NOT approve any row unless you can show explicit campus applicability proof copied verbatim from the source page.** Placeholder text ("TBD", "applies to all campuses", "system-wide") is auto-rejected by the validator.

## 2. Setup

1. Open the starter file:
   ```
   docs/platform-v2/local/usce-discovery-command-center/p102/exports/public_safe_review_decisions_top50.csv
   ```
   Save it under the canonical filename so re-running the summarizer does not clobber your work:
   ```
   cp public_safe_review_decisions_top50.csv public_safe_review_decisions.csv
   ```
   The builder prefers `public_safe_review_decisions.csv`; the top-50 file is the fallback.

2. Open the summary for context:
   ```
   docs/platform-v2/local/usce-discovery-command-center/p102/exports/public_safe_review_queue_summary.md
   ```
   It groups the 925 review-queue entries by institution, scope, and deep family.

## 3. Per-row workflow

For each row in your decisions CSV, decide one of:

| Decision | When to use |
|---|---|
| `APPROVE_PUBLIC_SAFE` | Quote-backed, on-domain or campus-applicability-proven, Tier 1 USCE. Promote. |
| `REJECT_NOT_USCE` | Quote describes something other than USCE (e.g., a residency-only program, a research fellowship for current trainees, a careers page). |
| `REJECT_SCOPE_MISMATCH` | Quote describes a different campus / wrong institution. (Cohen Children's-style.) |
| `REJECT_OFF_DOMAIN_NO_APPLICABILITY` | Source is on an off-domain medical school; no proof the named hospital uses this program. |
| `KEEP_HUMAN_REVIEW` | Need more time / not sure. (Default.) |
| `NEEDS_MORE_EVIDENCE` | Reviewer wants additional sources before approving. |
| `FUTURE_LANE_ONLY` | Downgrade to future-lane archive (Tier 2 / Tier 3 only — not USCE). |
| `DUPLICATE_OF_APPROVED_ROW` | Same opportunity as a row already approved. Fill `duplicateOfRowId`. |

### To approve (`APPROVE_PUBLIC_SAFE`)

Fill ALL of these fields:

| Field | Rule |
|---|---|
| `proposedOpportunityName` | Human-readable program name. ≥ 3 chars. Example: "Bone Marrow Transplant Elective". |
| `proposedOpportunityType` | One of: `OBSERVERSHIP`, `VISITING_MEDICAL_STUDENT`, `CLINICAL_ELECTIVE`, `SUB_INTERNSHIP`, `AWAY_ROTATION`, `INTERNATIONAL_VISITING_STUDENT`, `RESEARCH_OPPORTUNITY`, `EXTERNSHIP`. |
| `proposedAudience` | One of: `international`, `us-md-do`, `img-observer`, `unknown`. |
| `proposedCampus` | When `sourceScope` is `HEALTH_SYSTEM_LEVEL` or `MEDICAL_SCHOOL_LEVEL`, name the specific hospital/campus this row applies to. |
| `campusApplicabilityProof` | **REQUIRED for system/school scope.** ≥ 30 chars verbatim quote or named-list reference that proves the source page applies to the specific hospital. (See §4 for valid vs invalid examples.) |
| `decisionReason` | ≥ 10 chars, not "TBD"/"TODO"/"unknown"/etc. Explain what convinced you. Example: "VSLO catalog at https://students-residents.aamc.org names Memorial Regional Hollywood as a participating site for the Memorial Healthcare clerkship — quote: 'Visiting students rotate at Memorial Regional Hollywood (Hollywood, FL)'." |
| `reviewer` | Your full name (or initials + last name). Not "auto", "system", "model", "Claude", "AI", "TBD". |
| `reviewedAt` | Today's date, ISO format: `2026-05-16`. |

### To reject

Fill `reviewerDecision`, `decisionReason` (≥ 10 chars), `reviewer`, `reviewedAt`. No other fields required.

### To mark duplicate

Fill `reviewerDecision: DUPLICATE_OF_APPROVED_ROW`, `duplicateOfRowId` (the existing `rowId` it duplicates), `decisionReason`, `reviewer`, `reviewedAt`.

## 4. `campusApplicabilityProof` — valid vs invalid

### Valid (≥ 30 chars, names the campus)

✓ `"Teaching site list at https://medschool.example.edu/clinical-affiliates names Memorial Regional Hollywood as a primary teaching hospital for OB/GYN and Family Medicine clerkships."`

✓ `"VSLO catalog entry shows the elective at Memorial Regional Hollywood — quote: 'Visiting students rotate at Memorial Regional Hollywood (Hollywood, FL).'"`

✓ `"Clerkship page lists Memorial Regional Hollywood: 'Rotations occur at the following Memorial Healthcare System sites: Memorial Regional, Memorial Hollywood, Memorial Pembroke.'"`

✓ `"Department page links Memorial Regional Hollywood as the campus for the General Surgery sub-internship at https://example.edu/general-surgery/clerkships."`

### Invalid (validator will reject)

✗ `"TBD"` / `"TODO"` / `"unknown"` / `""` / `null`

✗ `"applies to all campuses"` — no specific campus named

✗ `"system-wide program"` — does not prove a specific campus

✗ Any string shorter than 30 characters

✗ Any text that does not contain the institution name, the campus name, or the city as a substring

The validator (`scripts/p102-validate-approved-public-safe-export.ts`) enforces all of these and exits non-zero on any violation.

## 5. After editing the CSV

1. Save the file.
2. Build the approved export:
   ```
   npx tsx scripts/p102-build-approved-public-safe-export.ts
   ```
   This regenerates `public_safe_opportunity_rows_approved.json`, `public_safe_opportunity_rows_rejected.json`, `public_safe_opportunity_rows_needs_more_evidence.json`, and `public_safe_approval_audit.md`.
3. Validate the approved export:
   ```
   npx tsx scripts/p102-validate-approved-public-safe-export.ts
   ```
   If validation fails, the audit MD lists every failure with the row ID and reason. Fix the CSV row and re-run.
4. Sync to the website snapshot:
   ```
   npx tsx scripts/p102-sync-approved-rows-to-website.ts
   ```
   This copies the approved export into `src/data/generated/p102-approved-usce.generated.json`, which the Next.js preview route imports.
5. Validate the website snapshot:
   ```
   npx tsx scripts/p102-validate-website-approved-usce-data.ts
   ```
6. Run the full validator dispatcher:
   ```
   npx tsx scripts/p102-validate-all.ts
   ```
   Expected: 14/14 PASS.
7. Preview locally:
   ```
   npm run dev
   ```
   Then open http://localhost:3000/usce/verified-preview to see the listing, and click into any row to see the detail page with the source quote evidence box.

## 6. Pacing target

- **First sitting**: 15 rows (3-4 hours). Aim for 5 approvals + the rest spread across rejects / needs-more-evidence.
- **Second sitting**: another 15 rows. Cumulative target: ~10 approvals.
- **Third sitting**: remaining 20 rows. Cumulative target: 20-30 approvals.

If the top 50 yields fewer than 10 approvals (because most are correctly held by scope discipline), expand to rows 51-150 from the full 925-entry template (`public_safe_review_decisions.template.csv`).

## 7. What NOT to do

- **Don't** approve a row whose `sourceQuote` you have not read.
- **Don't** approve a row where `sourceQuote` is `NOT_STATED_ON_SOURCE` — that's an honest absence marker, not a USCE offer.
- **Don't** write `"applies to all campuses"` as `campusApplicabilityProof`. The validator will reject it.
- **Don't** mark `reviewer` as "Claude" / "Claude Code" / "AI" / "auto". Use your own name.
- **Don't** approve rows for residency, fellowship, careers, jobs, or benefits content. Those are FUTURE_LANE_ONLY by design.
- **Don't** approve a row that names the wrong institution (Cohen Children's mis-attributed to SIUH-style).
- **Don't** mass-approve by find-and-replace. Each approval must include a real `campusApplicabilityProof` (for system/school) and a real `decisionReason`.

## 8. After the review pass

Run the rebuild + validate + sync + validate cycle in §5. Then commit:

```
git add docs/platform-v2/local/usce-discovery-command-center/p102/exports
git add src/data/generated/p102-approved-usce.generated.json
git commit -m "P102: top-50 reviewer pass — N rows approved"
```

The next sprint will:
- Decide whether to promote approved rows into Prisma (one-off import, separate user approval gate).
- Or surface the preview route to a small audience for soft launch.

Branch: `local/p102-approved-rows-website-ingestion`. Local commits only. Production main `739ab1e` UNCHANGED.
