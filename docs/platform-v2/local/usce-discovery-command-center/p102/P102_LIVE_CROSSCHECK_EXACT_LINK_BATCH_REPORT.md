# P102 Live Site Cross-Check + Exact-Link Validation Report

Generated: 2026-05-16  
Branch: `local/p102-live-site-crosscheck-exact-links`  
Parent commit: `02b9a2f` (Batch 2)

---

## TL;DR

- Compared `localhost:3000/usce/verified-preview` to live `uscehub.com` + `/browse`
- Found and parsed the source of the 304 live listings:
  - `/Users/shelly/usmle-observerships/data.js` → 207 hand-curated programs
  - `prisma/verified-links.ts` → 79 operator URL overrides (47 with `verified:true`)
- Built a 206-row seed CSV from the live data + ran the exact-link runner on the union (Batch 1+2 seeds + live source URLs)
- **Only 33 of 206 live listings (16%) have a source URL that survives direct-link validation today**
- 95 (46%) need re-verification (URL is a hospital homepage / dead)
- 72 (35%) should be hidden or downranked (URL is not an opportunity page at all)
- 6 (3%) are non-Tier-1 USCE (GME / research / pharmacy / careers)
- Preview row count grew from 29 → **61** after the live-source-link pass
- Validator: 21/21 exact-seed + 19/19 intelligent + tsc clean + no-secrets clean

---

## 1. Live site observations

Live `uscehub.com` is a real product:
- Homepage meta description: *"Search observerships, externships, research roles, and postdoc opportunities with direct source links, visa notes, fee ranges, and verification status. Free and community-reviewed."*
- Trust labels: NPI-Verified Posters · Admin-Reviewed · Community Reviews · Moderated Platform
- Claim: "282 Clinical Rotations (observerships, externships, electives)"
- Hardcoded display: `opportunitiesIndexed: 304` in `src/lib/site-metrics.ts:38`
- `/browse` shows 304 listing detail links
- Each listing card carries a "Verified program link" badge + `lastVerifiedAt` timestamp
- Detail page fields: Specialty, Duration, Format, Deadline, Eligibility, Description

Local DB seed produces 207 listings from data.js. The remaining 97 in production were added later via admin UI (or a different seed run).

---

## 2. Source of the live listings (Phase C)

| Source | Role | Count |
|---|---|---:|
| `/Users/shelly/usmle-observerships/data.js` (sibling repo) | Canonical `PROGRAMS[]` array | **207** programs (206 with HTTP link) |
| `prisma/verified-links.ts` | Operator URL overrides | **79** entries (47 `verified:true`) |
| `prisma/seed.ts` | Merges the two, writes `Listing` rows | — |

The seed flow:
```
data.js PROGRAMS[i].link
  ↓ (override if name matches)
prisma/verified-links.ts[program.name]?.url
  ↓
Listing.websiteUrl
```

**47 of 207 (23%)** of live listings have an operator-verified source URL. The other 160 use the raw `program.link`, which is often a generic landing page.

Detailed crosswalk written to:
`docs/platform-v2/local/usce-discovery-command-center/p102/P102_LIVE_DATA_CROSSWALK.md`

---

## 3. Exact-link validation on live source URLs (Phase E)

I generated a 206-row seed CSV from `data.js` + verified-links and combined with the 19 existing Batch 1+2 seeds (total 225). Ran the runner.

| Result | Count | % of fetched |
|---|---:|---:|
| AUTO_PROMOTE | 46 | 23% |
| HOLD_REVIEW | 7 | 4% |
| REJECTED | 139 | 70% |
| Duplicate clusters | 8 | — |
| FAILED_FETCH | 8 | 4% |

**Auto-promote rate on the live-URL subset alone: 32/183 = 17%.**
For comparison, the curated Batch 1+2 set scored 13/15 = 87%. The gap is exactly the operator-verified-vs-data.js-raw URL quality gap.

---

## 4. Per-listing decisions (live_listings_crosswalk)

The crosswalk script applied one decision per live listing:

| Decision | Count | % of 206 |
|---|---:|---:|
| **LIVE_ROW_NEEDS_REVERIFY** | 95 | 46% |
| **LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK** | 72 | 35% |
| **MATCH_UPDATE_WITH_SOURCE_QUOTE** | 33 | 16% |
| **FUTURE_LANE_ONLY** | 6 | 3% |
| **NEW_SOURCE_LINKED_ROW** | 14 | (added from Batch 1+2) |
| **DUPLICATE_HIDE_PREVIEW_ROW** | 0 | — |

