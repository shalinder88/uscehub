# Phase A — Sponsor repeat-rate: AWAITING DATA

The repeat rate cannot be computed from the repo's single combined DOL snapshot
(FY2024 Q4 + FY2025 Q3, no per-record year tag). To run this validation:

1. Download the annual LCA disclosure files (one per fiscal year, e.g. FY2022,
   FY2023, FY2024) from DOL OFLC: https://www.dol.gov/agencies/eta/foreign-labor/performance
   (manual download — the site 403s automated fetches).
2. Filter each to physician SOC codes (29-1210 family incl 29-1215/29-1216,
   29-122x, 29-124x surgeons).
3. Export each year as JSON to:
     /Users/shelly/usmle-platform/docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year/FY2022.json  (etc.)
   shape: [{"employer":"Mayo Clinic","positions":36}, ...]
4. Re-run: npx tsx scripts/visa-job-radar/repeat-rate.ts

The tool then reports the unweighted and position-weighted year-over-year repeat
rate. If the volume-weighted repeat is >=~80%, the >=90% coverage thesis is
validated: monitoring the known-sponsor universe captures most of next year's jobs.
