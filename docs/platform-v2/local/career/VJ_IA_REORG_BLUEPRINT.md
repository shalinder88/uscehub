# VJ — Internal IA Reorganization & Feature Blueprint (/career)

**Status:** DRAFT FOR SIGN-OFF · docs-only · no code, no deploy, no push, no DB, no noindex change
**Date:** 2026-05-29
**Anchor:** branch `main` @ `99f8caa` (`page.tsx` carries uncommitted last-session relabels — superseded by §3)
**Owner:** Shelly. Consensus reached on three forks (see §0).

**Relationship to prior decisions (this doc EXTENDS, does not replace):**
- `POSITIONING_DECISION_VISA_JOBS.md` — defines the S1–S5 section model + "intelligence-not-inventory" + deferred monetization. **Binding.** This blueprint is the internal-IA + feature build that sits underneath it.
- `VJ_PRODUCT_SEPARATION_UX_PLAN.md` — defines the OUTER shell (root two-lane module VJ-F, /career header VJ-G, footer VJ-H). Independent workstream; this blueprint governs what lives *inside* /career.
- `VJ_E_INDEXABILITY_AUDIT.md` — 33 indexable / 6 HOLD. This blueprint flags two indexed pages whose copy that audit marked SAFE but is not (see §10).
- `nav/SCOPED_LANE_DECISION.md` — /career is a same-domain microsite; the 4 section-nav lanes are confirmed.

---

## §0 — Consensus locked

| Fork | Decision |
|---|---|
| Home minimalism | **4 lane doors + dull Attorneys/Employers + thin live Policy-Alerts strip.** Kill the two competing tile grids and the 28-link dump. |
| Build approach | **Full blueprint first, then build.** (This document.) |
| Net-new in v1 | **All four groups:** Visa completeness · Practice tools · Location intel · Protection guides. |

**"Home" in this doc = the `/career` landing page (`src/app/career/page.tsx`), the microsite front door — NOT `uscehub.com/` root.** The root two-lane module is VJ-F and is out of scope here.

---

## §1 — Inherited binding constraints (carry into every build phase)

1. **Intelligence, not inventory.** The Jobs lane is an eligibility-intelligence engine over public/verified data. **Never claim complete or >50% J-1 job coverage.** (positioning §4, §6; UX-plan hard rules)
2. **No monetization wired.** Insurance content = educational guide only, NO affiliate/lead-gen links. Employers/attorneys stay deferred (soft "contact / coming soon" CTAs). (positioning §5, §7)
3. **Noindex gate is sacred.** No `noindex` removal without explicit "go" in chat. New pages ship `noindex` until copy QA. (UX-plan §5)
4. **Every number sourced.** No figure without a cited public/official source. No scraping proprietary/gated datasets (ABA, GreatSchools, C2ER, PracticeLink/Indeed). (positioning §6; global no-scraping rule)
5. **No push / deploy / PR / DB / schema / seed.** Lettered phases run in one turn; checkpoint before anything irreversible.
6. **Disclaimers required** on legal/tax/insurance/visa-strategy content ("not legal/tax/financial advice").
7. **Keep the dull treatment** (`text-muted/70`) on Attorneys + For Employers. The one thing that already works.

---

## §2 — Why we're reorganizing (audit findings, condensed)

