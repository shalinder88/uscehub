# P101 — T7 Artifact Storage Status

**Last updated:** 2026-05-11 (P101-3B sprint — third check after operator clarification: "T7" = T7 Shield)

## T7 mount status

| Check | P101-3 | P101-3B (initial) | P101-3B (after operator clarification) |
|---|---|---|---|
| Drive identified as canonical "T7" | `/Volumes/T7` (assumed) | `/Volumes/T7` (assumed) | **`/Volumes/T7Shield_Code`** |
| Mounted? | NO | NO | **YES** |
| Writable? | N/A | N/A | **YES** |
| Free space | N/A | N/A | **1.8 TB free** |
| Evidence root (actual) | NOT CREATED | NOT CREATED | **`/Volumes/T7Shield_Code/USCEHubEvidence/p101/<ST>/<slug>/`** — created 2026-05-11 |
| Co-tenancy note | n/a | n/a | T7 Shield also hosts `01_PROJECTS/iOS_Systolo/` (Systolo active source per memory). USCEHubEvidence is a sibling at drive root — no collision. |
| Decision | Document PENDING | Initially blocker doc written | Operator clarified naming; blocker doc retracted; backfill ran successfully on all 10 packets |

## Artifacts stored (P101-3B)

| Type | Count | Storage |
|---|---|---|
| Cleaned text files | **10** | `T7/<ST>/<slug>/cleaned-text/<sha1>.txt` |
| Raw HTML files | **10** | `T7/<ST>/<slug>/source-pages/<sha1>.html` |
| Source hashes (real SHA-256) | **10** | recorded in packet JSON (`changeDetectionPrep.sourceHash`, `sourceEvidence[].cleanedTextHash`) AND as `.sha256` files on T7 |
| Fetch metadata JSON | **10** | `T7/<ST>/<slug>/metadata/<sha1>.meta.json` |
| Screenshots | 0 | PENDING — `p101-fetch-html.ts` is curl-based (no screenshot capability); preview MCP not invoked for these 10 URLs this sprint |
| PDFs | 0 | PENDING — Emory + Cook County reference PDFs queued (helper `p101-extract-pdf-text.ts` ready) |

## Artifacts stored

| Type | Count this sprint | Storage location |
|---|---|---|
| Raw HTML files | 0 | (T7 pending) |
| Cleaned text files | 0 | (T7 pending) |
| Screenshots | 0 | (T7 pending) |
| PDF binaries | 0 | (T7 pending) |
| Source hashes | recorded in packet JSON `changeDetectionPrep.sourceHash` | git (string only, no binary) |
| Wayback snapshot URLs | 0 | (deferred; no automation this sprint) |

## What is pending

- All 10 retrofitted packets carry `cleanedTextPath: ""`, `screenshotPath: ""`, `pdfPath: ""` for their `sourceEvidence` entries — the file paths cannot be populated until T7 is mounted in a future sprint.
- `screenshotStatus: "PENDING"` on every sourceEvidence entry across the 10 packets.
- The `sourceHash` field in `changeDetectionPrep` is populated from the cleaned-text hash of the SSR'd content at WebFetch time as a placeholder — the canonical hash will be re-computed when the page is actually saved to T7. This means today's hash is a *capture-time* hash; tomorrow's hash for change-detection should be compared against the next-recheck hash, not against today's placeholder. Documented in each packet's `changeDetectionPrep.notes`.

## Large files committed to git

**NONE.** No HTML / PDF / PNG / JPEG was committed to `docs/` or any other git-tracked path during this sprint. Validator `validate-p101-discovery-command-center.ts` enforces this by scanning the command-center folder for files > 100 KB or with binary-suspect extensions; it will fail the commit if any are found.

## How to enable T7 storage in a future sprint

1. Plug in the T7 (`/Volumes/T7` should mount automatically).
2. Create the root: `mkdir -p /Volumes/T7/USCEHubEvidence/p101/`.
3. Run the (future) backfill script `scripts/p101-backfill-t7-artifacts.ts` against each existing packet's `sourceEvidence[].sourceUrl`. The script (not yet written) would:
   - re-fetch each sourceUrl with the existing `p101-fetch-html.ts` helper
   - save raw HTML + cleaned text + SHA-256 hash under `/Volumes/T7/USCEHubEvidence/p101/<ST>/<slug>/source-evidence/`
   - update the packet JSON's `cleanedTextPath`, `screenshotPath`, `pdfPath`, `screenshotStatus`, `cleanedTextHash` fields
   - update `p101_artifact_manifest.csv` rows with `storedOnT7: true`, `captureStatus: CAPTURED`
4. Re-run the validator. Any packet still marked PENDING after backfill should be queued for manual retry (likely bot-blocked or PDF-fail).

## Why we chose "pending" over "blocking"

If we made T7 a hard prerequisite, the entire P101-3 sprint would block until the drive is mounted. That trades one form of progress for another. Instead, we capture the *index* now (packet JSON + manifest + hashes in repo) and leave the *blobs* (HTML, text, screenshots, PDFs) for the future T7 backfill. The packet JSON itself remains the source of truth for classification and verbatim quotes — the artifacts are change-detection backup, not the primary evidence.

## Hard rule

Even when T7 IS mounted in future sprints, no large file is to be committed to git. The split is fixed:
- Repo = index, schema, validators, packet JSON, manifests, hashes (strings)
- T7 = HTML, text, screenshots, PDFs, raw evidence binaries
