# P99-P97 First Pilot Source Capture Batch 3 — Sprint Report

**Date:** 2026-05-08
**Sprint ID:** `P99-P97-FIRST-PILOT-SOURCE-CAPTURE-BATCH-3`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `07ceace P99: resume backsite data trust continuation`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Backend / data / trust evidence capture for the 4 institutions previously flagged `NEEDS_SOURCE_CAPTURE_BATCH_3`. **No UI. No promotion. No deploy.**

---

## 1. Executive result

| Row | Status |
|-----|--------|
| Manatee Memorial Hospital (FL) | `DIRECT_SOURCE_NOT_FOUND` — no visiting-student program documented; recommend `KEEP_INTERNAL` / `REJECT_PUBLIC` |
| University Health San Antonio (TX) | `SOURCE_CONTRADICTS_PRIOR_INTERPRETATION` — closed-network US-Texas-non-profit-only; recommend `KEEP_INTERNAL` for IMG-focused lane |
| UPMC Western Psychiatric (PA) | `SOURCE_SUPPORTS_FRAMEWORK_ONLY` — site-specific page absent; system-level UPSOM/UPMC programs apply; recommend curator re-audit with audience carveout |
| Lincoln Medical (NY) | `SOURCE_SUPPORTS_FRAMEWORK_ONLY` — system-level NYC H+H MOSAIC VSP applies; US LCME/AOA only; recommend curator re-audit with site-specificity caveat |

| Aggregate metric | Value |
|------------------|-------|
| Rows in scope | 4 |
| Rows with strong direct evidence | 4 (different shapes — see row-by-row) |
| Rows ready for curator re-audit | **2** (UPMC Western Psychiatric · Lincoln Medical) |
| Rows blocked / internal-only | **2** (Manatee · UH San Antonio) |
| Bridge approvals performed | **0** ✅ |
| Runtime files modified | **0** ✅ |
| Pilot route touched | **NO** ✅ |
| Production deploy triggered | **NO** ✅ |

## 2. Row-by-row findings

### 2.1 Manatee Memorial Hospital (Bradenton, FL)

- **Official source URL:** `https://manateememorial.com/graduate-medical-education/`
- **Outcome:** No visiting medical student / observership / elective program is documented on the official source. The GME page covers only ACGME residencies (Internal Medicine, Family Medicine, Pharmacy).
- **Direct quote (≤280 chars):** *"Manatee Memorial's Residency Programs and GME, inclusive of Internal Medicine and Family Medicine, have been around since 2011."*
- **Audience:** No visiting-student audience documented.
- **Visa:** Not stated.
- **Application method:** Residency-only (ERAS/Match) — irrelevant to USCE pilot.
- **Cost:** Not stated for visiting students (none documented).
- **Disposition:** `REJECT_PUBLIC` for the IMG-focused micro-pilot. May be `KEEP_INTERNAL_FRAMEWORK_ONLY` until/unless a public visiting-student page emerges.

### 2.2 University Health San Antonio (San Antonio, TX)

- **Official source URL:** `https://www.universityhealth.com/healthcare-professionals/student-placement/affiliation-agreements`
- **Outcome:** Strong direct evidence that the program is a closed-network: school-level affiliation agreement required, schools must be (a) non-profit AND (b) physically based in Texas. Caribbean schools are typically both for-profit and out-of-state, so they are excluded by policy. One-off student requests are also explicitly excluded.
- **Direct quote (≤280 chars):** *"requests with any of the following attributes do not meet our criteria: School is proprietary (for-profit), School is not physically based in Texas, Seeking to establish an agreement for one student"*
- **Audience:** US LCME, Texas-based, non-profit schools with active affiliation agreement only.
- **Visa:** Not stated.
- **Application method:** School-level affiliation agreement; individual applications not accepted.
- **Cost:** Not stated.
- **Disposition:** `KEEP_INTERNAL` for the IMG-focused micro-pilot. Possibly viable as a future `READY_PUBLIC_US_ONLY_TEXAS_NONPROFIT` row in a separate US-only lane, but the audience is too narrow for the current pilot.

### 2.3 UPMC Western Psychiatric Hospital (Pittsburgh, PA)

- **Site-level source:** `https://www.upmc.com/locations/hospitals/western-psychiatric/training-education/graduate-medical-education` — RESIDENCY/FELLOWSHIP only.
- **System-level source (international):** `https://live-researchprograms-medschool-pitt.pantheonsite.io/international-visiting-student-program`
- **System-level source (domestic):** `https://www.medstudentaffairs.pitt.edu/visiting-students/domestic-visiting-students`
- **Outcome:** No site-specific Western Psychiatric visiting-student page exists. Visiting electives at UPMC are governed by two parallel UPSOM/UPMC programs:
  - **Domestic:** LCME or AOA accredited home institution in North America only — Caribbean / IMG explicitly excluded.
  - **International:** Enrolled international students in their final year only; **graduates excluded**; observerships / externships explicitly NOT offered to graduates; $4,500 per clinical elective; USMLE Step 2 required for psychiatric electives; visa documentation provided after acceptance (J-1 / H-1B sponsorship NOT stated).
