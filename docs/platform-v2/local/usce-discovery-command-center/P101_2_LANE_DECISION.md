# P101-2 Lane Decision

**Date:** 2026-05-11
**Question:** Are we continuing the documented national Queue 4 (ranks 41-65), or switching to a state-completion lane?

---

## Selected lane

**A. Continue Queue 4 ranks 41-65** (25 institutions).

## Why selected

The Queue 4 ranks 41-65 segment is **not** a famous-AMC cherry-pick. It is a deliberately mixed band:

| Category | Count | Examples |
|---|---|---|
| Public safety-net hospitals (highest IMG-relevance) | 6 | Bellevue NYC H+H, LAC+USC, Cook County Stroger, Parkland Dallas, Harborview Seattle, ZSFG SF, Boston Medical Center |
| Massachusetts AMC cluster (state-depth completion for MA) | 4 | Brigham · MGH · Tufts · BIDMC — covers all 4 main HMS-affiliated teaching hospitals |
| Illinois AMC cluster (state-depth, IL had only Northwestern) | 2 | UChicago Pritzker · Rush |
| PA depth (one P0 sibling + 3 P1 AMCs) | 4 | UPMC Presbyterian · UPMC Children's · Geisinger · Penn State Hershey |
| Michigan AMC cluster (3 new MI institutions; Michigan Medicine still bot-blocked) | 3 | Henry Ford · DMC/Wayne State · Beaumont Royal Oak |
| Indiana sibling expansion (IU Methodist is in active runtime) | 2 | IU University Hospital · Riley Children's |
| Ohio sibling expansion | 2 | UC Health West Chester · The Christ Hospital |
| NY safety-net + Brooklyn depth | 2 | Bellevue (counted above) + Maimonides; not double-counted |
| Jefferson PA sibling | 1 | Thomas Jefferson East Campus |
| Northwell + SUNY Downstate | 1 | Northwell North Shore |

This advances **state-by-state completeness** in MA (0 → 5), IL (1 → 3), PA (1 → 5), MI (1 → 4), IN (sibling expansion), NY (Manhattan + Brooklyn depth) — while also adding 6 public safety-net IMG-relevant lanes that don't exist in P101-0/P101-1 at all.

## Alternatives considered

### Alternative B: Complete California

CA currently has 6 P101 packets (UCSF, UCLA, UCSD, UC Davis, Stanford, Keck/USC). To "complete" CA would require ~10-15 more packets, mostly P2-P5 priority:

- Cedars-Sinai Medical Center
- Children's Hospital Los Angeles
- City of Hope
- Loma Linda University Medical Center
- UC Irvine Medical Center
- UC Riverside School of Medicine
- Scripps Health
- Sharp HealthCare
- ZSFG (Zuckerberg SF General — actually already in Queue 4 rank 48)
- LAC+USC (already in Queue 4 rank 44)
- Various community AMCs

**Why not selected:** ZSFG and LAC+USC are already in Queue 4 ranks 41-65 — so they get covered by the selected lane anyway. The remaining CA institutions are mostly P2-P5 priority (lower marginal yield) and would mean spending 25 packets on a single state when the queue-41-65 segment introduces 6 entirely new public safety-net lanes and completes Boston (MA was 0 packets).

### Alternative C: Complete DC

DC has 3 P101 packets (MedStar WHC, GW, Howard). To "complete" DC would require ~1-2 more (Sibley Memorial / MedStar Georgetown University Hospital). **Why not selected:** DC is essentially already complete; 1-2 more packets is not a 25-packet sprint.

### Alternative D: Switch to existing-304 DB triage

The 304 live DB listings have unknown link-verification status; many were never re-checked. **Why not selected:** This sprint is discovery-only. DB triage is a separate sprint type that touches the production data layer; the prompt explicitly forbids it.

## How this advances state-by-state / national discovery

| Axis | Before P101-2 | After P101-2 (if all 25 land) |
|---|---|---|
| States touched | 8 | likely 11-12 (adds MA, IL deepens, IN, OH; PA gets first-real-P101 packets) |
| Public safety-net hospitals in P101 | 0 | 6 |
| IMG-relevance density | 3 INTERNATIONAL_STUDENT_CONFIRMED | expect 6-10 INTERNATIONAL/IMG_GRAD lanes (safety-nets often accept IMG observers) |
| MA depth | 0 packets | 5 packets (Boston cluster) |
| IL depth | 0 P101 (Northwestern was P99-only) | 2-3 P101 packets |
| PA depth | 0 P101 (HUP was P99-only) | 4-5 P101 packets |

## Drift risk

The drift risk is **continuing-major-AMC-queue-forever** — eventually exhausting documented evidence and falling into memory-based picks. We mitigate by:

1. Using the documented Queue 4 candidate CSV (not memory) for all 25 selections.
2. Including 6 public safety-net hospitals (not AMCs) in the selection.
3. Logging the lane decision in writing so the next sprint (P101-3) starts from a recorded position.
4. After P101-2, the next sprint's lane decision must answer: "Should we continue Queue 4 ranks 66-100, or pivot to (a) state completion, (b) DB triage, (c) schema planning?" The expected answer post-P101-2 is **state completion** — because Queue 4 ranks 66-100 trail off into smaller community hospitals where state-completion gives higher marginal evidence value.

## Mitigation

- Two intermediate checkpoints (after 10, after 20) — chance to pause and pivot if quality degrades.
- One-question audit per institution: "Does this institution packet advance state-by-state completeness or public-safety-net IMG-relevance?"
- If 5+ institutions in a row return `NO_PUBLIC_USCE_LANE_FOUND`, pause and reconsider the lane mid-sprint.

## Plain English

We're searching the next 25 institutions in the documented national Queue 4. This batch is intentionally mixed: 6 public safety-net hospitals (highest IMG-relevance), 5 Boston hospitals (MA had zero coverage before), 2 Chicago hospitals (IL depth), 4 PA hospitals (PA depth), 3 MI hospitals, and a handful of sibling expansions. It's not a famous-AMC cherry-pick — it deliberately mixes high-yield AMCs with the safety-net lane that previously didn't exist in P101. After this block, the next decision should likely pivot toward state-completion for under-covered states or pivot to existing-304 DB triage.