- **Home is two competing tile grids + a 28-link dump.** Salary appears 3×; map/tracker/timeline 2–3× each. Hero claims "Every number sourced… Every claim verified" while every figure is a hardcoded literal.
- **Honesty drift on indexed pages:** tracker titled "Real-Time," jobs count "Verified Positions" — both overstate hardcoded/aggregate data (§10).
- **Three disconnected job datasets, no dedup:** `jobs-search` reads ~50 manual jobs; landing count uses ~1,955 (incl. 1,905 DOL LCA signals); `[specialty]` pages hardcode their own lists; `sponsors` uses a 4th copy of DOL data.
- **3× pathway overlap:** greencard / citizenship / visa-journey re-cover the same EB ladder. `citizenship` is mislabeled (it's GC pathways, not naturalization).
- **Misfiled:** `waiver-problems` sits outside `/waiver/`; `credentialing` + `licensing` sit under Visa but are practice-readiness.
- **Confirmed non-issues:** `state-compare` is already a redirect to `compare-states` (not a real dupe). `hpsa-lookup`, `timeline`, `alerts`, `attorneys`, `sponsors` data are honest.
- **Content gaps (named by user, absent today):** O-1 visa · unified visa chooser · Southwest Border waiver · RVU calculator · transition-from-training · city cost-of-living · closest-airport tracker · school data · home/life/disability insurance.

---

## §3 — HOME (`/career` landing) — minimal

Replace the entire current `page.tsx` body with:

1. **Hero** — "Visa & Jobs" identity line, one honest subhead (drop "Every number sourced / Every claim verified" — it's false as written). One sentence on what the lane is.
2. **Four lane doors** (the only primary tiles): **J-1 Waiver · Visa & Immigration · Jobs · Offers & Practice.** Each = title + one-line "what's inside" + the 2–3 marquee tools it contains. These are the doors; everything else lives one click in.
3. **Policy Alerts strip** — thin, pulls the newest 3 from `policy-alerts-data.ts` (real, sourced). The lane's one genuinely live-ish element. "All alerts →" links into the Visa lane.
4. **Secondary (dull, kept):** Immigration Attorneys · For Employers — `text-muted/70`, below the doors, exactly as today.

**Removed:** the 3 "Live Data Previews" cards, the 5 "Focus Cards," the 28-link `<details>` dump, the employer banner section (folds into the dull secondary link).

---

## §4 — LANE 1: J-1 Waiver (subcategorized)

Lane landing (`/career/waiver`) reorganizes its cards into **named subgroups** instead of a flat 50-card wall + 5 quick-links:

- **Pathways** — `/waiver/pathways`. Covers Conrad 30, HHS, ARC (Appalachian), DRA (Delta), SCRC, VA. **ADD: Southwest Border Regional Commission** (user-named, absent). Decide also whether to name a generic IGA pathway.
- **Conrad 30 tools** — `/waiver/map` (interactive SVG) + `/waiver/tracker` (slot table). **These move OFF the home into this subgroup.**
- **By state** — top-by-slots + all-50 grid + `/waiver/[state]` detail pages (Florida etc. already exist). Keep per-state confidence tier.
- **Process & planning** — `/waiver/process` (forms/agencies; surface it — currently orphaned from the hub), `/waiver/timeline` (reverse-date calculator), `/waiver/hpsa-lookup` (honest HRSA hand-off).
- **When it goes wrong** — move `/career/waiver-problems` → `/career/waiver/problems` and link from the hub.

**Honesty fixes (this lane):** kill "Live fill status" (hub) and "Real-Time" (tracker title + H1) → "Estimated · last updated {date} · source 3RNET FY-pattern." Decide DC (data has 50 states, no DC, despite "+ DC" copy elsewhere).

---

## §5 — LANE 2: Visa & Immigration (subcategorized + the multi-visa tracker)

Lane landing (`/career/visa`) regroups its link cards into:

- **Nonimmigrant visas** — J-1 (overview), `/h1b`, `/h4-spouse`. **ADD: `/career/o1`** (entirely absent; user-named). Optional TN note.
- **Permanent residency** — `/greencard` (EB-1 / EB-2-NIW / EB-3 / PERM) + priority-date calculator; `/visa-bulletin` tracker. **MERGE `/citizenship` into `/greencard`** (it's mislabeled GC-pathway content that triples up with greencard + visa-journey) — or keep + rename "Permanent Residency" (open decision D2).
- **Decision & journey** — `/visa-journey` timeline + **NEW `/career/visa-chooser`** ("which visa paths may apply to me" — decision tree over existing pages; see §9-A). Strong "not legal advice / consult an attorney" framing.
- **Certification** — `/ecfmg` (cert gateway; keep here for now — open decision D3).
- **Policy alerts** — `/alerts` anchored here (home strip links in).

**Honesty fixes:** visa-bulletin "Updated monthly / verified May 2026" → match the true snapshot month (April 2026) or update the data. Reconcile greencard's inline backlog table ("8–12 yr") with `visa-bulletin-data.ts` WAIT_ESTIMATES ("12–15 yr") — single sourced number.

---

## §6 — LANE 3: Jobs (eligibility-intelligence engine — the "jobs engine")

**Reconciliation (important):** you asked for a "jobs engine." The binding positioning is "intelligence, not inventory — no >50% coverage claim." These reconcile as an **eligibility-first filtering engine** over public + verified data, with honest record-typing — not a scraped aggregator. Flag if you want to override toward a fuller board (that would reopen positioning §4).

- **One unified engine** at `/career/jobs`, filterable by **visa track (J-1 waiver / H-1B / green-card-OK / locums)** + specialty + state + HPSA + cap-exempt. (Exactly your "j1 / h1b / locums" framing.)
- **Honest record-typing (critical):** each row is tagged `live-posting` (verified employer-direct) vs `lca-sponsor-signal` (DOL LCA history). Signals render as "has sponsored before," never "open position." **Stop counting the 1,905 LCA rows as "verified positions."**
- **Unify the data:** `jobs-search` iterates the merged set (not just ~50); **dedupe** on employer+city+specialty; collapse the duplicate DOL encodings (`dol-jobs-data.ts` + `sponsor-data.ts` → one source). Make the headline count == the searchable count.
- **Fold `/sponsors`** in as the H-1B-signal view over the same data (open decision D4: keep standalone route noindex, or redirect to `jobs?track=h1b`).
- **Fix `/jobs/[specialty]`:** drive from the merged data + `SPECIALTY_META`, not separate hardcode; fix the dol.gov-as-"career page" mislabel; remove empty `searchLinks` cards.
- **Enforce `job-source-compliance.ts`** at render: safe / safe-with-attribution / avoid tiers; never display ToS-protected boards.
- **`/locums`** = the green-card/citizen track (guide; flagged J-1/H-1B can't do locums). **`/interview`** = adjacent support.
- **Remove the "$249/listing" CTA** still in `jobs-search` (monetization-before-traffic; we already removed the home one).

---

## §7 — LANE 4: Offers & Practice (subcategorized)

Lane landing (`/career/practice`) regroups its 8-card list into five subgroups:

- **Compensation** — `/salary` (already has the full RVU explainer), `/offers` comparison (**wire up the dead "RVU Target" field** to the new calculator), `/contract`, **NEW `/career/rvu-calculator`** (§9-B).
- **Money & risk** — `/taxes` (+ calculator), `/malpractice`, `/loan-repayment`.
- **Where to practice** — `/compare-states` (lib-backed COL/airports/climate/effective-salary), **NEW city cost-of-living**, **NEW closest-airport tracker**, **NEW school data** (§9-C).
- **Getting started** — **NEW transition-from-residency/fellowship** (§9-B), plus **MOVE `/credentialing` + `/licensing` here** (practice-readiness, currently misfiled under Visa).
- **Protection** — **NEW home/life/disability insurance guide** (§9-D), content-only, no affiliate wiring.

**Cleanup:** fix `compare-states` stale reverse cross-link (line ~451) that bounces to the `state-compare` redirect. Remove `offers` dead no-op code. Open decision D1: `compare-states` + `loan-repayment` are placed here, but positioning §3 filed them under S1 (Waiver) — recommend cross-link from Waiver rather than dual-home.

---

## §8 — Secondary (dull, kept)

- `/attorneys` — real firms, honest no-pay disclosure. Keep dull. (HOLD/noindex stays.)
- `/employers` (+ `/post`) — **soften the $249/$499/$999 pricing to "get notified / contact"** until a listings backend + traffic exist (positioning §5; ARCHITECTURE rule 5). Post-form's mailto mechanism is honest — keep. (HOLD/noindex stays.)
- `/community` — honest "coming soon." (HOLD/noindex stays.)

---

## §9 — Net-new features (v1 — all four groups)

Each ships `noindex` until copy QA; each carries its disclaimer; every number cites a public source.

**A. Visa completeness**
- `/career/o1` — O-1 extraordinary-ability guide for physicians (criteria, evidence, vs H-1B/J-1). Source: USCIS O-1 policy. Static content page like `/h1b`.
- `/career/visa-chooser` — decision tree over situation → *candidate* visa paths, linking to the relevant lane pages. **Recommends exploration, not a determination.** Prominent "not legal advice — consult an immigration attorney" banner.

**B. Practice tools**
- `/career/rvu-calculator` — deterministic: inputs (specialty, wRVU, conversion factor, comp model) → projected productivity comp. Uses the CMS CY2026 conversion factor ($33.40) + specialty wRVU benchmarks already in `/salary`. No external data; all formula. Wire `/offers` "RVU Target" into it.
- `/career/transition` — residency/fellowship → attending transition guide (final-year timeline crossing licensing → credentialing → first offer → finances). Links across all four lanes.

**C. Location intel** (data-provenance is the gating risk — see §11)
- City cost-of-living — **public sources only** (Census ACS median rent/income, BLS regional CPI). Label clearly; if a true city COL index requires a licensed dataset, ship a sourced approximation + disclosure, do NOT scrape Numbeo/C2ER.
- Closest-airport tracker — **OurAirports public-domain dataset** + FAA; distance from city lat/long. Clean, fully sourceable.
- School data — **NCES public-domain only** (Common Core of Data for public; Private School Universe Survey for private). No GreatSchools ratings (proprietary). Present counts/locations, not scraped ratings.

**D. Protection guides**
- `/career/insurance` — home / life / disability insurance primer for new attendings (own-occupation disability, term vs whole, umbrella). **Educational only — no affiliate links, no quotes** (monetization deferred). "Not financial/insurance advice."

---

## §10 — Cross-cutting honesty / relabeling pass (do this regardless)

These are **already indexed** (live SEO) and overstate the data:

| Page | Current (indexed) | Truth | Fix |
|---|---|---|---|
| `/waiver/tracker` | title "…Real-Time Waiver Availability"; H1 "Real-time tracking" | hardcoded estimates, `lastUpdated 2026-03-25`, "based on 3RNET FY2024 patterns" | "Estimated slot status · updated {date}" |
| `/waiver` hub | card "Live fill status for all 50 states" | same hand-maintained data | "Estimated fill status" |
| `/career/jobs` | title "Verified Positions"; count ~1,955 | 1,905 are LCA signals, not openings | count only verified live postings; label signals separately |
| `/career` hero | "Every number sourced… Every claim verified" | all hardcoded literals | drop the claim (§3) |
| `/visa-bulletin` | "Updated monthly / verified May 2026" | April 2026 snapshot | match true month |

---

## §11 — Data provenance rules (net-new)

- **Public-domain / official only:** Census ACS, BLS, NCES (CCD + PSS), OurAirports, FAA, CMS, USCIS, HRSA, DOL LCA.
- **Never scrape / never store:** GreatSchools, Numbeo, C2ER, Zillow, PracticeLink/PracticeMatch/Indeed (ToS), proprietary COL indices.
- Each net-new dataset gets a `// Source: … (public domain), retrieved {date}` header and an on-page "About this data" note, matching `/sponsors`' honest posture.
- City COL is the weakest public source — if we can't source it cleanly, ship state-level (already in `state-comparison-data.ts`) + a flagged "city detail coming" rather than a fabricated index.

---

## §12 — Disclaimers matrix

| Content | Disclaimer |
|---|---|
| visa-chooser, o1, any visa-strategy | "Not legal advice — consult a licensed immigration attorney." |
| taxes, rvu-calculator, salary, insurance | "Estimates only — not tax/financial advice." |
| malpractice, contract | "Educational — not legal/insurance advice." |
| school/COL/airport | "Sourced from public data, {provider} {date} — verify before relying." |

---

## §13 — Build sequencing (proposed; sign off before any code)

> "Full blueprint then build" = this doc, then phases. Each phase: TypeScript clean + preview walk (before/after screenshots) before moving on. No push between phases unless you say "push."

- **R0 — Honesty pass** (§10). Lowest-risk, highest-trust. Relabel indexed overclaims. No structure change.
- **R1 — Home minimalization** (§3). 4 doors + dull secondary + alerts strip.
- **R2 — Jobs engine** (§6). Your stated priority build: unify data, dedup, record-typing, fold sponsors, fix [specialty], remove $249 CTA.
- **R3 — Lane regrouping** (§4, §5, §7 subgroups; move waiver-problems, credentialing, licensing; merge citizenship per D2).
- **R4 — Net-new content pages** (§9-A o1, visa-chooser; §9-B rvu-calculator, transition; §9-D insurance). Content + formula only.
- **R5 — Location intel** (§9-C). Data-acquisition first (provenance per §11), then UI. Highest data risk — last.
- **R6 — Copy QA + canonicals + disclaimers** (§11, §12) across all new/changed pages. Then (separate "go") noindex/sitemap per VJ-E gate.

---

## §14 — Hard rules carried forward

No push · no deploy · no PR · no DB/schema/seed · no noindex removal without explicit "go" · no monetization wiring · no >50% job-coverage claim · no scraping gated sources · read before edit · zero gratuitous comments · no emojis · checkpoint before irreversible steps.

---

## §15 — Open decisions (resolve before R3+)

- **D1** — `compare-states` + `loan-repayment`: home them in Offers & Practice (this doc) or Waiver (positioning §3)? *Rec: Offers & Practice, cross-link from Waiver.*
- **D2** — `citizenship`: merge into `greencard` or keep + rename "Permanent Residency"? *Rec: merge (kills 3× overlap).*
- **D3** — `ecfmg`: stay in Visa lane, or move to a residency/exam surface? *Rec: stay for now.*
- **D4** — `sponsors`: fold into jobs engine and keep route noindex, or redirect to `jobs?track=h1b`? *Rec: fold data, keep route as the noindex H-1B view.*
- **D5** — Jobs framing: accept "eligibility-intelligence engine, no >50% coverage" reconciliation (§6)? *Rec: yes — it satisfies "engine" without breaking positioning.*
- **D6** — DC in waiver data (50 states only today)?
- **D7** — Employers pricing: soften to "get notified" now (§8)? *Rec: yes.*

---

## §16 — Phase checklist

- [ ] Sign-off on §3–§9 mapping + §15 decisions
- [ ] R0 honesty pass
- [ ] R1 home minimalization
- [ ] R2 jobs engine
- [ ] R3 lane regrouping
- [ ] R4 net-new content pages
- [ ] R5 location intel
- [ ] R6 copy QA + canonicals + disclaimers (then VJ-E gate, separate go)
