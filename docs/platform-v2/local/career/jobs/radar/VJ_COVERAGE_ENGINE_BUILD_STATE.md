# VJ Coverage Engine — Build State (2026-06-10)

Autonomous build toward ≥90% J-1/H-1B **physician** coverage. Status: **working end-to-end.**
Scope is physician-only (J-1-waiver physician spots + H-1B physician spots). Nothing published to the
live site (no `--promote`); nothing committed (awaiting operator go).

## What works now (the full chain, proven on real data)

The engine went from **0 real jobs ever surfaced** to, in one live run:

| Bucket | Count | What it is |
|---|---|---|
| `VISA_SIGNAL_ONLY` | **80** | VA physician openings carrying the statutory non-citizen-eligibility clause (USAJobs, no-key) |
| `SPONSOR_LEAD` | **73** | Real employer-direct physician openings at **known DOL H-1B sponsors** (Cleveland Clinic 40, AltaMed 24, MSK 9), posting visa-silent but employer documented as a sponsor |
| non-fixture `PUBLISH` | 0 | Honest empty state preserved — nothing auto-published |

All employer-direct or government. **No board scraping. No bot bypass.** gold 14/14, connector self-check
passing, tsc clean, 0 quote-validation failures, 0 secrets.

## The pipeline that produces it

```
DOL LCA data (repo)          ──▶  Phase B: sponsor universe (1,465 employers, ranked + scored)
                                          │
                                          ▼
employer careers page        ──▶  Phase C: ATS resolver (detect Workday/Greenhouse/iCIMS/Oracle,
                                          │              auto-extract the handle)
                                          ▼
                                  existing engine connectors pull REAL openings employer-direct
                                          │
                                          ▼
                                  clean → extractPhraseHits → classify → quote-gate
                                          │
                                  Phase D: sponsor-history fusion — a visa-silent posting from a
                                          known DOL sponsor is promoted NO_VISA_MENTION → SPONSOR_LEAD
                                          (DOL evidence cited, never a fabricated visa claim)
```

## Components (all runnable)

- **Phase B — `sponsor-universe.ts` + `build-sponsor-universe.ts`** (deterministic, no network)
  `npx tsx scripts/visa-job-radar/build-sponsor-universe.ts`
  → `sponsor-universe/sponsor_universe.json` + summary. 1,465 distinct sponsors, 1,230 J-1-eligible.
  **Concentration:** top 100 employers = ~50% of positions, top 250 = ~70%. So ~the top 500–700 + tail
  is the monitor set for ~90% of the *flow*.

- **Phase C — `ats-resolver.ts` + `probe-sponsor-ats.ts`**
  `npx tsx scripts/visa-job-radar/probe-sponsor-ats.ts`
  → `sponsor-universe/ats_reachability.md`. Detects ATS + extracts the handle from an employer's own
  careers page; reads postings two ways: a **no-auth JSON API** (Workday/Greenhouse/Lever/Ashby) or the
  **universal JSON-LD reader** (`schema.org/JobPosting` off iCIMS/Oracle/Taleo posting pages — the
  dominant healthcare ATSs that have NO public API). The JSON-LD reader is proven extract→map→engine→PUBLISH.
  Reachability of the top 22 sponsors (landing-page probe): ~27% clean API, ~18% JSON-LD, ~55% "unknown
  from landing" (mostly JS shells — true reachability is higher on inner pages).

- **Phase D — sponsor-history fusion** (`run.ts` `sponsorEnrich`)
  Promotes visa-silent physician postings from known DOL sponsors to `SPONSOR_LEAD` with cited DOL
  evidence. This is the answer to the negative-yield problem (employer ATS text rarely states visa intent).

- **Three sponsors graduated to the registry** (auto-resolved + CXS-verified 2026-06-10): Cleveland Clinic
  `ccf/wd1/clevelandcliniccareers` (~1,005 physician hits), UAMS `uasys/wd5/uams_all_careers` (~103), MSK
  `msk/wd108/mskcc_careers_primary` (~22 — the resolver found the wd108 datacenter a manual wd1 guess had
  422'd on).

- **Phase A — `repeat-rate.ts`** (the one validation still blocked)
  `npx tsx scripts/visa-job-radar/repeat-rate.ts`
  The whole 90% thesis rests on the year-over-year sponsor **repeat rate**. It **cannot** be computed from
  the repo's data — the DOL slice is a single combined snapshot (FY24 Q4 + FY25 Q3) with no per-record
  year tag. The analyzer is **built and ready**; it runs the moment the operator drops per-year physician
  employer lists into `sponsor-universe/by-year/` (instructions written there). DOL 403s automated
  fetches, so this is a manual download of the annual LCA files.

## Honest limits

- **"90%" is of the sponsored-job FLOW**, not every board listing. We surface known-sponsor openings +
  government eligibility; we do not and will not aggregate the boards.
- **`SPONSOR_LEAD` is a lead, not a guarantee** — the employer sponsors *some* physicians (DOL history);
  this specific role may not. Labeled as such, confidence LOW.
- **Repeat rate unvalidated** (Phase A blocked on data) — everything downstream is conditional on it.
- **ATS reachability** from a landing-page probe understates the truth (JS shells); the JSON-LD reader
  needs the posting/search pages, which is per-ATS work not yet built for iCIMS/Oracle.
- **MSK's Workday 422s** on its own quirk even with the right handle — per-tenant friction is real; some
  sponsors will resist employer-direct reach and stay leads-only.

## Next steps (in order)

1. **Operator: drop multi-year DOL physician employer lists** → run `repeat-rate.ts` → validate/refute the 90% thesis.
2. Build the **iCIMS/Oracle JSON-LD fetch path** (search page → posting pages → JSON-LD) so the dominant
   ATSs become live, not just detected.
3. Expand the registry from the **top ~250 sponsors** (auto-resolve their ATS, like the 3 added today).
4. Surface `SPONSOR_LEAD` + `VISA_SIGNAL_ONLY` to users as clearly-labeled tiers (a product decision).
5. 3RNET partnership for the J-1-tagged rural tail.
