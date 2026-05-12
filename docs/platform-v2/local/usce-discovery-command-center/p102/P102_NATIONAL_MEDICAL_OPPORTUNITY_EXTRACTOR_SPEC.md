# P102 — National Medical Opportunity Extractor Spec

schemaVersion: p102-0r-1
status: P102-0R (setup + one-institution dry run)
created: 2026-05-11
branch: local/p102-national-medical-opportunity-extractor

## 1. Purpose

P102 adapts the FranchiseL/FDD extraction architecture (A1 broad → A2 depth → A3 hostile gate) to USCEHub.

Where FDD's source unit is "one PDF per run," P102's source unit is **one institution / one official source universe per run**. Same discipline; different substrate.

P102 builds the terminal control system that scales source-linked national medical opportunity discovery one institution at a time. It does not crawl. It does not auto-discover at scale. It executes one institution end-to-end (A0 deterministic probe → A1 broad → A1.5 audit → A2 depth → A2.5 semantic miss → A3 hostile gate → optional A4 recovery → A5 continue-if-stuck) and stops.

## 2. Why P102 exists

P101 enhanced-packet manual cadence has shipped 25 source-linked institution packets at high quality. The cadence is proven (5 packets per execution window). But manual packetization does not scale to thousands of institutions.

P102 is the framework that does. It is a local terminal runner that:

- inherits FDD's gate discipline,
- writes artifacts to canonical T7,
- preserves the USCE-first public wedge,
- captures future-lane signals internally without publishing them,
- refuses to invent facts.

P102-0R builds the framework + runs one mid-size teaching hospital to prove the control system works. Extraction depth is allowed to be imperfect for P102-0R; the control system is the deliverable.

## 3. FDD lessons inherited

These are the FDD lessons that survive translation to USCEHub:

1. **Deterministic bootstrap before model interpretation.** The FDD bootstrap_pdf.py extracted TOC and page maps before A1 read anything. P102's A0 does the equivalent: robots.txt, sitemap.xml, fixed well-known path probes, JSON-LD extraction — all deterministic, no model judgment.

2. **One source unit per run.** FDD never let two PDFs share a run. P102 never lets two institutions share a run.

3. **No invented facts.** Every canonical field needs source evidence. NOT_STATED_ON_SOURCE is a valid value; making something up is not.

4. **Preserve uncertainty.** Contradictions, unresolveds, weak negative evidence — all preserved. Not collapsed prematurely.

5. **Evidence-grounded canonical.** Every public-safe claim cites source URL + source hash + verified quote.

6. **Single reader / single writer discipline.** The runner script writes files. The model reads cleaned text and emits structured JSON for the runner to write. No delegated reading. No Agent/subagent during A1–A4.

7. **Targeted retries.** A4 only does what A3 specifically identified as missing. No broad re-reading.

8. **File gates.** A1 must produce its required files before A2 starts. A2 must produce its required files before A3. A3 reads only files in the run folder.

9. **A2 depth is where the value lives.** A1 catalogs sources; A2 is where lane-specific depth is extracted.

10. **A3 is hostile.** A3's job is to catch hallucinated quotes, source-scope conflicts, public-copy overclaims, and missing critical fields. A3 has no network. A3 can fail A1/A2.

## 4. Core doctrine

1. One institution per run.
2. One source URL processed to artifact before the next (serial fetching).
3. Official source only for claims. Third-party pages (FRANdata equivalents, residency aggregators) are leads only.
4. No inferred claims. Quote or NOT_STATED_ON_SOURCE.
5. Quote must be verifiable in cleaned text. Quote verifier mandatory.
6. Preserve uncertainty.
7. Preserve negative evidence as first-class evidence.
8. Preserve future-lane signals internally but do not publish them as USCE.
9. Collect broad. Store structured. Tag aggressively. Validate strictly. Publish narrow.
10. Public USCE safe only when source proves it specifically.
11. Future-lane data (residency, fellowship, jobs, visa, doctor services, legal, insurance) stays internal unless the public wedge expands to that lane explicitly.

## 5. Product lanes

Canonical lane vocabulary:

