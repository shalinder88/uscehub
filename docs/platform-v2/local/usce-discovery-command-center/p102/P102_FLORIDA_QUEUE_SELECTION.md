# P102-FLORIDA Queue Selection — Batch 1 (10 institutions)

schemaVersion: p102-florida-1
branch: `local/p102-florida-state-deep-queue`
parent commit: `8e8344f` (P102 positive-control calibration complete)
production main: `739ab1e` UNCHANGED

## 1. Why Florida first

Florida is the right first one-state queue because the gold + positive-control sprints already stress-tested Florida-specific complexity patterns:

- **Orlando Health** (positive control): 27 quote-backed PUBLIC_SAFE_USCE rows. Real on-domain VSLO clerkship program.
- **AdventHealth Orlando** (gold): parent-system scope-discipline test caught the original P102-0G bug.
- **Cleveland Clinic Florida** (gold): system-domain (`my.clevelandclinic.org`) HUMAN_REVIEW_REQUIRED preservation.
- **Memorial Hollywood** (positive control): acronym-domain HEALTH_SYSTEM_LEVEL bug caught and fixed mid-sprint.
- **UM / UHealth** (positive control): demonstrated queue-author gap for deep institution-specific URLs.

Florida concentrates the failure-mode mix we need to validate at state scale before national:

- Multi-campus parent systems (AdventHealth, HCA Florida, Baptist Health South Florida, Memorial Healthcare System, Lee Health, BayCare).
- Academic medical centers with affiliated medical schools (UM Miller, USF Health, UF College of Medicine, Wertheim FIU, FSU College of Medicine).
- Off-domain medschool patterns (UF Health Jacksonville vs Gainesville, USF Health vs TGH, Wertheim vs Mount Sinai Miami).
- IMG-heavy applicant interest (NRMP / VSLO data show Florida is a top-5 state for IMG applications).
- Manageable institution count (~200 acute-care teaching hospitals statewide, vs 700+ for Texas or 900+ for California).

## 2. Batch 1 selection criteria

Per the user's instructions:

> Do not run the whole Florida queue blindly. Start with Batch 1 only — 10 institutions maximum. Batch 1 should include known positives, system-scope tests, one or two likely no-yield controls, one medical-school/off-domain ambiguity case.

Batch 1 selection (10 institutions, ordered by rank):

