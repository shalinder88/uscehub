# P99 ↔ P97 Pilot Data Bridge Audit

**Audit date:** 2026-05-07
**Scope:** Define the contract by which P97-source-verified rows can eventually flow into the P99 pilot product runtime data pipeline without bypassing the promotion script, validators, noindex/pilot copy, save/compare/export/report flows, or public safety gates.
**Status:** Docs/audit only. No import. No runtime data mutation. No public copy change. No promotion. No deploy.

---

## 0. Repo split note (read first)

P99 and P97 currently live in two separate working copies that have diverged from a shared ancestor:

| Lane | Path | HEAD | Latest work |
|------|------|------|-------------|
| P99 product | `/Users/shelly/usmle-platform` | `383930b` | P99-5 release hardening |
| P97 evidence | `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02` | `418590d` | P97 promotion-readiness audit 1 |

The Mac-local P99 copy carries a `README_FROZEN_INTERNAL_COPY.md` (dated 2026-05-02) that says active work is on T7. That note is **stale** for the P99 lane: P98-0 → P99-5 commits were authored in the Mac-local copy after the freeze date and that's where P99 work has continued. The T7 copy carries P97 commits that the Mac-local copy does not have. Reconciling the two copies is **out of scope** for this bridge audit — the audit assumes both copies remain authoritative for their respective lanes until a future ops pass merges them.