- PRE_RESIDENCY_USCE
- VISITING_MEDICAL_STUDENT
- INTERNATIONAL_MEDICAL_STUDENT
- IMG_OBSERVERSHIP
- IMG_EXTERNSHIP
- CLINICAL_ELECTIVE
- AWAY_ROTATION
- SUB_INTERNSHIP
- RESEARCH_OPPORTUNITY
- RESIDENCY_PROGRAM_INFO
- FELLOWSHIP_PROGRAM_INFO
- ADVANCED_FELLOWSHIP
- VISITING_PHYSICIAN
- FACULTY_JOB
- ATTENDING_JOB
- HOSPITALIST_JOB
- J1_WAIVER_SIGNAL
- H1B_SPONSORSHIP_SIGNAL
- CAREERS_PAGE
- PHYSICIAN_SERVICES
- MALPRACTICE_INSURANCE_RESOURCE
- DISABILITY_LIFE_INSURANCE_RESOURCE
- CONTRACT_LEGAL_RESOURCE
- IMMIGRATION_LEGAL_RESOURCE
- CREDENTIALING_LICENSING_RESOURCE
- LOCUMS_RESOURCE
- NONCLINICAL_PHYSICIAN_RESOURCE
- NO_PUBLIC_OPPORTUNITY_FOUND

## 6. Visibility lanes

- PUBLIC_SAFE_USCE — quote-verified, source-scoped, applicant-relevant. Eligible for public USCEHub.
- PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY — explicit negative quote from official source. Eligible for "no public lane" display.
- CAUTION_SAFE_INTERNAL_REVIEW — has source evidence but scope ambiguity or quote-verification weakness; needs human review before public.
- FUTURE_LANE_ONLY — captured signal in non-USCE lane (residency/fellowship/jobs/visa/services); internal only.
- HIDDEN_REJECTED — source content is irrelevant or off-scope; not used.
- NO_PUBLIC_OPPORTUNITY_FOUND — absence after broad official-source search; NOT a public-safe negative claim. Lower confidence than PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY.
- BOT_BLOCKED_MANUAL_RETRY — fetch blocked (403/CAPTCHA/timeout); needs manual retry.
- NEEDS_A4_RECOVERY — A3 identified specific gap; A4 task queued.
- HUMAN_REVIEW_REQUIRED — gate-blocking ambiguity beyond automatic resolution.

**Rule:** PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY requires:
- direct negative quote ("We do not offer observerships to..." or equivalent),
- source URL,
- source hash,
- quoteVerified = true,
- official-source scope match.

Absence after search is NO_PUBLIC_OPPORTUNITY_FOUND, not PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY.

## 7. Source scope

Source scope governs which claims a source can support:

- INSTITUTION_SPECIFIC — applies to this institution.
- CAMPUS_SPECIFIC — applies only to a named campus within a system.
- HEALTH_SYSTEM_LEVEL — applies to the system as a whole; does NOT automatically apply to every campus.
- MEDICAL_SCHOOL_LEVEL — applies to the medical school; does NOT automatically apply to every affiliated hospital.
- DEPARTMENT_LEVEL — applies only to a named department.
- PDF_SOURCE — applies as the PDF describes (often campus-specific).
- CAREERS_PORTAL — applies to careers/jobs context only.
- THIRD_PARTY_LEAD_ONLY — discovery hint; never a claim source.
- UNKNOWN_SCOPE — scope undeterminable from source; default to most conservative.

**Rules:**
- A health-system page does not automatically apply to every campus.
- A medical-school page does not automatically apply to every hospital affiliate.
- A residency page does not prove USCE.
- A careers page does not prove USCE.
- A source must explicitly support the specific claim. Implicit scope expansion is forbidden.

## 8. Geographic scaling

The discovery universe is national, but the **run unit is always one institution**.

Queue layers:
- national universe (~6,000 hospitals + ~190 medical schools + GME programs)
- state queue (per state)
- county queue
- city queue
- metro queue

All queue layers resolve to institution_id. The runner processes one institution_id at a time, in serial. There is no parallel cross-institution processing.

## 9. Identity and dedupe

