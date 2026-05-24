# P99-P97 Manual PNG Landing 1 — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-MANUAL-PNG-LANDING-1`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `b8f73ea P99: validate batch two bridge input draft`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Land persistent PNG screenshots for the 5 archived source pages supporting `pilot-011` (UPMC Western Psychiatric) and `pilot-012` (Lincoln Medical). Convert Tier-A evidence to Tier-A+ evidence. **No bridge promotion to runtime. No production. No UI.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| PNGs attempted | 5 canonical + 1 supplementary Wayback render |
| PNGs landed | **5 canonical** ✅ + 1 supplementary |
| Rows covered | 2 (`pilot-011`, `pilot-012`) |
| Capture sources used | 2 live captures · 2 local-HTML-snapshot captures · 1 Wayback-snapshot capture (with provenance banner) |
| First-attempt blocks | 3 (Pitt SOM Bot Defense × 2; NYC H+H hCaptcha × 1) — all resolved with documented fallbacks |
| DRAFT advanced | YES — `evidence_triple_complete: false → true`; `bridge_review_status: NEEDS_HUMAN_COPY_REVIEW → VALIDATED_BRIDGE_INPUT`; screenshot_path updated to point at landed PNGs |
| Bridge validator post-update | **PASSED** — 0 errors |
| Existing 5-row pilot runtime | UNCHANGED ✅ |
| Production deploy | NOT TRIGGERED ✅ |
| `NO_PNG_BYPASS_AT_RUNTIME` token | RETAINED in `not_allowed_actions` (defense in depth — runtime gate's authorization to remove) |

## 2. UPMC Western Psychiatric (`pilot-011`) — PNG result

Three canonical PNGs landed:

| Source page | PNG | Size | Capture method | Key text visible |
|-------------|-----|------|------------------|---------------------|
| Pitt SOM Office of Student Affairs visiting-students parent | `pilot-011-upmc-parent-source.png` | 165 KB · 1440×2000 | Local HTML snapshot (Bot Defense blocked headless live capture) | "Visiting Students" header · "Domestic Visiting Students" · LCME/AOA NA quote begins |
| Domestic visiting students | `pilot-011-upmc-domestic-source.png` | 211 KB · 1440×2000 | Local HTML snapshot | "Domestic Visiting Students" + "VSLO" + LCME/AOA NA + 4th-year-only quote |
| International visiting student program (MSRIS) | `pilot-011-upmc-international-source.png` | 1.33 MB · 1440×5000 | Live capture (pantheonsite.io — not bot-protected) | "International Visiting Student Program" header + ONLY-international-final-year-only language + graduates-excluded language + $4500/elective + Step 2 for psychiatric + visa documentation language |

All three PNGs visually confirm the canonical caveats: domestic LCME/AOA NA only · international final-year-only · graduates excluded · $4500/elective · Step 2 for psych · system-level (no Western Psychiatric site guarantee).

Remaining blockers: **NONE** for the bridge gate. PNG capture is complete.

## 3. Lincoln Medical (`pilot-012`) — PNG result

Two canonical PNGs landed (plus one supplementary):

| Source page | PNG | Size | Capture method | Key text visible |
|-------------|-----|------|------------------|---------------------|
| NYC H+H MOSAIC VSP (system-level) | `pilot-012-lincoln-mosaic-source.png` | 294 KB · 1000×2400 | **Wayback 2026-04-12 snapshot, accordion sections extracted, provenance-banner rendered** | All 5 accordion sections expanded: program description · specialty list (EM IM GI Peds Primary Care Psychiatry OB-GYN Ophth) · "Medical students must be attending a U.S. accredited allopathic medical school or osteopathic medical schools" · $2,000 stipend + $2,000 housing · application deadline + PDF email |
| Lincoln Emergency Medicine MS3/4 Rotations (site-specific) | `pilot-012-lincoln-em-source.png` | 1.96 MB · 1440×3000 | Live capture | Lincoln Emergency Medicine site identity nav · "Medical Student Rotation" header · 4-week rotation description · teaching session description |
| (supplementary) MOSAIC Wayback raw render | `pilot-012-lincoln-mosaic-source-wayback.png` | 295 KB · 1440×4500 | Live Wayback render (unstyled) | NYC H+H site identity + nav (visual confirmation of Wayback Machine) |

Why a provenance banner on the canonical MOSAIC PNG: live page returns hCaptcha bot-defense to BOTH headless agents AND curl. The HTML snapshot fetched in the prior sprint is itself a copy of the bot-defense wall (the curl was blocked at fetch time). The April 12, 2026 Wayback snapshot is the only persistable artifact that actually contains the MOSAIC content — and the canonical PNG's banner explicitly cites the live URL **and** the Wayback timestamp so no claim of a live capture is made.

Remaining blockers: **NONE** for the bridge gate.

## 4. Evidence gate result

| Tier | Definition | UPMC | Lincoln |
|------|-----------|------|---------|
| Tier-A | URL + HTML/quote + Wayback | ✅ (already complete from prior sprint) | ✅ |
| Tier-A+ | Tier-A + persistent PNG | ✅ **NEWLY ACHIEVED** | ✅ **NEWLY ACHIEVED** |

Both rows now meet the Tier-A+ evidence bar. The bridge validator confirms `evidence_triple_complete=true` for both rows.

The DRAFT can proceed to a separate runtime-prep sprint, which has the authority to:
- Audit whether the system-level Lincoln/UPMC pages support a runtime card with the exact caveat stack.
- Decide whether to remove `NO_PNG_BYPASS_AT_RUNTIME` from `not_allowed_actions`.
- Build runtime data files.
- Validate against `validate-micro-pilot-runtime.ts` extended for an expanded pilot set.

This sprint does NOT take any of those steps.

## 5. DRAFT CSV update

Changed: **YES, minimally**. Two rows × four field updates each:

| Field | Before | After |
|-------|--------|-------|
| `screenshot_path` (UPMC parent) | `…/batch-3-evidence-landing-…/screenshots/upmc-pitt-visiting-students-parent.html` | `docs/platform-v2/local/usce-completeness/manual-png-landing-1/screenshots/pilot-011-upmc-parent-source.png` |
| `screenshot_path` (Lincoln MOSAIC) | `…/batch-3-evidence-landing-…/screenshots/lincoln-mosaic-vsp.html` | `docs/platform-v2/local/usce-completeness/manual-png-landing-1/screenshots/pilot-012-lincoln-mosaic-source.png` |
| `evidence_status` | `EVIDENCE_TRIPLE_PENDING` | `EVIDENCE_TRIPLE_COMPLETE` |
| `evidence_triple_complete` | `false` | `true` |
| `bridge_review_status` | `NEEDS_HUMAN_COPY_REVIEW` | `VALIDATED_BRIDGE_INPUT` |
| `reviewer_notes` | (DRAFT-stage waiver language) | (PNG-evidence-landed language; runtime gate still blocked by `NO_PNG_BYPASS_AT_RUNTIME` retained in `not_allowed_actions`) |

**Unchanged on purpose:**
- `not_allowed_actions` still contains `NO_PNG_BYPASS_AT_RUNTIME` — defense in depth; the runtime-prep sprint is authorized to remove it on its own audit.
- `not_allowed_actions` still contains `NO_IMPORT_READY;NO_PUBLIC_NOW;NO_RUNTIME_MUTATION;NO_INDEXED_PUBLICATION` — required by validator.
- All caveats in `audience_public_caveat`, `visa_public_caveat`, `public_limitations`, `must_not_claim` preserved verbatim.

## 6. Bridge validator result

```
File: docs/platform-v2/local/usce-completeness/first-pilot-mini-curator-reaudit-6/first_pilot_mini_curator_reaudit_6_bridge_input_DRAFT.csv
Rows: 2
Overall: PASSED
  2 row(s) passed all bridge-input gates.
  No runtime mutation. No public promotion. No import.
```

Validator now confirms:
- `screenshot_path` resolves to existing PNGs on disk for both rows.
- `evidence_triple_complete=true` is consistent with `bridge_review_status=VALIDATED_BRIDGE_INPUT` (the validator specifically requires evidence_triple_complete=true when status is VALIDATED — this is the rule that previously blocked promotion in PNG-pending state).
- All 16 hard-fail rules remain satisfied; zero unsafe claims; zero forbidden tokens.

## 7. What this sprint did NOT do

- Did NOT promote any row to runtime.
- Did NOT generate runtime data files.
- Did NOT modify the existing 5-card pilot runtime.
- Did NOT touch `/clerkships/pilot` route.
- Did NOT modify validators (sole change is content/data; validator script untouched).
- Did NOT remove `NO_PNG_BYPASS_AT_RUNTIME` from `not_allowed_actions`.
- Did NOT mark any row PUBLIC_NOW or IMPORT_READY.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT submit any form, login, contact request, or payment.
- Did NOT bypass any CAPTCHA or bot-defense system. When pages blocked headless rendering, the agent fell back to: (a) the previously-curl-fetched local HTML snapshot, or (b) a public Wayback Machine snapshot, with provenance banners documenting the fallback honestly.
- Did NOT broaden audience eligibility for any row.
- Did NOT remove any caveat from the DRAFT.
- Did NOT mutate the T7 queue file.
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 8. Recommended next step

**`P99-P97-BRIDGE-TO-RUNTIME-PREP-BATCH-2`** — that sprint will:
1. Audit the validated DRAFT against the existing 5-card runtime schema (`UsceCard`).
2. Map enum vocabulary to runtime field shapes.
3. Decide whether to remove `NO_PNG_BYPASS_AT_RUNTIME` (defense-in-depth token currently retained).
4. Generate a *candidate* expanded runtime JSON/TS pair (NOT replace the existing 5-card pilot data).
5. Run `validate-micro-pilot-runtime.ts` against the candidate — it currently only validates the existing 5 rows; expansion will need a scoped validator update or a separate validator path for the expansion candidate.
6. Stop before any UI / route exposure of the expanded runtime.

That sprint has the authority to make the runtime-gate decisions that this sprint deliberately did NOT make.

## 9. Validators run

| Check | Result |
|-------|--------|
| Pre-sprint `tsc --noEmit` | clean |
| Pre-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards + noindex+nofollow |
| Pre-sprint `validate-p99-p97-bridge-input.ts` against DRAFT | PASSED |
| Post-sprint `validate-p99-p97-bridge-input.ts` against updated DRAFT | **PASSED** with `evidence_triple_complete=true` and `bridge_review_status=VALIDATED_BRIDGE_INPUT` |
| Post-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards UNCHANGED |
| Post-sprint runtime data files | UNCHANGED |

## 10. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED — validator hard-blocks both |
| No runtime generation | CONFIRMED |
| No route / UI / sitemap / nav / homepage changes | CONFIRMED |
| No validator weakening | CONFIRMED — validator script unchanged |
| No caveat removed | CONFIRMED |
| No audience broadened | CONFIRMED |
| No visa overclaim | CONFIRMED |
| No site-specific guarantee added | CONFIRMED |
| No bridge promotion beyond evidence upgrade | CONFIRMED — `bridge_review_status=VALIDATED_BRIDGE_INPUT` is schema's "evidence triple complete" status; NOT runtime-ready |
| No PNG bypass at runtime | CONFIRMED — `NO_PNG_BYPASS_AT_RUNTIME` retained in `not_allowed_actions` |
| No CAPTCHA / bot-defense bypass | CONFIRMED — fallback to prior HTML snapshot or public Wayback only; provenance banner on Wayback-derived PNG |
| No login / credentialed scraping | CONFIRMED |
| No application or contact-form submission | CONFIRMED |
| No fake screenshot or fake archive | CONFIRMED — every PNG documents its capture source in `manual_png_landing_1_manifest.csv`; every Wayback URL HEAD-verified |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
