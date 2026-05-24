# P102-0F — Deep Institutional Extraction Doctrine

schemaVersion: p102-deep-0f-1
date: 2026-05-14
status: ACTIVE
predecessor: P102-0E (commit `1b52992`, branch `local/p102-cli-extractor-orchestrator`)
branch: `local/p102-deep-institutional-extraction-mode`

## 1. Why P102-0F exists

P102-0E proved the Claude CLI extractor works **technically**: 4 institutions processed, 39 sources, 159 quote-verified claims, 0 rejected, A2 caught what A1 missed, zero hallucinated quotes, defense-in-depth holds end-to-end. The CLI flow (no API key, FDD pattern) is correct.

But "the extractor works" is not the same as "the extractor researches deeply." P102-0E behaves like a competent source-by-source claim reader. The USCEHub product requires that one institution-run produces a **full three-tier institutional intelligence packet** — like a slow, careful, high-IQ institutional researcher would write, not like a keyword scanner. We can run gold-set, state, or national only after that depth is demonstrable.

P102-0F upgrades P102-0E along three axes:

1. **Source-family completeness.** A0 deep mode discovers and accepts a broader set of institution-affiliated source families per run (within bounded budgets — still one institution at a time, still no broad crawl).
2. **Three-tier extraction.** A1/A2/A3 prompts emit findings tagged Tier 1 / Tier 2 / Tier 3 corresponding to the full USCEHub product backbone, not only USCE keywords.
3. **Completion validation.** A run is no longer "done" the moment it produces zero PUBLIC_SAFE_USCE — it must also report source-family coverage, tier coverage, negative evidence strength, scope conflicts, and A4 targeted recovery tasks.

## 2. One institution means complete institution intelligence

For a single institution, P102-0F extracts across all of:

- official hospital pages (homepage, about, contact)
- health-system pages (when the hospital is a campus)
- affiliated medical school pages (UME)
- GME office pages
- department / specialty education pages
- research education pages
- careers / provider careers / physician careers
- benefits / employee benefits pages
- visa / immigration / sponsorship language
- PDFs (handbooks, policies, application packets)
- volunteer / shadowing
- observership / externship
- clinical electives / away rotations / Sub-I
- residency / fellowship program pages
- faculty / attending / hospitalist jobs
- physician services / resources (only when officially linked from the institution)

We do **not** broaden into third-party aggregators. We do **not** fetch competitor sites. We do **not** crawl the open web. We work with what the institution itself publishes and links.

## 3. The three tiers

### Tier 1 — Pre-residency / USCE & Match

In scope for **PUBLIC_SAFE_USCE** when source-specific and quote-verified.

Concepts:
- observership (clinical / international / IMG / physician observer)
- externship
- clinical elective
- visiting medical student / VSLO / VSAS / "special student"
- away rotation
- Sub-I / acting internship / AI rotation / senior elective
- research elective / medical-student research / summer research
- shadowing / volunteer (medically relevant only — usually CAUTION_SAFE or HUMAN_REVIEW)
- IMG / international / offshore / Caribbean eligibility statements
- application process / pathway (VSLO, online form, email PDF, etc.)
- cost / fee / waiver
- duration / rotation length
- requirements (ECFMG, USMLE Step 1/2, immunizations, BLS, malpractice, background check)
- malpractice / professional liability statements
- visa / J-1 sponsorship statements for visiting students
- contact / coordinator / program director
- specialty / site list
- LOR / certificate / evaluation policies
- application windows / deadlines

### Tier 2 — Trainee / Residency & Fellowship

Default visibility: **FUTURE_LANE_ONLY**. Only ever PUBLIC_SAFE if the future USCE/Match lane is explicitly authorized.

Concepts:
- residency programs (categorical, preliminary, transitional)
- fellowship programs (ACGME-accredited)
- advanced fellowships / non-ACGME fellowships
- GME office and contact
- program list and specialties
- ERAS / NRMP / SF Match / FREIDA references
- ECFMG / J-1 / H-1B visa policy language
- IMG-friendliness / IMG language
- salary / benefits / stipend
- moonlighting policy
- research tracks
- fellowship pathways (after residency)
- coordinator contacts
- application route (ERAS, supplemental, in-house)
- board pass rate / procedure log / case log (only if officially stated)

### Tier 3 — Post-trainee / Practice & Career Life

Default visibility: **FUTURE_LANE_ONLY**. Eventually their own future lanes (jobs, visa, contracts, insurance).

Concepts:
- physician careers / provider careers
- faculty / attending / hospitalist / EM-attending / surgeon positions
- J-1 waiver / H-1B sponsorship signals
- benefits / total compensation language
- malpractice / professional liability resources
- disability / life insurance resources
- relocation / signing bonus
- loan repayment / student-loan benefits
- contract / legal / immigration resources (only if officially linked)
- credentialing / licensing
- locums / locum-tenens
- nonclinical physician roles
- compensation / partnership terms (only if explicitly stated by the institution)

## 4. Public visibility doctrine

Final visibility per claim is decided by the **deterministic re-classifier**, not the model. Rules:

| Condition | Final visibility |
|---|---|
| Tier == 1 AND source family ∈ {OBSERVERSHIP, EXTERNSHIP, ELECTIVE, VISITING_STUDENT, SUB_INTERNSHIP, RESEARCH_EDUCATION} AND source scope ∈ {INSTITUTION_SPECIFIC, CAMPUS_SPECIFIC} AND model confidence == HIGH AND quote-verified | `PUBLIC_SAFE_USCE` |
| Tier == 1 with USCE signal but ambiguous eligibility / scope / source family | `CAUTION_SAFE_INTERNAL_REVIEW` |
| Tier == 2 OR Tier == 3 | `FUTURE_LANE_ONLY` |
| Source family ∈ {GME, RESIDENCY, FELLOWSHIP, PHYSICIAN_CAREERS, FACULTY_JOBS, BENEFITS} (Tier 2/3 by family) regardless of model tier guess | `FUTURE_LANE_ONLY` |
| Source scope ∈ {HEALTH_SYSTEM_LEVEL, MEDICAL_SCHOOL_LEVEL} without campusApplicabilityProof | `HUMAN_REVIEW_REQUIRED` |
| VOLUNTEER_SHADOW family without USCE-relevant signal | `HUMAN_REVIEW_REQUIRED` |
| Explicit negative refusal sentence (`We do not accept observers`) on INSTITUTION_SPECIFIC scope + Tier 1 lane | `PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY` |
| Absence of USCE mention (silence) | NOT a negative claim. Either `CAUTION_SAFE_INTERNAL_REVIEW` or omitted. |
| Irrelevant page (no signal at all) | `HIDDEN_REJECTED` |

The model's tier suggestion and visibility suggestion are advisory. The script's classifier is authoritative.

## 5. Thoroughness standard

A deep-mode run is **not complete** simply because it found zero PUBLIC_SAFE_USCE. It must produce, for the institution:

1. **Source-family coverage report** — which families were searched, found, accepted, rejected, or absent-after-search. No silent omission.
2. **Tier-coverage status** — TIER_1_COVERAGE_COMPLETE / PARTIAL / WEAK; same for Tier 2 and Tier 3.
3. **Accepted-page list** with source family, scope, hash, and tier assignment.
4. **Rejected-page list** with reason (404, robots, off-domain, off-topic, budget-skipped).
5. **Missing source families** — families we expected to find but didn't, with the search attempts logged.
6. **Negative-evidence summary** — strength + scope of any explicit refusal sentences.
7. **Unresolveds** — concepts the cleaned text gestures at but does not resolve.
8. **A4 targeted recovery tasks** — narrow follow-ups, never broad re-reads.

Zero PUBLIC_SAFE_USCE with no source-family coverage report is **not** a complete run. The framework will refuse to mark the institution deep-complete.

## 6. No keyword scanning alone

The extractor must learn **conceptually**, not by regex:

- "student learner" can mean clinical education for any of: undergraduate medical students, visiting medical students, residents, or fellows. Tier depends on the audience the page actually names.
- "away rotation" is Tier 1 USCE.
- "acting internship" / "AI" is Tier 1 USCE (Sub-I).
- "special student" might be Tier 1 visiting student — verify in the audience sentence.
- "clinical observer" is Tier 1 observership.
- "volunteer" or "shadowing" can be USCE-adjacent but is **not** automatically USCE. Default HUMAN_REVIEW unless the page explicitly says "for medical students" or "for IMGs."
- "GME" is Tier 2 — never auto-USCE — even if the page mentions observership in a footer link.
- "careers" is Tier 3 — never auto-USCE — even if the page contains the word "student."
- A page that does not mention USCE is **silence**, not refusal.

## 7. Institution / campus scope discipline

- **System-level source** (e.g. `adventhealth.com`) cannot produce a campus-specific public claim unless the campus is explicitly named in the quote OR a `campusApplicabilityProof` field is supplied.
- **Medical-school source** (e.g. `hms.harvard.edu`) cannot automatically apply to a teaching hospital campus. UME content is its own lane.
- **Department source** cannot imply institution-wide eligibility. Departmental observership might be department-only.
- **Health-system career portal** content cannot be attributed to any one campus.

The deterministic re-classifier enforces this. Model output that violates it is downgraded.

## 8. Depth vs scale

Deep one-by-one extraction comes **before** national scale.

- A single slow, correct, complete institution packet > 100 shallow false packets.
- Gold-set (11 institutions) runs only after deep-mode produces a confident, validator-passing packet on at least one institution.
- State slice runs only after gold-set passes.
- National runs only after state-slice passes + explicit operator authorization.

P102-0F deliberately runs deep mode on **one** existing institution in this sprint. Other institutions remain on P102-0E output until deep mode is proven on that one.

## 9. What P102-0F does NOT do (still on hold)

- ❌ Run new institution fetches
- ❌ Run the gold set (11 institutions)
- ❌ Run a state slice
- ❌ Run national
- ❌ Public import / DB / schema / UI / SEO changes
- ❌ Push to production
- ❌ Open a PR
- ❌ Deploy
- ❌ Use `ANTHROPIC_API_KEY` or `@anthropic-ai/sdk`
- ❌ Run any Agent or subagent during A1/A2/A3
- ❌ Broad-crawl the open web
- ❌ Fetch competitor or aggregator sites
- ❌ Run multiple institutions in parallel during deep mode

## 10. What completes P102-0F

- Deep-mode CLI extractor flag wired and tested.
- One institution deep-run end-to-end with a `16_three_tier_institution_packet.json` artifact.
- Source-family coverage, tier coverage, negative evidence, scope conflicts, and A4 tasks all reported.
- 11 validators (plus new tier/coverage validators) pass.
- Single local commit on `local/p102-deep-institutional-extraction-mode`.
- No push, no PR, no deploy.