Each institution has:
- institution_id (canonical, stable)
- canonical_name
- aliases (former names, doing-business-as, common short forms)
- parent_system (if applicable)
- official_domains (the domains that count as official sources)
- duplicate_of (if a previous record was the canonical one)
- distinct_campus_same_system (e.g., Cleveland Clinic Florida is distinct from Cleveland Clinic Foundation)
- source_scope_rules (which scopes apply to claims about this institution)
- do_not_merge_reason (when entities look similar but are deliberately not merged)

Identity resolution is conservative: when in doubt, do not merge.

## 10. A0 deterministic discovery probe

A0 runs before any model interpretation. It is purely deterministic.

A0 fetches:
1. `robots.txt` — to identify allowed/disallowed paths and sitemap pointers.
2. `sitemap.xml` (and child sitemaps) — bounded extraction of candidate URLs.
3. Fixed well-known paths (see §11) — HEAD-first, GET on 2xx/3xx.
4. JSON-LD structured data from fetched HTML pages.

A0 writes:
- `00_bootstrap.json` — institution identity bootstrap
- `00_domain_map.json` — official domains identified
- `00_source_seed_map.json` — candidate source URLs
- `00_robots_sitemap_probe.json` — robots/sitemap results
- `00_jsonld_extract.json` — JSON-LD captured
- `00_fixed_path_probe.json` — fixed path probe results
- `00_artifact_manifest.csv` — artifact index for this run

**Important:** robots.txt and sitemap.xml guide scope. They do not authorize broad crawling. Sitemap parsing must be bounded and filtered to medical-opportunity URL patterns.

## 11. Fixed well-known path probes

Probe the following paths at the institution's official domain root and at known sub-paths (e.g., `/gme/`, `/education/`, `/medical-education/`):

- /observership
- /observerships
- /observer
- /clinical-observer
- /visiting-student
- /visiting-students
- /medical-students
- /international-students
- /electives
- /away-rotations
- /clinical-elective
- /clinical-rotation
- /sub-internship
- /subinternship
- /acting-internship
- /research
- /student-research
- /shadow
- /shadowing
- /volunteer
- /volunteering
- /img
- /international-medical-graduates
- /graduate-medical-education
- /gme
- /residency
- /fellowship
- /careers
- /physician-careers
- /provider-careers
- /benefits
- /visa
- /immigration
- /credentialing

HEAD-first probing. GET only on 200/301/302 or HEAD-unsupported 405 where GET is likely safe. Bounded redirect chains (max 5). No off-domain probing unless the official page redirects there and the redirect is recorded.

## 12. PDF doctrine

Official PDFs (visiting student handbooks, GME packets, observership applications, fellowship brochures) are first-class source objects.

PDF cascade:
1. Direct text extraction (e.g., `pdf-parse` or equivalent) if PDF is text-bearing.
2. `pdftoppm` render to PNG if text extraction fails or returns empty.
3. `fitz` (PyMuPDF) pixmap render if pdftoppm unavailable.
4. OCR (tesseract) only for diligence-material text-empty pages, **and only if tesseract is installed**. If tesseract is unavailable, mark `PDF_OCR_UNAVAILABLE` and do not infer content.

Never OCR an entire website. Never OCR a broad PDF set blindly. Target only relevant official PDFs.

## 13. A1 source map + broad extraction

A1 takes the A0 source seed map and:
- classifies each source by family (visiting-student page, observership page, GME page, careers page, etc.),
- accepts or rejects each source for extraction (with reason),
- captures cleaned text and raw HTML for accepted sources,
- emits source map, reader report, opportunity object skeletons, and a canonical institution record.

A1 outputs:
- `01_source_map.md`
- `02_reader_report.md`
- `03_opportunity_objects.json`
- `04_rejected_sources.json`
- `05_canonical_institution.json`
- `06_coverage_audit.md`
- `07_retry_tasks.md`
- `08_final_report.md`
- `09_final_canonical.json`
- `10_scorecard.md`
- `11_canonical_enriched.json`
- `12_canonical_enriched_v2.json`
- `14_run_summary.json`

## 14. A1.5 source completeness audit

A1.5 verifies A1 found everything A0 surfaced. Writes:
- `A1_5_source_completeness_audit.json`