This bridge audit lands in the **Mac-local P99 copy** (per user's stated path). Cross-references to P97 artifacts use absolute T7 paths.

---

## 1. Current P99 product state

**Pilot route:** `/clerkships/maine` — noindex, follow=false, canonical set, "Pilot · Maine" badge.

**Runtime data path:**
- Reviewed source: `docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json` (internal)
- Generated runtime: `src/data/usce/public-listings.generated.json` (and `.ts` mirror) — **only entry point** that the React UI imports
- Promotion script: `scripts/usce-data/promote-reviewed-usce-data.ts`
- TypeScript wrapper: `src/lib/usce-maine-data.ts` — typed `UsceCard`, runtime guard against non-public buckets

**Cards in runtime today:** 12 (7 `READY_PUBLIC_IMG_RELEVANT` + 5 `READY_PUBLIC_US_STUDENT_ONLY`).

**Runtime allow-list (21 fields, enforced by promotion script):**
`listing_id, institution_name, campus_name, state, county, specialty, opportunity_type, source_page_type, listing_role, display_bucket, eligible_audiences, excluded_audiences, unknown_audiences, restriction_tags, fit_warnings, audience_detail, application_url, official_source_url, source_status, last_reviewed_at` (`audience_detail` is a 4-key object).

**Forbidden substrings in any runtime key (enforced):**
`npi, ccn, cms, nppes, aamc, nrmp, acgme, nucc, completeness_score, max_possible_score, identity_status, unknown_fields`

**Forbidden bucket assignments:**
- Anything that is not `READY_PUBLIC_IMG_RELEVANT` or `READY_PUBLIC_US_STUDENT_ONLY`
- `POLICY_HUB` source pages assigned `PUBLIC_OPPORTUNITY` listing role
- `NEEDS_REVIEW`, `SUPPORTING_SOURCE_ONLY` ever entering runtime

**Validators (5, all PASS at audit time):**
1. `scripts/usce-data/validate-public-runtime-data.ts` — runtime data shape + bucket + forbidden field + source-fidelity
2. `scripts/validate-usce-public-cards.ts` — UI card hard gates + tsc
3. `scripts/validate-usce-save-compare.ts` — localStorage = listing_id array only; save/compare hard gates; export field clean; compare cap=4
4. `scripts/validate-usce-report-intake.ts` — local report model PHI-clean; export field clean; privacy copy present
5. `scripts/validate-usce-pilot-release.ts` — forbidden language clean; pilot/local-only copy; noindex set; localStorage resilience; a11y

**Save/compare/export/report flow:** localStorage stores `listing_id[]` only (no full payloads); report-issue model is local-only with no server submission, no PHI fields; export JSON/CSV stripped to known field set.

**SEO/indexation:** noindex on the pilot route; no public surfacing of NEEDS_REVIEW or SUPPORTING_SOURCE_ONLY content; sitemap should not list the pilot route.

## 2. Current P97 evidence state

**Branch (T7 active):** `local/p97-discovery-integrity-guardrails` at `418590d`.

**Discovery corpus:** Q1 + Q2 + Q3 complete (373 institutions processed). High-yield workbench refreshed; source-capture layer refreshed; first gated import-readiness triage exists with 25 selected rows.

**Source-capture batches:**
- Batch 1 (`8ad492c`): 6 institutions captured.
- Batch 2 (`daa49bd`): 7 institutions captured.
- Cumulative: 13 of 25 first-batch rows have primary-source evidence at row level.
- All 13 batched rows currently have `screenshotProduced=NO` (capture via WebFetch + search-result snippets only — interactive browser-screenshot pass still required).

**Visa forward corrections:**
- Hemet Global (`ea6bfd2`): full reversal — NO J-1, NO H-1B, NO F-1 OPT per FREIDA primary source.
- Saint Elizabeths (`517afdc`): partial — J-1 only retained; H-1B claim struck.

**Promotion-readiness audit 1 (`418590d`):** **0 of 25 first-batch rows are HUMAN_REVIEW_READY.** Distribution:
- 9 NEEDS_SOURCE_RECHECK
- 6 NEEDS_AUDIENCE_CARVEOUT
- 5 NEEDS_APPLICATION_METHOD_REVIEW
- 2 NEEDS_COST_COPY_REVIEW
- 2 DEFER_PUBLIC_UNSAFE (TJUH 100, Hemet 167)
- 1 NEEDS_VISA_COPY_REVIEW (Saint Elizabeths 172)

**Packet schema (rich, internal):** `dedupeKey`, `tier`, `yieldTier`, `sourceProofScore`, `sourceUrls[]`, `sourceEvidenceShort`, `audienceMatrix`, `applicationMethod`, `eligibilityRestrictions{}`, `audienceExclusionEvidence`, `importReadiness`, `manualReferenceUsed/Source/Purpose/DerivedConclusion`, `publicSourceFollowupRequired/Url`, `reviewerSelfAudit`, `notes`.

**Authoritative current state:** No P97 row is authorized for public import. Even rows with substantively clean evidence (e.g., Queens Hospital Center, Elmhurst residency) carry blockers (missing browser screenshot, application-method gap, or audience carveout).

## 3. Why P97 rows must not bypass the P99 promotion script

The P99 promotion script is the **only** mechanism that:

1. **Scopes runtime fields.** Strips a 21-field allow-list from a richer reviewed-source schema. P97 packet JSONs carry 30+ internal-only fields (audit trail, manual references, reviewer self-audit, FREIDA notes, dedupe keys). Any direct-into-runtime path would smuggle those fields onto the wire.

2. **Enforces bucket discipline.** Rejects `NEEDS_REVIEW`, `SUPPORTING_SOURCE_ONLY`, `POLICY_HUB` opportunity cards. P97's promotion-readiness audit is the upstream version of the same gate but with finer-grained categories (`DEFER_PUBLIC_UNSAFE`, `NEEDS_VISA_COPY_REVIEW`, etc.). Those categories must collapse to P99 buckets through the promotion script, not through ad-hoc UI logic.

3. **Enforces forbidden field substrings.** `npi/ccn/cms/nppes/aamc/nrmp/acgme/nucc/completeness_score` cannot appear in any runtime key. P97 references FREIDA program IDs, dedupeKeys with raw institution slugs, and (in earlier discovery work) NPPES/CCN identifiers. The script's forbidden-substring scan is non-negotiable.

4. **Enforces audience coherence at gate time.** IMG bucket cards must have explicit international/IMG eligibility; US-only bucket cards must have explicit exclusion signals or VSLO restriction tag. P97's `audienceMatrix` uses different enum vocabulary (e.g., `STRONG_POSITIVE_J1_H1B_VISA_SPONSORSHIP_RESIDENCY`, `POSITIVE_J1_ONLY_VISA_SPONSORSHIP_RESIDENCY_H1B_NOT_VERIFIED_AT_PRIMARY_SOURCE`); the bridge must translate to P99's `ELIGIBLE_EXPLICIT / EXCLUDED_EXPLICIT / UNKNOWN_NOT_STATED / ONLY_IF_AFFILIATED / ONLY_IF_LCME_COCA` vocabulary at one place.

5. **Enforces validator alignment.** All 5 P99 validators (runtime, public-cards, save-compare, report-intake, pilot-release) presume the runtime file shape produced by the promotion script. Any direct write to `public-listings.generated.json` would trip source-fidelity / count / bucket gates and fail validation.

6. **Enforces source-traceability invariant.** The promotion script reads from one named reviewed source file (`public_listing_cards_preview_v2.json`) and writes to one named runtime file. Any P97-direct path would break the single-source-of-truth contract that the runtime validator's source-fidelity check depends on.

**Therefore:** P97 rows must enter runtime only via a NEW upstream stage that produces or merges into `public_listing_cards_preview_v2.json` (or a renamed successor). The promotion script and runtime validator stay unchanged in their hard-gate logic; their input grows.

## 4. Required fields for a future P97 → P99 reviewed-input row

A P97 row may be promoted to a P99 reviewed-input candidate row only if all of these are true at audit-of-the-row time:

| # | Required | Source | How verified |
|---|----------|--------|--------------|
| 1 | `sourceProofScore = 5` | P97 packet | Read from packet |
| 2 | `manualReferenceUsed` is consistent with `audienceMatrix` (no third-party-only visa claims) | P97 packet | Hemet/Saint Elizabeths lessons applied |
| 3 | `importReadiness` ≠ `PENDING_PROMOTION_GATE_VISA_CORRECTION_BLOCKED` | P97 packet | String compare |
| 4 | Source-capture batch row exists with `captureStatus` ∈ {`CAPTURED_VIA_FETCH`, `CAPTURED_VIA_FREIDA_FETCH`, `PARTIAL_CONTRADICTION_FORWARD_CORRECTED`} | source-capture-batch-N manifest | Cross-ref by queueRank |
| 5 | Browser screenshot exists at `screenshots/<filename>.png` AND Wayback archive URL is recorded | source-capture-batch-N manifest | File exists; archive URL present |
| 6 | promotion-readiness audit decision ∈ {`HUMAN_REVIEW_READY`} | promotion-readiness-audit-N matrix | String compare |
| 7 | Public-copy guardrails CSV row exists (forbiddenClaims, mandatoryCaveats, sourceQuoteRequiredVerbatim) | source-capture-batch-N public_copy_guardrails.csv | Cross-ref by queueRank |
| 8 | Audience scope is interpretable in P99 vocabulary (no irreducible carveouts that the 21-field shape cannot represent) | bridge-side translator | See section 7 |

Any row missing any of (1)–(8) stays internal — P99 runtime never sees it.

## 5. Fields that must be stripped before runtime

These P97 packet fields are **internal only** and must never appear on the wire:

- `dedupeKey` — contains raw institution slug + state + county that some downstream systems treat as quasi-PII for entity resolution.
- `tier`, `yieldTier`, `yieldScore` — internal ranking signals; can mislead public copy if surfaced.
- `sourceProofScore` — internal QA signal; not a user-facing concept.
- `sourceEvidenceShort` (free-text, multi-paragraph) — contains capture-process narrative and quotation context that belong in audit logs, not on cards.
- `audienceExclusionEvidence` (multi-paragraph) — same reason.
- `audienceMatrix` (raw enums like `STRONG_POSITIVE_J1_H1B_VISA_SPONSORSHIP_RESIDENCY`) — narrative enum vocabulary; replaced by the 4-key `audience_detail` object.
- `eligibilityRestrictions` (nested, schema varies per packet) — narrative; replaced by `restriction_tags` + `fit_warnings`.
- `manualReferenceUsed`, `manualReferenceSource`, `manualReferencePurpose`, `manualReferenceDerivedConclusion` — audit trail only.
- `reviewerSelfAudit` — audit trail only.
- `notes` (free-text) — audit trail only.
- `publicSourceFollowupRequired`, `publicSourceFollowupUrl` — internal capture queue, not user-facing.
- `applicationMethod` (raw enum like `DIRECT_EXTERNSHIP_FOR_VISITING_OR_GW_HOWARD_AFFILIATION`) — narrative enum; the user-visible mapping is `application_url` + a short caveat string in `restriction_tags` if applicable.
- Any FREIDA program ID, ACGME ID, NPPES NPI, CMS CCN — forbidden by the runtime validator's substring scan and must be stripped at the bridge stage.

## 6. Fields that must remain internal only (audit / reviewer use)

In addition to section 5 stripping, these audit artifacts must never be referenced from any source/runtime card:

- Source-capture screenshot file paths — internal evidence trail.
- Wayback archive URLs — citable on demand by reviewers, but not embedded in user-facing cards.
- Forward-correction commit SHAs (`ea6bfd2`, `517afdc`, etc.) — audit trail.
- Promotion-readiness audit matrix paths — audit trail.
- Reviewer notes ("Mayo blocks WebFetch", "interactive screenshot session required") — audit trail.
- packetPath — file system reference; do not include in runtime card.

The schema proposal at [p97_to_p99_reviewed_input_schema_PROPOSAL.csv](p97_to_p99_reviewed_input_schema_PROPOSAL.csv) marks each field's `internalOnly` and `stripBeforeRuntime` flags.

## 7. Audience / visa / cost / application caveat mapping

This is the load-bearing translation layer. P97's vocabulary is narrative; P99's is enumerated. Each P97 row's promotion-readiness audit decision must produce both (a) a P99 `audience_detail` 4-key object and (b) `restriction_tags` + `fit_warnings`.

### 7.1 Audience matrix → audience_detail

| P97 audienceMatrix value | P99 audience_detail mapping |
|---|---|
| `STRONG_POSITIVE_*` for an audience | `ELIGIBLE_EXPLICIT` |
| `POSITIVE_*` for an audience | `ELIGIBLE_EXPLICIT` if source quote uses unambiguous accept language; otherwise `UNKNOWN_NOT_STATED` |
| `ELIGIBLE_VIA_*` (e.g., `ELIGIBLE_VIA_GW_HOWARD_OR_DIRECT_EXTERNSHIP`) | `ONLY_IF_AFFILIATED` + audit-time check that the named affiliations match the audience |
| `ELIGIBLE_BUT_NO_VISA_SPONSORSHIP_REQUIRES_PRIOR_US_WORK_AUTHORIZATION` | `ELIGIBLE_EXPLICIT` for `img_graduate` audience BUT `restriction_tags += "VISA_NO_SPONSORSHIP"` AND `fit_warnings += "VISA_NO_SPONSORSHIP"` |
| `UNKNOWN_NOT_PUBLICLY_DOCUMENTED` | `UNKNOWN_NOT_STATED` |
| `EXCLUDED_*` or `LCME_AOA_ONLY` | `EXCLUDED_EXPLICIT` for non-LCME-AOA audiences; `restriction_tags += "IMG_EXCLUDED"` |

### 7.2 Visa policy → restriction_tags / fit_warnings

| P97 evidence | P99 representation |
|---|---|
| `J1` only (e.g., Saint Elizabeths post-correction) | `restriction_tags += "VISA_J1_ONLY"` AND `fit_warnings += "H1B_NOT_OFFERED"` |
| `J1 + H1B + F1_OPT` (e.g., Elmhurst per FREIDA) | No special tag; `audience_detail.img_graduate = ELIGIBLE_EXPLICIT` is sufficient |
| No sponsorship (e.g., Hemet) | `restriction_tags += "VISA_NO_SPONSORSHIP"` AND `fit_warnings += "VISA_NO_SPONSORSHIP"` AND consider DEFER bucket |
| B-1 visa (applicant-obtained, e.g., CCF) | `restriction_tags += "VISA_APPLICANT_OBTAINED_B1"` AND copy MUST clarify NOT sponsored |
| Visa not addressed at primary source | NO sponsorship claim in any field; UI shows neutral default |

### 7.3 Cost figures → restriction_tags

| P97 evidence | P99 representation |
|---|---|
| Explicit dollar fee (e.g., $200/$400 CCF) | `restriction_tags += "FEE_REQUIRED"`; full citation lives in source quote (off-card) |
| Diversity scholarship (e.g., $1500 URM) | `restriction_tags += "DIVERSITY_SCHOLARSHIP_AVAILABLE"`; not surfaced as general financial aid |
| Min housing budget (e.g., $3000 TJUH) | `restriction_tags += "HOUSING_BUDGET_REQUIRED"` |
| Not specified | No tag |

### 7.4 Application method → application_url + restriction_tags

| P97 evidence | P99 representation |
|---|---|
| VSLO standard | `application_url = official VSLO link`; no special tag |
| VSLO except for affiliated school | `restriction_tags += "VSLO_AFFILIATED_EXCEPTION"` |
| Direct application (school-side placement, e.g., Ross at Norwalk) | `restriction_tags += "DIRECT_HOME_SCHOOL_PLACEMENT"` AND `fit_warnings += "NOT_SOLO_APPLICATION"` |
| ERAS only (residency-track evidence) | EXCLUDE from visiting-MS opportunity cards entirely |
| Multi-track / unresolved | DEFER until reviewer pins the primary method |

### 7.5 Audience carveouts → restriction_tags + fit_warnings

| P97 evidence | P99 representation |
|---|---|
| Named-school only (e.g., Atlantic Health 4-school MS3) | `restriction_tags += "NAMED_SCHOOL_PARTNERS_ONLY"` AND non-named audiences get `EXCLUDED_EXPLICIT` |
| Specialty-specific Caribbean affiliation (Bergen psych) | `restriction_tags += "SPECIALTY_SCOPED_AFFILIATION"` AND scope card to that specialty |
| URM/diversity scholarship-only (Highland $1500) | `restriction_tags += "DIVERSITY_ELIGIBILITY_REQUIRED"` AND `fit_warnings += "DIVERSITY_REQUIRED"` |
| Regional-site capacity unspecified (Mayo Mankato/Eau Claire) | DEFER until Mayo system carveout is interactively reviewed |

## 8. How source-capture screenshots / archive references should be represented internally

Screenshots live at: `<P97-T7>/docs/platform-v2/local/p97-national-queue/import-readiness-triage/source-capture-batch-N/screenshots/<filename>.png`. Wayback archive URLs are captured per-row in the source-capture-batch-N manifest's `screenshotPath` and `notes` fields.

For the bridge:
- The reviewed-source preview file (`public_listing_cards_preview_v2.json`) MAY carry `internal_evidence_ref` fields with the screenshot filename and Wayback URL.
- The promotion script's allow-list MUST NOT include those fields, so they are stripped before runtime.
- The runtime validator's source-fidelity check verifies that the kept fields match the reviewed-source preview file — that check should not fail when internal_evidence_ref is present in source but absent in runtime (verify allow-list is the gate, not an exact-shape match).

**Recommendation:** when extending the reviewed-source schema, namespace internal fields with an `internal_` prefix (e.g., `internal_screenshot_path`, `internal_archive_url`, `internal_packet_path`, `internal_reviewer_notes`). Promotion script can strip by prefix in addition to the existing allow-list.

## 9. How public card copy should be generated conservatively

For each P97 row that crosses the bridge:

1. **Card title:** `institution_name` from packet (no transform).
2. **Specialty:** required; if packet uses narrative enums (e.g., `EXCLUSIVE_OR_NEAR_EXCLUSIVE` for Saint Elizabeths psychiatry-focus), translate to a single specialty value in P99's existing list.
3. **opportunity_type:** Sub-internship / Visiting elective / Externship / etc. Reviewer must classify per row using P97's evidence — do NOT auto-assign.
4. **Eligible / excluded audiences:** derived from section 7 mapping. If the packet does not have explicit-enough evidence for a given audience, `audience_detail` MUST be `UNKNOWN_NOT_STATED` (never default to `ELIGIBLE_EXPLICIT`).
5. **No prose / no narrative copy on cards.** All caveats are tag-shaped (`restriction_tags`, `fit_warnings`). Long quotes live off-card in evidence files.
6. **No marketing language.** Forbidden-language scanner in `validate-usce-pilot-release.ts` already catches "best", "top", "guaranteed", "trusted by", etc.; same scanner applies to any card text generated from P97 rows.
7. **Visa caveat MUST be tag, not prose.** "VISA_J1_ONLY" / "VISA_NO_SPONSORSHIP" / "VISA_APPLICANT_OBTAINED_B1" — the UI renders a fixed badge for each tag.
8. **Cost caveat MUST be tag, not figure on card.** "FEE_REQUIRED" / "HOUSING_BUDGET_REQUIRED" — the UI may show a generic "Fee required" pill but the dollar figure stays in the citation panel that pulls from the reviewed-source preview file.

## 10. How validators must change before non-Maine rows

Each validator and what changes:

### 10.1 `validate-public-runtime-data.ts`
- Hard counts (12 / 7 / 5) become **dynamic** — read from a config or compute from the source preview. Replace the literal `expected 12` with `expected = sum of READY_PUBLIC_* in source preview`.
- Source-fidelity check stays on the same exact-match logic but now spans more rows.
- Forbidden field scan stays unchanged.
- Add: per-state coverage check (no state has >50% of cards in first national pilot) to avoid Maine-overweight illusion.

### 10.2 `validate-usce-public-cards.ts`
- Listing buckets PASS expectation stays (READY counts > 0; no NEEDS_REVIEW; no SUPPORTING_SOURCE in runtime).
- Add: every state present in runtime must have at least one P97 packet referenced in the reviewed-source preview's `internal_packet_path` (cross-link sanity check, internal only).

### 10.3 `validate-usce-save-compare.ts`
- localStorage `listing_id[]` model unchanged. Compare cap stays at 4. Save filters unchanged.
- Add: confirm that the `listing_id` ID space is not state-prefix-coupled (current Maine cards use `ME-001`, `ME-004` style; future rows would use the institution slug or queueRank — pick one and lock it before first national import).

### 10.4 `validate-usce-report-intake.ts`
- LocalReport model PHI-clean unchanged.
- Privacy copy unchanged.
- Add: ensure report categories include "visa policy claim seems wrong" and "audience claim seems wrong" — the two contradiction-types we've actually surfaced in P97 source-capture batches.

### 10.5 `validate-usce-pilot-release.ts`
- Forbidden-language scan unchanged.
- noindex check stays — even when adding non-Maine rows, the route should remain noindex until the full national pilot is reviewer-approved.
- Add: a per-state `pilot_status` attribute check — if any state's pilot status is `pre_first_review`, the route must remain noindex AND the state must be excluded from runtime.

### 10.6 New validator (recommended): `validate-p97-bridge-input.ts`
- Reads `public_listing_cards_preview_v2.json` (or successor)
- For each card with `internal_packet_path`, verify:
  - Packet file exists
  - Packet `importReadiness` is not `PENDING_PROMOTION_GATE_VISA_CORRECTION_BLOCKED` (or stricter)
  - Packet's `audienceMatrix` is consistent with the card's `audience_detail`
  - Packet's `eligibilityRestrictions.visaSponsorshipResidency` is consistent with the card's `restriction_tags`
- Hard-fail if any consistency mismatch — this is the contract enforcement point.

## 11. How counts should evolve from 12 Maine cards to first national pilot

**Pilot trajectory (recommended):**

| Stage | Total cards | Sources | Geographies | Indexation | Trigger to advance |
|-------|-------------|---------|-------------|------------|---------------------|
| Now | 12 (7 IMG + 5 US) | Maine review | ME only | noindex | — |
| After bridge audit | 12 (unchanged) | Maine review | ME only | noindex | Schema proposal accepted; validators updated |
| First national addition | 14–18 | + Saint Elizabeths (J-1 only) + Morristown + Overlook | ME + DC + NJ | noindex | Saint Elizabeths J-1-only public copy approved; Atlantic Health pair browser-screenshot captured |
| Second national addition | 20–24 | + Highland + Bergen | + CA + NJ Bergen | noindex | URM scholarship copy approved; Bergen psychiatry-clerkship-only audience carveout approved |
| Third national addition | 28–34 | + cleared CCF system rows + Queens/Elmhurst (residency-only) | + OH + NY | noindex | CCF system + Queens/Elmhurst pathways resolved |
| First-pilot exit | 30–40 | All resolved P97 promotions | 6–8 states | indexation decision deferred | Reviewer formally approves indexation per route |

**Hard ceiling per state in first national pilot:** No state should account for more than 50% of cards (avoid Maine illusion of completeness). At 30 cards, that's max 15 from any single state.

**Bucket balance target:** Roughly 2:1 IMG-relevant : US-only (current 7:5 ≈ 1.4:1 is acceptable; first national addition should preserve at least 50% IMG-relevant share).

## 12. Route decision: keep `/clerkships/maine` or new route

**Option A — keep `/clerkships/maine` until exit pilot.** Add non-Maine cards under the same route with state filter prominent in UI. Pro: single noindex surface; users in pilot expect "Maine" framing. Con: route name becomes a lie when 50%+ of cards are non-Maine.

**Option B — new `/clerkships/pilot` (or `/clerkships/preview`) route, rename Maine route to subroute.** Maintain `/clerkships/maine` for the original 12 + add `/clerkships/pilot` as the national pilot index, both noindex. Pro: honest naming; Maine pilot stays the proof-of-shape; national pilot is a separate review surface. Con: two routes to keep noindex and validator-clean.

**Recommendation: Option B.** Create `/clerkships/pilot` for the first national set (max 30–40 cards), keep `/clerkships/maine` as-is for the 12 ME cards. Both noindex. The pilot validator should require BOTH routes to be noindex.

**Naming rule:** No route should imply a national database completeness until the route's state coverage exceeds a defined threshold (e.g., 30+ states). Until then, the surface is "pilot" / "preview" / "verified pilot listings" — never "national" / "complete" / "all".

## 13. Noindex / indexation recommendation

- All pilot routes (`/clerkships/maine`, future `/clerkships/pilot`) remain noindex until reviewer formally approves indexation.
- Do not add the pilot routes to `sitemap.xml` until indexation approval.
- Robots.txt should not need changes (noindex is page-level metadata).
- Indexation decision is a **separate change** from any data import. Even if 100 cards are reviewer-approved, the route stays noindex until indexation is explicitly approved as its own audit step.

## 14. Human review checklist before first import

For each P97 row before it crosses the bridge:

1. ☐ `sourceProofScore = 5` per packet
2. ☐ `importReadiness` is not `*_BLOCKED` per packet
3. ☐ Source-capture batch row exists with capture status in the safe set
4. ☐ Browser screenshot exists at `screenshots/<expected-filename>.png` (file system check)
5. ☐ Wayback archive URL is recorded in batch manifest
6. ☐ promotion-readiness audit decision = `HUMAN_REVIEW_READY`
7. ☐ Public-copy guardrails CSV row exists and reviewer has read it
8. ☐ Audience translation per section 7.1 — reviewer signs the translation
9. ☐ Visa translation per section 7.2 — reviewer signs the translation
10. ☐ Cost translation per section 7.3 — reviewer signs the translation
11. ☐ Application-method translation per section 7.4 — reviewer signs the translation
12. ☐ Audience-carveout translation per section 7.5 — reviewer signs the translation
13. ☐ Card draft prose-free (no narrative; tags only)
14. ☐ Forbidden-language scanner passes on draft
15. ☐ Validator `validate-p97-bridge-input.ts` (when built) passes on draft

A single reviewer signs all 15 boxes per row, with a row-level audit note logged to `internal_reviewer_notes`. Two-reviewer requirement may be added for `DEFER_PUBLIC_UNSAFE` rows that are later cleared.

## 15. Rollback plan

If a bridged row is later found to carry incorrect evidence:

1. **Soft removal** — add the row's listing_id to a runtime exclusion list and re-run the promotion script. The runtime validator's source-fidelity check should warn, not fail, when the source preview has more rows than the runtime (allow soft-exclude).
2. **Hard correction** — forward-correct the upstream P97 packet (Hemet/Saint Elizabeths pattern), re-run the bridge translator, regenerate the reviewed-source preview, re-run the promotion script.
3. **No history rewrite** — never amend a commit that promoted runtime data; corrections land as forward commits.
4. **Validator rerun mandatory** — all 5 P99 validators + the new `validate-p97-bridge-input.ts` must pass after every rollback.
5. **User-facing comms** — if the row was visible (noindex or not), the report-issue intake captures user reports; a rollback note can be appended to the row's audit trail in `internal_reviewer_notes`.

For the first pilot, rollback should be tested against a fictional bad row before any real bridged row is imported (chaos-test the rollback path).

## 16. Exact next implementation prompt (no implementation now)

```text
Start P99-P97-BRIDGE-IMPLEMENTATION-STAGE-1.

Goal:
Build the upstream stage that translates one reviewer-approved P97 row
(Saint Elizabeths Hospital DC, queueRank 172, J-1 only) into a
public_listing_cards_preview_v2.json candidate row, end-to-end. Do not
import. Do not promote. Run all validators including the new
bridge-input validator.

Repos:
P99 product: /Users/shelly/usmle-platform
P97 evidence: /Volumes/T7Shield_Code/.../uscehub-active-2026-05-02

Hard rules:
- No push, no PR, no deploy.
- No DB/schema mutation.
- One row only (Saint Elizabeths) for Stage 1.
- Browser screenshot must be captured first (interactive session).
- Wayback archive URL recorded.
- All P99 validators + new bridge-input validator must pass.
- No noindex change; route stays /clerkships/maine for now.

Phases:
A. Browser screenshot capture for Saint Elizabeths landing + residency
   subpages; Wayback archive both.
B. Build scripts/usce-data/bridge-p97-row.ts (translates a single
   P97 packet path + audit decision into a reviewed-source candidate
   row).
C. Build scripts/usce-data/validate-p97-bridge-input.ts (per section 10.6
   of P99_P97_PILOT_DATA_BRIDGE_AUDIT.md).
D. Apply translation to Saint Elizabeths row; produce a single candidate
   row (do not yet write to public_listing_cards_preview_v2.json).
E. Reviewer signs the 15-step checklist (per audit section 14).
F. Merge candidate into public_listing_cards_preview_v2.json (still
   internal preview file, not runtime).
G. Run promote-reviewed-usce-data.ts → expect 13 cards (8 IMG + 5 US).
H. Run all 5 P99 validators + the new bridge-input validator.
I. Commit:
   git add scripts/usce-data/bridge-p97-row.ts \
           scripts/usce-data/validate-p97-bridge-input.ts \
           docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json \
           src/data/usce/public-listings.generated.json \
           src/data/usce/public-listings.generated.ts
   git commit -m "P99-6: bridge stage 1 — Saint Elizabeths J-1 only"

Stop after commit. Route stays noindex.
```

This is a **placeholder prompt** for the next implementation step. It is not authorized to run yet. Run only after this bridge audit lands and a screenshot capture sprint covers Saint Elizabeths (per user's stated next intent).

---

## Hard-rule confirmation for THIS audit

| Rule | Status |
|------|--------|
| No `git push` / PR / deploy | CONFIRMED |
| No DB / schema mutation | CONFIRMED |
| No listing import | CONFIRMED |
| No generated runtime data mutation | CONFIRMED — runtime files untouched in this audit |
| No new public rows | CONFIRMED |
| No public copy / status change | CONFIRMED |
| No IMPORT_READY / PUBLIC_NOW promotion | CONFIRMED |
| No route changes | CONFIRMED |
| No SEO / indexation change | CONFIRMED |
| Docs / audit only | CONFIRMED |

## Validator results at audit close

**P99 (Mac-local):**
- `validate-public-runtime-data.ts`: PASSED (12 cards, 0 IMG coherence failures, 12 source-fidelity verifications)
- `validate-usce-public-cards.ts`: PASSED (USCE v2 cards + tsc)
- `validate-usce-save-compare.ts`: PASSED (localStorage clean, compare cap=4)
- `validate-usce-report-intake.ts`: PASSED (PHI-clean, privacy copy present)
- `validate-usce-pilot-release.ts`: PASSED (noindex set, a11y, localStorage resilience)
- `tsc --noEmit`: PASSED

**P97 (T7):**
- `p97-validate-discovery.ts --state ME`: PASSED (16 counties, 0 errors)
- `tsc --noEmit`: PASSED

## Files added by this audit

- `docs/platform-v2/local/usce-completeness/P99_P97_PILOT_DATA_BRIDGE_AUDIT.md` (this file)
- `docs/platform-v2/local/usce-completeness/p97_to_p99_reviewed_input_schema_PROPOSAL.csv`

No source data, runtime data, validator scripts, UI code, or pilot route was modified.
