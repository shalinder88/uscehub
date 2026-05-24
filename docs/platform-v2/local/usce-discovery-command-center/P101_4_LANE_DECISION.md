# P101-4 — Lane Decision

**Date:** 2026-05-11
**Sprint:** P101-4 — Next 25-Institution Enhanced Discovery Block
**Pre-sprint HEAD:** `98c952c` (P101-3C committed locally, unpushed) · **Production main:** `739ab1e` — UNCHANGED

---

## 1. Selected lane

**Continue Queue 4 national ranks 70–95** with enhanced evidence + canonical T7 artifact capture at fetch time. Every new packet born enhanced; no PENDING_T7_BACKFILL placeholders.

## 2. Why selected

- The national queue 4 lane is the established discovery engine and has produced 40 packets across 15 states with predictable yield.
- Ranks 41–69 were processed in P101-2; the natural next block is 70–95 (next 25 ranks of the same queue).
- The enhanced-evidence layer (added in P101-3 and proven artifact-real in P101-3B) plus the canonical T7 root reconciled in P101-3C means this is the first sprint where new packets can be born enhanced from byte zero — that's the point at which a "next-25 with no retrofit" is finally cheap.
- The scoreboard records `next_exact_institution = Queue 4 rank 70 = Brooklyn Hospital Center` — explicit pre-positioned decision that this sprint executes.

## 3. Alternatives considered

| Option | Lane | Verdict |
|---|---|---|
| A | Continue Queue 4 ranks 70–95 (selected) | **Chosen** — natural continuation, queue-ranked, enhanced from byte zero |
| B | State-completion lane (fill out 1-packet states: AR, AL, TN, MO, GA, TX, WA) | Rejected — fewer institutions per state mean diminishing returns, and the 1-packet states already have their flagship AMC packet; backfilling smaller hospitals adds breadth without much IMG signal |
| C | Secondary-URL screenshot/PDF backfill | Rejected — this is true-cleanup work, deferred to a future sprint after enhanced coverage has more breadth |
| D | Existing 304 DB listing source-triage | Rejected — premature; the enhanced-packet inventory must reach a larger N before triaging the DB benefits from real comparisons |
| E | Manual-retry queue (Michigan, UCSF Fresno, WashU VSLO Global, Cook County PDF, UW central, LAC+USC observership) | Rejected as primary lane — these need targeted retry, not a fresh 25-block; they will continue to be addressed inline when natural sibling overlap occurs |

## 4. Why alternatives not selected

Option B (state completion) trades national breadth for state depth in places where IMG signal is already low. The 1-packet states' single packets are the flagship AMCs; sweeping their second-tier hospitals delivers less moat than continuing the national queue.

Option C (artifact backfill) is real cleanup work, but P101-3B already captured primary URLs for the 10 P101-3 retrofit packets. The 30 P101-2 packets still have placeholder hashes; those should be backfilled in a focused sprint once the enhanced layer has more breadth and the patterns have stabilized.

Option D (DB triage) is the long-term goal but premature: the enhanced packet inventory (10 enhanced + 25 from this sprint = 35) is still far short of the 304 active listings. Triage works better when the side-by-side ratio is closer to 1:1 or better.

Option E (manual retry) is addressed inline whenever the next-25 block surfaces a natural sibling or system overlap; pursuing it as a primary lane wastes the breadth opportunity.

## 5. How this advances national/state-by-state coverage

- Adds ~25 institutions across queue 4 ranks 70–95.
- Likely adds 3–5 new states (queue 4 tail crosses Ohio, Minnesota, Wisconsin, Colorado, Connecticut, Maryland, Virginia, North Carolina, Florida — none currently represented in P101 packets).
- Brings cumulative P101 packets from 40 → 65.
- Brings enhanced-evidence packets from 10 → 35 (cumulative).
- Brings real artifact-backed packets from 10 → up to 35 (every P101-4 packet must have real artifacts at capture time).

## 6. Drift risk

| Risk | Mitigation |
|---|---|
| Hitting bot-block walls (`hms.harvard.edu` family, Cleveland Clinic, Mayo) — logging users out of pages | Use the same WebFetch + cleaned-text discipline as P101-3B; if bot-blocked, classify as `BOT_BLOCKED_MANUAL_RETRY` with explicit reason — do not bypass |
| Temptation to thin-packet to hit 25 | Drift warning trigger; every packet must carry full fieldQuoteMap (35 fields) + opportunityTags + userFacingSummaryDraft + negativeEvidence + changeDetectionPrep |
| Temptation to write to legacy T7 root | Validator rejects with `T7_LEGACY_ROOT_PATH`/`T7_NON_CANONICAL_ROOT` |
| Temptation to push P101-3C without P101-4 | Plan is to push both commits together at the end after validators pass |
| Capacity: 25 enhanced packets is a large block; risk of stopping mid-block | Honor the 5 / 10 / 20 / 25 checkpoint discipline; if a real stopping signal appears, write the most recent checkpoint and stop honestly rather than ship partial enhanced packets |

## 7. Mitigation

- One institution at a time. No batching.
- Stop conditions: after 5, after 10, after 20, after 25. Each checkpoint is a written deliverable, not a comment line.
- Every packet must pass validator before moving to next sprint's deliverables.
- Canonical T7 root enforced by validator on every `cleanedTextPath` / `pdfPath` / `screenshotPath`.

## 8. Plain English

The job is to add 25 more institutions to USCEHub's evidence-backed inventory by continuing down the established national queue. P101-3 set up the enhanced schema. P101-3B proved the schema worked by saving real cleaned text and real cryptographic fingerprints of source pages on the T7 Shield drive. P101-3C moved that evidence to the correct project folder. P101-4 is the first sprint where new packets are born with all that machinery on day one — no retrofit, no placeholder hashes, every artifact directly under the canonical capsule.

If any packet fails for honest reasons (bot block, dead page, login wall), the packet records that reason explicitly. No fake data is permitted to hit 25. If the workflow stalls before 25, the most recent intermediate checkpoint becomes the stopping line and the remainder rolls into P101-5.