Checks:
- officialDomainChecked
- robotsChecked
- sitemapChecked
- fixedPathProbesCompleted
- jsonLdChecked
- sourceFamiliesChecked (per lane)
- missingSourceFamilies
- conceptPacksDeferred (P102-0R defers concept packs to P102-1)
- searchCompletenessScore
- canProceedToA2

A2 does not start until A1.5 emits canProceedToA2 = true.

## 15. A2 depth engines

A2 is lane-specific depth extraction. Each depth engine reads relevant source families and produces structured claims.

A2 outputs:
- `RT_depth_usce.json` — USCE-specific depth (observership/visiting student/elective/Sub-I)
- `RT_depth_gme_residency_fellowship.json` — residency/fellowship/advanced fellowship structure
- `RT_depth_jobs_visa.json` — careers, faculty, visa signals
- `RT_depth_physician_services.json` — services, insurance, legal, credentialing
- `RT_depth_negative_evidence.json` — explicit negative claims with quote/source/hash
- `RT_depth_source_scope_conflicts.json` — scope ambiguities and conflicts

For P102-0R, depth engines may produce starter outputs based on the one institution. Full depth-engine generalization is deferred to P102-1+.

## 16. A2.5 semantic miss detector

A2.5 catches code-word blindness — places where lane-keywords are present but were not picked up as lane objects.

Checks (P102-0R minimum):
- "student" + "rotation" present but no visiting-student object → flag
- "elective" + ("fourth-year" or "4th year" or "M4") present but no elective object → flag
- "observer" or "shadow" present but no observership object → flag
- volunteer/shadow page found but no negative/positive classification → flag
- "J-1" or "H-1B" present but no visa object → flag
- "faculty" + "apply" present but no future-lane job object → flag
- PDF detected but not extracted → flag
- JSON-LD extracted but not reflected in source map → flag

Writes: `RT_semantic_miss_detector.json`

Concept packs (full synonym lexicon) are deferred to P102-1.

## 17. A3 hostile gate

A3 is the publish gate. It is hostile — its job is to find reasons to fail.

**A3 has no network. A3 has no Agent. A3 reads only run-folder files.**

A3 checks:
- unsupported claims (claim without source URL or hash or verified quote)
- quote verification failures (quote not findable in cleaned text)
- source scope conflicts (claim's scope exceeds source's scope)
- missing critical fields
- public-copy overclaim (PUBLIC_SAFE_USCE on GME-only or careers-only or doctor-services-only object)
- future-lane contamination of public USCE
- negative-evidence handling (is PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY actually quote-backed?)

A3 outputs:
- `15_publish_gate.md`
- `A3_gate.json`

A3_gate.json must include:
- `networkUsed: false` (self-attested, validator-checked)
- `agentUsed: false` (self-attested, validator-checked)
- `verdict`
- `publicSafe`
- `futureLaneValue`
- list of hallucination risks
- list of unsupported claims
- list of quote verification failures
- list of source scope conflicts
- list of missing critical fields
- list of negative evidence findings
- list of required A4 tasks
- final recommendation

## 18. A4 focused recovery

A4 does ONLY what A3 named in `requiredA4Tasks`. No broad re-crawl. No general re-reading.

A4 outputs:
- `A4_focused_recovery_tasks.json` (input — what A3 said to fix)
- updated artifact captures + updated source claims for the specific items A3 named

For P102-0R, A4 only runs if A3 names simple, safe tasks. Broad recovery is deferred.

## 19. A5 continue-if-stuck

A5 runs if A1 files are missing or incomplete and A1 could not complete. A5 provides a controlled restart path. For P102-0R, A5 is a stub — the runner should not need A5 for the dry-run institution.

## 20. T7 artifact doctrine

All artifacts go under:

```
/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/
```

Sub-structure:
- `queues/` — queue CSVs
- `runs/<run_id>/` — run files (A0–A5 outputs)
- `artifacts/<run_id>/` — source captures (cleaned text, raw HTML, PDFs, hashes)
- `indexes/` — global indexes
- `logs/` — runner logs
- `tmp/` — scratch

**Legacy root** at `/Volumes/T7Shield_Code/USCEHubEvidence/` is forbidden. Validator enforces.

