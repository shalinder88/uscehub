# P102 Gold Set — 10-Institution Benchmark Spec

schemaVersion: p102-0r-1
status: SPEC ONLY — queue is built but NOT to be run until P102-0D (model A1/A2 reader) is online and extraction is resumed by the operator.

## Purpose

The gold set is the framework's regression-test harness. It contains 10 institutions chosen to span the known failure modes (per master spec §23). When P102-0D produces real PUBLIC_SAFE_USCE claims, the gold set verifies that:

1. The framework produces correct positive claims where USCE actually exists.
2. The framework produces correct negative claims where USCE is explicitly refused.
3. The framework produces correct future-lane signals from GME/careers/services pages.
4. The framework correctly handles system-scope / school-scope ambiguity.
5. The framework correctly handles bot blocks and PDF-heavy institutions.

The gold set is the gate before Trial 3.5 (25-institution stratified sample) and Trial 4 (state slice).

## Selection method

Each of the 10 institutions exercises one specific failure mode from the master spec. Where possible, the institution is drawn from existing P101 evidence so a prior ground truth exists. Where P101 evidence is thin, the institution is selected by reputation + public-information confidence, and the gold-set ground truth is set after P102-0D runs it (turning the gold set into a regression baseline).

## The 10 entries

### Gold 1 — Clear international medical student program
- **Cleveland Clinic Florida** (Weston, FL)
- Domain: `my.clevelandclinic.org` (or `clevelandclinicflorida.org`)
- Failure mode tested: positive identification of an International Medical Student Program (ISP) — does the framework correctly emit PUBLIC_SAFE_USCE for clearly-named visiting/international student programs?
- Prior P101 evidence: no (not yet packeted)
- Expected (after P102-0D): ≥1 PUBLIC_SAFE_USCE in VISITING_MEDICAL_STUDENT lane, quote-verified.

### Gold 2 — Clear US MD/DO VSLO-only
- **Vanderbilt University Medical Center** (Nashville, TN)
- Domain: `vumc.org`
- Failure mode tested: VSLO-only restriction — does the framework correctly emit a PUBLIC_SAFE_USCE with a quote indicating US LCME-only AND a negative claim about IMG access?
- Prior P101 evidence: no
- Expected: ≥1 PUBLIC_SAFE_USCE for VSLO-only visiting students; possibly a PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY for IMGs depending on whether explicit refusal is on-page.

### Gold 3 — Clear IMG observership
- **Houston Methodist Hospital** (Houston, TX)
- Domain: `houstonmethodist.org`
- Failure mode tested: framework finds real observership pages even when URLs like /observership are stale redirects. Requires fixed-path expansion or sitemap-index recursion.
- Prior P101 evidence: P101-6 packet exists. P102 Trial 2 run captured `/observership` (was Pharmacy Externship redirect — false positive). Real observership content may live at a different path.
- Expected: at minimum, identify the actual observership page if it exists; otherwise emit PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY if explicit refusal exists.

