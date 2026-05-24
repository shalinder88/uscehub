# P99-P97 Batch 3 Evidence Landing & Queue Reconciliation — Sprint 1 Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-BATCH-3-EVIDENCE-LANDING-AND-QUEUE-RECONCILIATION-1`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `45b3c93 P99: capture first pilot source batch three`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Harden Batch 3 evidence for `pilot-011` (UPMC Western Psychiatric) and `pilot-012` (Lincoln Medical) before any curator approval. **No bridge approval. No production. No UI. No runtime.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Rows in scope | 2 (`pilot-011`, `pilot-012`) |
| HTML snapshots persisted to repo | **5/5** ✅ (UPMC × 3 pages, Lincoln × 2 pages) |
| Persistent PNG screenshots | **0/5** ❌ — Chrome MCP `save_to_disk` does not return a filesystem path in this runtime; mitigated with HTML snapshots + verbatim quotes + Wayback archives |
| Wayback archives landed | **4 sprint-fresh + 1 prior snapshot = 5/5** ✅ |
| Verbatim source quotes captured | **5/5** ✅ |
| Evidence triple for `pilot-011` | URL + HTML + archive + quote across 3 pages — **complete (modulo PNG)** |
| Evidence triple for `pilot-012` | URL + HTML + archive + quote across 2 pages — **complete (modulo PNG)** |
| Queue file location resolved | YES — T7 lane: `…/uscehub-active-2026-05-02/docs/platform-v2/local/usce-completeness/p99_p97_first_pilot_evidence_action_queue_1.csv` |
| Bridge approval | **NONE** ✅ |
| Runtime / pilot-route changes | **NONE** ✅ |
| Production deploy | **NOT TRIGGERED** ✅ |

## 2. UPMC Western Psychiatric (`pilot-011`) — evidence result

Three Pitt SOM pages captured, each with HTML snapshot + sprint-fresh Wayback archive:

| Page | Live URL | HTML snapshot | Wayback (sprint-fresh) |
|------|----------|----------------|-------------------------|
| Visiting students parent | `https://www.medstudentaffairs.pitt.edu/visiting-students` | `screenshots/upmc-pitt-visiting-students-parent.html` (34 KB) | `https://web.archive.org/web/20260509181911/...` |
| Domestic | `https://www.medstudentaffairs.pitt.edu/visiting-students/domestic-visiting-students` | `screenshots/upmc-pitt-domestic-visiting-students.html` (35 KB) | `https://web.archive.org/web/20260509182106/...` |
| International | `https://live-researchprograms-medschool-pitt.pantheonsite.io/international-visiting-student-program` | `screenshots/upmc-pitt-international-visiting-student-program.html` (40 KB) | `https://web.archive.org/web/20260509182127/...` |

Verbatim quotes captured:
- *"Students who have completed their core clinical training and will be in the fourth year of medical education at their LCME- or AOA- accredited home institution in North America may apply for an elective experience…"* (parent + domestic)
- *"This program is ONLY for international students who have completed their core clinical training and are in their final year of medical education. This program does not offer observerships/externships to medical graduates."* (international)
- *"$4,500 per clinical elective"* (international)
- *"The USMLE Step 2 exam (not Step 1 scores) is a requirement to apply for a Psychiatric clinical elective."* (international)

**Caveats preserved (must NOT be broadened by any later copy):**
- Domestic = LCME/AOA accredited home institution in North America only — Caribbean / IMG explicitly excluded.
- International = enrolled international students in final year only — graduates explicitly excluded.
- Site-specific Western Psychiatric placement is NOT guaranteed — the source is system-level UPSOM/UPMC.
- Visa: B-1/B-2 acceptance/invoice documentation only — J-1 and H-1B sponsorship NOT stated.
- Fee: $4,500/clinical elective for international.

**Remaining blocker:** Persistent PNG not landed (Chrome MCP runtime limitation). Evidence is otherwise complete.

## 3. Lincoln Medical (`pilot-012`) — evidence result

Two complementary sources captured (system-level + site-specific):

| Page | Live URL | HTML snapshot | Wayback |
|------|----------|----------------|---------|
| NYC H+H MOSAIC VSP (system-level) | `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/` | `screenshots/lincoln-mosaic-vsp.html` (15 KB) | `https://web.archive.org/web/20260412100521/...` (prior snapshot, HEAD-verified) |
| Lincoln Emergency Medicine MS3/4 Rotations (site-specific) | `https://www.lincolnemergencymedicine.com/medical-students` | `screenshots/lincoln-emergency-medicine-medstudents.html` (141 KB) | `https://web.archive.org/web/20260509182018/...` (sprint-fresh) |

Verbatim quotes captured:
- *"Medical students must be attending a U.S. accredited allopathic medical school (i.e., are enrolled in Medical Degree-granting programs) or osteopathic medical schools (i.e., are enrolled in Doctor of Osteopathy-granting programs)."* (MOSAIC)
- *"$2,000 stipend for the rotation and an additional $2,000 housing stipend for participants that are not based in the New York City metro area."* (MOSAIC)
- *"Each VSP participant will be matched to a NYC H+H participating site"* (MOSAIC — implies no Lincoln-specific guarantee)
- *"Hello! Thank you for your interest in rotating at Lincoln's Emergency Medicine Residency! Our rotation is 4 weeks long."* (Lincoln EM site)

