# P102-POSITIVE-CONTROL USCE — Diagnostic Report

schemaVersion: p102-pc-1
sprint: P102-POSITIVE-CONTROL
branch: `local/p102-gold-deep-benchmark`
predecessor: P102-GOLD complete at HEAD `afd9f7a` (11/11 gold institutions PASS, 769 verified claims, 0 quote failures, 0 PUBLIC_SAFE_USCE)
this report HEAD: see git log

## 1. Why P102-POSITIVE-CONTROL was needed

P102-GOLD proved the extractor is **safe** — 0 over-promotions, 0 quote failures, 100% scope discipline, 100% defense-in-depth coverage across 11 institutions × 11 failure modes. But the gold result also exposed an unanswered question: can the framework **promote a real USCE opportunity to `PUBLIC_SAFE_USCE` when one truly exists**?

The user authorized a small, targeted positive-control sprint:
- Pull 10-20 institutions from prior P97/P101 evidence where USCE/observership/visiting-student opportunities are **known to exist** on-domain.
- Run the deep three-tier pipeline.
- Pass criterion: at least several quote-backed PUBLIC_SAFE_USCE rows produced.
- Fail criterion: 0 PUBLIC_SAFE_USCE → **stop and diagnose** classifier / source-scope / public-promotion rules.

## 2. What ran

Per the user's "stop after the second 0-promotion result and diagnose" rule, the sprint was halted after 2 institutions when both produced 0 PUBLIC_SAFE_USCE and the diagnostic pattern was clear.

| # | Institution | Domain | Known TIER_A URL (from P101) | Run ID | A0 accepted | Model verified | PUBLIC_SAFE_USCE source claims |
|---|---|---|---|---|---:|---:|---:|
| 1 | Memorial Sloan Kettering Cancer Center | mskcc.org | `/hcp-education-training/medical-students/elective` AND `/medical-student-observerships` | `p102-pc-1-msk` | 4 | 48 | **0** |
| 2 | Orlando Health Orlando Regional Medical Center | orlandohealth.com | `/medical-professionals/graduate-medical-education/clerkship-programs` | `p102-pc-2-orlando-health` | 4 | 30 | **0** |

Validators clean for both runs: quote-verify 78/78 OK; 11/11 validator dispatcher PASS.

The remaining 8 queued institutions (UM/UHealth, Memorial Hollywood, HSS, Houston Methodist deep re-test, UAB, Stanford, UCSF Fresno, Emory) were NOT run because the diagnostic pattern was already clear and running them would consume hours without producing additional diagnostic value.

The full queue is preserved at `docs/.../p102/queues/p102_positive_control_usce_queue.csv` and can be resumed after fixes are applied.

## 3. Diagnostic findings

The framework currently has **three complementary gaps** that together prevent positive promotion of known-good USCE pages. Each is addressable; all three are framework-level changes.

### Gap A: A0 fixed-path probe doesn't cover deep institution-specific URL patterns

The A0 deterministic probe iterates over a fixed list of well-known paths defined in `scripts/p102-discovery-runner.ts`:

```
/observership, /observerships, /observer, /clinical-observer,
/visiting-student, /visiting-students, /medical-students, /international-students,
/electives, /away-rotations, /clinical-elective, ...
/education, /medical-education, /professional-education, ...
```

But **real institutional USCE pages live at deep paths the probe doesn't try**:

| Institution | Real USCE URL | Probe coverage |
|---|---|---|
| MSK | `/hcp-education-training/medical-students/elective` | NO — three segments deep, prefix `/hcp-education-training` not probed |
| Orlando Health | `/medical-professionals/graduate-medical-education/clerkship-programs` | NO — three segments deep, prefix `/medical-professionals` not probed |
| Houston Methodist | `/academic-institute/education/medical/medical-student-rotations/` | NO — four segments deep, prefix `/academic-institute` not probed |
| UAB | `/medicine/international/international-programs/international-visiting-medical-students` | NO — four segments deep |
| Stanford | `/visiting-clerkships/international.html` | NO — `.html` suffix + non-standard prefix |
| HSS | `/education-institute/academic-visitor-program` | partial — `/education` probed but not `/education-institute/...` |

Result on MSK: A0 hit `/medical-students` (a top-level path that the probe does cover) and got the right CONTENT, but did not reach `/hcp-education-training/medical-students/elective` where the actual elective-application instructions live.

