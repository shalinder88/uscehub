# P99-P97 Bridge Input Validation Batch 2 — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P99-P97-BRIDGE-INPUT-VALIDATION-BATCH-2`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `679facb P99: re-audit batch three pilot candidates`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Author/port a Mac-local bridge-input validator and validate the 2-row curator-approved DRAFT for `pilot-011` (UPMC Western Psychiatric) and `pilot-012` (Lincoln Medical). **No bridge promotion. No runtime. No production. No UI.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Validator authored / ported | **PORTED FROM T7** (byte-identical, 322 lines) |
| Validator path | `scripts/validate-p99-p97-bridge-input.ts` |
| Rows validated | 2 (`pilot-011`, `pilot-012`) |
| Initial validator run | **FAILED — 58 enum/format issues, 0 safety violations** |
| DRAFT corrections applied | YES — minimal vocabulary alignment, every caveat preserved verbatim |
| Final validator run | **PASSED — 0 errors, 0 warnings** |
| `runtime_generation_allowed` | **false** |
| `public_now_allowed` | **false** |
| `import_ready_allowed` | **false** |
| Next gate | `MANUAL_PNG_LANDING_OR_RUNTIME_GATE_PREP` |
| Existing 5-row pilot runtime | **UNCHANGED** ✅ |
| Production deploy | **NOT TRIGGERED** ✅ |

## 2. Validator implementation

The validator was **ported byte-identical from T7 read-only** at:
`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02/scripts/validate-p99-p97-bridge-input.ts`

No modifications to validator logic or enum vocabulary. Reasoning:

1. The T7 validator already encodes the canonical bridge schema for this exact pipeline (the same schema used to validate Morristown / Overlook / CCF Mercy / CC Hillcrest / Highland on the T7 lane).
2. Authoring a divergent validator on Mac-local would create a schema fork.
3. The DRAFT is what gets aligned, not the validator — preserving cross-lane joinability of the canonical row IDs.

The validator enforces 16 hard-fail rule families (full list in `bridge_input_validation_batch_2_schema_notes.md`):

