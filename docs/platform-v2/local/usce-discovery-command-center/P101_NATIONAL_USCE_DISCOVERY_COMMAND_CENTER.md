# P101 — National USCE Discovery Command Center

**Reset date:** 2026-05-11
**Sprint:** P101-0 (5-institution proof)
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `f4207b1`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED

---

## 1. Main objective

Build the largest credible **official-source** USCE discovery engine. Systematically search every likely U.S. hospital / medical school / health system / academic medical center / children's hospital / VA affiliate / public hospital / clinic — state by state, institution by institution — toward **thousands++ source-linked USCE opportunities**.

The 304-listing DB-backed public site is **seed data**, not the final product. The 12-card noindex pilot is a **paused, no-growth artifact** of the old approach.

## 2. What counts as progress

- New institution packet created on disk with required schema fields.
- New official USCE source page found and quoted.
- Negative evidence recorded (NO_PUBLIC_USCE_LANE_FOUND with documented search terms + pages opened + stop condition).
- Existing classified row tier-corrected with new evidence.
- State / county / region coverage measurably increased.
- Universe ledger / next-institution queue expanded with documented sources.

## 3. What does NOT count as progress

- Noindex activation / staged runtime / static pilot expansion.
- Contact / report mapping.
- UI / homepage / nav / sitemap / SEO work.
- Validator-only work, except this sprint's discovery validator.
- Backend refactor / Prisma schema / DB migration / seed.
- "Another report folder" without packets.
- Bunch-checking many institutions in one report.

Anything in this list is **drift**. Hard-stop and write a `DRIFT WARNING` block.

## 4. Prior discovery state recovered (from repo, not memory)

| Artifact | Path | What it confirms |
|---|---|---|
| Maine Cumberland packets (P97 era) | `docs/platform-v2/local/p97-institution-packets/ME/Cumberland/` | Prior packet system; 2 institution packets exist (Maine Medical Center + Maine Track Tufts-MMC). |
| National screening scoreboard (Queue 4) | `docs/platform-v2/local/usce-completeness/national-screening-scoreboard-and-queue-4/` | 100-row Queue 4 candidate list, state-by-state scoreboard, 10-sprint plan. |
| Queue 4 candidate rows | `docs/platform-v2/local/usce-completeness/queue-4-national-screening-resume/queue_4_candidate_rows.csv` | 100 documented next-up institutions ranked. |
| Queue 4 Session 1 (ran) | `docs/platform-v2/local/usce-completeness/queue-4-session-1-screening/`, `-curator-pass/`, `-evidence-hardening/`, `-bridge-validation/` | Session 1 covered ~14 rows; only Vanderbilt + UCSF reached active runtime. |
| Queue 4 Session 2 | NOT YET STARTED — `Queue 4 ranks 26-50` per the 10-sprint plan |

**The next correct discovery lane** per the 10-sprint plan and the Queue 4 candidate row order is **Queue 4 Session 2 first 5: ranks 26-30** (UAMS / UAB / MedStar Washington / GW University / Howard University). See `p101_next_institution_queue.csv`.

## 5. No-growth static / noindex policy

The static noindex pilot at `src/data/usce/public-listings-pilot.generated.{json,ts}` is **paused / no-growth** as of the 2026-05-11 reset. No new staged batches. No new noindex activation slices. No new contact mapping. Folding-or-killing the noindex pipeline is its own future decision (currently parked).

If a future sprint touches the static pipeline, it must be explicitly authorized and is **not discovery work**. Discovery work writes to `docs/platform-v2/local/usce-discovery-command-center/` only.

## 6. One-website-at-a-time rule

**Two modes. Never mix.**

- **Mode 1 — Universe / ledger building.** Batch OK. Output limited to: institution name, city, state, official domain, institution_type, health_system, priority, why_selected, source_of_queue_decision, search_status. No audience / cost / visa / application / "confirmed USCE" claims.
- **Mode 2 — Evidence extraction.** **One institution at a time.** For each institution: search official domain, record pages opened + search terms tried + rejected pages, capture verbatim short quote if found, classify, write packet, **then** move to next.

**Sequential commit:** Packet N must exist on disk before Mode 2 work on institution N+1 begins.

## 7. Packet schema

Canonical schema in `p101_packet_schema.md`. Summary of hard requirements:

- `schemaVersion: "p101-0"`
- `institution`: name, aliases[], city, state, officialDomain, institutionType, healthSystem, sourceOfIdentity
- `searchProcess`: searchedAt, searchMode = `ONE_INSTITUTION_ONE_WEBSITE`, officialDomainsChecked[], searchTermsTried[], pagesOpened[], rejectedPages[{url, title, reason}], robotsOrAccessNotes, stopCondition
- `candidateFindings[]`: sourceUrl, pageTitle, sourcePageType, shortQuote (≤ 240 chars), quoteSupports[], audienceDecision, applicationDecision, costDecision, visaDecision, durationDecision, specialtyDecision, sourceScopeDecision, confidenceTier, classification, caveats[]
- `negativeEvidence`: noPublicUsceLaneReason, searchedTermsCount, openedPagesCount, strongNegativeEvidence, weakNegativeEvidence
- `finalClassification`, `finalTier`, `nextAction`, `plainEnglishSummary`, `driftCheck`

**No packet = no claim.**
**No verbatim quote = no audience/cost/visa/application claim.**

## 8. Classification & tier enums

See `p101_packet_schema.md` for the full enum tables. 13-value `finalClassification`, 5-value `finalTier`, 8-value `sourceScopeDecision`, 6-value `stopCondition`, 13-value `rejectedPageReason`.

## 9. Completion percentage system

Always report **two** percentages.

**A. Discovery Engine Completion %** — measures the national source-search machine.

| Range | Meaning |
|---|---|
| 0–10% | Scattered data, no command center |
| 10–20% | Command center exists, prior work recovered, packet schema exists |
| 20–30% | Repeatable one-institution packet workflow proven on 5–25 institutions |
| 30–40% | Multiple states have ledgers and packets |
| 40–50% | Hundreds of institutions searched/classified |
| 50–60% | Existing 304 triaged + several new states |
| 60–70% | 1,000+ institution packets or candidate source pages classified |
| 70–80% | Broad national high-priority universe searched with strong state coverage |
| 80–90% | Thousands of classified opportunities/candidates with trust tiers |
| 90–100% | Continuously updating national USCE discovery engine |

**B. Public V1 Readiness %** — measures user-facing launch readiness: safe public inventory, browse/search quality, trust labels, correction/report flow, mobile/browser QA, source freshness, launch blockers.

**Starting rough numbers (pre-P101-0):** Discovery Engine ~15%. Public V1 Readiness ~43%.

Do not inflate.

## 10. Drift warning rule

Before every institution, ask the one-question audit:

> Does this next action increase institution coverage, official-source evidence, packet count, classification quality, state-by-state progress, or national discovery coverage?

If **no** → stop and write:

```
DRIFT WARNING:
I am drifting away from national USCE discovery.
The drift is: [describe]
The next correct discovery action is: [exact next institution / official domain packet]
```

Do not continue until the correct discovery action is restored.

## 11. Five-institution proof lane (this sprint)

Per `p101_next_institution_queue.csv`, the 5 institutions for the P101-0 proof are Queue 4 Session-2 ranks 26-30:

1. UAMS Medical Center — Little Rock, AR — uams.edu — STATE_GAP_FILL_THIN
2. University of Alabama at Birmingham Hospital — Birmingham, AL — uabmedicine.org — STATE_GAP_FILL_THIN
3. MedStar Washington Hospital Center — Washington, DC — medstarwashington.org — STATE_GAP_FILL_THIN
4. George Washington University Hospital — Washington, DC — gwhospital.com — STATE_GAP_FILL_THIN
5. Howard University Hospital — Washington, DC — huhealthcare.com — STATE_GAP_FILL_THIN

After 5, **STOP** and write `P101_0_FIVE_INSTITUTION_PROOF_CHECKPOINT.md`. No automatic continuation.

## 12. Next exact institution queue

Maintained in `p101_next_institution_queue.csv`. First 5 are this sprint. Ranks 6-10 are queued for the next sprint (P101-1) if this proof succeeds.

## 13. Plain English summary

We lost focus on the original mission. The build became a hidden noindex preview with two-row activation cycles; the real product (DB-backed public USCEHub) and the discovery engine that should feed it both sat idle. This command center is the operating system that prevents that drift: every institution gets one packet, every claim gets a verbatim source quote, every "we found nothing" gets documented search evidence, and progress is measured by institutions searched — not by polished hidden cards.

This sprint proves the workflow on 5 institutions. If it works, we go to 10 next sprint, then state-batch, toward thousands.
