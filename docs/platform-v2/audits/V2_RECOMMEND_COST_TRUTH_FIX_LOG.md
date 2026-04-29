# V2 Recommend + Cost-Calculator Truth-Safety Fix Log (PR 0f-fix + PR 0g-fix combined)

**PR title:** Fix recommend and cost calculator truth claims
**Branch:** `fix/v2-recommend-cost-truth`
**Source audits:** [`RECOMMEND_TOOLS_AUDIT.md`](RECOMMEND_TOOLS_AUDIT.md) (PR #45) and [`COST_CALCULATOR_AUDIT.md`](COST_CALCULATOR_AUDIT.md) (PR #46), both open at time of writing.
**Pattern precedents:** [`V2_COPY_TRUTH_FIX_LOG.md`](V2_COPY_TRUTH_FIX_LOG.md) (PR #42 — review-flow truth/safety) and [`V2_COMMUNITY_TRUTH_FIX_LOG.md`](V2_COMMUNITY_TRUTH_FIX_LOG.md) (PR #44 — community truth/safety).
**Scope:** small surgical changes that close PR 0f findings H1 + M1 and PR 0g findings H1 + H2 + M1 + M2. **No** new backend, **no** schema, **no** real emails, **no** monetization, **no** `/career` changes, **no** broad redesign. Single authorized SEO-impl exception class: removing `applicationCategory: "FinanceApplication"` JSON-LD from the cost calculator (mirrors PR #42's `AggregateRating` removal and PR #44's `DiscussionForumPosting` removal).

---

## What was fixed

### A. Recommendation copy truth (PR 0f audit H1)

The `/recommend` flow advertised "Find the **Best** Observership for You" / "**Top Matches**" / "**best programs**" / "Finding your **best matches**" without any quality-ranking model behind those claims. The engine actually filters APPROVED listings by user input and orders by `lastVerifiedAt → linkVerified → views`. Copy reframed:

| Surface | Before | After |
|---|---|---|
| `src/app/recommend/page.tsx` title + OG title | "Program Finder — Find the **Best** Observership for You" | "Program Finder — **Match Programs to Your Profile**" |
| Page description | "find the **best** observership, externship, or research programs" | "find observership, externship, or research programs **that match your filters**. Results may prioritize recently verified, source-linked, approved listings." |
| OG description | "find the **best** clinical experience programs" | "find clinical experience programs **that match your filters**" |
| JSON-LD description | same overclaim | same softening |
| `<RecommendClient>` loading state | "Finding your **best matches**…" | "Finding listings that **match your filters**…" |
| `<RecommendClient>` results header | "Your **Top Matches**" | "**Your Matches**" |
| `<RecommendClient>` results subtitle | "{N} programs matched your preferences" | "{N} listings matched your filters. Results may prioritize recently verified, source-linked, approved listings — verify details with the official institution before applying." |
| `<RecommendClient>` quiz subtitle | "we'll find the **best** programs for you" | "we'll find listings **that match your filters**" |

### B. Recommendation visa-filter honesty (PR 0f audit M1)

The previous visa step offered four options (`b1b2`, `j1`, `citizen`, `need-support`) but the API only branches on `need-support` ([`/api/recommend/route.ts:36-39`](../../../src/app/api/recommend/route.ts)). The other three values were cosmetic — they collected input but did not constrain the query. Replaced with a 2-option binary that matches what the engine actually does:

| Field | Before | After |
|---|---|---|
| Title | "What's your visa status?" | "Do you need visa-support listings?" |
| Subtitle | "This helps us find programs that accept your visa type" | "Some listings explicitly support applicants who need visa help. Other listings may still accept various visa types — verify with the institution." |
| Options | b1b2 / j1 / citizen / need-support (4) | need-support / any (2) |

The result-page chip for the visa filter now suppresses when the user picks `any`, matching the budget/specialty pattern. Existing API param parsing untouched (`need-support` and any other value unchanged in semantics).

### C. Cost calculator description honesty (PR 0g audit H1)

The page metadata previously claimed "**visa costs**" were among the things estimated. The calculator does not include visa, exam, ECFMG, ERAS/NRMP, airfare, malpractice, or background-check fees. Description rewritten:

| Surface | Before | After |
|---|---|---|
| `src/app/tools/cost-calculator/page.tsx` title | "Cost Calculator — Estimate Your Observership **Costs**" | "Cost Calculator — Estimate Your Observership **Trip Costs**" |
| Page description | "Estimate the **total cost** … program fees, housing, food, transportation, and **visa costs**." | "Estimate the **trip-side cost** … program fee plus housing, food, transport, and an insurance range. Visa, exam, ECFMG, ERAS/NRMP, airfare, malpractice, and background-check fees are **not included**." |
| OG description | mirrored prior claim | mirrors honest framing |

### D. Cost calculator disclaimer + missing-fee disclosure (PR 0g audit H1 + M1)

The previous in-component disclaimer was a single line ("Estimates based on average costs…"). Replaced with a structured block:

- **"Estimator only."** Not financial, insurance, immigration, or legal advice. Costs are planning ranges; actual costs vary by neighborhood / lifestyle / time of year / program / travel origin / visa type / required documents.
- **`Last reviewed: April 2026.`** Constant `LAST_REVIEWED` exposed in source so admins know to bump it on data updates.
- **`<details>` collapsible:** "Common costs not included (verify with ECFMG / USMLE / ERAS / NRMP / consular and institutional sources)" with bulleted list:
  - USMLE Step 1 / Step 2 CK / Step 3 fees
  - ECFMG application + Pathways assessment fees
  - ERAS / NRMP application + match fees
  - Visa application + SEVIS / consular fees
  - Round-trip airfare from origin country
  - Malpractice insurance (if not program-covered)
  - Background check + drug screen + immunizations
  - Document translation / notarization (non-English source schools)
  - TOEFL / IELTS, NPI registration, contingency buffer

The constant `NOT_INCLUDED_FEES` is exported from the file's module scope so future edits are localized.

### E. "Other city" assumption-surfacing (PR 0g audit M2)

When a user picks `Other city`, the calculator silently defaults to US-median proxy values ($1,000 housing / $300 food / $80 transport per month) — under-estimating cities like SF / Seattle / DC. Added an inline amber notice under the cost breakdown when `city === "Other city"`:

> **Heads up:** "Other city" uses US-median assumptions. Higher-cost cities (San Francisco, Seattle, DC, etc.) will be under-estimated; lower-cost cities may be over-estimated. Verify locally.

### F. `FinanceApplication` JSON-LD removal (PR 0g audit H2 — authorized SEO impl change)

The page previously emitted:

```ts
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  applicationCategory: "FinanceApplication",
  ...
};
```

Schema.org reserves `FinanceApplication` for tools that perform banking, tax filing, loan applications, fund transfers, etc. A static client-side cost estimator with 11 hardcoded city numbers does not qualify. The entire `jsonLd` constant has been removed from `src/app/tools/cost-calculator/page.tsx`. `BreadcrumbSchema` is preserved.

This is the **single authorized SEO-impl exception** for this PR — same shape as PR #42 (`AggregateRating`) and PR #44 (`DiscussionForumPosting`). **No other JSON-LD, sitemap, robots, canonical, or redirect was touched.**

### G. Compare page copy spot-fix

`/compare` page metadata previously said "Compare observership and externship programs side by side **to find the best fit** for your IMG journey." Softened to: "Compare observership and externship programs side by side. **Source-linked fields shown where available; verify missing data with the official institution.**"

---

## Files changed

| File | Class | Why |
|---|---|---|
| `src/app/recommend/page.tsx` | code (small) | A — drop "best" from title/description/OG/JSON-LD |
| `src/app/recommend/recommend-client.tsx` | code (small) | A — drop "best" / "Top Matches" copy in 3 places. B — replace 4-option visa step with 2-option honest binary, suppress visa chip on `any` |
| `src/app/tools/cost-calculator/page.tsx` | code (small) | C — drop "visa costs" from descriptions. F — remove `FinanceApplication` JSON-LD entirely; preserve `BreadcrumbSchema` |
| `src/components/tools/cost-calculator.tsx` | code (medium) | D — strengthen disclaimer, add `LAST_REVIEWED`, add `NOT_INCLUDED_FEES` collapsible list. E — add "Other city" amber notice |
| `src/app/compare/page.tsx` | code (small) | G — drop "best fit" leftover |
| `docs/platform-v2/audits/V2_RECOMMEND_COST_TRUTH_FIX_LOG.md` | docs | this file |

**Forbidden paths verified untouched:** `/career`, `/careers`, `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `vercel.json`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/middleware.ts`, any cron route, `src/lib/email.ts`, monetization, any new API route, any new public route. `/api/recommend/route.ts` was reviewed but **not modified** — its visa filter is honest as-is; the fix is in the UI step (B).

---

## What was intentionally not fixed

Documented for the future-tools track. None of these are required before v2 launch given §A–§G:

- **Full personalization / quality-ranking model.** Today's engine is filter-based with trust-aware ordering. A real ranking model (engagement, completion-rate, review-weighted) is a separate post-launch feature.
- **Persistent recommendation snapshots.** No `Recommendation` model. A user re-running the quiz starts blank.
- **Recommendation explanation per result** ("matched on visa support: yes; verified Apr 2026"). Audit M3a, deferred.
- **Quiz state in URL** for share / refresh. Audit M4, deferred.
- **`/dashboard/compare` trust-field surfacing.** The dashboard compare page does not surface `linkVerificationStatus` while `/compare?ids=` does. Audit M3b, post-launch polish.
- **Richer visa-type filtering.** The schema lacks the structured fields (`acceptsB1B2`, `acceptsJ1`, etc.) to do this correctly. Schema PR — only if authorized later.
- **Calculator admin assumptions editor.** No UI. City costs require code change + deploy. Defer to a future `CostAssumption` schema PR.
- **Calculator save / export / share-link.** No `CostCalculatorSnapshot` model. Defer post-launch.
- **Origin-country airfare lookup.** Out of scope; would require external data source.
- **Personalized result URL routes** (e.g. `/recommend/result/[snapshotId]`). If ever added, must `noindex` and stay out of sitemap. Defer.
- **Pathway #3 finance / insurance calculators.** Must be separate tools with separate disclosure layers. Do not generalize the existing primitive.
- **Real rate-limit on `/api/recommend` / `/api/saved` / `/api/compare` / `/api/compared`.** Theoretical risk only at current traffic; mirror PR #42's review/flag rate-limit when volume rises.
- **Per-result reasoning in `<ListingCard>` for /recommend results.** Audit M3a, post-launch.
- **`<CostCalculatorSection>` homepage embed.** Inherits all in-component fixes via the shared `<CostCalculator>` component — no separate change needed.

---

## Audit decision deltas

| Audit | Before this PR | After this PR |
|---|---|---|
| **A6** (recommend / tools, PR 0f) | option B (limited utility tools, conservative copy) | **closed for v2 launch.** Copy is honest. Visa filter is honest. |
| **A7** (cost calculator, PR 0g) | option B/D hybrid (limited estimator + small fix PR) | **closed for v2 launch.** Description is honest. Disclaimer lists what's NOT included. `FinanceApplication` JSON-LD removed. `LAST_REVIEWED` surfaced. "Other city" assumption surfaced. |

---

## Resume order

1. PR queue review: PR #44 (community fix), PR #45 (recommend/tools audit), PR #46 (cost-calculator audit), and **this PR**.
2. When the deployment window opens and Vercel build budget resets, merge in order:
   - PR #44 (community fix)
   - PR #45 + PR #46 (audits) — docs-only, mergeable as a pair via Mode A
   - **this PR** (combined truth-fix batch B)
3. **Phase 0 closes operationally.**
4. Begin **real Pathway #1 implementation** per the user-supplied sequence:
   - **PR P1-1** Foundation branch — design tokens / primitives only
   - **PR P1-2** Homepage USCE-first pathway selector
   - **PR P1-3** USCE & Match dashboard shell
   - **PR P1-4** Listing detail trust / action cleanup
   - **PR P1-5** Save / compare / recommend polish
   - **PR P1-6** Cost calculator launch-safe fix (likely collapses to "verify" since this PR closes the calculator-side gaps)
   - **PR P1-7** Checklist module
   - **PR P1-8** QA + release batch
