# P101-3C — T7 Evidence Root Reconciliation Checkpoint

**Date:** 2026-05-11
**Sprint:** P101-3C — T7 Evidence Root Reconciliation + Canonical Project Folder Fix
**Pre-sprint HEAD:** `04bd895` · **Production main:** `739ab1e` — UNCHANGED

---

## What this sprint did

Relocated all 10 P101-3B artifact trees from the **mistaken sibling root** to the **canonical USCEHub product capsule** on T7 Shield, with byte-identical verification and full repo path rewrite.

| Before | After |
|---|---|
| `/Volumes/T7Shield_Code/USCEHubEvidence/p101/<ST>/<slug>/` | `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<ST>/<slug>/` |

The legacy location was a new top-level T7 folder created in P101-3B before the existing project capsule layout (`/Volumes/T7Shield_Code/01_PROJECTS/`) was checked. The new location sits alongside the existing `p96/` and `p97/` evidence under the USCEHub capsule's `11_LOCAL_EVIDENCE/` subtree, matching the established convention.

## Verification

| Check | Result |
|---|---|
| Files at legacy root | 40 |
| Files copied to canonical root | 40 |
| Per-file SHA-256 diff (legacy ↔ canonical, all files) | **0 differences** |
| Cleaned-text content unchanged | YES — bit-for-bit identical |
| Hash strings in packet JSONs unchanged | YES — only paths rewrote |
| Legacy tree preserved | YES (with `LEGACY_ROOT_RELOCATED.md` pointer; not deleted) |

## Files touched in repo

| File | Change |
|---|---|
| `docs/platform-v2/local/usce-discovery-command-center/P101_3C_T7_CANONICAL_ROOT_DECISION.md` | NEW — root selection rationale |
| `docs/platform-v2/local/usce-discovery-command-center/p101_3c_t7_artifact_relocation_plan.csv` | NEW — legacy→canonical mapping for 10 institutions |
| `docs/platform-v2/local/usce-discovery-command-center/P101_3C_T7_ROOT_RECONCILIATION_CHECKPOINT.md` | NEW — this file |
| `docs/platform-v2/local/usce-discovery-command-center/p101_t7_storage_status.md` | UPDATED — canonical root recorded, P101-3C column added |
| `docs/platform-v2/local/usce-discovery-command-center/p101_artifact_manifest.csv` | UPDATED — 20 path occurrences rewritten to canonical |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/AL/university-of-alabama-at-birmingham-hospital.json` | UPDATED — 2 path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/CA/stanford-health-care.json` | UPDATED — 2 path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/GA/emory-university-hospital.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/IL/cook-county-health-stroger.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/beth-israel-deaconess-medical-center.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/boston-medical-center.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/brigham-and-womens-hospital.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/MA/massachusetts-general-hospital.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/PA/upmc-presbyterian.json` | UPDATED — path occurrences |
| `docs/platform-v2/local/usce-discovery-command-center/institution-packets/TX/parkland-health-utsw.json` | UPDATED — path occurrences |
| `scripts/validate-p101-discovery-command-center.ts` | UPDATED — REQUIRED_DOCS gained 3 P101-3C entries; new canonical-root enforcement on `sourceEvidence[].cleanedTextPath` etc. and on `changeDetectionPrep.cleanedTextPath` etc.; legacy prefix fails with `T7_LEGACY_ROOT_PATH`, off-capsule T7 paths fail with `T7_NON_CANONICAL_ROOT` |

## Files written on T7 (off-repo)

| File | Purpose |
|---|---|
| `/Volumes/T7Shield_Code/USCEHubEvidence/LEGACY_ROOT_RELOCATED.md` | Pointer at legacy root explaining the canonical capsule and the no-write rule |
| `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<ST>/<slug>/...` | 40 files (10 institutions × cleaned-text + html + meta + hash) |

## What this sprint did NOT do

- Did NOT delete the legacy tree at `/Volumes/T7Shield_Code/USCEHubEvidence/p101/` — left in place as safety net.
- Did NOT re-fetch any source URLs (pure copy).
- Did NOT change any cleaned-text content, SHA-256 hash, or evidence semantics — only file addresses moved.
- Did NOT capture screenshots, PDFs, or any new artifacts.
- Did NOT touch secondary-URL placeholder hashes (still queued for a later sprint).
- Did NOT touch production main (still pinned at `739ab1e`).
- Did NOT push, PR, or merge.

## Validator status

| Check | Result |
|---|---|
| REQUIRED_DOCS includes P101-3C trio | YES |
| Per-packet path-prefix check rejects legacy root | YES (`T7_LEGACY_ROOT_PATH`) |
| Per-packet path-prefix check rejects off-capsule T7 paths | YES (`T7_NON_CANONICAL_ROOT`) |
| changeDetectionPrep paths also checked | YES |
| Forbidden-token / banned-phrase scan still clean | (verified by re-running validator) |
| All 10 packets pass | (verified by re-running validator) |

## Whether P101-4 can proceed

**YES.** The canonical T7 root is now the single source of truth for P101 evidence on this drive. Any new packet's fetch helper must write artifacts directly under `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<ST>/<slug>/`. The validator will reject any drift.

## Plain English

P101-3B captured 10 real source-page fingerprints and put them on the right drive but in the wrong folder. P101-3C moved the folder to where it belonged — inside the USCEHub project capsule, parallel to existing P96 and P97 evidence — without changing a single byte of content or a single hash value. Every packet now points to the canonical location. The validator now refuses any future packet that tries to use the legacy sibling root.

## Sprint status

**PASS.** Ready for `P101-4 — Next 25-Institution Discovery Block` using the canonical T7 root from the first packet onward.
