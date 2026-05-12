# P102-1 Trial 2 — Institution Selection

schemaVersion: p102-0r-1
date: 2026-05-12
trial: P102-1 (3-institution dry run)
predecessor: P102-0R Trial 1 (Hartford Hospital — PASS_WITH_CAVEATS)
predecessor patch: P102-0B (fixed-path list extended +5 paths)

## Selection criteria (from operating doctrine § 25)

Trial 2 exercises framework on three institutional structures:
1. one **high-yield** (clear IMG observership or international student program)
2. one **no-yield candidate** (small standalone; expected absence-based outcome)
3. one **ambiguous multi-campus health system** (exercises source-scope discipline)

## Selections

### 1. Houston Methodist Hospital — HIGH-YIELD CANDIDATE
- City/State: Houston, TX
- Domain: `houstonmethodist.org`
- institution_id: `inst_houston_methodist_hospital_tx`
- Type: academic medical center
- Academic affiliation: Weill Cornell Medicine (primary), Texas A&M EnMed, multiple SOM affiliates
- Prior P101 evidence: yes (P101-6)
- Why: Large academic medical center with multiple SOM affiliations. Houston Methodist publicly markets a Center for International Medicine. A robust web presence should surface VSLO and/or international electives at well-known paths. If P102-0R's framework finds them, the new fixed-path additions (`/medical-education`, `/student-affairs`) and the model A2 reader (deferred) will eventually extract claims.

### 2. The Brooklyn Hospital Center — NO-YIELD CANDIDATE
- City/State: Brooklyn, NY
- Domain: `tbh.org`
- institution_id: `inst_brooklyn_hospital_center_ny`
- Type: public safety-net hospital, independent
- Academic affiliation: Clinical affiliate of Mount Sinai (Icahn SOM)
- Prior P101 evidence: yes (P101-4)
- Why: Small standalone safety-net hospital, no large international student infrastructure. Expected outcome: absence-based "no public USCE lane" — same shape as Hartford. Distinguished from Hartford by being structurally simpler (no health-system parent) and lower expected fixed-path hit rate.

**Note on no-yield testing:** Without the A2 model reader (deferred to P102-0C / P102-1-deeper), the framework cannot extract explicit negative quotes if they exist. So this institution is a structural no-yield test (does the framework correctly produce `NO_PUBLIC_OPPORTUNITY_FOUND` with no overclaim?) rather than a `PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY` end-to-end test. The end-to-end negative-quote test is deferred to P102-GOLD with model A2 enabled.

### 3. AdventHealth Orlando — AMBIGUOUS MULTI-CAMPUS
- City/State: Orlando, FL
- Domain: `adventhealth.com` (system-level)
- institution_id: `inst_adventhealth_orlando_fl`
- Type: academic medical center, part of AdventHealth system
- Academic affiliation: AdventHealth system (multiple residencies)
- Prior P101 evidence: yes (P101-6)
- Why: AdventHealth operates 50+ hospitals. The queue's `official_domain` is `adventhealth.com` (the SYSTEM domain), not a hospital-specific subdomain. This is the most aggressive scope-discipline test available without writing a custom institution: any USCE-relevant page captured from `adventhealth.com/observership` (etc.) applies to the SYSTEM, not specifically to the Orlando flagship. The framework must classify these as `HEALTH_SYSTEM_LEVEL` source scope. The A3 hostile gate must not let system-level claims propagate to the Orlando-specific opportunity object.

## Expected outcomes (informed by P101 evidence)

| Institution | Expected accepted sources | Expected publicSafe | Expected futureLaneValue | Notes |
|---|---|---|---|---|
| Houston Methodist | 5–10 | false (P102-0R defers A2) | MEDIUM-HIGH | If new fixed paths fire, expect richer source map |
| Brooklyn Hospital Center | 1–3 | false | LOW | Small site; expected sparse |
| AdventHealth Orlando | 5–10 | false | MEDIUM | System domain → many candidate pages but scope is system-level |

A3 verdict for all three: `PASS_WITH_CAVEATS` if A0 captures usable sources; `FAIL_NEEDS_A4` if any institution produces zero accepted sources (would indicate bot-block or framework defect).

## What this trial does NOT test

- Model-driven claim extraction (deferred to P102-0C or P102-1-deeper)
- Explicit negative-quote PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY end-to-end (needs model reader)
- PDF cascade exercise (only fires if institution links PDFs; opportunistic)
- Identity canonicalizer at scale (one institution per run; merging deferred to gold set)

## Run plan

Three sequential runs, one institution per run (per doctrine rule 1):
- `p102-1-trial-2-run-1` — Houston Methodist
- `p102-1-trial-2-run-2` — Brooklyn Hospital Center
- `p102-1-trial-2-run-3` — AdventHealth Orlando

Each run takes ~2 minutes wall clock. Validators run after each (per doctrine rule 24).
