# P99-P97 First Pilot Mini Curator Re-audit 6 — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `20ec7ca P99: land batch three evidence artifacts`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Curator re-audit decision for `pilot-011` (UPMC Western Psychiatric) and `pilot-012` (Lincoln Medical). **No bridge approval beyond DRAFT. No runtime. No production. No UI.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Rows reviewed | 2 (`pilot-011`, `pilot-012`) |
| Rows approved for bridge-input DRAFT | **2** ✅ |
| Rows held / internal | 0 (this sprint's scope) |
| Bridge-input DRAFT created | YES — 2 rows with full caveat stack |
| DRAFT promoted to runtime | **NO** ✅ |
| DRAFT marked PUBLIC_NOW or IMPORT_READY | **NO** ✅ |
| PNG landed | **NO** — explicit waiver granted for DRAFT only; required at runtime gate |
| Production touched | **NO** ✅ |
| UI touched | **NO** ✅ |
| Existing 5-row pilot runtime | **UNCHANGED** ✅ |

## 2. UPMC Western Psychiatric (`pilot-011`) — curator decision

**Status:** `APPROVED_WITH_PUBLIC_COPY_CARVEOUT`

### Reason
Three Pitt SOM pages (parent + domestic + international) are evidence-hardened with HTML snapshots, sprint-fresh Wayback archives, and verbatim quotes. Audience eligibility is split into two clearly-bounded programs:
- **Domestic:** LCME / AOA accredited home institutions in North America only.
- **International:** Enrolled international students in their final year of medical education only — graduates explicitly excluded.

The framing fits the existing `SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE` pattern (mirror CC Hillcrest). All claims the row makes are directly supported by quoted source text. Risks are HIGH but contained by an explicit caveat stack.

### Mandatory caveats for any future public copy
- System-level UPSOM/UPMC source — Western Psychiatric site placement not separately enumerated.
- Domestic visiting program: LCME / AOA accredited home institutions in North America only.
- International visiting program: enrolled international students in their final year of medical education only — graduates not eligible.
- Application: VSLO or paper via `MSRIS@medschool.pitt.edu`.
- USD 4,500 per clinical elective (international program).
- USMLE Step 2 required to apply for a Psychiatric clinical elective.
- B-1/B-2 visa documentation supported on acceptance — J-1 / H-1B sponsorship not stated on source.

### Must NOT claim
- guaranteed Western Psychiatric rotation
- hospital-approved USCEHub listing
- apply through USCEHub
- IMG-friendly pathway
- Caribbean accessible (domestic program)
- J-1 sponsorship
- H-1B sponsorship
- observership for graduates
- general broad national audience

### Required before runtime
- Manual PNG capture for at least the parent visiting-students page and the international program page, OR explicit curator-signed PNG waiver in `first_pilot_mini_curator_reaudit_6_manual_png_policy_decision.md`.

## 3. Lincoln Medical (`pilot-012`) — curator decision

**Status:** `APPROVED_WITH_PUBLIC_COPY_CARVEOUT`

### Reason
Two complementary sources are evidence-hardened:
- **NYC H+H MOSAIC VSP** (system-level): HTML snapshot + verified prior Wayback (April 12, 2026, HEAD-verified) + verbatim quotes.
- **Lincoln Emergency Medicine MS3/4 Rotations** (site-specific, EM only): HTML snapshot + sprint-fresh Wayback + verbatim quotes.

The framing fits the existing `READY_PUBLIC_US_ONLY` pattern (mirror CCF Mercy) with an additional `SYSTEM_PAGE_NO_LINCOLN_SPECIFIC_GUARANTEE` caveat (mirror CC Hillcrest). Audience is strictly US LCME/AOA — Caribbean/IMG explicitly excluded by accreditation language. The Lincoln EM secondary source supports a specialty-restricted EM rotation only and is silent on accreditation/visa/fees, so it must NOT be used to broaden audience.

### Mandatory caveats for any future public copy
- System-level NYC H+H MOSAIC source — Lincoln site placement not separately guaranteed.
- Eligibility: U.S. LCME-accredited allopathic medical students or AOA-accredited osteopathic medical students only.
- Caribbean / IMG students explicitly excluded by accreditation language.
- Application by PDF email to `MOSAIC@nychhc.org`.
- $2,000 stipend per four-week rotation + $2,000 housing stipend for participants outside the NYC metro area.
- Lincoln Emergency Medicine site-specific page covers Emergency Medicine MS3/4 rotation (4 weeks) only; audience accreditation, fees, and visa policy silent on this page — do not broaden.

### Must NOT claim
- open to IMGs
- open to Caribbean students
- guaranteed Lincoln placement (system-level program)
- all specialties (EM source restricted to EM)
- visa sponsorship
- apply through USCEHub
- hospital-approved USCEHub listing
- USCEHub affiliation

### Required before runtime
- Manual PNG capture for at least the MOSAIC VSP page (with the four accordion sections expanded) and the Lincoln EM page, OR explicit curator-signed PNG waiver.

## 4. PNG policy decision

Detail in `first_pilot_mini_curator_reaudit_6_manual_png_policy_decision.md`. Summary:

| Gate | PNG required? |
|------|----------------|
| DRAFT bridge input (today) | **NO** — Tier-A evidence (URL + HTML + Wayback + quote) sufficient |
| Bridge-input validation (next) | **NO** — Tier-A still sufficient |
| Runtime preparation / generation | **YES**, or explicit documented curator waiver |
| Production deploy | **YES**, or explicit documented production-tier waiver (double sign-off) |

This sprint grants an explicit DRAFT-only PNG waiver for both rows. The waiver does NOT carry forward to the runtime gate.

## 5. Bridge-input DRAFT result

File: `first_pilot_mini_curator_reaudit_6_bridge_input_DRAFT.csv` (2 rows + header).

Schema mirrors the T7-lane bridge-input draft schema (54 columns including evidence-triple, audience flags, visa flags, public-copy summary, must_not_claim, allowed_next_workflow, not_allowed_actions, human_reviewer_required, reviewer_notes).

Both rows carry:
- `bridge_review_status = APPROVED_WITH_PUBLIC_COPY_CARVEOUT_PNG_WAIVED_FOR_DRAFT_NOT_FOR_RUNTIME`
- `not_allowed_actions = RUNTIME_GENERATION | PUBLIC_NOW | IMPORT_READY | PNG_BYPASS_AT_RUNTIME`
- `human_reviewer_required = true`

**Validation status:** No `validate-p99-p97-bridge-input.ts` exists on Mac-local. Schema validation is therefore deferred to the next sprint (`P99-P97-BRIDGE-INPUT-VALIDATION-BATCH-2`) where the validator can be authored alongside its first real input. Honest disclosure rather than forcing a fake validator pass.

The runtime validator (`validate-micro-pilot-runtime.ts`) was re-run after the DRAFT was written and continues to PASS — the DRAFT does NOT touch runtime data.

## 6. What this sprint did NOT do

- Did NOT promote any row to runtime data.
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT modify the existing 5-card pilot runtime.
- Did NOT touch `/clerkships/pilot` route or its data.
- Did NOT modify validators, sitemap, robots.txt, homepage, nav, or any UI.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT contact program coordinators.
- Did NOT broaden audience eligibility for any row.
- Did NOT capture or fabricate any PNG.
- Did NOT mutate or copy the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 7. Recommended next step

Two non-conflicting options; the user/curator may run them in either order or in parallel:

1. **`P99-P97-BRIDGE-INPUT-VALIDATION-BATCH-2`** — author a Mac-local `scripts/validate-p99-p97-bridge-input.ts` and run it against this sprint's DRAFT. Confirms schema, banned-phrase, audience-consistency, and Tier-A-evidence-completeness gates. Does NOT need PNG.
2. **`P99-P97-MANUAL-PNG-LANDING-1`** — manually capture persistent PNGs for the 5 source pages already archived (3 UPMC pages + Lincoln MOSAIC + Lincoln EM). Required before any runtime preparation. Public sources, no login, no form submission.

If the user prefers to defer manual PNG work, option 1 alone is sufficient to advance the DRAFT to a validated state.

## 8. Validators run

| Check | Result |
|-------|--------|
| Pre-sprint `tsc --noEmit` | clean |
| Pre-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards + noindex+nofollow |
| Pre-sprint all 6 USCE/P99 validators | PASSED |
| Post-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards UNCHANGED |
| Post-sprint runtime data files | UNCHANGED |
| Bridge-input DRAFT validator | NOT RUN — validator does not exist on Mac-local; deferred to next sprint |

## 9. Hard-rule confirmation

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
| No edits to existing 5-row pilot runtime | CONFIRMED |
| No login / CAPTCHA bypass / credentialed scraping | CONFIRMED — DRAFT built from prior-sprint evidence pack only; no live fetches in this sprint |
| No application or contact-form submission | CONFIRMED |
| No fake evidence / fake archive / fake PNG | CONFIRMED |
| No audience broadening | CONFIRMED — every audience claim has a verbatim source quote |
| No visa overclaim | CONFIRMED — UPMC visa carveout preserved; Lincoln visa N/A |
| No campus inference beyond source | CONFIRMED — site-specific caveats preserved for both |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED — explicit dir add only |
| No `--no-verify` / amend / force push | CONFIRMED |
| No DRAFT to runtime promotion | CONFIRMED |
| No PNG fabrication | CONFIRMED — explicit waiver documented honestly |