### Gold 4 — No public lane with direct negative quote
- **Mayo Clinic** (Rochester, MN)
- Domain: `mayoclinic.org`
- Failure mode tested: framework produces PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY when an institution publishes explicit refusal language (Mayo's policy pages historically state observership eligibility restrictions).
- Prior P101 evidence: no
- Expected: ≥1 EXPLICIT_NEGATIVE_QUOTE negative claim with STRONG strength and publicSafeNegativeClaim=true. (If Mayo's site no longer publishes this, gold-set will be re-pointed at a clearer example.)

### Gold 5 — No public lane by absence after broad search
- **Hartford Hospital** (Hartford, CT)
- Domain: `hartfordhospital.org`
- Failure mode tested: absence-only (no explicit negative quote). Framework should emit NO_PUBLIC_OPPORTUNITY_FOUND with negativeEvidenceStrength=WEAK, NOT PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY.
- Prior P101 evidence: P101-5 packet exists with verdict NO_PUBLIC_USCE_LANE_FOUND_ON_HOSPITAL_OWN_SITE. P102 Trial 1 confirmed structural correctness.
- Expected: 0 PUBLIC_SAFE_USCE, 0 PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY, framework verdict FAIL_NEEDS_A4 or PASS_WITH_CAVEATS depending on whether the v2 cleaned-text + expanded fixed paths recover any signal.

### Gold 6 — Parent system ambiguity
- **AdventHealth Orlando** (Orlando, FL)
- Domain: `adventhealth.com` (system-level)
- Failure mode tested: scope discipline — system-level page content must not auto-apply to a specific campus.
- Prior P101 evidence: P101-6 packet exists. P102 Trial 2 confirmed scope inference correctly marks `adventhealth.com/*` as HEALTH_SYSTEM_LEVEL.
- Expected: 0 PUBLIC_SAFE_USCE for AdventHealth Orlando (scope mismatch); ≥0 HUMAN_REVIEW_REQUIRED items if observership content exists on the system page.

### Gold 7 — Medical-school-level source ambiguity
- **Brigham and Women's Hospital** (Boston, MA)
- Domain: `brighamandwomens.org` (hospital), `hms.harvard.edu` (med school)
- Failure mode tested: when the visiting student page lives on the medical school's domain (HMS) and applies to BWH only via affiliation, the framework must not auto-apply HMS claims to BWH.
- Prior P101 evidence: P101-4 packet exists for Brigham; HMS Visiting Clerkship page sometimes captures.
- Expected: 0 PUBLIC_SAFE_USCE from HMS sources for Brigham specifically. Cross-institution evidence should be marked CAUTION_SAFE_INTERNAL_REVIEW.

### Gold 8 — GME-rich but no USCE
- **The Brooklyn Hospital Center** (Brooklyn, NY)
- Domain: `tbh.org`
- Failure mode tested: deep residency/fellowship/pharmacy content that must NOT produce PUBLIC_SAFE_USCE. All GME claims must remain FUTURE_LANE_ONLY.
- Prior P101 evidence: P101-4 packet exists. P102 Trial 2 confirmed: 23 sources, 33 claims, 32 FUTURE_LANE_ONLY (GME), 0 PUBLIC_SAFE_USCE.
- Expected: same shape — 0 PUBLIC_SAFE_USCE, rich future-lane signal, possibly 1 HUMAN_REVIEW_REQUIRED for the volunteer/shadow page.

### Gold 9 — Jobs/visa-rich
- **Northwell Staten Island University Hospital** (NY) OR a similar academic medical center
- Domain: `northwell.edu` / `siuh.northwell.edu`
- Failure mode tested: heavy careers / visa / faculty job content. Framework should produce high futureLaneValue but 0 PUBLIC_SAFE_USCE.
- Prior P101 evidence: P101 has Northwell Staten Island; jobs/visa signal expected.
- Expected: 0 PUBLIC_SAFE_USCE, ≥3 FUTURE_LANE_JOB claims, possibly J-1/H-1B visa signals.

### Gold 10 — PDF-heavy
- **Boston Medical Center** (Boston, MA)
- Domain: `bmc.org`
- Failure mode tested: PDF handbook content. Framework's PDF cascade must fire (pdftoppm render or pdf-parse). Currently P102 marks PDFs as PDF_TEXT_EMPTY_RENDER_PENDING; this gold-set entry exercises that path.
- Prior P101 evidence: P101-4 packet exists for BMC.
- Expected: ≥1 PDF detected, cascade applied (pdftoppm fallback or PDF_OCR_UNAVAILABLE if tesseract missing), claims emitted from extracted PDF text where possible.

### Gold 11 — Bot-block / timeout (over-cap entry; can drop to 10 if needed)
- **Michigan Medicine** (Ann Arbor, MI)
- Domain: `uofmhealth.org`
- Failure mode tested: institution with known bot-detection. Framework should produce BOT_BLOCKED_MANUAL_RETRY status for blocked sources, never fabricate claims.
- Prior P101 evidence: P101-1 packet exists with verdict BOT_BLOCKED.
- Expected: ≥1 source marked BOT_BLOCKED_MANUAL_RETRY; A4 emits REFETCH_FAILED_SOURCE task.

## Verification protocol (after P102-0D runs the gold set)

1. P102-0D's model A1/A2 reader processes each gold-set institution.
2. For each, the validator runs and confirms quote-verification + scope discipline.
3. The A3 regate runs.
4. A separate `scripts/p102-gold-set-verify.ts` (future work) compares actual outputs against the expected outcomes documented above and produces a pass/fail per institution.
5. Gold set passes if 9/10 institutions match expected. The one allowed mismatch must be documented with rationale.

## Failure-mode coverage check

| Failure mode | Gold entry | Status |
|---|---|---|
| Identity collision | (deferred — handled by canonicalizer + dedupe index) | n/a |
| Duplicate old/new names | (deferred) | n/a |
| Campus merge error | Gold 6 (AdventHealth Orlando) | covered |
| Parent-system overapplication | Gold 6 | covered |
| Medical-school overapplication | Gold 7 (BWH + HMS) | covered |
| Keyword blindness | (will be tested in P102-0D model reader) | partial |
| Future-lane contamination | Gold 8 (Brooklyn) | covered |
| Quote hallucination | (validator enforces) | enforced |
| Stale/dead page | Gold 3 (Houston Methodist `/observership` redirect) | covered |
| PDF text-empty miss | Gold 10 (BMC) | covered |
| Rate limit / bot block | Gold 11 (Michigan Medicine) | covered |
| Storage mess | (operating doctrine + validator enforces) | enforced |
| Public-copy overclaim | Gold 6 (system-level scope) | covered |
| City/metro ambiguity | Gold 6, Gold 7 | partial |
| Negative evidence treated too weakly | Gold 4 (Mayo) | covered |
| Negative evidence treated too strongly | Gold 5 (Hartford absence-only) | covered |
| Identity canonicalizer | (handled by `p102-identity-canonicalizer.ts`) | covered |

## Run policy (CRITICAL)

**DO NOT RUN THIS QUEUE** until BOTH of the following are true:
1. P102-0D (model A1/A2 reader) is online and producing PUBLIC_SAFE_USCE claims on Trial-2 institutions.
2. The operator explicitly authorizes the gold-set run.

When authorized, the gold set runs through the standard runner, one institution per invocation:

```
npx tsx scripts/p102-discovery-runner.ts \
  --queue docs/platform-v2/local/usce-discovery-command-center/p102/queues/p102_gold_set_queue.csv \
  --limit 1 \
  --run-id p102-gold-<institution-slug>-1 \
  --institution-id <institution_id>
```

After each gold-set run completes, run the extractor + regate + (future) gold-set-verify scripts.
