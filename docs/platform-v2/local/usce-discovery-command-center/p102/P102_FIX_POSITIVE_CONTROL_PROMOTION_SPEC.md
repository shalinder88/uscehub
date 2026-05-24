# P102-FIX — Positive-Control Public-Safe Promotion Spec

schemaVersion: p102-fix-1
branch: `local/p102-positive-control-promotion-fix`
parent commit: `9e236e5` (P102-POSITIVE-CONTROL diagnostic report)
production main: `739ab1e` UNCHANGED

## 1. Why this fix is needed

P102-GOLD ran 11 institutions × 11 failure modes. Result:

- 769 verified claims
- 100% quote-verification
- 0 over-promotions
- 0 scope conflicts
- 0 quote failures
- 0 hallucinations
- 11 / 11 validators PASS

→ **The framework is safe.**

P102-POSITIVE-CONTROL ran 2 institutions (MSK, Orlando Health) drawn from known TIER_A_PUBLIC_SAFE / INSTITUTION_SPECIFIC P101 evidence. Result:

- 78 verified claims
- 78 / 78 quote-verified
- 0 over-promotions
- 11 / 11 validators PASS
- **0 PUBLIC_SAFE_USCE source claims**

→ **The framework is too conservative on known-good positives.**

## 2. The problem is NOT...

- The quote verifier — 78/78 quote-verified.
- The model A1/A2 reader — MSK's 20 Tier 1 `CLINICAL_ELECTIVE` candidates were correctly identified with `deepSourceFamily: ELECTIVE`, `confidence: HIGH`, `sourceScope: INSTITUTION_SPECIFIC`.
- The A3 gate — gold ran clean.
- Scope discipline — system / school / off-domain medschool all held correctly across gold.

## 3. The problem IS

The deterministic public-safe promotion path is too narrow:

- `classifyVisibility` uses the **discovery-time** `sourceFamily` (`JSON_LD`, `SITEMAP`, `FIXED_PATH`) to decide whether a page is appropriate for Tier 1 promotion.
- It does NOT consult the **content-tagged** `deepSourceFamily` (`ELECTIVE`, `OBSERVERSHIP`, `VISITING_STUDENT`) that the model emits per-claim.
- Result: a `/medical-students` page with content `"Medical Student Elective Program: How to Apply"` that was discovered via JSON-LD is forever stuck at `CAUTION_SAFE_INTERNAL_REVIEW`, even when every safety gate passes.

## 4. The correct principle

> `sourceFamily` is **discovery method**, not **content category**. It should be preserved as provenance but should not, by itself, block public-safe promotion.

The opportunity classification should be driven by:

1. **`deepSourceFamily`** — content-tagged by the model after reading the page (`ELECTIVE`, `OBSERVERSHIP`, `VISITING_STUDENT`, `INTERNATIONAL_VISITING`, etc.)
2. **`lane`** — extracted opportunity type
3. **`sourceScope`** — `INSTITUTION_SPECIFIC` / `CAMPUS_SPECIFIC` / `HEALTH_SYSTEM_LEVEL` / `MEDICAL_SCHOOL_LEVEL`
4. **`tier`** — Tier 1 / Tier 2 / Tier 3
5. **`quoteVerified`** — must be `true`
6. **`confidence`** — model's HIGH/MEDIUM/LOW
7. **`campusApplicabilityProof`** — set when system/school scope is rescued by explicit campus mention

The fix introduces a `resolvedOpportunityFamily` derived from the content tags, used by the classifier alongside `sourceFamily` (now demoted to provenance).

## 5. Before / after

### MSK — `/medical-students` page

**Before P102-FIX:**

```
claim:
  sourceUrl: https://mskcc.org/medical-students
  sourceFamily: JSON_LD              # discovery-time tag
  deepSourceFamily: ELECTIVE         # content tag (ignored by classifier)
  lane: CLINICAL_ELECTIVE
  sourceScope: INSTITUTION_SPECIFIC
  tier: TIER_1_PRE_RESIDENCY_USCE_MATCH
  quote: "Medical Student Elective Program: How to Apply"
  quoteVerified: true
  confidence: HIGH

classifyVisibility decision:
  isAppropriateFamily = (sourceFamily == 'OBSERVERSHIP_PAGE'
                         || 'VISITING_STUDENT_PAGE'
                         || 'RESEARCH_PAGE')
  → false (sourceFamily is JSON_LD)
  → return CAUTION_SAFE_INTERNAL_REVIEW
```

**After P102-FIX:**

```
classifyVisibility decision:
  resolvedOpportunityFamily = deepSourceFamily ?? sourceFamily
                            = 'ELECTIVE'
  isAppropriateFamily = (sourceFamily ∈ TIER_1_PAGE_FAMILIES)
                       || (resolvedOpportunityFamily ∈ TIER_1_DEEP_FAMILIES)
  → true (ELECTIVE is a Tier 1 deep family)

  AND confidence=HIGH AND sourceScope=INSTITUTION_SPECIFIC
  → return PUBLIC_SAFE_USCE
```

### Counter-examples (must NOT change)

**GME claim** (Tier 2):
```
deepSourceFamily: GME
lane: RESIDENCY_PROGRAM_INFO
→ FUTURE_LANE_ONLY (lane match short-circuits before family check)
```

**System-level Mayo claim**:
```
deepSourceFamily: ELECTIVE
sourceScope: HEALTH_SYSTEM_LEVEL
campusApplicabilityProof: null
→ HUMAN_REVIEW_REQUIRED (scope check short-circuits before family check)
```

**Quote-failure claim**:
```
quoteVerified: false
→ never reaches classifyVisibility (filtered upstream)
```