- **Direct quotes (≤280 chars each):**
  - *"This program is ONLY for international students who have completed their core clinical training and are in their final year of medical education."*
  - *"This program does not offer observerships/externships to medical graduates."*
  - *"The USMLE Step 2 exam (not Step 1 scores) is a requirement to apply for a Psychiatric clinical elective."*
- **Audience:** International enrolled-final-year students for the international program; LCME/AOA North America for the domestic program.
- **Visa:** Acceptance letter / invoice provided for B-1/B-2 visa documentation. **No stated J-1 or H-1B sponsorship.**
- **Application method:** VSLO or paper (paper preferred) via `MSRIS@medschool.pitt.edu`.
- **Cost:** $4,500 per clinical elective (international program).
- **Disposition:** `NEEDS_CURATOR_REAUDIT` — promotable as a `SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE` row similar to CC Hillcrest, contingent on the curator deciding whether Caribbean schools count as "international" for this program (source is silent specifically). Audience carveouts and visa caveats are mandatory.

### 2.4 NYC Health + Hospitals/Lincoln (Bronx, NY)

- **Lincoln-level source:** `https://www.nychealthandhospitals.org/locations/lincoln/` — no visiting-student program documented at the site level.
- **System-level source:** `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/` — MOSAIC Visiting Scholars Program.
- **Outcome:** Lincoln is a participating site within NYC H+H, and visiting medical-student access flows through the system-level MOSAIC VSP. Eligibility is restricted to U.S. allopathic (LCME) or osteopathic (AOA) medical students who have completed core rotations. Caribbean / IMG students are explicitly excluded by accreditation language. Specific Lincoln placement is not guaranteed — participants are matched to a NYC H+H site based on availability. URM students are encouraged to apply.
- **Direct quotes (≤280 chars each):**
  - *"Medical students must be attending a U.S. accredited allopathic medical school (i.e., are enrolled in Medical Degree-granting programs) or osteopathic medical schools."*
  - *"Each VSP participant will be matched to a NYC H+H participating site and will conduct clinical shadowing, didactic sessions, practical learnings, simulation and experiential training."*
  - *"$2,000 stipend for the rotation and an additional $2,000 housing stipend for participants that are not based in the New York City metro area."*
- **Audience:** US LCME / AOA only; URM encouraged.
- **Visa:** Not stated (US-only audience).
- **Application method:** PDF application + CV + transcript + personal statement + letter of recommendation, emailed to `MOSAIC@nychhc.org` (deadline April 24, 2026).
- **Cost:** No fee documented; $2,000 stipend + $2,000 housing stipend.
- **Disposition:** `NEEDS_CURATOR_REAUDIT` — promotable as `READY_PUBLIC_US_ONLY` similar to CCF Mercy, with `SYSTEM_PAGE_NO_LINCOLN_SPECIFIC_GUARANTEE` caveat (mirror CC Hillcrest pattern). Caribbean eligibility is closed by accreditation language — do NOT promote in the IMG lane.

## 3. Screenshot / Wayback result

| Row | Screenshot | Wayback |
|-----|-----------|---------|
| Manatee | inline visual only — no persisted PNG | NOT ATTEMPTED (no usable USCE evidence to preserve) |
| UH San Antonio | not captured (text-only WebFetch) | NOT ATTEMPTED |
| UPMC Western Psychiatric | inline visual only | NOT ATTEMPTED — `pantheonsite.io` subdomain raises archive priority for curator |
| Lincoln Medical | inline visual only | NOT ATTEMPTED |

**Honest caveat:** This sprint's runtime environment cannot fetch from `web.archive.org` (WebFetch is blocked for that host), and Chrome MCP screenshots from this session were not persisted to the repo filesystem. The Phase C `screenshots/` directory exists but is empty. The capture goal was met via direct quoted source text + URL evidence + Chrome MCP visual confirmation in-session. Manual Wayback Save Page Now invocations are queued for the curator in `first_pilot_source_capture_batch_3_manual_retry_checklist.md`.

This is a Stop-condition disclosed honestly; it is NOT a failure of the data finding itself.

## 4. Audience / visa / application / cost findings (synthesis)

| Dimension | Manatee | UH SA | UPMC Western Psych | Lincoln |
|-----------|---------|-------|--------------------|---------|
| Audience documented | NO | YES (very narrow) | YES (split: LCME/AOA NA OR international enrolled final-year) | YES (US LCME/AOA only) |
| IMG / Caribbean eligible per source | n/a | NO | UNCERTAIN (international final-year only, Caribbean status not specified) | NO |
| Visa policy stated | NO | NO | partial (B-1/B-2 doc only; J-1/H-1B silent) | NO (US-only audience) |
| Application method | n/a | school-level affiliation only | VSLO or paper via MSRIS | PDF email to MOSAIC@ |
| Fee | n/a | NO | $4,500 per clinical elective (intl) | $0 + stipend |
| Stipend | n/a | NO | NO | $2,000 + $2,000 housing |
| Site-specificity | n/a | site-specific | system-level (no site guarantee) | system-level (no site guarantee) |