- Required columns + non-empty fields
- Allowed enum values (54-column schema)
- Audience-detail JSON structure (4 keys × 4 status enum tokens)
- URL shape checks (http(s)://, web.archive.org/)
- Screenshot path resolves on disk
- Source quote ≤280 chars
- `p97_readiness_status = HUMAN_REVIEW_READY`
- Forbidden status tokens (`IMPORT_READY`, `PUBLIC_NOW`, `BRIDGE_READY_TO_RUNTIME`, `APPROVED_FOR_PUBLICATION`) with safe `NO_<token>` exceptions in pre-defined fields
- H-1B claim vs caveat/tag conflict guard
- `not_allowed_actions` must contain `NO_IMPORT_READY, NO_PUBLIC_NOW, NO_RUNTIME_MUTATION, NO_INDEXED_PUBLICATION`
- `evidence_triple_complete=true` required only when `bridge_review_status=VALIDATED_BRIDGE_INPUT`
- Forbidden runtime substrings on public-facing fields (`npi, ccn, cms, nppes, aamc, nrmp, acgme, nucc, ...`)

Warnings: none in current run.

## 3. UPMC Western Psychiatric (`pilot-011`) — validation result

**Status: PASSED.**

Critical caveats preserved verbatim in the DRAFT:
- Domestic LCME/AOA accredited home institution in North America only
- International program: enrolled international students in their final year of medical education only — graduates excluded
- $4,500 per clinical elective (international program)
- USMLE Step 2 required for psychiatric clinical elective
- B-1/B-2 visa documentation supported on acceptance — J-1 / H-1B sponsorship not verified on source
- System-level UPSOM/UPMC source — Western Psychiatric site placement not separately enumerated

Unsafe claims found: **0**.

PNG runtime-gate present: **YES** — `not_allowed_actions` includes `NO_PNG_BYPASS_AT_RUNTIME`; `reviewer_notes` reads "Persistent PNG capture is required before runtime generation"; `evidence_triple_complete=false` carries the missing-PNG state forward.

Remaining blockers before runtime generation:
- Manual PNG capture for at least the parent visiting-students page and the international program page, OR explicit curator-signed PNG waiver.
- Curator confirmation on Caribbean eligibility for the international program (source is silent — the safer carveout `accepts_caribbean=UNKNOWN_NOT_STATED` is currently in place).

## 4. Lincoln Medical (`pilot-012`) — validation result

**Status: PASSED.**

Critical caveats preserved verbatim in the DRAFT:
- Eligibility: U.S. LCME-accredited allopathic medical school or AOA-accredited osteopathic medical school only
- Caribbean / IMG students explicitly excluded by accreditation language
- $2,000 stipend per rotation + $2,000 housing stipend (non-NYC metro)
- PDF email application to `MOSAIC@nychhc.org`
- System-level MOSAIC source — Lincoln site placement not separately guaranteed
- Lincoln Emergency Medicine secondary source covers EM specialty rotation only — audience accreditation, fees, visa silent on this page

Unsafe claims found: **0**.

PNG runtime-gate present: **YES** (same enforcement as UPMC).

Remaining blockers before runtime generation:
- Manual PNG capture for at least the MOSAIC VSP page (with accordion sections expanded) and the Lincoln EM page, OR explicit curator-signed PNG waiver.

## 5. DRAFT CSV change record

The DRAFT was rewritten to align with the canonical T7 enum vocabulary (Phase F mapping in `bridge_input_validation_batch_2_schema_notes.md` §5). Concretely:

- Free-text values in enum fields → canonical T7 enum tokens.
- `evidence_triple_complete = partial_no_PNG_runtime_limitation` → `false` (PNG missing is a true gap, not a state).
- `bridge_review_status = APPROVED_WITH_PUBLIC_COPY_CARVEOUT_PNG_WAIVED_FOR_DRAFT_NOT_FOR_RUNTIME` → `NEEDS_HUMAN_COPY_REVIEW` (T7-recognized status that correctly blocks promotion to `VALIDATED_BRIDGE_INPUT`).
- `not_allowed_actions = "RUNTIME_GENERATION | PUBLIC_NOW | IMPORT_READY | PNG_BYPASS_AT_RUNTIME"` → `"NO_IMPORT_READY;NO_PUBLIC_NOW;NO_RUNTIME_MUTATION;NO_INDEXED_PUBLICATION;NO_PNG_BYPASS_AT_RUNTIME"` (NO_-prefixed; T7 mandatory tokens included).
- `audience_detail` rewritten as JSON with required 4 keys and 4 enum status tokens.
- `visa_tags` aligned with the validator's `NO_H1B_VERIFIED` / `NO_J1_VERIFIED` regex pattern.

All caveats preserved verbatim in `audience_public_caveat`, `visa_public_caveat`, `public_limitations`, `must_not_claim`, and `reviewer_notes`. The DRAFT's behavioral safety promises are unchanged; only machine-checked enum vocabulary changed.

## 6. What this sprint did NOT do

- Did NOT promote any row to `VALIDATED_BRIDGE_INPUT` (validator blocks this until `evidence_triple_complete=true` after PNG capture).
- Did NOT generate runtime files.
- Did NOT modify the existing 5-card pilot runtime.
- Did NOT touch `/clerkships/pilot` route or its data.
- Did NOT modify other validators, sitemap, robots.txt, homepage, nav, or any UI.
- Did NOT deploy to production.
- Did NOT merge to main.
- Did NOT remove or weaken any caveat from the DRAFT.
- Did NOT broaden audience eligibility.
- Did NOT mutate or copy the T7 queue file (only the validator script, which is a tooling artifact, was ported).
- Did NOT stage `.claude/launch.json`, Maine generated files, NPPES, or redesign-mockups.

## 7. Recommended next step

**`P99-P97-MANUAL-PNG-LANDING-1`** — manually capture persistent PNGs for the 5 archived source pages (UPMC Pitt parent + domestic + international; Lincoln MOSAIC; Lincoln EM). After PNG landing, the DRAFT can advance from `NEEDS_HUMAN_COPY_REVIEW` to `VALIDATED_BRIDGE_INPUT` (which then unblocks runtime preparation as a separate later sprint).

Alternative if the user wants to defer manual PNG: explicit curator-signed PNG waiver in a new policy doc, with double-sign-off requirements documented for the production gate.

## 8. Validators run

| Check | Result |
|-------|--------|
| Pre-sprint `tsc --noEmit` | clean |
| Pre-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards + noindex+nofollow |
| Initial bridge-input validator run | **FAILED — 58 issues, all enum/format** |
| Post-correction bridge-input validator run | **PASSED — 0 errors, 0 warnings** |
| Post-sprint `validate-micro-pilot-runtime.ts` | PASSED — 5 cards UNCHANGED |
| Post-sprint runtime data files | UNCHANGED |

## 9. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED — Vercel CLI not installed |
| No merge / PR to main | CONFIRMED |
| No Vercel production promotion | CONFIRMED |
| No DB / schema / prisma / seed / cron | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED — validator hard-blocks both |
| No runtime generation | CONFIRMED |
| No route / UI / sitemap / nav / homepage changes | CONFIRMED |
| No validator weakening | CONFIRMED — validator ported byte-identical from T7; enums unchanged |
| No caveat removed from DRAFT | CONFIRMED — every caveat preserved verbatim in human-readable fields |
| No audience broadened | CONFIRMED — `accepts_caribbean=UNKNOWN_NOT_STATED` (UPMC) and `=NO` (Lincoln) match source language |
| No visa overclaim | CONFIRMED — `h1b_supported=FALSE`, `j1_supported=FALSE`, `b1_b2_supported=APPLICANT_OBTAINED` (UPMC) / `UNKNOWN_NOT_STATED` (Lincoln) |
| No site-specific guarantee | CONFIRMED — system-level caveat preserved in `public_limitations` and `audience_public_caveat` |
| No bridge promotion beyond DRAFT | CONFIRMED — `bridge_review_status=NEEDS_HUMAN_COPY_REVIEW`; promotion to VALIDATED is hard-blocked by `evidence_triple_complete=false` |
| No PNG waiver beyond DRAFT gate | CONFIRMED — `not_allowed_actions` includes `NO_PNG_BYPASS_AT_RUNTIME`; reviewer_notes states PNG required before runtime |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
| T7 mutated | NO — read-only inspection only; only the validator tooling script was copied |
