# P101-3B — T7 Artifact Backfill Checkpoint

**Date:** 2026-05-11
**Sprint:** P101-3B — T7 Artifact Backfill + Real Source Hash Capture
**Pre-sprint HEAD:** `9e58524` · **Production main:** `739ab1e` — UNCHANGED

---

## T7 status

| Check | Result |
|---|---|
| Drive | `/Volumes/T7Shield_Code` (operator clarified that "T7" in the doctrine refers to T7 Shield) |
| Mounted | YES |
| Writable | YES |
| Free space | 1.8 TB |
| Evidence root | `/Volumes/T7Shield_Code/USCEHubEvidence/p101/` — created this sprint |
| 10 institution folders + 6 subfolders each (source-pages/screenshots/pdfs/cleaned-text/hashes/metadata) | created (60 folders total) |

## 10 packets processed

| # | Institution | State | Source URL | Real SHA-256 (first 16) | bytes | T7 cleaned-text saved | T7 raw HTML saved | Screenshot | PDF |
|---|---|---|---|---|---|---|---|---|---|
| 1 | UAB Hospital | AL | uab.edu/.../international-visiting-medical-students | `0bf17ce50fc43712` | 12,846 | YES | YES | PENDING | N/A |
| 2 | Stanford Health Care | CA | med.stanford.edu/visiting-clerkships/international.html | `2a15412582452aa2` | 10,959 | YES | YES | PENDING | N/A |
| 3 | Emory University Hospital | GA | med.emory.edu/.../visiting/index.html | `7a5007a65c20028b` | 9,412 | YES | YES | PENDING | PENDING (policy PDF) |
| 4 | UPMC Presbyterian | PA | researchprograms.medschool.pitt.edu/.../international-visiting-student-program | `c29f0183283944a0` | 13,533 | YES | YES | PENDING | N/A |
| 5 | Boston Medical Center | MA | bumc.bu.edu/isep/ | `9694d37bef02475c` | 2,904 | YES | YES | PENDING | N/A |
| 6 | Parkland Health / UTSW | TX | medschool.utsouthwestern.edu/.../international.html | `e638c1ddd2bbe1b1` | 8,740 | YES | YES | PENDING | N/A |
| 7 | Brigham and Women's Hospital | MA | hms.harvard.edu/.../visiting-students-program/apply | `2e4da52932847783` | 7,657 | YES | YES | PENDING | N/A |
| 8 | Massachusetts General Hospital | MA | massgeneral.org/.../advanced-surgery-clerkship-program | `fb34f7d6aaeeb3b1` | 12,573 | YES | YES | PENDING | N/A |
| 9 | Beth Israel Deaconess Medical Center | MA | bidmc.org/medical-education/undergraduate-medical-education | `9e3e402c05200c70` | 5,812 | YES | YES | PENDING | N/A |
| 10 | Cook County Health (Stroger) | IL | cookcountyhealth.org/education-and-research/ | `180ca4880fef206b` | 6,208 | YES | YES | PENDING | PENDING (2018 PDF) |

## Artifact totals

| Metric | Count |
|---|---|
| Source URLs processed | 10 |
| Cleaned text files saved | **10** (real, on T7) |
| Raw HTML files saved | **10** (real, on T7) |
| Real SHA-256 hashes captured | **10** (none `PENDING_T7_BACKFILL` remaining for primary sources) |
| Placeholder hashes remaining | **0** for the 10 primary source URLs. Secondary `sourceEvidence` entries on Emory (3 total) / UPMC (2 total) / BMC (3 total) / Parkland (3 total) / BWH (2 total) / MGH (2 total) / BIDMC (2 total) — their secondary URLs were NOT re-fetched this sprint and retain placeholder hashes; flagged below. |
| Screenshots captured | 0 |
| Screenshots PENDING | 10 |
| PDFs saved | 0 |
| PDFs extracted | 0 |
| PDFs PENDING | 2 (Emory policy PDF, Cook County 2018 PDF) |
| Artifact manifest rows added (P101-3B) | 30 (3 per institution: cleaned_text + raw_html + screenshot-pending) |
| **Large files committed to git** | **NO** — all artifacts on T7 Shield only |

