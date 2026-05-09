# Missing Data Sources

**Date:** 2026-05-09
**Sprint:** P97-NATIONAL-SCREENING-SCOREBOARD-AND-QUEUE-4

---

## Inventory

| Source | Purpose | Risk | Source-of-truth or lead-source? | Currently available locally? | Action needed |
|--------|---------|------|----------------------------------|------------------------------|----------------|
| AAMC / VSLO host directory | Lead source for institutions accepting visiting students | VSLO host list is published only to enrolled students | LEAD (cannot be canonical because Q3a already had to re-fetch institution-by-institution) | NO | Future manual/legal harvest; not in this sprint |
| LCME accreditation roster | Universe of MD-granting medical schools | Static list updated annually | SOURCE-OF-TRUTH for "is this school LCME?" | NO (not in repo) | Future docs-only snapshot sprint |
| COCA accreditation roster | Universe of DO-granting medical schools | Static list updated annually | SOURCE-OF-TRUTH for "is this school COCA?" | NO | Future docs-only snapshot sprint |
| ACGME sponsoring institutions list | Lead for institutions with formal GME programs | ACGME ≠ USCE elective; do NOT use as truth source for visiting students | LEAD ONLY | PARTIALLY (some institution-level references in Q3) | Already accepted as lead source; no immediate gap |
| Hospital system pages | One per system; lists site-specific affiliates | Pages restructure frequently | LEAD then verify per site | YES (case-by-case in Q1-Q3 evidence captures) | None for Queue 4 build; will be needed for Queue 4 screening |
| State hospital association lists | Per-state hospital index | Restricted to membership in some states | LEAD only | NO | Future per-state thin-coverage sprint |
| Public academic medical center UME pages | Direct visiting-student source | Sites change URLs frequently; bot defenses common (Pitt SOM / NYC H+H confirmed in prior sprints) | SOURCE-OF-TRUTH per institution | YES via Q1-Q3 + first-pilot evidence captures | Continue per-institution as Queue 4 screens |
| Caribbean-school affiliated hospital lists (per school: SGU / Ross / AUC / Saba / MUA / All Saints / Avalon / etc.) | Critical for IMG/Caribbean lane | Each school's site is the only authoritative list | SOURCE-OF-TRUTH per school | NO | Per-school harvest in a future Caribbean denominator sprint |
| Official institution pages | Always primary source-of-truth | Static URL but content drifts | SOURCE-OF-TRUTH | YES (per-row in Q1-Q3 + workbench) | Continue |
| Wayback Machine archives | Time-stamped backup of source pages | Archive coverage is per-snapshot; some pages partially captured | SUPPORTING | YES (used in Batch 3 evidence + workbench) | Continue |
| NPPES dataset | Institution-name normalization only | Provider-level data; tangentially useful for canonicalizing institution names | LEAD ONLY | YES (already on Mac-local under docs/platform-v2/local/nppes/) | Already used; do NOT use as USCE truth source |
| CMS Hospital General Information | Lead for "all U.S. hospitals" denominator | Hospital ≠ USCE host | LEAD ONLY | YES (Mac-local docs/platform-v2/local/cms/) | Already used as a coarse universe |

## Future web/manual collection (TODO; NOT this sprint)

These are explicitly flagged as TODOs to avoid web-scraping in this sprint:

1. **AAMC member-institution snapshot** — manual: visit `aamc.org/about-us/members`, copy current member list. Not done.
2. **LCME current roster** — manual: visit `lcme.org/directory`. Not done.
3. **COCA current roster** — manual: visit AOA website. Not done.
4. **AAMC VSLO public-host catalog** — manual / legal review: VSLO is a closed system; what is publicly available is limited.
5. **Per-Caribbean-school affiliate list** — one school per future sprint. Not started.
6. **State hospital association indexes** — opportunistic per-state Queue 4 sweeps.

## What we did NOT do in this sprint

- Did NOT run a web-scraping sweep.
- Did NOT fetch AAMC/LCME/COCA roster pages.
- Did NOT fetch any Caribbean school's affiliate list.
- Did NOT introduce any new external data dependency.
- Did NOT modify any existing source-list file.

All Queue 4 candidate rows in this sprint are sourced from:
- Public coarse universe (AHA / CMS hospital list already in Mac-local).
- Coverage-gap analysis (states / systems known to be missing).
- General domain knowledge of major U.S. academic + public-hospital systems.

Each Queue 4 row will be source-verified institution-by-institution in a SEPARATE later screening sprint. **This sprint builds the queue list, not the verifications.**