Run folders are write-once: never overwrite. If a re-run is needed, use a new run_id.

T7 artifacts are NOT committed to the repo.

## 21. Global indexes

Maintained in T7 (`indexes/`):
- `institution_index.csv` — all known institutions
- `source_url_index.csv` — all source URLs encountered
- `claim_index.csv` — all claims ever made
- `opportunity_index.csv` — all opportunity objects ever created
- `artifact_index.csv` — all artifact files
- `run_index.csv` — all runs
- `dedupe_index.csv` — all dedupe decisions

These indexes grow append-only across runs.

## 22. Score system

Each run computes:
- **searchCompletenessScore** — did A0/A1/A1.5 cover the official source universe?
- **sourceConfidenceScore** — are sources official and verifiable?
- **artifactCompletenessScore** — are cleaned text + hashes present for accepted sources?
- **publicReadinessScore** — is there a public-safe USCE object ready to publish?
- **futureLaneValueScore** — what future-lane signal was captured?
- **hallucinationRiskScore** — how much of the run depends on unverified quotes or scope expansions?

Scores are advisory, not gating. A3 verdict gates publishing.

**searchCompleteness and publicReadiness are separate.** A thorough search can result in "no public lane." A thin search can produce a public-safe USCE if the one source is rock-solid. Do not collapse them.

## 23. Gold-set benchmark

Future P102-GOLD will define 10 reference institutions covering:
1. clear international medical student program (e.g., a major academic center with VSLO + ISP)
2. clear US MD/DO VSLO only
3. clear IMG observership
4. no public lane with direct negative quote
5. no public lane by absence after broad official-source search
6. parent system ambiguity (system page vs campus page)
7. medical-school-level source ambiguity
8. GME-rich but no USCE
9. jobs/visa-rich
10. PDF-heavy
11. bot-block/timeout

(11 listed for safety; can drop to 10.)

P102-0R does not build the gold set.

## 24. Failure modes

Known failure modes the framework guards against:
- identity collision (two distinct institutions merged into one)
- duplicate old/new names (rebranded institution captured twice)
- campus merge error (system campuses collapsed into the system)
- parent-system overapplication (system page claim applied to all campuses)
- medical-school overapplication (school page applied to all hospital affiliates)
- keyword blindness (lane keywords present but lane object not created)
- future-lane contamination (residency/jobs marked as public USCE)
- quote hallucination (quoted text not actually in source)
- stale/dead page (404 source quoted)
- PDF text-empty miss (PDF content not extracted; cascade not run)
- rate limit / bot block (fetch blocked; falsely treated as "no opportunity")
- storage mess (artifacts written to wrong root)
- public-copy overclaim (CAUTION_SAFE elevated to PUBLIC_SAFE)
- city/metro ambiguity (institution location misattributed)
- negative evidence treated too weakly (real explicit negative quote downgraded)
- negative evidence treated too strongly (absence after search treated as quote-backed)

Validator catches what it can. A3 hostile gate catches the rest.

## 25. Build/test/scale plan

Gated progression:
- **Trial 1 (P102-0R, this sprint):** one mid-size institution dry run.
- **Trial 2 (P102-1):** three institutions (high-yield, no-yield, ambiguous).
- **Trial 3 (P102-GOLD):** 10-institution gold-set benchmark.
- **Trial 3.5:** 25-institution stratified sample across states/types.
- **Trial 4 (P102-STATE):** one state slice.
- **Trial 5 (P102-NATIONAL):** national run.

No trial advances until the previous trial's validators + A3 gate verdicts are clean.

## 26. What this sprint builds

P102-0R deliverables:
- this master spec
- data contracts spec
- operating doctrine
- queue templates (repo-side)
- index templates (repo-side + T7 live)
- runner script (`scripts/p102-discovery-runner.ts`)
- validator (`scripts/validate-p102-discovery-runner.ts`)
- dry-run queue (one institution)
- institution selection doc
- one dry-run run folder (with all A0–A3 files)
- T7 artifact folder for the dry run
- checkpoint report
- final report

Out of scope for P102-0R:
- 3-institution test
- gold set
- state run
- national run
- production push
- UI changes
- DB schema
- public import
- noindex activation