## Quality checks

| Check | Result |
|---|---|
| No fake screenshots | ✅ YES — all screenshotStatus remain `PENDING` |
| No fake hashes | ✅ YES — all 10 hashes are real SHA-256 of actual cleaned text on T7 |
| No fake PDF extraction | ✅ YES — Emory + Cook County PDFs remain PENDING |
| No large artifacts committed | ✅ YES — git only has small text files (packet JSON, manifest CSV, hash strings, docs) |
| T7 paths recorded honestly | ✅ YES — all `cleanedTextPath` values point to actual files |
| Quote-or-no-claim preserved | ✅ YES — no fieldQuoteMap entries modified this sprint |
| Real hashes match what's on T7 | ✅ YES — hash files at `T7/<ST>/<slug>/hashes/<sha1>.txt.sha256` carry the same hash as packet JSON |

## Failures and reasons

| Item | Reason | Resolution |
|---|---|---|
| Screenshots for all 10 | `p101-fetch-html.ts` is curl-based (no screenshot capability built in); Claude Preview MCP not invoked for these 10 URLs this sprint to keep scope tight. | Future sprint: optional headless-Chrome screenshot in `p101-fetch-html.ts`, or per-URL Preview MCP capture, or operator browser capture. |
| Emory policy PDF (`visiting-student-elective-policy-requirements_08.2024.pdf`) | Helper `p101-extract-pdf-text.ts` exists but not invoked this sprint. Backfill scope was "primary source URL per packet" not "all secondary URLs". | Run `npx tsx scripts/p101-extract-pdf-text.ts <pdf-url>` against the URL; copy PDF + extracted text to T7; update Emory packet's `pdfPath` + `pdfExtractionStatus`. |
| Cook County 2018 PDF | Same as Emory + content is 8 years stale | Same retrieval mechanism + flag for content re-verification before any classification update |
| Secondary `sourceEvidence` entries on 7 packets | Backfill captured only the primary URL per packet (10 URLs); secondary URLs (e.g., HMS apply sub-page for BWH, fee-schedule for Stanford IVS, etc.) retain `PENDING_T7_BACKFILL` hash placeholders | Next sprint adds those URLs to the backfill queue (~10 more URLs across the 10 packets) |

## Whether P101-4 can proceed

**YES — with caveats**:

1. The artifact layer is now REAL for the 10 primary source URLs. 10 packets carry real SHA-256 hashes + real T7 paths.
2. Screenshot capture is still PENDING for all 10. That's tolerable for change detection (hashes do the work) but the moat includes screenshots for trust transparency UX.
3. Secondary URLs on 7 packets still have placeholder hashes. The most important moat data (primary source page text + hash) is real for all 10; secondary URLs are nice-to-have.
4. The PDF helper is in place but unused this sprint.

**Recommendation:** P101-4 (next 25-institution discovery block using enhanced schema with real artifact capture at fetch time) is now unblocked. The proof is real on these 10 institutions; the workflow scales.

## Plain English

This sprint did exactly one thing well: it converted 10 PENDING placeholder hashes into 10 real SHA-256 hashes computed from real cleaned text saved on the T7 Shield drive. The packet JSONs now carry the actual fingerprint of each source page — when a future re-verification cron fetches the same URL, recomputes the hash, and compares, it can deterministically detect whether the page changed. That is the change-detection moat now operational.

What this sprint did NOT do: capture screenshots, extract PDFs, re-fetch secondary URLs on multi-source packets. Those are honest gaps documented as PENDING. No fake artifacts. No fake hashes. The artifact layer is real, not theatrical.

## Sprint status

**PASS.** Ready for `P101-4 — Next 25-Institution Discovery Block Using Enhanced Evidence + Real Artifact Capture` (the spec for that sprint should bake hash-at-fetch-time into the per-packet workflow so no future packet ever ships with a placeholder hash).
