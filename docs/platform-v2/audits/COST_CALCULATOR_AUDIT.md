# Cost Calculator Flow Audit (PR 0g)

**Status:** complete
**Audited at:** main `63815dc` (2026-04-29)
**Scope:** `/tools/cost-calculator` page + `<CostCalculator>` component + `<CostCalculatorSection>` (homepage embed). Sitemap entry. Cross-page references in `<navbar>`, `/resources`, `lib/journey.ts`, `/img-resources`, `/terms`. **Excludes** any `/career/*` cost or compare-state surface per the `/career` guardrail. **Does NOT re-litigate** findings already covered in [`RECOMMEND_TOOLS_AUDIT.md` §5 / §15](RECOMMEND_TOOLS_AUDIT.md) (PR 0f / PR #45) — this audit is shorter by design and focuses on calculator-specific items.
**Audit type:** docs-only. No code changes in this PR. Fix work is queued as separate PRs.

This audit answers **decision A7** (does USCEHub's cost calculator overpromise as a financial tool? is it Pathway 1 launch-ready?). It is the seventh and **final** Phase 0 audit. Sibling audits: [`POSTER_FLOW_AUDIT.md`](POSTER_FLOW_AUDIT.md), [`RESIDENCY_NAMESPACE_AUDIT.md`](RESIDENCY_NAMESPACE_AUDIT.md), [`APPLICATION_FLOW_AUDIT.md`](APPLICATION_FLOW_AUDIT.md), [`REVIEW_FLOW_AUDIT.md`](REVIEW_FLOW_AUDIT.md), [`COMMUNITY_FLOW_AUDIT.md`](COMMUNITY_FLOW_AUDIT.md), [`RECOMMEND_TOOLS_AUDIT.md`](RECOMMEND_TOOLS_AUDIT.md).

---

## 1. Executive verdict

**Verdict: real-functional UI, materially incomplete data scope for IMGs, weak disclaimer, structured-data overclaim. Launch-acceptable as a USCE-budget estimator only after a small fix PR closes calculator-specific gaps.**

Three layers, three different truths:

| Layer | Status | One-line truth |
|---|---|---|
| **UI functionality** | real-functional | client-side React, 11 cities × 4 durations × manual program-fee → instant estimate. No bugs surfaced. Renders both standalone (`/tools/cost-calculator`) and embedded (homepage `<CostCalculatorSection>`). |
| **Data scope** | **materially incomplete for IMGs** | covers housing + food + transport + insurance + program fee. **Omits** USMLE Step fees, ECFMG fees, ERAS fees, NRMP fees, visa stamping/SEVIS, airfare, malpractice, NPI, background-check, drug-screen, immunizations/titers, document translation/notarization. For an IMG, USMLE+ECFMG alone can be $4–6K — a meaningful share of total USCE budget that the "Estimated Total" line ignores. |
| **Trust framing** | weak | single one-line disclaimer ("Estimates based on average costs. Actual costs may vary…"). No `lastUpdated`. No source attribution. No "what's NOT included" list. **`applicationCategory: "FinanceApplication"` JSON-LD overclaims for a static estimator** (PR 0f H2 — re-confirmed here as C2/H1 carrying into this audit). |

**Two H-class findings (carried forward + sharpened from PR 0f):**

- **H1** — `<CostCalculator>` data scope omits IMG-specific fees that materially affect totals. The user reads "$X,XXX Estimated Total" believing they have a complete USCE budget; in reality they may need $4–6K more for USMLE+ECFMG alone. Same trust class as PR 0d's review-completeness gap and PR #42's brand-naming insurance copy — a credibility-by-omission risk.
- **H2** — `applicationCategory: "FinanceApplication"` JSON-LD on `/tools/cost-calculator/page.tsx:27` overclaims credibility for a static client-side estimator. Re-confirmed from PR 0f §15 H2; no fix shipped yet.

**One M-class finding** — no `lastUpdated` timestamp + no source attribution on the city-cost data; numbers age silently.

**No C-class finding.** The fixes are small and well-scoped.

**Decision A7:** option **B/D hybrid — keep as a limited estimator with conservative copy + ship a small fix PR before any v2 marketing push.** Recommendation in §19, follow-up PR in §20.

---

## 2. Existing route / component inventory

| File | Role | Status |
|---|---|---|
| [`src/app/tools/cost-calculator/page.tsx`](../../../src/app/tools/cost-calculator/page.tsx) | public page | indexable; emits `WebApplication` JSON-LD with `applicationCategory: "FinanceApplication"` (H2). 5 hardcoded "Tips to Reduce Costs" bullets. |
| [`src/components/tools/cost-calculator.tsx`](../../../src/components/tools/cost-calculator.tsx) | client component | 11 cities + 4 durations + insurance range, all hardcoded. Single disclaimer line. |
| [`src/components/home/cost-calculator-section.tsx`](../../../src/components/home/cost-calculator-section.tsx) | homepage embed | wraps `<CostCalculator>` in a "Plan Your Budget" section with link to full calculator |
| [`src/app/sitemap.ts:45`](../../../src/app/sitemap.ts) | sitemap | `/tools/cost-calculator` priority 0.7 |
| [`src/components/layout/navbar.tsx:85,263`](../../../src/components/layout/navbar.tsx) | nav | desktop + mobile menu link |
| [`src/app/resources/page.tsx:368`](../../../src/app/resources/page.tsx) | reference | inline link from /resources |
| [`src/lib/journey.ts:38`](../../../src/lib/journey.ts) | journey-step | "Cost Calculator — Estimate total USCE costs" — surfaces in journey timeline |
| **No API route** | n/a | calculator is fully client-side; no `/api/cost-calculator` exists |
| **No persistence** | n/a | no `CostCalculatorSnapshot`, no save/export, no admin update path |

---

## 3. Input model inventory

What the user can input today (ranked by user-visibility):

| Input | Source | Notes |
|---|---|---|
| **City** | `<Select>` | 11 hardcoded cities + "Other city" fallback |
| **Duration** | `<Select>` | 2 / 4 / 8 / 12 weeks |
| **Program fee** | `<input type=number>` | optional; manual integer; no validation beyond `parseInt` |

**Inputs not collected today (gaps that materially affect IMG totals):**

- Number of rotations / observerships per trip
- Origin country (drives airfare estimate)
- Travel dates / time-of-year (housing surge pricing)
- Visa type held (B1/B2 vs J-1 vs F-1) — affects SEVIS fee applicability
- USMLE Step status (Step 1 done? Step 2 CK in progress? affects ECFMG / exam fees due)
- Whether ECFMG certification is being pursued in parallel
- Document translation needs (non-English-source applicants)
- Whether the program requires malpractice / background check / drug screen
- Insurance preference (program-provided vs personal)

The current 3-input model is appropriate for a *city-of-stay* estimator, but mislabels itself as a *complete clinical-experience cost* tool. See §6.

---

## 4. Calculation logic audit

### 4.1 What is hardcoded?

| Field | Source | Value |
|---|---|---|
| `CITY_COSTS["New York, NY"]` | hardcoded | housing $2000, food $400, transport $130 |
| `CITY_COSTS["Los Angeles, CA"]` | hardcoded | $1800 / $350 / $100 |
| `CITY_COSTS["Chicago, IL"]` | hardcoded | $1200 / $300 / $100 |
| `CITY_COSTS["Houston, TX"]` | hardcoded | $1000 / $300 / $80 |
| `CITY_COSTS["Philadelphia, PA"]` | hardcoded | $1200 / $300 / $100 |
| `CITY_COSTS["Boston, MA"]` | hardcoded | $1800 / $350 / $90 |
| `CITY_COSTS["Cleveland, OH"]` | hardcoded | $800 / $250 / $70 |
| `CITY_COSTS["Pittsburgh, PA"]` | hardcoded | $900 / $250 / $70 |
| `CITY_COSTS["Detroit, MI"]` | hardcoded | $700 / $250 / $80 |
| `CITY_COSTS["Miami, FL"]` | hardcoded | $1500 / $350 / $90 |
| `CITY_COSTS["Other city"]` | hardcoded fallback | $1000 / $300 / $80 |
| `INSURANCE_MIN` / `INSURANCE_MAX` | hardcoded | $50–$200/month |
| `DURATIONS` | hardcoded | 2 / 4 / 8 / 12 weeks |

### 4.2 What is derived?

```
months = duration.weeks / 4
housing = round(city.housing × months)
food = round(city.food × months)
transport = round(city.transport × months)
insuranceMin = round(50 × months)
insuranceMax = round(200 × months)
totalMin = fee + housing + food + transport + insuranceMin
totalMax = fee + housing + food + transport + insuranceMax
```

Pure linear scaling by `months`. No marginal rate (e.g. month-3 deposit), no front-loaded one-time costs, no airfare round-trip surcharge.

### 4.3 What assumptions are hidden?

| Hidden assumption | Risk |
|---|---|
| Cost data is "current enough" | no `lastUpdated` field; numbers may have been authored 2022-era |
| `Other city` defaults to a US-median proxy | someone choosing a high-cost city not in the list (San Francisco, Seattle, DC) gets understated estimate |
| Insurance covers IMG needs | IMG-specific malpractice and program-required health-insurance plans are pricier than the $50-200 range |
| One observership at a time | a 4-week duration is treated as a single rotation; multi-rotation trips need different logic |
| Single occupancy housing | no "shared/roommate" toggle; users sharing accommodation see a single-room rate |

### 4.4 Are ranges or exact figures used?

**Mixed.** Housing/food/transport/program-fee are exact; insurance is min-max range. `Estimated Total` shows `$X,XXX - $Y,YYY` if min ≠ max, else `$X,XXX`. The min-max framing only reflects the insurance range, not the (much larger) underlying uncertainty in city-cost data accuracy.

### 4.5 Are min/max values clear?

Partial. The label `Estimated Total` + the disclaimer line attempts to soften, but a casual reader sees `$X,XXX` as the answer.

### 4.6 Does it silently default values?

**Yes — `Other city` returns the median fallback.** A user from San Francisco who selects "Other city" gets housing $1000/month — far below reality. No warning surfaces.

### 4.7 Can users understand how totals are produced?

**Yes for the visible inputs (per-line breakdown is rendered).** No for the city-cost data (no source, no methodology link).

---

## 5. Data freshness and source audit

| Question | Answer |
|---|---|
| Is there a `lastUpdated` date? | **No.** |
| Are city cost values sourced? | **No.** No citation, no methodology link, no "based on Numbeo / BLS / user-reported median" disclosure. |
| Are exam / ECFMG / USMLE fees sourced? | **N/A** — these fees are not in scope at all (§6). |
| Are insurance / malpractice ranges sourced? | **No.** $50–200/month is a hardcoded range with no justification. |
| Are currency / exchange rates relevant? | Not directly today (USD-only output). For international applicants paying program fees from origin currency, no FX conversion or hint is offered. |
| Are local cost assumptions stale-risk? | **Yes.** NYC housing $2000/month/single is a 2022-era number. 2026 reality in many neighborhoods is higher. |
| Is there any admin path to update values? | **No.** Changing any city number requires a code change + deploy. |

---

## 6. IMG-specific fee scope

This is the central calculator-specific finding.

| Fee | In scope today? | Approximate USD range | Importance for IMG |
|---|---|---|---|
| USCE / observership tuition | **partial** (manual `programFee` input) | $0 – $4,000 | high |
| Application fees (per program) | **no** | $0 – $200 each, often non-refundable | medium-high |
| ERAS fees | **no** (residency-stage) | up to ~$1,400 over a typical IMG cycle | high (later stage) |
| NRMP Match fees | **no** | $85+ (more for SOAP) | medium-high |
| USMLE Step 1 fee | **no** | ~$1,000 | high |
| USMLE Step 2 CK fee | **no** | ~$1,000 | high |
| USMLE Step 3 fee | **no** | ~$915 | medium (residency-prep stage) |
| ECFMG application + certification fee | **no** | ~$160 (application) + Pathways fees | high |
| Pathway-X assessment fees | **no** | $1,500+ depending on year | high |
| Visa application (DS-160 / J-1 / F-1) | **no** | $185 application + $220 SEVIS J-1 / $350 SEVIS F-1 | high |
| B1/B2 travel-only stamping (lighter) | **no** | $185 | medium |
| Round-trip airfare | **no** | $600 – $2,500 origin-dependent | high |
| Health insurance (visiting student) | **partial** ($50–200/mo range, no source) | $80 – $300/month realistic | medium-high |
| Malpractice insurance | **no** | $0 (program-covered) – $300/month | medium-high |
| NPI registration | **no** | free, but the *time-cost* may matter | low |
| Background check | **no** | $50 – $300 | medium |
| Drug screen | **no** | $30 – $80 | low-medium |
| Immunizations / titers | **no** | $0 – $500 (uncovered) | medium |
| Document translation / notarization | **no** | $50 – $500 | medium (non-English source schools) |
| TOEFL / IELTS (if required) | **no** | $200 – $300 | medium |
| Emergency / contingency buffer | **no** | recommend +10-15% | medium |

**Estimated cumulative IMG-specific gap not in calculator: $4,000 – $9,000+.** A user planning a $5,000 USCE trip via the calculator may face a $9,000–$14,000 actual total once IMG-specific fees are layered in. **H1 — credibility-by-omission risk.**

The fix is not to add every fee to the calculator (that would balloon scope and create financial-advice optics). The fix is **disclosure**: a "What's NOT included in this estimate" section listing the IMG-specific fee categories above with rough ranges and source links to ECFMG, USMLE, ERAS, NRMP, US Department of State (visa fees).

---

## 7. Financial-advice and legal-disclaimer risk

| Question | Answer |
|---|---|
| Does copy imply exact cost? | **partial** — title says "Estimate" (good) but `Estimated Total: $X,XXX` reads as an answer, not a range, and the disclaimer is below the fold for users whose total fits on one screen |
| Does it imply financial advice? | **moderate** — the `FinanceApplication` JSON-LD (H2) categorically claims so, even though the visible page does not |
| Does it imply insurance advice? | **no** — `Health Insurance` line is a passive cost line, no carrier names, no "we recommend" language. Good. (PR #42 already neutralized brand-naming on `/residency/finances`.) |
| Does it mention third-party brands? | **no** ✅ |
| Are disclaimers adequate? | **no** — single line is not enough given §6 omissions. Should add: "USCEHub is not a financial planning service" + "What's NOT included" list |
| Is "estimate only" visible before results? | **partial** — page-level h1 says "Cost Calculator" + subtitle says "Estimate" but user can scroll past to results without re-encountering the framing |
| Are limitations shown near totals? | **single line below total** — physically near, but text-weight is low (`text-xs text-slate-400`) |

**Risk class:** comparable to PR 0f §5/§15 H2 + PR #42's `/residency/finances` insurance brand-name fix. Same FTC-pre-monetization concern. Below C-class severity because no brand names are surfaced and no purchase channel exists.

---

## 8. Structured-data / SEO audit

| Question | Answer |
|---|---|
| Is `FinanceApplication` JSON-LD present? | **yes** — [`src/app/tools/cost-calculator/page.tsx:27`](../../../src/app/tools/cost-calculator/page.tsx) |
| Does any structured data overclaim functionality? | **yes** — Schema.org reserves `FinanceApplication` for tools that perform banking, tax filing, loan applications, transfer funds, etc. A static estimator does not qualify. **H2.** |
| Are calculator result pages indexable? | **n/a** — results are client-state on the same SSR shell URL. No new URLs are generated. Architecture is correct by construction. ✅ |
| Are dynamic results URL-encoded? | **no** — `useState`-only. Re-running the calculator from a fresh tab requires re-entering inputs. |
| Should result pages be `noindex` if later added? | **yes (future)** — if a "share my estimate" route is ever built (e.g. `/tools/cost-calculator/snapshot/[id]`), it must `noindex` and not be in sitemap. |
| `BreadcrumbSchema` | present, accurate ✅ |

**Recommendation (queued for fix PR, not applied here):** change `applicationCategory: "FinanceApplication"` → `"EducationalApplication"` (consistent with `/recommend` and `/compare`) **or** drop the JSON-LD entirely. Authorized SEO-impl exception class — same shape as PR #42's `AggregateRating` removal and PR #44's `DiscussionForumPosting` removal.

---

## 9. Shared-entry behavior

Apply [`SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md`](../SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md) URL-wins doctrine:

| Surface | Compliance |
|---|---|
| `/tools/cost-calculator` direct link | ✅ opens directly, no login wall, no pathway modal |
| Calculator visible without login | ✅ |
| Results shareable via URL | ❌ — calculator state is `useState` only. Future polish; not blocker. |
| Results saveable / persisted | ❌ — no API; no schema |
| Login wall risk | ✅ none |
| Social-card preview accuracy | ✅ — OG metadata is honest ("Estimate the total cost…") |
| Visitor understanding | partial — title makes it clear it's an estimator; result framing softens that. §16 fix |

Acceptable for v2 launch *as-is*; share-state and save-state are post-launch polish.

---

## 10. Pathway #1 relationship

Per [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](../PATHWAY_DASHBOARD_ARCHITECTURE.md), the calculator is **Pathway 1 (USCE & Match) only**. Use cases:

| Use case | Fit |
|---|---|
| Budgeting for a single observership / externship trip | ✅ direct fit (after H1 disclosure fix) |
| Comparing city costs side-by-side | ✅ user can re-run with different cities |
| Preparing application + travel budget | partial — H1 IMG-fee gap means application-cycle budget is incomplete |
| Old-YOG / reapplicant / SOAP / visa-dependent budgeting | partial — visa fee category is missing (H1) |

**Belongs in v2 launch as Pathway 1's budget tool.** Recommended after H1 + H2 fixes ship.

---

## 11. Practice & Career spillover risk

| Question | Answer |
|---|---|
| Does the calculator imply attending / job / contract / insurance planning? | **no** today — copy is observership-focused. Any future Pathway 3 calculator (income tax, contract value, attending insurance, J-1 waiver finances) **must be a separate tool**, not an extension of this one. |
| Should Practice & Career calculators be separate later? | **yes.** Different fee categories, different legal disclosure surface (job offers, insurance, malpractice → higher disclaimer bar). |
| Should insurance / financial planning be deferred for Pathway #3? | **yes.** Don't generalize this estimator into Pathway 3 — keep it Pathway 1 scope. |

---

## 12. Trust and monetization risk

| Question | Answer |
|---|---|
| Are paid placements involved? | **no** ✅ |
| Could future sponsors bias calculator values? | **yes — design risk for v2+.** A future "sponsored housing partner" who pays for placement could be tempted to influence calculator defaults. Per [`TRUST_AND_MONETIZATION_POLICY.md`](../TRUST_AND_MONETIZATION_POLICY.md), keep the estimator and any monetization surface fully separated. |
| Should monetized partners affect estimates? | **no.** Hard line. Calculator estimates must remain source-attributed and partner-neutral. |

---

## 13. Public visitor flow

| Action | Available? |
|---|---|
| Use calculator | ✅ unauthenticated |
| See assumptions | ⚠️ partial — disclaimer line below fold; no "what's NOT included" list (H1) |
| See disclaimers | ⚠️ minimal (one sentence) |
| Reset inputs | ✅ via in-place re-selection |
| Share results | ❌ — `useState` only, no URL state |
| Save results | ❌ — no API |
| Login walls | ✅ none |

---

## 14. Logged-in user flow

| Action | Available? |
|---|---|
| Save calculator outputs | ❌ — no `CostCalculatorSnapshot` |
| Compare multiple budgets | ❌ — single-state only |
| Attach budget to saved listing | ❌ |
| Export | ❌ |
| Delete / reset | n/a (nothing persisted) |

**For launch:** `none of these are required.` The calculator is a one-shot estimator. Save / compare / attach are post-launch polish.

---

## 15. Admin / ops flow

| Action | Available? |
|---|---|
| Update cost assumptions | ❌ — code change + deploy required |
| Audit data freshness | ❌ — no `lastUpdated` field |
| See stale values | ❌ — no telemetry |
| Manage sources | ❌ — no source attribution exists to manage |
| Localize by city / state | partial — 11 hardcoded cities + fallback |

**Launch risk:** the admin gap is acceptable at v2 launch given expected low traffic. Becomes meaningful post-launch when prices drift and admin needs an update path. Defer to a future "calculator-data hygiene" PR (could grow into a CMS-backed assumption table).

---

## 16. Copy / marketing risk

| File | Quote | Status | Recommended fix |
|---|---|---|---|
| [`src/app/tools/cost-calculator/page.tsx:6`](../../../src/app/tools/cost-calculator/page.tsx) | "Cost Calculator — **Estimate** Your Observership Costs" | ✅ honest | keep |
| [`src/app/tools/cost-calculator/page.tsx:8`](../../../src/app/tools/cost-calculator/page.tsx) | "Estimate the **total** cost of your observership… including program fees, housing, food, transportation, and visa costs." | ⚠️ "total" + "**visa costs**" overstated — visa costs are NOT in the calculator (H1) | drop "visa costs" from the description; soften "total" to "estimated trip cost" |
| [`src/app/tools/cost-calculator/page.tsx:25`](../../../src/app/tools/cost-calculator/page.tsx) | JSON-LD description: "Estimate the **total** cost… including program fees, housing, food, transportation, and **visa costs**." | ⚠️ same | mirror description fix |
| [`src/components/tools/cost-calculator.tsx:194-196`](../../../src/components/tools/cost-calculator.tsx) | "Estimates based on average costs. Actual costs may vary by neighborhood, lifestyle, and time of year." | ⚠️ minimal (H1) | replace with: "Estimates only. Average costs across [N] cities, last reviewed [DATE]. **NOT included:** USMLE / ECFMG fees, ERAS / NRMP fees, visa fees, airfare, malpractice, background check. USCEHub is not a financial planning service." |
| [`src/components/home/cost-calculator-section.tsx:11`](../../../src/components/home/cost-calculator-section.tsx) | "Plan Your Budget" | ✅ honest | keep |
| `<TipsToReduceCosts>` block | tips on housing, transit, free programs, sharing accommodation | ✅ no overclaim | keep |
| Anywhere | "exact" / "complete" / "official" / "cheapest" / "guaranteed" / "financial plan" / "all-in cost" / "personalized" | **absent** ✅ | confirmed via grep |

---

## 17. Functional truth table

| Action | Real / Partial / Missing / Unsafe / Unknown |
|---|---|
| Calculator page loads | **Real** |
| User can choose city | **Real** (11 hardcoded + fallback) |
| User can choose duration | **Real** (4 options) |
| User can input program fee | **Real** |
| User sees total estimate | **Real** |
| Assumptions visible | **Partial** — line breakdown shown; data origin not |
| Data sources visible | **Missing** (no citations, no methodology) |
| `lastUpdated` visible | **Missing** |
| IMG-specific fees included | **Missing** (H1 — major gap) |
| Disclaimer adequate | **Partial / Unsafe** (one line; no "what's NOT included" list) |
| Structured data accurate | **Unsafe** — `FinanceApplication` overclaims (H2) |
| Results shareable | **Missing** — `useState` only (acceptable for launch) |
| Results saveable | **Missing** (acceptable for launch) |
| Admin can update assumptions | **Missing** (defer post-launch) |
| Page metadata + description honest about scope | **Partial** — mentions "visa costs" that are not actually included (§16) |

---

## 18. Risks found

### Critical (C-class)

**None.** Below the C-class bar that PR 0d (review) and PR 0e (community) hit.

### High (H-class) — must close before any v2 marketing push

| ID | File / route | Risk |
|---|---|---|
| **H1** | [`src/components/tools/cost-calculator.tsx:194-196`](../../../src/components/tools/cost-calculator.tsx) + [`src/app/tools/cost-calculator/page.tsx:8,25`](../../../src/app/tools/cost-calculator/page.tsx) | IMG-specific fee scope materially incomplete. User-visible total can understate true USCE-cycle cost by $4-9K+. Disclaimer doesn't list omitted categories. Page description names "visa costs" that are not actually included. Same credibility-by-omission class as PR #42's brand-name fix. |
| **H2** | [`src/app/tools/cost-calculator/page.tsx:27`](../../../src/app/tools/cost-calculator/page.tsx) | `applicationCategory: "FinanceApplication"` JSON-LD overclaims for a static estimator. Schema.org reserves the category for actual financial-transaction tools. Same risk class as PR 0d C2 (`AggregateRating`) and PR 0e C2 (`DiscussionForumPosting`). Authorized SEO-impl exception class for fix. |

### Medium (M-class)

| ID | File / route | Risk |
|---|---|---|
| **M1** | [`src/components/tools/cost-calculator.tsx:7-22`](../../../src/components/tools/cost-calculator.tsx) | City-cost data hardcoded with no `lastUpdated`, no source attribution. Numbers age silently. Admin update path requires code change. |
| **M2** | "Other city" fallback | quietly defaults to median-proxy values. A user from San Francisco / Seattle / DC gets understated estimate without warning. |
| **M3** | `/tools/cost-calculator` lacks URL-encoded result state | results not shareable; re-running requires re-entering inputs. Acceptable for launch; post-launch polish. |
| **M4** | No `CostCalculatorSnapshot` schema | no save / export / attach-to-saved-listing flows. Acceptable for launch; defer. |

### Low (L-class)

| ID | File / route | Risk |
|---|---|---|
| **L1** | Insurance range $50-200/month hardcoded | could be sourced or attributed; low-priority. |
| **L2** | No multi-rotation toggle | a user planning two consecutive observerships in different cities gets one-rotation logic. Niche case. |
| **L3** | No shared-housing toggle | single-occupancy default overstates costs for users sharing accommodation. |
| **L4** | `<CostCalculatorSection>` on homepage uses the same component as `/tools/cost-calculator` | any fix in the component automatically improves both surfaces — good. |

---

## 19. Recommended v2 decision

**Decision A7: option B/D hybrid — keep as a limited estimator with conservative copy + ship a small fix PR before any v2 marketing push.**

Reasoning:

- Option **A** (launch as-is) — **rejected.** H1 + H2 are real credibility gaps.
- Option **B** (limited estimator with conservative copy and source/disclaimer fix) — **chosen as the framing posture.** Tool is genuinely useful for city-of-stay budgeting. Honest disclosure closes H1.
- Option **C** (hide / de-emphasize) — **rejected.** Tool is real-functional and provides real value. No reason to hide it.
- Option **D** (build small fix PR before v2) — **chosen as parallel track.** PR 0g-fix-1 below.
- Option **E** (defer to post-v2) — **rejected.** Pathway 1 budget tool is high-leverage for IMG audience.

The fix PR is small (~30-60 LOC). Worth doing as part of the combined truth-fix batch (see §20).

---

## 20. Required follow-up PRs

| PR | Type | Scope | Blocker? |
|---|---|---|---|
| **PR 0g-fix-1 (copy + small SEO + disclosure)** | code (small) | H1: rewrite the in-component disclaimer to list "What's NOT included" (USMLE, ECFMG, ERAS, NRMP, visa, airfare, malpractice, background check) and add a `lastUpdated` line. Drop "visa costs" from page metadata description and JSON-LD description (§16). H2: change `applicationCategory: "FinanceApplication"` → `"EducationalApplication"` (or remove the JSON-LD entirely — same call as PR #42 made for `AggregateRating`). M2: add a one-line warning when user selects "Other city". ~30-60 LOC. Authorized SEO-impl exception class. | **YES** before any v2 marketing push |
| **PR 0g-fix-2 (data hygiene)** | code (small) | M1: add a top-of-component `LAST_REVIEWED = "2026-04"` constant and a "Last reviewed: April 2026" line near the disclaimer. Cite "average rents from publicly available sources" without specific brand names (mirrors PR #42's insurance-disclosure fix pattern). ~10-20 LOC. | nice-to-have; can batch with 0g-fix-1 |
| **(future) admin assumptions PR** | code (medium) | move city-cost data into `CostAssumption` Prisma model with admin UI to update + `lastUpdated` per row. **Schema PR — only if authorized later.** | post-launch |
| **(future) snapshot / save flow** | code + schema | `CostCalculatorSnapshot` model + share-link route. Mirrors PR 0c's deferred ApplyForm and PR 0e's deferred community persistence. | post-launch |
| **(future) IMG-fees scope expansion** | code | optional inputs section for USMLE / ECFMG / visa / airfare driven from origin-country lookup. | post-launch |

**Batching recommendation:** **combine PR 0g-fix-1 + PR 0g-fix-2 + the queued PR 0f-fix-1 + PR 0f-fix-2 from PR #45 audit into a single small "v2 truth-fix batch B" PR (~80-150 LOC).** Same shape as PR #42 (review fix) and PR #44 (community fix). All four sub-fixes are calculator/recommend copy + JSON-LD + disclosure, which makes them coherent to ship together.

---

## 21. Do-not-do list

- **Do not** call the estimate "exact", "complete", "all-in", or "your full cost".
- **Do not** imply financial advice. Keep the "Estimate" framing. Do NOT restore `FinanceApplication` JSON-LD until a real financial-advisory feature ships with appropriate disclosure.
- **Do not** name specific insurance carriers, banks, FX providers, or housing brands in the estimator. PR #42 closed this for `/residency/finances`; the same posture must hold here.
- **Do not** use sponsor or partner values in estimates. Calculator data must remain partner-neutral and source-attributed.
- **Do not** index personalized result pages if a snapshot route is ever added.
- **Do not** launch any Pathway 3 (Practice & Career) finance calculator from this primitive. They must be separate tools with separate disclosure layers.
- **Do not** generalize the estimator into a multi-pathway "all-purpose IMG cost tool" — keep Pathway 1 (USCE & Match) scope.
- **Do not** drop the existing 11-city + duration framework before v2 launch. The fix is disclosure, not a rebuild.
- **Do not** remove the `<CostCalculatorSection>` from the homepage. Once H1+H2 fix ships, the homepage embed becomes the most-trafficked instance.

---

## 22. Final recommendation

**Lock A7 = option B/D hybrid.** Keep as a limited estimator with conservative copy + ship the small fix PR before any v2 marketing push.

**Phase 0 audits — complete.** All seven planned audits closed:

| Audit | PR | Status |
|---|---|---|
| 0a — Poster flow | PR #32 | merged |
| 0b — Residency namespace | PR #38 | merged |
| 0c — Application flow | PR #40 | merged |
| 0d — Review flow | PR #41 | merged |
| 0e — Community flow | PR #43 | merged |
| 0f — Recommend / tools | PR #45 | open (Vercel rate-limit) |
| 0g — Cost calculator | this PR | drafted |

Plus three truth-fix PRs already scoped:

| Fix PR | Source | Status |
|---|---|---|
| PR #42 — review + application + insurance copy + `AggregateRating` JSON-LD | 0a / 0b R1 / 0c / 0d | **merged** |
| PR #44 — community truth/safety + `DiscussionForumPosting` JSON-LD | 0e | **open (Vercel rate-limit)** |
| **next combined fix PR** — recommend/tools + cost-calculator | 0f / 0g | **proposed, not yet drafted** |

**Action queue:**

1. Merge PR #45 (this audit's parent — recommend/tools) and PR #44 (community fix) when the Vercel rate-limit clears in the next deployment window.
2. Merge **this PR (PR 0g audit)** in the same deployment window if checks are green.
3. Ship the **combined truth-fix batch B PR** (PR 0f-fix-1 + PR 0f-fix-2 + PR 0g-fix-1 + PR 0g-fix-2 = ~80-150 LOC) — small code PR, same shape as PR #42 and PR #44.
4. **Phase 0 closes.**
5. Begin **real Pathway #1 implementation** per the user-supplied sequence:
   - **PR P1-1** Foundation branch — design tokens / primitives only
   - **PR P1-2** Homepage USCE-first pathway selector
   - **PR P1-3** USCE & Match dashboard shell (saved / compare / recommend / checklist / alerts preview / official source reminders)
   - **PR P1-4** Listing detail trust / action cleanup
   - **PR P1-5** Save / compare / recommend polish
   - **PR P1-6** Cost calculator launch-safe fix (already covered by combined truth-fix batch B above; if so, P1-6 may collapse into "verify" rather than "fix")
   - **PR P1-7** Checklist module
   - **PR P1-8** QA + release batch (mobile QA, shared-link QA, noindex/SEO review, trust-copy review, rollback plan, screenshots → deployment window)
6. Production release only after batch review, screenshots, QA, and the deployment window.

**Pathway tag:** `usce_match`. The cost calculator belongs to Pathway 1 only. Practice & Career future calculators must be separate tools.

**No critical security gap.** All findings are credibility / disclosure / SEO-overclaim concerns that the proposed fix PR closes without schema changes.

---

*End of PR 0g audit. Sibling audits: [POSTER_FLOW_AUDIT.md](POSTER_FLOW_AUDIT.md) (PR #32), [RESIDENCY_NAMESPACE_AUDIT.md](RESIDENCY_NAMESPACE_AUDIT.md) (PR #38), [APPLICATION_FLOW_AUDIT.md](APPLICATION_FLOW_AUDIT.md) (PR #40), [REVIEW_FLOW_AUDIT.md](REVIEW_FLOW_AUDIT.md) (PR #41), [COMMUNITY_FLOW_AUDIT.md](COMMUNITY_FLOW_AUDIT.md) (PR #43), [RECOMMEND_TOOLS_AUDIT.md](RECOMMEND_TOOLS_AUDIT.md) (PR #45). Predecessor fixes: [V2_COPY_TRUTH_FIX_LOG.md](V2_COPY_TRUTH_FIX_LOG.md) (PR #42 merged) + [V2_COMMUNITY_TRUTH_FIX_LOG.md](V2_COMMUNITY_TRUTH_FIX_LOG.md) (PR #44 open). **Phase 0 audits complete.** Next: combined truth-fix batch B (recommend/tools + cost-calculator), then real Pathway #1 implementation per PR P1-1 → P1-8.*
