# P101-3C — T7 Evidence Canonical Root Decision

**Date:** 2026-05-11
**Sprint:** P101-3C — T7 Evidence Root Reconciliation
**Pre-sprint HEAD:** `04bd895` · **Production main:** `739ab1e` — UNCHANGED

---

## Why this decision is needed

P101-3B saved 10 institutions' cleaned-text + raw-HTML + SHA-256 artifacts to T7 Shield, but used a **new top-level path** (`/Volumes/T7Shield_Code/USCEHubEvidence/p101/`). T7 Shield is already organized as a multi-project drive with a per-project capsule layout under `/Volumes/T7Shield_Code/01_PROJECTS/`. USCEHub already has a capsule at `01_PROJECTS/USCEHub/` with a dedicated `11_LOCAL_EVIDENCE/` subfolder that already contains `p96/` and `p97/`. P101 evidence belongs there, not as a sibling root.

## Drive structure observed (read-only inspection)

```
/Volumes/T7Shield_Code/01_PROJECTS/
├── Desktop_Inbox/
├── FDD_Franchiese_Downloads/
├── FDD_Franchiese_Main/
├── Health_USMLE_Platform/        ← repo-snapshot capsule (source-backup, daily snapshots)
├── NazarSe/
├── USCEHub/                      ← product capsule (use this for P101 evidence)
│   ├── 08_ACTIVE_ON_SHIELD_LATER/
│   ├── 09_ARCHIVES/
│   ├── 10_BACKUPS/
│   └── 11_LOCAL_EVIDENCE/
│       ├── p96/                  ← existing prior-sprint evidence
│       └── p97/                  ← existing prior-sprint evidence
├── Web_Sasanova/
└── iOS_Systolo/
```

## Why `USCEHub` (and not `Health_USMLE_Platform`)

| Capsule | Purpose observed | Fit for P101 evidence |
|---|---|---|
| `Health_USMLE_Platform/` | Repo source backups, daily snapshots, project admin, logs, restore notes | **Wrong** — this is repo-state/backup, not product evidence |
| `USCEHub/11_LOCAL_EVIDENCE/` | Already holds `p96/` and `p97/` discovery evidence | **Right** — this is the established convention for sprint-evidence blobs |

P101 is a discovery/product sprint, parallel to P96 and P97. It belongs alongside them.

## Canonical root (selected)

```
/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<STATE>/<institution-slug>/
```

with per-institution subfolders preserved from P101-3B:

```
<STATE>/<institution-slug>/
├── cleaned-text/    real cleaned text (the SHA-256 input)
├── source-pages/    raw fetched HTML
├── metadata/        fetch metadata JSON (status, redirects, content-type, fetched-at)
├── hashes/          .sha256 files (one per cleaned-text file)
├── screenshots/     reserved (still PENDING for all 10)
└── pdfs/            reserved (still PENDING for Emory + Cook County)
```

## Mistaken root (legacy)

```
/Volumes/T7Shield_Code/USCEHubEvidence/p101/
```

**Disposition:** keep artifacts in place during P101-3C, copy (not move) into canonical capsule, verify hashes, then write a `LEGACY_ROOT_RELOCATED.md` pointer at the old root explaining that the canonical location is the USCEHub capsule. The legacy tree is not deleted in this sprint — that's a future cleanup once packets, manifest, and validator all reference the canonical path and have been re-verified.

## Path-rewrite scope (all P101-3B references)

| Surface | Old path | New path |
|---|---|---|
| 10 packet JSONs (`sourceEvidence[].cleanedTextPath`, `changeDetectionPrep.cleanedTextPath`, `changeDetectionPrep.notes`) | `/Volumes/T7Shield_Code/USCEHubEvidence/p101/...` | `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/...` |
| `p101_artifact_manifest.csv` rows from P101-3B | `/Volumes/T7Shield_Code/USCEHubEvidence/p101/...` | `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/...` |
| `p101_t7_storage_status.md` evidence-root callout | `T7Shield_Code/USCEHubEvidence/p101/<ST>/<slug>/` | `T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<ST>/<slug>/` |
| Validator (`scripts/validate-p101-discovery-command-center.ts`) | (no path check yet) | Enforce canonical prefix on `cleanedTextPath`, fail on legacy prefix |

## What this sprint does NOT do

- Does NOT delete the legacy root (`/Volumes/T7Shield_Code/USCEHubEvidence/p101/`) — leaves a pointer note for operator review.
- Does NOT re-fetch source URLs — relocation is a pure file copy.
- Does NOT change any cleaned-text content, hash, or evidence semantics — only the storage address.
- Does NOT touch secondary-URL placeholder hashes (still queued for a later sprint).
- Does NOT capture screenshots or PDFs.
- Does NOT touch production main (still pinned at `739ab1e`).