| # | Institution | Domain | Priority | Test purpose |
|---|---|---|---|---|
| 1 | Mayo Clinic Florida | mayoclinic.org | FL_P1_HIGH_YIELD_ACADEMIC | Off-domain medschool possible (jacksonville.mayo.edu); compare against Mayo Rochester (gold #4) |
| 2 | Baptist Hospital of Miami | baptisthealth.net | FL_P3_SYSTEM_SCOPE_TEST | 11-hospital system on a single brand-acronym domain; same pattern as Memorial Healthcare System (positive-control bug-fix) |
| 3 | Tampa General Hospital | tgh.org | FL_P1_HIGH_YIELD_ACADEMIC | USF Health affiliate; off-domain medschool likely (health.usf.edu/medicine) |
| 4 | UF Health Shands Hospital | ufhealth.org | FL_P1_HIGH_YIELD_ACADEMIC | UF College of Medicine flagship; multi-campus (Shands Gainesville + UF Health Jacksonville) scope test |
| 5 | Jackson Memorial Hospital | jacksonhealth.org | FL_P1_HIGH_YIELD_ACADEMIC | Miller SOM primary teaching hospital; content may live at miami.edu medical school |
| 6 | Mount Sinai Medical Center Miami Beach | msmc.com | FL_P2_TEACHING_GME | Wertheim (FIU) SOM affiliate; single-campus academic |
| 7 | Nicklaus Children's Hospital | nicklauschildrens.org | FL_P2_TEACHING_GME | Pediatric teaching hospital; multi-specialty USCE content varies |
| 8 | Lee Memorial Hospital | leehealth.org | FL_P3_SYSTEM_SCOPE_TEST | 6-campus Lee Health system; scope-discipline test for system domain |
| 9 | Sarasota Memorial Hospital | smh.com | FL_P2_TEACHING_GME | Community teaching hospital with growing GME; FSU/USF affiliations |
| 10 | Nemours Children's Hospital Orlando | nemours.org | FL_P2_TEACHING_GME | Multi-state pediatric system (Delaware Valley + FL); strong system-scope test |

Mix balance:

- **3 academic centers with possible off-domain medschool** (Mayo FL, TGH/USF, UF Health/UF COM) — test off-domain medschool patterns.
- **2 multi-campus system-scope tests** (Baptist Health South FL, Lee Health, Nemours multi-state) — test acronym-domain HEALTH_SYSTEM_LEVEL discipline.
- **1 Miller SOM teaching hospital** (Jackson Health) — test off-domain via miami.edu academic content.
- **3 single-campus or pediatric academic** (Mount Sinai Miami, Nicklaus, Sarasota Memorial) — test cleaner positive promotion paths.
- **1 likely-no-yield control** (Lee Memorial / Sarasota Memorial — community teaching with limited public USCE).

## 3. Florida institutions NOT in Batch 1 (already tested via gold / positive-control)

These are already covered by existing runs on the canonical T7 root:

| Institution | Run ID | Status |
|---|---|---|
| Cleveland Clinic Florida | `p102-gold-1-cleveland-clinic-florida` | `GOLD_PASS_HUMAN_REVIEW_REQUIRED` (system scope) |
| AdventHealth Orlando | `p102-1-trial-2-run-3` | `GOLD_PASS_HUMAN_REVIEW_REQUIRED` (parent system) |
| Orlando Health Orlando Regional | `p102-pc-2b-orlando-health` | `FL_PASS_PUBLIC_SAFE_FOUND` (27 PUBLIC_SAFE_USCE) |
| Memorial Healthcare System / Memorial Regional Hollywood | `p102-pc-4-memorial-hollywood` | `FL_PASS_HUMAN_REVIEW_REQUIRED` (system scope, post-fix) |
| University of Miami Miller SOM / UHealth | `p102-pc-3-um-uhealth` | `FL_PASS_NO_PUBLIC_SAFE_CORRECT` (deep URL gap, honest absence) |

These will be folded into the final Florida cross-run aggregate after Batch 1.

## 4. Pipeline per institution

Same proven pipeline that produced the 91 PUBLIC_SAFE_USCE source claims across gold + positive control:

```
1. A0 source capture           npx tsx scripts/p102-discovery-runner.ts ...
2. Deep source discovery       npx tsx scripts/p102-deep-source-discovery.ts ...
3. Deep extraction              npx tsx scripts/p102-claude-cli-extractor.ts --deep
4. (optional) A4 bounded fetch  ... --fetch-additional --max-additional-candidates 20 --max-additional-accepted 10 --max-additional-pdfs 5
5. Re-deep if A4 added sources  (re-run step 3)
6. Re-classify                  npx tsx scripts/p102-extract-claims-from-run.ts
7. Regate                       npx tsx scripts/p102-regate-run.ts
8. Quote-verify --strict        npx tsx scripts/p102-quote-verify.ts --strict
9. Validators                   npx tsx scripts/p102-validate-all.ts --fast
10. Log entry in P102_FLORIDA_RUNNING_LOG.md
11. Commit every 2-3 institutions or after any fix
```

## 5. Pass / fail criteria for Batch 1

Batch 1 passes if:

- 10 / 10 institutions complete or honestly blocked.
- Quote-verification failures: 0.
- Over-promotion failures: 0 (no HIDDEN_REJECTED → PUBLIC).
- Scope failures: 0 (no HEALTH_SYSTEM_LEVEL → PUBLIC).
- Gold-set verification: 11 / 11 still PASS.
- Validator dispatcher: 12 / 12 still PASS.
- At least several institutions produce PUBLIC_SAFE_USCE rows.
- System / campus ambiguous institutions remain HUMAN_REVIEW_REQUIRED.
- GME / residency / fellowship remains FUTURE_LANE_ONLY.

If Batch 1 fails on any of the above → halt and write `P102-FLORIDA-FIX` report. Do not continue to Batch 2 until fixed.

## 6. After Batch 1

Recommendation will be one of:

- **A. P102-FLORIDA-FIX** — bug or pattern needs framework fix before continuing.
- **B. Florida Batch 2** — continue state queue with next 10-20 institutions.
- **C. Minimal website ingestion contract** — start the source-linked display work for the 91 + new PUBLIC_SAFE_USCE rows.
- **D. Stop and review** — strategic checkpoint with user.

## 7. Out-of-scope reminders

- No push.
- No PR.
- No deploy.
- No merge to main.
- No schema migration / Prisma / DB / seed.
- No UI / homepage / SEO / sitemap / robots / metadata changes.
- No public import.
- No auto-publish.
- No national run.
- No parallel institutions.
- No broad crawler.
- T7 canonical root only.
- Terminal Claude CLI only.

Branch: `local/p102-florida-state-deep-queue`. Local commits only. Production main `739ab1e` UNCHANGED.
