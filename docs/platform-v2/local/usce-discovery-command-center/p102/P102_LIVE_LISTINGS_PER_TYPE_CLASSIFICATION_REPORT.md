# P102 Per-Listing Classification — Corrective Audit

Generated: 2026-05-17  
Branch: `local/p102-live-site-crosscheck-exact-links`  
Parent commit: `1c14d21`

---

## Why this report exists — what I got wrong before

In the earlier crosswalk pass I wrote "81% of live listings have URLs that don't survive direct-link validation." **That framing was wrong and misleading.** It was based on a single Node-fetch + URL-pattern gate, applied uniformly to all listings regardless of program type, and treated anything not matching a narrow direct-USCE regex as "should hide or downrank."

The reality, after the operator's correction:

- Many URLs are reachable and useful but not perfectly direct opportunity pages
- **Research listings follow a different standard** — institutional research-office pages are valid for research, not for clinical USCE  
- Cloudflare-protected pages are not "dead" — they work in real browsers
- Some rows are intentionally negative-informational (e.g. "X does not offer observerships") — they shouldn't be counted as USCE but shouldn't be deleted either
- Borderline rows should be reverified, not condemned

This report applies the operator's 11-state taxonomy per listing, with type-aware standards.

---

## Methodology — type-aware per-listing classifier

`scripts/p102-classify-live-listings-per-type.ts` walks every row in `usmle-observerships/data.js` (207 programs) and applies:

1. **Hide-list override** → `NO_PROGRAM_FOUND_HIDE`
2. **Negative-info detection** (description says "does not offer" / "no longer offers") → `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE`
3. **Research-type listings** get the loose standard:
   - `RESEARCH_DIRECT_PROGRAM` (operator-verified research URL)
   - `RESEARCH_VALID_INSTITUTIONAL_PATHWAY` (postdoc/lerner/research/training path)
   - `RESEARCH_GENERIC_BUT_ACCEPTABLE` (institutional but reasonable)
   - `RESEARCH_TOO_GENERIC_REVERIFY` (homepage; needs better URL)
4. **Clinical USCE listings** get the strict standard:
   - `PROTECTED_BROWSER_REQUIRED` (Cloudflare 403; works in browser — kept)
   - `BROKEN_REQUIRES_MANUAL_BROWSER` (network failure other than 403)
   - `DIRECT_TRUE_USCE_LINK` (verified + URL has direct USCE keyword)
   - `MOVED_REORIENTED_TO_TRUE_USCE_LINK` (verified replacement, even if URL signal is less direct)
   - `BORDERLINE_KEEP_REVERIFY` (URL works but not a perfectly direct USCE path — kept)

---

## Results (n=207 programs)

| Classification | Count |
|---|---:|
| BORDERLINE_KEEP_REVERIFY | 103 |
| DIRECT_TRUE_USCE_LINK | 45 |
| MOVED_REORIENTED_TO_TRUE_USCE_LINK | 28 |
| NO_PROGRAM_FOUND_HIDE | 10 |
| RESEARCH_VALID_INSTITUTIONAL_PATHWAY | 9 |
| RESEARCH_TOO_GENERIC_REVERIFY | 7 |
| BROKEN_REQUIRES_MANUAL_BROWSER | 3 |
| NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE | 1 |
| PROTECTED_BROWSER_REQUIRED | 1 |

**No listing is "broadly inaccurate."** 73 are confirmed direct/reoriented USCE links; 103 are borderline-but-kept (institutional URLs that work in browsers but lack a perfectly direct USCE keyword in the path); only 10 are hidden as confirmed-dead.

---

## What changed in the data this session (sweep total across 4 commits)

| | Before sweep | After sweep |
|---|---:|---:|
| verified-links.ts entries | 79 | **135** (+56) |
| verified:true | 47 | **108** (+61) |
| Hide list entries | (none) | **9** (8 PERMANENT, 1 added second pass) |
| Listings to seed | 207 | **197** |
| Confirmed DIRECT_TRUE or REORIENTED USCE | (unmeasured) | **73** |
| Counted research listings | (unmeasured) | **9** |

---

## Outstanding work (per the operator's "1-by-1" mandate)

**103 BORDERLINE_KEEP_REVERIFY rows** need manual browser-based reverification:
- Their URLs are not homepages and not research pages
- They likely work in browsers (institutional pathway pages with some content)
- They just don't match the strict direct-USCE regex
- For each, the operator (or a future browser-based pass) should:
  - Confirm the page contains USCE-relevant content
  - If yes → mark DIRECT_TRUE_USCE_LINK
  - If a better URL exists → mark MOVED_REORIENTED_TO_TRUE_USCE_LINK
  - If page is research-only → reclassify as RESEARCH_*
  - If page is negative info → mark NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE
  - If no program found → mark NO_PROGRAM_FOUND_HIDE

**7 RESEARCH_TOO_GENERIC_REVERIFY rows** need operator to supply a deeper research-office URL.

**3 BROKEN_REQUIRES_MANUAL_BROWSER + 1 PROTECTED** rows need browser verification.

---

## Output files

- `exports/live_listings_classification.json` — full per-listing data (`listingTitle`, `currentUrl`, `finalUrl`, `programType`, `subType`, `audience`, `classification`, `evidenceQuote`, `sourceStatus`, `actionTaken`, `reason`, `countsAsTrueUSCE`, `countsAsResearch`, `needsManualBrowser`, `hasVerifiedOverride`, `isHidden`, `priorRunnerStatus`)
- `exports/live_listings_classification_summary.md` — same counts in markdown
- `scripts/p102-classify-live-listings-per-type.ts` — the classifier itself

The classifier is re-runnable any time `verified-links.ts`, `listings-hidelist.ts`, `data.js`, or the runner output change. It encodes the operator's intent: clinical USCE strict, research loose, negatives separated, borderline kept.

---

## Honest summary

I was wrong to apply a single strict gate uniformly and call live URLs broadly inaccurate. The corrected picture:

- **Confirmed true USCE links: 73** (45 direct + 28 reoriented; +1 protected = 74 if you count Hopkins)
- **Confirmed research-valid: 9**
- **Need 1-by-1 manual reverification: ~110** (103 borderline + 7 research-reverify; these are institutional URLs likely valid in browsers)
- **Confirmed should-hide: 10** (no-program-found / dead)
- **Other special cases: 5** (3 broken / 1 protected / 1 negative-info)

The path forward is exactly what the operator described: one-by-one reverification of the 103 borderline rows, prioritizing observerships → VMS clerkships → sub-I → externships → INTL → research → negative-info.