## 5. Public copy risk summary

- **Manatee:** BLOCKING — no source, no list. Cannot publish.
- **UH SA:** HIGH — audience narrow + IMG/Caribbean explicitly disqualified. Cannot publish in IMG lane.
- **UPMC Western Psych:** HIGH — audience narrow (no graduates, fee $4,500), site-specificity unsupported, visa under-supported. Publishable only with full caveat stack and curator decision on Caribbean eligibility.
- **Lincoln:** MODERATE — US-only audience clear, site-specificity unsupported. Publishable as US-only row with caveat. Not IMG-relevant.

Detail in `first_pilot_source_capture_batch_3_public_copy_risks.csv`.

## 6. Evidence action queue updates

The sprint prompt referenced `docs/platform-v2/local/usce-completeness/p99_p97_first_pilot_evidence_action_queue_1.csv`. **That file does not exist on this Mac-local working tree.** It may live on the T7 lane or was never persisted to this repo. Consequently, the action queue is captured in this sprint's row-disposition CSV (`first_pilot_source_capture_batch_3_row_disposition.csv`) instead of mutating an upstream queue file. If a queue file exists elsewhere, the curator should reconcile.

| Row | New status | Recommended next sprint |
|-----|-----------|-------------------------|
| Manatee | RESIDENCY_ONLY_NOT_USCE | DEFER_TO_FUTURE_LANE |
| UH SA | NOT_IMG_LANE_AUDIENCE_NARROW | DEFER_TO_FUTURE_LANE |
| UPMC Western Psych | EVIDENCE_CAPTURED_PENDING_CURATOR_REAUDIT | P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6 |
| Lincoln Medical | EVIDENCE_CAPTURED_PENDING_CURATOR_REAUDIT | P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6 |

## 7. What this sprint did NOT do

- Did NOT promote any row to bridge input.
- Did NOT generate runtime files.
- Did NOT touch `/clerkships/pilot` or its data file.
- Did NOT modify validators, sitemap, robots.txt, homepage, nav, or any UI.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT contact program coordinators (out of scope; queued for curator).
- Did NOT broaden audience eligibility for any row.
- Did NOT claim verification, hospital approval, or IMG-friendliness.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 8. Recommended next step

**`P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6`** for the 2 rows ready (`UPMC Western Psychiatric`, `Lincoln Medical`) — both are framework-level evidence with strict caveats; promotion (if curator approves) would mirror existing patterns from CC Hillcrest (`SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE`) and CCF Mercy (`READY_PUBLIC_US_ONLY` with explicit visa silence).

For the 2 rejected rows:
- **Manatee:** No replacement search action this sprint. Recommend `KEEP_INTERNAL_FRAMEWORK_ONLY`.
- **UH SA:** Strong evidence to KEEP_INTERNAL for IMG lane. Could be revisited under a future US-only lane.

If the curator wants additional FL/TX coverage in the IMG lane, replacement candidate sourcing is OUT OF SCOPE here.

## 9. Validators run

| Check | Result |
|-------|--------|
| Pre-sprint `tsc --noEmit` | clean |
| Pre-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards + noindex+nofollow |
| Pre-sprint `validate-public-runtime-data.ts` | PASSED |
| Pre-sprint `validate-usce-public-cards.ts` | PASSED |
| Pre-sprint `validate-usce-save-compare.ts` | PASSED |
| Pre-sprint `validate-usce-report-intake.ts` | PASSED |
| Pre-sprint `validate-usce-pilot-release.ts` | PASSED |
| Post-sprint runtime files changed | NONE |
| Post-sprint pilot card count | 5 (UNCHANGED) |
| Post-sprint `<meta robots>` on `/clerkships/pilot` | `noindex, nofollow` (UNCHANGED) |

## 10. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED — `--prod` never used; Vercel CLI not installed |
| No merge / PR to main | CONFIRMED |
| No Vercel production promotion | CONFIRMED |
| No DB / schema / prisma / seed / cron | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime generation | CONFIRMED |
| No route / UI changes | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No new interface / UI work | CONFIRMED |
| No broad launch copy | CONFIRMED |
| No validator weakening | CONFIRMED |
| No bridge approval | CONFIRMED |
| No bridge input changes | CONFIRMED |
| No edits to existing 5-row pilot runtime | CONFIRMED |
| No login / CAPTCHA bypass / credentialed scraping | CONFIRMED — public sources only |
| No private-source access | CONFIRMED |
| No application or contact-form submission | CONFIRMED |
| No fake evidence | CONFIRMED |
| No OCR | CONFIRMED — Chrome MCP DOM read only |
| No campus inference beyond source | CONFIRMED |
| No audience broadening | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED — `.claude/launch.json`, Maine generated files, NPPES, redesign-mockups untouched |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` | CONFIRMED |
| No history rewrite / amend / force push | CONFIRMED |