### What each decision means

| Decision | Triggering condition |
|---|---|
| `MATCH_UPDATE_WITH_SOURCE_QUOTE` | Runner returned `VALID_DIRECT_USCE_SOURCE` + strong quote → enrich the existing live row with `sourceQuote` + `sourceHash` |
| `LIVE_ROW_NEEDS_REVERIFY` | `FAILED_FETCH`, `GENERIC_PAGE_HOLD`, or `REJECT_PATIENT_FACING` → URL is dead, generic, or a hospital homepage. Operator should supply a deeper URL. |
| `LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK` | `INVALID_NOT_USCE_SOURCE` → URL doesn't point at any USCE opportunity content. Hide until fixed. |
| `FUTURE_LANE_ONLY` | `REJECT_GME_ONLY` / `REJECT_RESEARCH_ONLY` / `REJECT_PHARMACY` / `REJECT_CAREERS` → real content, just not Tier-1 USCE. |
| `NEW_SOURCE_LINKED_ROW` | Exact-seed row from Batch 1+2 with no matching live listing → genuinely new |

### Sample rows per decision

**MATCH_UPDATE_WITH_SOURCE_QUOTE** (33 rows ready for enrichment) — examples:

| Live listing | Source URL |
|---|---|
| Cleveland Clinic | …/international-medical-education/.../physician-observer |
| Houston Methodist Hospital | houstonmethodist.org/.../observerships |
| Brigham and Women's Hospital | …/education/medical-school-students/visiting-medical-students |
| Stanford Health Care | …/visiting-students |
| Cleveland Clinic Florida | …/florida/medical-professionals/education/observerships |
| University of Colorado Hospital | …/visiting-students |
| University of Washington Medical Center | …/visiting-students |

**LIVE_ROW_NEEDS_REVERIFY** (95 rows) — examples:

| Live listing | Source URL (hospital homepage / generic) |
|---|---|
| Mount Sinai Hospital | mountsinai.org/about/international/programs |
| Montefiore / Albert Einstein | montefioreeinstein.org/education/gme |
| NewYork-Presbyterian / Columbia | nyp.org/ |
| Maimonides Medical Center | (FAILED_FETCH — URL dead) |
| Tufts Medical Center | (HOLD_REVIEW — weak quote) |

**LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK** (72 rows) — examples:

| Live listing | Source URL (not USCE-specific) |
|---|---|
| Various hospital homepages, GME landing pages, and patient portals |

Full per-listing decisions: `exports/live_listings_crosswalk.json` and `exports/live_listings_crosswalk_summary.md`.

---

## 5. Preview surface state

| | Before this sprint | After |
|---|---:|---:|
| Preview rows visible at `/usce/verified-preview` | 29 | **61** |
| Of which from reviewer-approved snapshot | 13 | 13 |
| Of which from exact-link seed (Batch 1+2 + live URLs) | 14 | 46 |
| Of which from intelligent gate | 2 | 2 |
| Filter validation | passes | passes |

---

## 6. Validator + build status

```
P102 exact-seed validator: 21/21 PASS
P102 intelligent rows validator: 19/19 PASS
tsc --noEmit: clean
validate-no-secrets: 0 findings across 6439 files
```

`npm run build`: not run (deferred per sprint scope; tsc + dev server cover the working state).

---

## 7. New artifacts

| File | Purpose |
|---|---|
| `docs/.../p102/P102_LIVE_SITE_CROSSCHECK.md` | Live ↔ preview field/copy/badge comparison |
| `docs/.../p102/P102_LIVE_DATA_CROSSWALK.md` | Where the 304 live listings come from + schema map |
| `docs/.../p102/queues/p102_live_existing_source_links_seed.csv` | 206 live source URLs as seed rows |
| `docs/.../p102/exports/live_listings_crosswalk.json` | Per-live-listing decision (all 206) |
| `docs/.../p102/exports/live_listings_crosswalk_summary.md` | Human-readable decision summary |
| `scripts/p102-build-live-listings-crosswalk.ts` | Crosswalk builder (reads runner output + data.js + verified-links) |
| this report | Phase G summary |

---

## 8. Key findings