**Generic education page without opportunity**:
```
deepSourceFamily: MEDICAL_EDUCATION
lane: NO_PUBLIC_OPPORTUNITY_FOUND
→ HUMAN_REVIEW_REQUIRED (lane match short-circuits)
```

**Off-domain medschool source** (Brigham, Vanderbilt pattern):
```
sourceUrl: medschool.harvard.edu/...
officialDomains: [brighamandwomens.org]
→ source never accepted by A0/A4 (off-domain refused upstream)
```

## 6. What changes

### Gap B (primary fix) — `scripts/p102-extraction-lib.ts`

1. Add `TIER_1_DEEP_FAMILIES` constant: the set of model-emitted content families that signal Tier 1 USCE opportunity.
2. Extend `VisibilityInput` with an optional `deepSourceFamily?: string` field.
3. In `classifyVisibility`, compute `resolvedOpportunityFamily` and widen `isAppropriateFamily` to accept any of:
   - `sourceFamily` in the original page-family set (OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE, RESEARCH_PAGE)
   - `deepSourceFamily` in `TIER_1_DEEP_FAMILIES`
4. Keep all other gates unchanged: future-lane source families short-circuit first; system/school scope short-circuits before family; future-lane lanes short-circuit before family.

### Gap B thread-through

- `scripts/p102-claude-cli-extractor.ts:854` — pass `deepSourceFamily: c.deepSourceFamily` into the `classifyVisibility` call.
- `scripts/p102-quote-verify.ts:163` — pass `deepSourceFamily: claim.deepSourceFamily ?? null` into the `classifyVisibility` call.
- `scripts/p102-extract-claims-from-run.ts` — when emitting Tier 1 candidates, pass model-tagged `deepSourceFamily` through.

### Gap C — `USCE_VSM_PATTERNS`

Add narrow patterns:

```
/\bmedical\s+student\s+elective/i,
/\belective\s+for\s+medical\s+student/i,
/\bvisiting\s+medical\s+student\s+elective/i,
/\bmedical\s+student\s+rotation/i,
/\bclerkship\s+program/i,
/\binternational\s+visiting\s+student/i,
/\bnon[-\s]?affiliated\s+visiting/i,
/\bclinical\s+observer\s+program/i,
```

Keep specificity: require "medical student" + ("elective" | "rotation") phrase, OR "clerkship program", OR "observer program". Do NOT add bare "elective" or "rotation" (would catch fellowship/residency content).

### Gap A — `scripts/p102-discovery-runner.ts:FIXED_PATHS`

Add 20-30 narrow patterns derived from P97/P101 evidence:

```
/hcp-education-training/medical-students
/hcp-education-training/medical-students/elective
/medical-professionals/graduate-medical-education
/medical-professionals/graduate-medical-education/clerkship-programs
/academic-institute/education/medical/medical-student-rotations
/academic-institute/education
/medicine/international
/medicine/international/international-programs
/medicine/international/international-programs/international-visiting-medical-students
/visiting-clerkships
/visiting-clerkships/international
/education-institute/academic-visitor-program
/education-institute
/students/visiting-students
/medical-education/medical-student-electives
/medical-education/visiting-students
/education/medical-students
/education/visiting-medical-students
/for-medical-professionals/education/medical-students
/for-health-professionals/medical-students
/graduate-medical-education/clerkship-programs
/professionals/medical-education/visiting-students
```

Documented in code with the P97/P101 source URL each was derived from.

## 7. What does NOT change

- Quote verification.
- Quote-not-in-cleaned-text rejection.
- `NOT_STATED_ON_SOURCE` semantics.
- Scope-discipline (HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL → HUMAN_REVIEW_REQUIRED).
- Off-domain A4 refusal.
- Asymmetric visibility-drift fix (P102-GOLD Northwell).
- Source-family-as-provenance — still recorded, still returned, just not the only signal for promotion.
- Future-lane gating (CAREERS / GME / RESIDENCY / FELLOWSHIP / PHYSICIAN_SERVICES still cap at FUTURE_LANE_ONLY).

## 8. Pass criteria

- **MSK re-run** produces ≥ 1 quote-backed `PUBLIC_SAFE_USCE` source claim.
- **Orlando re-run** produces ≥ 1 quote-backed `PUBLIC_SAFE_USCE` source claim (after Gap A path additions).
- All 6 new regression tests pass.
- All existing tests pass.
- All 12 validators (including tsc) pass.
- Quote verification clean across all runs (gold + positive-control), strict mode.
- **Gold-set regression**: 11 / 11 still PASS; no existing FUTURE_LANE or HIDDEN_REJECTED claim is over-promoted to PUBLIC_SAFE_USCE.
- Northwell cross-campus catch (Cohen Children's → SIUH) still rejected.
- Cleveland system-scope discipline still holds Tier 1 to HUMAN_REVIEW_REQUIRED.
- Brigham / Vanderbilt / Michigan off-domain medschool refusal unchanged.

If pass criteria met → continue remaining 8 positive controls.
If MSK still 0 PUBLIC_SAFE_USCE after fix → halt and re-diagnose (likely missing test coverage or model-emit field mismatch).
If gold regresses (any FUTURE / HIDDEN claim promotes) → halt and roll back the offending change.

## 9. Out of scope

- No state run.
- No national run.
- No UI changes.
- No schema migration.
- No DB mutation.
- No SDK / API-key path.
- No broad crawler.
- No public import.
- No SEO / sitemap / robots / metadata / JSON-LD changes.
- No homepage changes.

## 10. Branch / commit hygiene

Branch: `local/p102-positive-control-promotion-fix`.
Local commits only.
No push.
No merge to main.
Production main `739ab1e` UNCHANGED.
