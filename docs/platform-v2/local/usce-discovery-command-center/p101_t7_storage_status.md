# P101 — T7 Artifact Storage Status

**Last updated:** 2026-05-11 (P101-3C — canonical root reconciliation complete)

## T7 mount status

| Check | P101-3 | P101-3B | P101-3C (canonical) |
|---|---|---|---|
| Drive | `/Volumes/T7` (assumed, never mounted) | `/Volumes/T7Shield_Code` (clarified by operator) | `/Volumes/T7Shield_Code` |
| Mounted | NO | **YES** | **YES** |
| Writable | N/A | **YES** | **YES** |
| Free space | N/A | 1.8 TB | 1.8 TB |
| Evidence root | NOT CREATED | `/Volumes/T7Shield_Code/USCEHubEvidence/p101/` (**mistaken sibling root** — relocated in P101-3C) | **`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<ST>/<slug>/`** (canonical capsule, parallel to existing `p96/` + `p97/` evidence) |
| Co-tenancy | n/a | n/a | USCEHub capsule holds `08_ACTIVE_ON_SHIELD_LATER/`, `09_ARCHIVES/`, `10_BACKUPS/`, `11_LOCAL_EVIDENCE/` — P101 lives in `11_LOCAL_EVIDENCE/p101/` |
| Decision | Pending (drive offline) | Backfill ran successfully — but to wrong top-level root | Tree copied byte-identical (verified per-file SHA-256), packet+manifest paths updated, validator hardened, legacy root preserved with `LEGACY_ROOT_RELOCATED.md` pointer |

## Canonical artifact layout (P101-3C onward)

```
/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p101/<STATE>/<institution-slug>/
├── cleaned-text/  <sha1>.txt        the SHA-256 input
├── source-pages/  <sha1>.html       raw fetched HTML
├── metadata/      <sha1>.meta.json  fetch metadata (status, redirects, content-type, fetched-at)
├── hashes/        <sha1>.txt.sha256 one-line SHA-256 file per cleaned-text artifact
├── screenshots/   (PENDING — no captures this sprint)
└── pdfs/          (PENDING — Emory + Cook County queued)
```

## Artifacts stored (P101-3B captured · P101-3C relocated)

| Type | Count | Storage location |
|---|---|---|
| Cleaned text files | **10** | `<canonical>/<ST>/<slug>/cleaned-text/<sha1>.txt` |
| Raw HTML files | **10** | `<canonical>/<ST>/<slug>/source-pages/<sha1>.html` |
| Fetch metadata JSON | **10** | `<canonical>/<ST>/<slug>/metadata/<sha1>.meta.json` |
| SHA-256 hash files | **10** | `<canonical>/<ST>/<slug>/hashes/<sha1>.txt.sha256` |
| Source hashes (real, in packet JSON) | **10** | `changeDetectionPrep.sourceHash` + `sourceEvidence[].cleanedTextHash` |
| Screenshots | 0 | PENDING — curl-based fetcher has no screenshot capability; not invoked via preview MCP this sprint |
| PDFs | 0 | PENDING — Emory policy PDF + Cook County 2018 PDF queued; helper `p101-extract-pdf-text.ts` ready |

## Relocation verification (P101-3C)

| Check | Result |
|---|---|
| Source file count at legacy root | 40 |
| Destination file count at canonical root | 40 |
| Per-file SHA-256 diff (legacy ↔ canonical) | **0 differences** — every byte matches |
| Packet JSONs path-rewritten (10 packets) | YES |
| Artifact manifest CSV path-rewritten | YES |
| Legacy root preserved | YES — `LEGACY_ROOT_RELOCATED.md` pointer written at `/Volumes/T7Shield_Code/USCEHubEvidence/LEGACY_ROOT_RELOCATED.md`, tree not deleted |
| Validator enforces canonical-root prefix | YES — fails on `T7Shield_Code/USCEHubEvidence` prefix in any packet `cleanedTextPath` |

## Large files committed to git

**NONE.** No HTML / PDF / PNG / JPEG was committed to `docs/` or any other git-tracked path during P101-3 / P101-3B / P101-3C. The validator scans the command-center folder for files > 100 KB and binary-suspect extensions and fails on any hit.

## What is still pending (carries into P101-4+)

- **Screenshots**: 10 PENDING across all 10 packets.
- **PDFs**: 2 PENDING (Emory policy PDF + Cook County 2018 PDF).
- **Secondary URL hashes**: 7 packets carry secondary `sourceEvidence` entries with `PENDING_T7_BACKFILL` hash placeholders. Primary URLs (the main one per packet) are all real now.

## Hard rule (unchanged)

Repo = index, schema, validators, packet JSON, manifests, hash strings.
T7 = HTML, cleaned text, screenshots, PDFs, raw binaries.
**No large file ever committed to git.**