Result on Orlando Health: A0 hit `/residency`, `/fellowship`, `/careers`, `/education` — all Tier 2/3 pages. The Tier 1 `/medical-professionals/graduate-medical-education/clerkship-programs` was never probed, never captured, and the model A3 gate emitted **0 A4 recovery tasks** because nothing in the captured Tier 2/3 content linked to or referenced it.

**Fix candidate**: extend `FIXED_PATHS` with the prefix-rich patterns observed in P97/P101 evidence:

```
/hcp-education-training/medical-students
/hcp-education-training/medical-students/elective
/hcp-education-training/medical-students/observership
/medical-professionals/graduate-medical-education/clerkship-programs
/medical-professionals/graduate-medical-education
/academic-institute/education/medical/medical-student-rotations
/medicine/international/international-programs/international-visiting-medical-students
/medicine/international
/visiting-clerkships, /visiting-clerkships/international
/education-institute/academic-visitor-program
/education-institute
... and a small handful more from the P101 candidate URLs CSV.
```

The fix is a queue-author-curated URL list, NOT a free-form guesser. It's a 20-30 line addition in one place.

### Gap B: `classifyVisibility` uses discovery-time `sourceFamily` rather than content-tagged `deepSourceFamily`

When A0 discovers a page via JSON-LD or sitemap, the source-family tag is `JSON_LD` (or `SITEMAP`), which is a discovery-method tag, **not a content tag**. The deterministic re-classifier in `scripts/p102-extraction-lib.ts:classifyVisibility` requires the source-family to be one of `OBSERVERSHIP_PAGE`, `VISITING_STUDENT_PAGE`, or `RESEARCH_PAGE` before it will promote to `PUBLIC_SAFE_USCE`. When the family is anything else (including `JSON_LD`), it caps at `CAUTION_SAFE_INTERNAL_REVIEW`.

MSK is the cleanest example: A0 captured `/medical-students` via the JSON-LD record (so `sourceFamily: JSON_LD`). The deep model correctly extracted 20 Tier 1 candidates with `lane: CLINICAL_ELECTIVE`, `deepSourceFamily: ELECTIVE`, `sourceScope: INSTITUTION_SPECIFIC`, `confidence: HIGH`, and quoted real text like "Bone Marrow Transplant Elective — We offer an elective for medical students on bone marrow transplantation". All 20 were correctly identified as Tier 1 — but the re-classifier saw `sourceFamily: JSON_LD` and capped at `CAUTION_SAFE_INTERNAL_REVIEW`. None promoted.

**Fix candidate**: thread `deepSourceFamily` through to `classifyVisibility` and widen `isAppropriateFamily` to also accept content-tagged Tier 1 families (`ELECTIVE`, `OBSERVERSHIP`, `VISITING_STUDENT`, `INTERNATIONAL_VISITING`, `MEDICAL_EDUCATION`):

```typescript
// p102-extraction-lib.ts
const APPROPRIATE_DEEP_FAMILIES = new Set([
  'ELECTIVE', 'OBSERVERSHIP', 'VISITING_STUDENT',
  'INTERNATIONAL_VISITING', 'MEDICAL_EDUCATION',
]);

const isAppropriateFamily = 
  sourceFamily === 'OBSERVERSHIP_PAGE' || 
  sourceFamily === 'VISITING_STUDENT_PAGE' || 
  sourceFamily === 'RESEARCH_PAGE' ||
  (input.deepSourceFamily && APPROPRIATE_DEEP_FAMILIES.has(input.deepSourceFamily));
```

This is a ~5-line change in `classifyVisibility` plus a ~3-line update in `p102-claude-cli-extractor.ts:854` and `p102-quote-verify.ts:163` to pass `deepSourceFamily` through.

Safety: the existing lane-based gates remain — claims with future-lane (`CAREERS_PAGE`, `RESIDENCY_PROGRAM_INFO`, `FELLOWSHIP_PROGRAM_INFO`, `PHYSICIAN_SERVICES`), system/school scopes, or shadow/volunteer lanes are still capped to FUTURE_LANE_ONLY / HUMAN_REVIEW_REQUIRED regardless of `deepSourceFamily`. The widening only takes effect when the lane is USCE-positive AND the deep family is a clear Tier 1 content tag.

### Gap C: `USCE_VSM_PATTERNS` is missing common elective phrasings

The deterministic source-claim extractor (`scripts/p102-extract-claims-from-run.ts`) runs its OWN pattern-matching over the cleaned text — independent of the model's claim output. The patterns are defined in `scripts/p102-extraction-lib.ts`:

```typescript
USCE_VSM_PATTERNS = [
  /\bvisiting\s+medical\s+student/i,
  /\bvisiting\s+student/i,
  /\baway\s+rotation/i,
  /\bclinical\s+elective/i,
  ...
];
```

These miss the MSK phrasings: `Medical Student Elective Program`, `BMT Elective for medical students`, `medical-student elective`. The patterns require words like "clinical elective" / "visiting student" / "away rotation" — but MSK uses "medical student elective" without the "clinical" prefix.

**Fix candidate**: add 2-3 patterns:

```typescript
/\bmedical\s+student\s+elective/i,
/\belective\s+for\s+medical\s+students?/i,
/\bvisiting\s+(medical\s+)?student\s+elective/i,
```

Risk: too-broad patterns could overpromote non-USCE content (e.g., a residency page that mentions "medical-student-elective rotations"). Mitigation: keep the patterns specific (require the word "elective" with "medical student" as a phrase) and rely on the existing source-family / scope / lane gates.

## 4. Cross-cutting observation: positive promotion requires three signals to align

For the framework to emit a `PUBLIC_SAFE_USCE` source claim, three things must align:

1. **Capture** — A0 (or A4 recovery) must fetch the USCE-specific page.
2. **Classify** — the deterministic re-classifier must see a Tier 1 source-family signal.
3. **Pattern-match** — the deterministic source-claim extractor must match a USCE-positive pattern in the cleaned text.

Gold proved (2) and (3) are safe — no over-promotions across 11 institutions. Positive-control reveals that the joint coverage of (1), (2), and (3) is currently too narrow to surface known-positive content. Each gap is small; the three together compound.

## 5. What the model did right

This is not a model-quality problem. The model (Claude Opus 4.7) correctly:

- Captured MSK's `/medical-students` page content.
- Identified 20 Tier 1 `CLINICAL_ELECTIVE` candidates with HIGH confidence.
- Tagged `deepSourceFamily: ELECTIVE` (content-correct).
- Tagged `sourceScope: INSTITUTION_SPECIFIC` (correct).
- Quoted real elective-program language from MSK's site verbatim.
- Emitted 3 narrow A4 recovery tasks pointing at the right MSK pages.

The deterministic re-classifier failed to consume those signals because it was looking at the discovery-time source-family tag (`JSON_LD`) instead of the model's content-tag (`ELECTIVE`).

## 6. What the framework did right

- 0 quote-verification failures across 78 claims (model accuracy is high).
- 0 scope conflicts.
- 0 over-promotions.
- 0 hallucinations.
- All defense-in-depth signals working.
- All 11 validators clean.

The conservative posture is the right posture. The fix is to widen the **promotion path** without weakening any of the safety gates.

## 7. Recommendation

**A. Fix extractor/classifier** before running one-state deep queue.

Specifically, in a small, scoped P102-FIX sprint:

1. **Gap B (highest leverage, smallest change)**: thread `deepSourceFamily` into `classifyVisibility`. Re-run MSK + Orlando + the remaining 8 positive controls. Confirm at least several PUBLIC_SAFE_USCE rows emerge. (~30 minutes of code + ~2 hours of wall-clock to re-run 10 institutions.)
2. **Gap C (second-highest leverage)**: add 2-3 elective-phrasing patterns to `USCE_VSM_PATTERNS`. Re-run extract-claims on the existing positive-control runs. (~10 minutes of code + ~1 minute per institution.)
3. **Gap A (largest change, highest yield)**: extend `FIXED_PATHS` with 20-30 P97/P101-derived deep URL patterns. This is queue-author-curated, not free-form. Re-run A0 + deep extraction on all 10 positive controls. (~30 minutes of code + ~5 hours of wall-clock.)

Pass criteria for P102-FIX:
- At least 5 of 10 positive controls produce ≥1 quote-backed PUBLIC_SAFE_USCE source claim.
- 0 over-promotions (gold-set still 11/11 PASS, no PUBLIC_SAFE_USCE emerges where the model said HIDDEN_REJECTED).
- 0 quote-verification failures.
- 0 scope conflicts on system/school domains.
- All 11 validators continue to PASS.

After P102-FIX passes, advance to **B. one-state deep queue** as originally planned.

If P102-FIX fails (e.g., over-promotion sneaks in, or positive controls still 0/10), the recommendation is **C. stop and review with the user** before any further code changes.

---

Branch: `local/p102-gold-deep-benchmark`. Production main `739ab1e` UNCHANGED. No push, no deploy. Queue and 2 run folders committed locally for resume.
