# Queue 4 — Candidate Generation Rules

## Selection rules

1. **Do not select random hospitals.** Every candidate must trace to a coverage gap, an audited high-yield pattern, or a sibling expansion of an already-validated row.
2. **Prefer official UME / visiting-student / elective / observership pages.** SOM-administered visiting-students offices are the strongest yield; followed by health-system GME pages.
3. **Prefer rows where the application method is likely to be clear.** VSLO-host institutions and SOM-Registrar-administered visiting student programs have the highest signal.
4. **Prefer state and system diversity.** Active runtime is currently 10 cards across 7 states (NJ / OH / CA / NC / NY / IN / PA / IL). Queue 4 should explicitly add states beyond those.
5. **Avoid overconcentration.** No more than 2 candidates per state per session unless the state has a specific gap (e.g. NY can carry both MSK + Bellevue because they're different lanes — academic vs public-safety-net).
6. **Use requeue / partial rows only if the blocker is solvable.** If a prior screening sprint marked a row `NEEDS_EVIDENCE_HARDENING`, only re-queue if a Wayback save or a per-site source can plausibly land the missing artifact.
7. **Use broad-IMG rows only if the source explicitly supports audience.** Default to LCME/AOA-only unless the source uses verbatim language like "international medical graduates" or "students from accredited international institutions" with eligibility criteria.
8. **Do not infer campus applicability from system pages.** A SOM page that lists "the system's affiliated hospitals" without per-site language goes into the staged candidate pool with a `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` caveat.
9. **Preserve future-lane findings, but do not count as USCE.** If a row turns out to be observership-only or research-only, mark it as a future-lane candidate and remove from the USCE staging path.
10. **Official / public source only.** No login-walled content. No CAPTCHA bypass. No automated FREIDA / ACGME / AAMC scraping.

## Scoring dimensions

Each Queue-4 row is scored on:

| Dimension | What it measures |
|-----------|------------------|
| Source clarity | Does the official URL exist? Is the page about visiting medical students specifically? |
| Audience clarity | Does the source language tell us US LCME/AOA only vs IMG-relevant vs Caribbean-eligible? |
| Application clarity | Is there a named application path (VSLO / SOM Registrar / mailto / form)? |
| Evidence availability | Can we get HTML + screenshot + Wayback + verbatim quote? |
| Public-copy risk | Is the institution's public brand more recognizable than the source's actual scope? (Brand-vs-source mismatch is a deferral signal.) |
| Geographic diversity | Does activating this row add a state we don't currently have? |
| Strategic value | Tier-1 AMC / large public safety-net / state-gap-fill? |
| Likelihood to become staged runtime | Realistic conversion probability from screened → bridge-validated → staged → active |
| Effort | Single SOM page = low; multi-site system page + per-site sources = high |

## Risk levels

- **LOW** — clear single-site source, audience explicit, application method explicit. Activates cleanly.
- **MEDIUM** — system-level source with explicit caveats; audience explicit but application method less so. Activatable with `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` framing.
- **HIGH** — brand-vs-source mismatch; partial source detail; multi-site system page with no per-site language. Defer until per-site source lands.

## Categorical priorities for this resume

| Priority | Description | Target row count in Queue 4 |
|----------|-------------|------------------------------|
| P0_FOR_STATE_GAP | 4 zero-coverage states (AK / ID / MT / WY) + 4 thin states with strong P0 candidates | 11 rows |
| P0_AMC_GAP | Top tier-1 AMCs missing from Q1-Q3 | 14 rows |
| P0_PUBLIC_SAFETY_NET | IMG-relevant large city safety-net systems | 7 rows |
| P0_SIBLING_EXPANSION | High-yield siblings of already-validated systems | 1 row |
| P1_*_GAP | Lower-priority but still defensible | 49 rows |
| P2_*_GAP | Backstop / future-session pool | 18 rows |
| **Total** | (mirrors the prior 100-row queue) | **100** |

Session 1 picks 25 of these — biased toward P0 priorities and state diversity.

## Output discipline

- Each Queue-4 row is a target, not a publication. The candidate file describes what to screen, not what is true.
- Each Session-1 row must be screenable in roughly the same time as a Q1/Q2/Q3 row (~5-15 minutes).
- Each row that yields a TIER_A_PLUS evidence triple must be promoted to a separate bridge-input artifact in a later sprint, not in this one.
- No Queue-4 row gets activated in this sprint. This sprint produces the queue, not the activation.