**Caveats preserved:**
- MOSAIC = US LCME/AOA only — Caribbean / IMG explicitly excluded.
- MOSAIC is system-level — Lincoln-specific placement NOT guaranteed.
- Lincoln EM rotation source is specialty-restricted (Emergency Medicine only) and is silent on accreditation, IMG, fees, and visa.
- $2,000 stipend + $2,000 housing for non-NYC metro applicants (MOSAIC).

**Remaining blocker:**
1. Persistent PNG not landed (same Chrome MCP runtime limitation).
2. MOSAIC sprint-fresh Wayback failed today (HTTP 520 then 000); fell back to verified April 12 2026 snapshot whose text matches today's live page identically.

## 4. Queue reconciliation result

Detail in `batch_3_queue_reconciliation.md`. Summary:

- **Mac-local queue file:** does NOT exist.
- **T7 queue file:** EXISTS at `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02/docs/platform-v2/local/usce-completeness/p99_p97_first_pilot_evidence_action_queue_1.csv` (13 lines, `pilot-001`..`pilot-012`).
- **Decision:** do NOT copy T7 file into Mac-local in this sprint. Reason: copying without the related matrix CSVs and sprint dirs would leave Mac-local with orphan references; the user's standing rule keeps T7 as cold storage.
- **Recommendation:** the curator's next sprint should read the T7 queue as advisory input and produce a Mac-local matrix scoped to the ready rows. A future ops-cleanup sprint can decide whether to formally transplant the T7 lineage.
- **Canonical row IDs identified from T7:** `pilot-011` (UPMC Western Psychiatric, rank 153), `pilot-012` (Lincoln Medical, rank 185). Used in this sprint's manifest + matrix CSVs so the curator can join against either lane without translation.

T7 also revealed two divergences from this sprint's source URLs:
- T7's UH SA source is `uthscsa.edu/medicine/...student-electives` (UT Health med school), not the affiliated hospital affiliation page used in Batch 3 — but UH SA is OUT OF SCOPE for this sprint.
- T7's Lincoln source is `lincolnemergencymedicine.com/medical-students` (EM residency dept, site-specific). Batch 3 captured the system-level MOSAIC. **This sprint landed both** as complementary evidence.

## 5. What this sprint did NOT do

- Did NOT approve any row for bridge input.
- Did NOT add any row to bridge-input draft.
- Did NOT generate runtime files.
- Did NOT modify the 5-card pilot runtime.
- Did NOT touch `/clerkships/pilot` route or its data.
- Did NOT modify validators, sitemap, robots.txt, homepage, nav, or any UI.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT contact program coordinators (out of scope; queued for curator).
- Did NOT broaden audience eligibility for any row.
- Did NOT copy the T7 queue file into Mac-local.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 6. Recommended next step

**`P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6`** — both `pilot-011` and `pilot-012` now have complete evidence packs (URL + HTML snapshot + Wayback archive + verbatim quote), modulo persistent PNGs. The curator has all the information needed to decide:

- For **`pilot-011` UPMC Western Psychiatric**: promote as `SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE` row (mirror CC Hillcrest pattern) with full caveat stack — domestic excluded for IMG; international final-year-only with $4,500 fee and Step 2 requirement; no site-specific Western Psychiatric guarantee; no J-1/H-1B sponsorship language. OR `KEEP_INTERNAL` pending direct program confirmation on Caribbean eligibility.

- For **`pilot-012` Lincoln Medical**: promote as `READY_PUBLIC_US_ONLY` row (mirror CCF Mercy / CC Hillcrest pattern) referencing both sources — MOSAIC (US LCME/AOA only) and Lincoln EM (site-specific EM rotation, audience silent). OR `KEEP_INTERNAL` if the curator wants a unified Lincoln-site-specific source for non-EM specialties.

Open question for the curator: **whether persistent PNG is mandatory** before bridge input, or whether HTML snapshot + Wayback + verbatim quote is sufficient for system-level rows. A `MANUAL_PNG_CAPTURE_REQUIRED` carveout is documented in `batch_3_manual_retry_checklist.md`.

## 7. Validators run

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
| Post-sprint pilot-route metadata | UNCHANGED — `noindex, nofollow` |
| Post-sprint pilot card count | 5 (UNCHANGED) |

## 8. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED — Vercel CLI not installed |
| No merge / PR to main | CONFIRMED |
| No Vercel production promotion | CONFIRMED |
| No DB / schema / prisma / seed / cron | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime generation | CONFIRMED |
| No route / UI changes | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No new interface / UI work | CONFIRMED |
| No validator weakening | CONFIRMED |
| No bridge approval | CONFIRMED |
| No bridge-input changes | CONFIRMED |
| No edits to existing 5-row pilot runtime | CONFIRMED |
| No login / CAPTCHA bypass / credentialed scraping | CONFIRMED — public sources only |
| No application or contact-form submission | CONFIRMED |
| No fake evidence | CONFIRMED — every quoted snippet is verbatim from source pages, every Wayback URL is HTTP-200 verified |
| No audience broadening | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No campus inference beyond source | CONFIRMED |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED — explicit dir add only |
| No `--no-verify` / amend / force push | CONFIRMED |
| T7 file mutated | NO — read-only inspection only |
| T7 file copied into Mac-local | NO |
