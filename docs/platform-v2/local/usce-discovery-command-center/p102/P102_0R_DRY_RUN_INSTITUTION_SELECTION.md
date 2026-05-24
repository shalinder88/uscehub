# P102-0R Dry Run Institution Selection

schemaVersion: p102-0r-1
selected: 2026-05-11

## Institution selected

**Hartford Hospital**
- City: Hartford
- State: CT
- Official domain (primary): `hartfordhospital.org`
- Official domain (system): `hartfordhealthcare.org`
- Parent system: Hartford HealthCare
- Academic affiliation: University of Connecticut School of Medicine (UConn SOM)
- Institution type: academic medical center
- institution_id: `inst_hartford_hospital_ct`
- run_id (planned): `p102-0r-dry-run-1`

## Why selected

Hartford Hospital is the right Trial 1 because the framework is being tested, not the dataset:

1. **Mid-size, not a 12-domain academic monster.** Hartford Hospital has a single primary web domain (`hartfordhospital.org`) plus a system sibling (`hartfordhealthcare.org`). Compared to MSKCC, Stanford, or Mayo — each of which spans many subdomains, departmental sites, separate medical-school portals, and complex affiliated entities — Hartford Hospital is structurally simple enough to diagnose failure modes if any phase breaks.

2. **System-scope discipline test.** Hartford Hospital is part of Hartford HealthCare. The framework must demonstrate it correctly distinguishes hospital-level claims from system-level claims when capturing sources from `hartfordhospital.org` versus any redirected/system pages. This exercises the `HEALTH_SYSTEM_LEVEL` vs `INSTITUTION_SPECIFIC` source-scope rule from the operating doctrine (rule 12).

3. **Medical-school overapplication test.** Hartford Hospital's UConn SOM affiliation means UConn-mediated sources (e.g., visiting-student pages on `medicine.uchc.edu`) might surface in JSON-LD or sitemap candidates. The framework must not auto-apply medical-school claims to the hospital. This exercises doctrine rule 13.

4. **Known prior P101 evidence.** P101-5 already produced an enhanced packet for Hartford Hospital with verdict `NO_PUBLIC_USCE_LANE_FOUND_ON_HOSPITAL_OWN_SITE`. This means we have ground truth to compare against:
   - P101 found `/health-professionals` and `/health-professionals/education` but not `/observership`, `/visiting-student`, or `/electives`.
   - P101 found 404 on `/health-professionals/education/medical-students` and `/health-professionals/education/graduate-medical-education`.
   - P101 found UConn SOM visiting-student pages timed out / 404.

   P102-0R should produce a structurally consistent A0 probe outcome: residency / fellowship / credentialing pages present, USCE pages absent. A3 should issue `PASS_WITH_CAVEATS` (or `FAIL_NEEDS_A4` if A0 unexpectedly captures zero usable sources), `publicSafe = false`, and should NOT emit `PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY` because no explicit negative quote exists — only absence after search.

5. **Negative-evidence discipline test.** Because P101 concluded "no public USCE lane" via absence (not via explicit negative quote), P102-0R's expected output is `NO_PUBLIC_OPPORTUNITY_FOUND` at the opportunity level, not `PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY`. If A3 lets an absence-based negative claim escape as public-safe, the validator's negative-evidence rule should catch it. This is the most important framework rule to test in Trial 1.

6. **Bot-block sensitivity is low.** Hartford Hospital's main site is publicly indexed and not aggressively bot-protected (per P101 evidence; `robots or access notes`: "Hartford Hospital site accessible"). Trial 1 should not be confounded by access blocks.

7. **PDF density is unknown but expected low.** Hartford Hospital's "Health Professionals" section is HTML-based, not PDF-handbook-driven. P102-0R's PDF cascade may or may not exercise; either way is informative.

## Why not MSKCC / Stanford / Mayo / Cleveland Clinic for Trial 1

These are major academic medical centers with:
- many subdomains (mskcc.org, mskcc.edu, separate departmental sites),
- multi-hospital systems (Stanford Health Care vs Stanford Hospital vs Lucile Packard vs SOM),
- complex international student programs that mix institutional + system-level claims,
- aggressive bot detection on some pages.

If P102-0R fails on MSKCC, it is unclear whether the failure is in the framework or in the institution's complexity. Trial 2 (P102-1) is where multi-domain complexity should be introduced after the framework proves stable on a simpler case.

## Expected outcomes

Expected A0 probe outcomes (based on P101 evidence):
- `robots.txt` reachable.
- `sitemap.xml` likely reachable.
- Fixed paths: most return 404. `/health-professionals` would not be in the fixed-path list (P102-1 should add it); `/residency`, `/fellowship`, `/gme`, `/careers` likely 200.
- JSON-LD: unknown; expected modest.

Expected A1.5 outcomes:
- `searchCompletenessScore` modest (probably 20–30%, reflecting that most fixed paths return 404 — that's a finding about hospital site structure, not a framework defect).
- `missingSourceFamilies` likely includes `OBSERVERSHIP_PAGE`, `VISITING_STUDENT_PAGE`.

Expected A2/A2.5 outcomes:
- Lane-specific depth empty (P102-0R defers model extraction).
- A2.5 should flag `pdf_pending` if any PDFs encountered; otherwise mostly false flags reflecting deferred extraction.

Expected A3 outcomes:
- `verdict`: `PASS_WITH_CAVEATS` (framework reached completion).
- `publicSafe`: `false` (no claim extraction → no overclaim possible).
- `networkUsed`: `false` (A3 reads run folder only).
- `agentUsed`: `false` (no Agent used).
- `futureLaneValue`: `MEDIUM` (residency/fellowship/careers pages typically present).
- `requiredA4Tasks`: likely empty, possibly small entries about UConn SOM follow-up.

## Risk level

LOW. Hartford Hospital is a known-tractable institution. The risk is in the framework, not in this particular institution.

## What this run does NOT test

- Multi-domain academic medical centers (deferred to P102-1 Trial 2).
- High-PDF-density institutions (deferred to gold set).
- Bot-blocked institutions (deferred to gold set).
- Explicit negative-quote institutions (deferred to gold set "no public lane with direct negative quote" type).
- VSLO-only US-MD/DO institutions (deferred to gold set).
- IMG-friendly observership programs (deferred to gold set).