### Finding 1 — Most live source URLs do not survive direct-link validation
**81% of live listings** (167 of 206: 95 reverify + 72 hide) have URLs that today are either dead, point at a hospital homepage, or point at a non-USCE-specific page. The "Verified link" badge on the live site is currently a statement about reachability, not about specificity. Reachability of `https://nyp.org/` does not prove anything about an observership program.

### Finding 2 — The operator's verified-links override list is the highest-confidence subset
The 47 `verified:true` entries in `prisma/verified-links.ts` are the operator's hand-validated URLs. These are the ones that consistently auto-promote through the runner. The remaining 160 listings rely on a `data.js` `program.link` that's often a generic page.

### Finding 3 — 33 live rows are ready to enrich today
Of the 206 live listings, 33 have a `MATCH_UPDATE_WITH_SOURCE_QUOTE` decision — meaning the runner produced a verbatim source quote that can immediately upgrade the existing live listing. **No new database table, no parallel universe — just enrich the existing rows.** That's the right migration path.

### Finding 4 — The preview should not become a separate product
The 14 `NEW_SOURCE_LINKED_ROW` rows from Batch 1+2 are real (Iowa, Vanderbilt, UVM, Rush, Brown, Keck, UCLA, Cleveland Clinic, MSK, Orlando, UAB, HSS, BMC, Fresno) but they're at institutions that don't yet have a live listing. The right path is to **add them as new live listings**, not to maintain a separate preview-only surface.

### Finding 5 — `REJECT_PATIENT_FACING` is the dominant failure mode
68 of the 139 rejections (49%) are `REJECT_PATIENT_FACING` — meaning the URL is a hospital homepage with patient-facing content (Find a Doctor, Make an Appointment, etc.) and no specific USCE language. This is honest classification — those URLs simply aren't USCE pages.

---

## 9. Recommendation

**Choice B + A: Upgrade existing `/browse` data locally with source quotes, then add more operator exact links.**

Concrete next steps (in order):

1. **Enrich the 33 MATCH_UPDATE rows locally first.** Add `sourceQuote`, `sourceHash`, `directLinkStatus`, `audienceClass`, and `lastSourceCheckAt` to those 33 Prisma rows. Do this in a local DB only — no production migration this sprint. This proves the enrichment data model.

2. **Build an admin "reverify" workflow for the 95 NEEDS_REVERIFY rows.** Each needs operator attention to supply a deeper URL. The existing admin UI at `/usce/verified-preview/admin/review` is the right surface — add a "live listing needs better URL" queue.

3. **Hide or downrank the 72 LIVE_ROW_SHOULD_HIDE rows in the local DB.** Set a flag like `sourceQualityDowngrade=true` and have the listing card render a "Source verification pending" state. Don't delete — the row may have value once the URL is fixed.

4. **Add 30-50 more operator-supplied exact links to the seed CSV.** Per Batch 2 finding: when the operator supplies a URL, it nearly always auto-promotes. Operator's manual research is the highest-yield input.

5. **Headless-browser fetch for Cloudflare-protected institutions** (Hopkins, Michigan, parts of NYU). Separate sprint.

**Choice E (continue extraction) is NOT recommended.** Broad URL guessing in Batch 2 returned 78% wrong. The corpus grows fastest from operator input, not from automated discovery.

---

## 10. What this sprint does NOT change

- No production DB mutation
- No Prisma schema migration
- No new production route
- No homepage / SEO / robots changes
- No deploy
- No push

The preview surface and the live site are both unchanged in production. All artifacts live under `docs/platform-v2/local/usce-discovery-command-center/p102/` and `scripts/p102-*.ts`. The work product is the **decision data and the path forward**, not a production change.

---

## 11. Deploy threshold (unchanged from prior reports)

The operator's stated bar for public deploy is 75-100 strong rows. Current path:

| Component | Rows |
|---|---:|
| Live listings worth keeping (MATCH_UPDATE_WITH_SOURCE_QUOTE) | 33 |
| New rows from Batch 1+2 seeds (NEW_SOURCE_LINKED_ROW) | 14 |
| Live listings recovered via operator-supplied better URLs (NEEDS_REVERIFY) | up to 95 |
| Genuinely Tier-3 / drop | 6 |
| **Path to 75-100** | enrich 33 + add operator's next 30-50 exact links + recover 20-30 reverify rows |

That's a 1-2 batch path, not 5-10. Crucially, all rows arrive with source quotes, audience classification, and direct-link validation — which is what the live site has been claiming but hasn't actually been enforcing.
