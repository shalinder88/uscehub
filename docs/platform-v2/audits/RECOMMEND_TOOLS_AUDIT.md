# Recommend & Tools Flow Audit (PR 0f)

**Status:** complete (drafted on local-only branch — not yet pushed)
**Audited at:** main `63815dc` (2026-04-29)
**Scope:** `/recommend` (program-finder quiz) + `/api/recommend`, `/compare` (in-memory side-by-side) + `/api/compare`, `/dashboard/compare` (persistent up-to-3 list) + `/api/compared`, `/dashboard/saved` + `/api/saved`, `/tools/cost-calculator` + `<CostCalculator>` component, `<FloatingFinder>` floating button, sitemap entries for the three tool pages, `SavedListing` + `ComparedListing` Prisma models. **Excludes** `/career/compare-states` and `/career/state-compare` per the `/career` guardrail.
**Audit type:** docs-only. No code changes in this PR. Fix work is queued as separate PRs.

This audit answers **decision A6** (does USCEHub's recommendation engine + cost calculator overpromise? are tool-result pages indexable correctly? real or aspirational?). It is the sixth of seven Phase 0 audits. Sibling audits: [`POSTER_FLOW_AUDIT.md`](POSTER_FLOW_AUDIT.md), [`RESIDENCY_NAMESPACE_AUDIT.md`](RESIDENCY_NAMESPACE_AUDIT.md), [`APPLICATION_FLOW_AUDIT.md`](APPLICATION_FLOW_AUDIT.md), [`REVIEW_FLOW_AUDIT.md`](REVIEW_FLOW_AUDIT.md), [`COMMUNITY_FLOW_AUDIT.md`](COMMUNITY_FLOW_AUDIT.md). Predecessor fix: [`V2_COMMUNITY_TRUTH_FIX_LOG.md`](V2_COMMUNITY_TRUTH_FIX_LOG.md) (PR #44, currently open and unmerged).

---

## 1. Executive verdict

**Verdict: real-functional with two H-class trust gaps + several M-class polish gaps.** Materially less severe than PR 0d (review) and PR 0e (community). The tools work; the framing overclaims.

Five layers, five different truths:

| Layer | Status | One-line truth |
|---|---|---|
| **Recommendation engine** (`/recommend` + `/api/recommend`) | real-functional, partially honest | 4-question quiz → real Prisma query against `Listing` rows. Trust-aware ordering (`lastVerifiedAt` → `linkVerified` → `views`). **Visa filter is mostly cosmetic** — only `need-support` actually constrains the query; `b1b2`, `j1`, `citizen` collect input but do not filter. Copy promises "best match" / "best programs" — there is no quality ranking, just filter+order. |
| **Cost calculator** (`/tools/cost-calculator`) | real-functional, hardcoded data, **`FinanceApplication` JSON-LD overclaims credibility** | client-side only, 11 cities + 4 durations + insurance range, all hardcoded. No `lastUpdated` timestamp, no source attribution, no IMG-specific fee coverage (ECFMG, USMLE, malpractice). Page JSON-LD `applicationCategory: "FinanceApplication"` is too strong for a static estimator. |
| **Compare** (in-memory `/compare` + persistent `/dashboard/compare`) | real-functional | both are real. `/compare` reads listing ids from URL params; `/dashboard/compare` persists up to 3 (server-side cap enforced). Trust fields surfaced correctly. PR #42 already neutralized the misleading "Via Platform" cell to "Via institution". |
| **Saved listings** (`/dashboard/saved` + `/api/saved`) | real-functional | auth-gated CRUD on `SavedListing`. No tags, no notes, no notifications, but the basic save flow is clean. |
| **Floating Finder** (`<FloatingFinder>`) | real-functional pointer | a global floating button that links to `/recommend`. Single-purpose. Fine. |

**Two H-class findings:**

- **H1** — `/recommend` claims "Find the **Best** Observership for You" / "Your **Top Matches**" / "we'll find the **best** programs for you" / "Finding your **best matches**…" without any quality-ranking model behind those claims. The engine filters by user input and orders by trust-freshness + views. Same copy-truth class as PR 0d's "verified review" / "Top-rated programs are featured". User cannot tell why a listing appears in their results.
- **H2** — `/tools/cost-calculator` page emits `WebApplication` JSON-LD with `applicationCategory: "FinanceApplication"`. The category is reserved by Schema.org for tools that perform financial transactions, banking, accounting, or substantive financial advisory work. A static client-side estimator with 11 hardcoded city numbers and a paragraph of disclaimer text overclaims under that category. Rich-results inference risk + brand-truth gap.

**Three M-class findings (§14, §15):** visa-filter cosmetic gap (M1), city-cost staleness without timestamp/source (M2), no recommendation-result persistence or "why this matched" explanation (M3).

**Decision A6:** option **B — limited utility tools with conservative copy.** Recommendation in §16, follow-up PR in §17.

---

## 2. Existing route inventory

All routes confirmed at `63815dc`:

| Route | File | Method | Audit verdict |
|---|---|---|---|
| `/recommend` (public page) | [`src/app/recommend/page.tsx`](../../../src/app/recommend/page.tsx) | UI | indexable; emits `WebApplication` JSON-LD (`EducationalApplication` — fine). Loads `<RecommendClient />`. |
| `<RecommendClient>` | [`src/app/recommend/recommend-client.tsx`](../../../src/app/recommend/recommend-client.tsx) | client UI | 4-step quiz → fetches `/api/recommend`. Renders `<ListingCard>` grid for results. **No persistence** beyond `useState`. |
| `/api/recommend` | [`src/app/api/recommend/route.ts`](../../../src/app/api/recommend/route.ts) | GET | public; reads `Listing` table; trust-aware order; budget filter is post-query string-regex; visa filter only honors `need-support`. **No rate limit.** |
| `/compare` (public page) | [`src/app/compare/page.tsx`](../../../src/app/compare/page.tsx) | UI | indexable; emits `WebApplication` JSON-LD (`EducationalApplication` — fine). Loads `<CompareClient />`. |
| `<CompareClient>` | [`src/app/compare/compare-client.tsx`](../../../src/app/compare/compare-client.tsx) | client UI | reads `?ids=a,b,c` from URL; fetches `/api/compare`. PR #42 neutralized the application-method cell. |
| `/api/compare` | [`src/app/api/compare/route.ts`](../../../src/app/api/compare/route.ts) | GET | public; cap of 3 ids; only APPROVED listings returned; trust fields surfaced. Clean. |
| `/dashboard/compare` (auth UI) | [`src/app/dashboard/compare/page.tsx`](../../../src/app/dashboard/compare/page.tsx) | UI | auth-gated; reads `/api/compared`. |
| `/api/compared` | [`src/app/api/compared/route.ts`](../../../src/app/api/compared/route.ts) | GET / POST / DELETE | auth-gated; cap of 3 enforced; unique constraint dedupes. Clean. |
| `/dashboard/saved` (auth UI) | [`src/app/dashboard/saved/page.tsx`](../../../src/app/dashboard/saved/page.tsx) | UI | auth-gated; reads `/api/saved`. |
| `/api/saved` | [`src/app/api/saved/route.ts`](../../../src/app/api/saved/route.ts) | GET / POST / DELETE | auth-gated; unique constraint dedupes. Clean. |
| `/tools/cost-calculator` (public page) | [`src/app/tools/cost-calculator/page.tsx`](../../../src/app/tools/cost-calculator/page.tsx) | UI | indexable; **emits `WebApplication` JSON-LD with `applicationCategory: "FinanceApplication"` (H2)**. |
| `<CostCalculator>` | [`src/components/tools/cost-calculator.tsx`](../../../src/components/tools/cost-calculator.tsx) | client UI | client-side only; no API. Hardcoded data (M2). |
| `<FloatingFinder>` | [`src/components/tools/floating-finder.tsx`](../../../src/components/tools/floating-finder.tsx) | client UI | floating link to `/recommend`. |
| `<CostCalculatorSection>` | [`src/components/home/cost-calculator-section.tsx`](../../../src/components/home/cost-calculator-section.tsx) | UI | mounts the calculator on the homepage. |
| Sitemap entries | [`src/app/sitemap.ts:33-49`](../../../src/app/sitemap.ts) | sitemap | `/recommend` (priority 0.8), `/compare` (0.7), `/tools/cost-calculator` (0.7). All three correctly indexable as static SSR shells (results render client-side, not as separate URLs). |

**Routes that do NOT exist:**

| Expected route | Actual status |
|---|---|
| `POST /api/recommend` to save a recommendation snapshot | **absent** — no recommendation persistence. |
| `GET /api/recommend/results/[snapshotId]` shareable result | **absent** — quiz answers are URL params at most, not stored. |
| Per-listing "why this matched" explanation | **absent** — listings appear without a per-result rationale. |
| Tool-result `noindex` policy | **n/a** — results are rendered client-side from the same SSR shell, so Google sees the empty quiz/calculator shell, not personalized output. The current architecture already protects against thin-result-page indexing. ✅ |
| ROI / financial-advice tool | **absent** — out of scope and explicitly should stay so. |
| Recommendation engine bias / fairness logging | **absent** — no admin telemetry on which listings the engine surfaces vs hides. |

---

## 3. Data model inventory

### 3.1 `SavedListing` ([`prisma/schema.prisma:269-279`](../../../prisma/schema.prisma))

```prisma
model SavedListing {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, listingId])
  @@map("saved_listings")
}
```

**Status:** clean. Cascade-delete correct. Unique constraint dedupes. No moderation needed (private to user). No tags / notes / folders — minimal but sufficient.

### 3.2 `ComparedListing` ([`prisma/schema.prisma:281-291`](../../../prisma/schema.prisma))

```prisma
model ComparedListing {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  listingId String
  listing   Listing  @relation(fields: [listingId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())

  @@unique([userId, listingId])
  @@map("compared_listings")
}
```

**Status:** clean. Cap of 3 is enforced server-side at [`/api/compared/route.ts:69`](../../../src/app/api/compared/route.ts) (count >= 3 → 400). Schema-level cap is not enforced (would need a check constraint, out of scope) but the API gate is sufficient.

### 3.3 What is NOT modeled (intentional, low-risk gaps)

| Concept | Why it might matter |
|---|---|
| `Recommendation` snapshot | persisted "I asked X and got Y at time Z" record. Useful for share-with-friend or revisit. Currently impossible. |
| `UserPreferences` (default budget, specialty interest, visa, region) | no profile-level defaults flow into the quiz pre-fill. Repeat users restart from blank. |
| `PathwayPreference` | per `PATHWAY_DASHBOARD_ARCHITECTURE.md` v2 launch uses localStorage only. Not a recommend-tools concern. |
| `CostCalculatorSnapshot` | calculator output is ephemeral. No share-link. |
| `RecommendationFeedback` (admin telemetry) | no record of which user got which listings, no relevance feedback signal. Could enable abuse-detection or quality monitoring later. Defer. |

---

## 4. Recommendation engine truth audit

### 4.1 Does `/recommend` use real data?

**Yes.** [`/api/recommend/route.ts:63-80`](../../../src/app/api/recommend/route.ts) reads `Listing` rows where `status: "APPROVED"` and applies the user's filter conditions, returning the top 20 by `lastVerifiedAt → linkVerified → views`.

### 4.2 Does it use trust/source status?

**Partially yes — and correctly.** The order-by clause matches the PHASE3 trust-first ordering used by `/browse` and `<FeaturedListings>`. But:

- The CARD itself shows the verification badge via `<ListingCard>` (which already does the right thing). ✅
- The order is **trust-aware but not trust-strict** — listings with `linkVerificationStatus = "SOURCE_DEAD"` would not be filtered out. They appear behind verified+views, but they appear. Defensible (PR 0a's audit established admin-only suppression for `SOURCE_DEAD` rows is intentional), but worth documenting.

### 4.3 Does it personalize safely?

**Mostly.** Filter inputs are user-supplied query params. No PII flows to the recommendation. But:

- The visa filter is **mostly cosmetic** — only `need-support` actually constrains the query (`conditions.push({ visaSupport: true })`). The other three values (`b1b2`, `j1`, `citizen`) collect data but the route does not branch on them. **§15 M1.**
- The budget filter is **partial** — `free` resolves cleanly, but numeric ranges (`under500`, `500to1500`, `1500to3000`) parse from a free-text `cost` String field with regex. The fallback `// Can't parse, include it` ([:88](../../../src/app/api/recommend/route.ts)) means a $5,000 program with an unusual cost string slips through a $1,500-cap filter. **§15 M2.**

### 4.4 Does it overclaim match quality?

**Yes.** Multiple "best" claims with no quality model behind them:

| File / line | Phrase | Issue |
|---|---|---|
| [`src/app/recommend/page.tsx:6`](../../../src/app/recommend/page.tsx) | "Program Finder — Find the **Best** Observership for You" | tier 1 SEO title |
| [`src/app/recommend/page.tsx:8`](../../../src/app/recommend/page.tsx) | "find the **best** observership, externship, or research programs" | description |
| [`src/app/recommend/page.tsx:13`](../../../src/app/recommend/page.tsx) | "Find the **Best** Observership for You" | OG title |
| [`src/app/recommend/page.tsx:25`](../../../src/app/recommend/page.tsx) | "find the **best** observership, externship, or research programs" | JSON-LD description |
| [`src/app/recommend/recommend-client.tsx:174`](../../../src/app/recommend/recommend-client.tsx) | "Finding your **best matches**…" | loading state |
| [`src/app/recommend/recommend-client.tsx:187`](../../../src/app/recommend/recommend-client.tsx) | "**Your Top Matches**" | results header |
| [`src/app/recommend/recommend-client.tsx:269`](../../../src/app/recommend/recommend-client.tsx) | "we'll find the **best** programs for you" | quiz subtitle |

There is **no quality-ranking model** behind any of these. The engine filters by user input and orders by trust+views. "Best" overclaims. Recommended in §13: rephrase as "matches", "your matches", "matching programs" — which is what the engine actually does.

### 4.5 Does it explain why recommendations appear?

**Partially.** [`recommend-client.tsx:198-223`](../../../src/app/recommend/recommend-client.tsx) renders the user's own filter selections as chips above the results ("Under $500", "Internal Medicine", "B1/B2 Visitor Visa", "Northeast"). But this is just an echo of inputs, not an explanation of why a specific listing was selected. No "matched on visa support: yes" or "trust verified Apr 2026" tag per result.

### 4.6 Does it risk fake "best program" claims?

**Yes (H1) — but moderate.** No fabricated content; just unsupported superlatives. Different risk class from PR 0e fake forum and PR 0d AggregateRating, but same lineage as PR 0d's "Top-rated programs are featured prominently".

---

## 5. Cost calculator truth audit

### 5.1 What inputs are used?

User selects:
- **City** — one of 11 hardcoded options + "Other city".
- **Duration** — 2/4/8/12 weeks.
- **Program fee** — manual numeric input (optional).

### 5.2 What assumptions are hardcoded?

[`src/components/tools/cost-calculator.tsx:7-22`](../../../src/components/tools/cost-calculator.tsx):

| City | Housing/mo | Food/mo | Transport/mo |
|---|---|---|---|
| New York, NY | $2,000 | $400 | $130 |
| Los Angeles, CA | $1,800 | $350 | $100 |
| Chicago, IL | $1,200 | $300 | $100 |
| Houston, TX | $1,000 | $300 | $80 |
| Philadelphia, PA | $1,200 | $300 | $100 |
| Boston, MA | $1,800 | $350 | $90 |
| Cleveland, OH | $800 | $250 | $70 |
| Pittsburgh, PA | $900 | $250 | $70 |
| Detroit, MI | $700 | $250 | $80 |
| Miami, FL | $1,500 | $350 | $90 |
| Other city | $1,000 | $300 | $80 |

Insurance: hardcoded $50–$200/month range ([`:31-32`](../../../src/components/tools/cost-calculator.tsx)).

### 5.3 Are costs estimates or exact?

**Estimates.** [`:194-196`](../../../src/components/tools/cost-calculator.tsx) renders: "Estimates based on average costs. Actual costs may vary by neighborhood, lifestyle, and time of year." Disclaimer is honest but minimal.

### 5.4 Are exchange rates / current costs stale?

**No source attribution, no `lastUpdated` timestamp.** The numbers may have been accurate at compose time but there is nothing in the page or the underlying data that tells the user when they were last validated. NYC housing $2,000/month/single is a 2022-era number; 2026 reality is meaningfully higher in many neighborhoods. **§15 M2.**

No exchange-rate concern — costs are USD-only.

### 5.5 Are disclaimers adequate?

**Minimum-viable.** The single disclaimer line covers the user against literal "this is the exact number" interpretation. It does **not**:

- Cite a source ("Bureau of Labor Statistics 2025", "Numbeo", "user-reported median").
- Identify a `lastUpdated` date.
- List items not included (visa stamping fees, USMLE registration, ECFMG fees, malpractice, NPI registration, hospital security clearance, criminal-background check, drug test).
- Flag IMG-specific cost shocks (e.g. some programs require a $200-500 background-check pre-payment).

### 5.6 Does it imply financial advice?

**Borderline yes — and the JSON-LD makes it worse.** The page-level [`src/app/tools/cost-calculator/page.tsx:27`](../../../src/app/tools/cost-calculator/page.tsx) declares:

```ts
applicationCategory: "FinanceApplication"
```

Per Schema.org, `FinanceApplication` is for software that "primarily allows users to access banking accounts, manage finances, transfer funds, file tax returns, prepare loan applications, etc." A 11-city static-table estimator does not qualify. Risk classes:

1. **Rich-results inference** — Google may surface the page with finance-tool credibility cues that aren't earned.
2. **Brand-truth** — implies USCEHub offers financial-advice tooling, which sets a higher bar (FTC-style disclosure, fairness, fiduciary impressions for IMGs new to US finance norms).
3. **Pre-monetization risk** — same FTC-style risk class as the `/residency/finances` insurance-carrier brand-naming PR #42 closed.

**§15 H2.** Recommend downgrading to `applicationCategory: "EducationalApplication"` (consistent with `/recommend` and `/compare`) **or** removing the JSON-LD entirely. Authorized SEO-implementation exception class — same shape as PR #42's `AggregateRating` removal.

---

## 6. Compare / save flow audit

### 6.1 Can users save?

**Yes.** `POST /api/saved` is auth-gated, idempotent (unique constraint → 409 on duplicate), and surfaces in `/dashboard/saved`. Clean.

### 6.2 Can users compare?

**Yes — two paths:**

1. **Ad-hoc compare** — `/compare?ids=a,b,c` reads up to 3 ids from URL and fetches `/api/compare` server-side. Public.
2. **Persistent compare** — `POST /api/compared` adds a listing to a user's compare set (cap 3), `/dashboard/compare` reads them. Auth-gated.

Both paths pull APPROVED-only listings.

### 6.3 Does compare use source / trust fields?

**Yes for the public ad-hoc path** ([`/api/compare/route.ts:42-43`](../../../src/app/api/compare/route.ts) selects `linkVerificationStatus` + `lastVerifiedAt`). The `<CompareClient>` renders these via `<VerificationCell>`. ✅

**No for the persistent dashboard path** ([`/api/compared/route.ts:18-32`](../../../src/app/api/compared/route.ts) selects only basic listing fields — `linkVerified` and `linkVerificationStatus` are omitted from the select). The dashboard compare table at [`/dashboard/compare/page.tsx:28-36`](../../../src/app/dashboard/compare/page.tsx) does not render verification chips. **§15 M3.** Mild inconsistency — the public compare table shows trust, the user's persistent compare list does not.

### 6.4 Does compare overclaim completeness?

**No.** Both paths render only the fields they select. No "all factors considered" framing. Clean.

### 6.5 Does compare expose stale or missing data?

**Partial.** If a saved-compare listing's `lastVerifiedAt` is months old, the public ad-hoc path surfaces the stale verification chip; the dashboard path does not surface it at all. The fact that users may bookmark a 3-listing comparison and revisit a year later is not handled — no "this listing's source link was verified Apr 2025" notice. Defer to a future refresh-stale-comparisons PR.

---

## 7. Public visitor flow

| Action | Available? | Notes |
|---|---|---|
| Use `/recommend` quiz | ✅ | unauthenticated; no walls |
| Use `/tools/cost-calculator` | ✅ | unauthenticated |
| Compare listings via `/compare?ids=...` | ✅ | unauthenticated; up to 3 |
| Save a listing | ❌ — auth required | redirects to login (returnTo preserved per direct-share doctrine) |
| See trust/source fields | ✅ on `/recommend` and `/compare` | matches PHASE3 trust language |
| Share results | ⚠️ partial | quiz answers + selections are URL-derivable but the `/recommend` page does NOT surface them as a stable URL (no `?budget=...&specialty=...` push). `/compare?ids=` is shareable. |
| Hit login walls | only on save / dashboard | acceptable per direct-share doctrine |

**Shared-entry compliance:** good. `/compare?ids=...` is a shareable URL that opens directly without modal hijack. `/recommend` does not preserve quiz state in the URL today (M-class polish).

---

## 8. Logged-in user flow

| Action | Available? | Notes |
|---|---|---|
| Save listings | ✅ | `/dashboard/saved` |
| Persist a compare set | ✅ | `/dashboard/compare`, cap 3 |
| Persist recommendations | ❌ | no snapshot — every quiz session is ephemeral |
| Persist calculator outputs | ❌ | client-only; no API |
| Use dashboard tools | ✅ | saved + compare are real |
| Delete / reset data | ✅ | `DELETE /api/saved`, `DELETE /api/compared` |
| Avoid stale pathway cache | n/a today | localStorage-only pathway preference is per `PATHWAY_DASHBOARD_ARCHITECTURE.md`; not interacting with tools yet |

**No multi-session continuity for recommendations.** A user who completes the quiz, browses elsewhere, and returns — starts from blank. Defer to a future user-preferences PR.

---

## 9. Admin / ops flow

| Action | Available? | Notes |
|---|---|---|
| Audit recommendation quality | ❌ | no admin view of which listings are surfaced |
| See bad recommendations | ❌ | no telemetry, no feedback model |
| Override unsafe recommendation logic | ⚠️ partial | admin can `featured: true` to influence `<FeaturedListings>` ordering, but `/recommend` does not consider `featured` |
| Verify calculator assumptions | ❌ | admins cannot edit city-cost data without a code change |
| Track broken tool outcomes | ❌ | no telemetry |

Tools are operationally lightweight from admin's side. No abuse vectors emerge today (low traffic, no UGC). Defer ops tooling to post-launch.

---

## 10. Trust and safety analysis

| Vector | Severity | Today's exposure | Why |
|---|---|---|---|
| Misleading recommendations | **H1, today** | "best match" copy with no model | covered §4.4 |
| Paid-placement conflicts | low | none today | `featured: true` is admin-curated; not paid; not surfaced to `/recommend` either |
| Stale data (cost calculator) | **M2, today** | hardcoded city numbers age silently | no `lastUpdated` field |
| Source status ignored in recommend | low | already trust-aware in ranking | not a gap |
| Hidden ranking logic | medium | no per-result rationale | M3 |
| Bias against certain applicant groups | low-moderate | visa filter is cosmetic for 3 of 4 options (M1) | b1b2/j1/citizen users see the same results, which may hide visa-incompatible listings as if they were eligible |
| Visa-sensitive recommendations | medium | engine does not warn when filter mismatches a listing's visa requirements | cross with M1 |
| Financial / insurance advice risk | **H2, today** | `FinanceApplication` JSON-LD overclaims | covered §5.6 |

No critical (C-class) finding. Two H-class trust gaps (H1 copy, H2 JSON-LD) and three M-class gaps.

---

## 11. SEO / shared-entry implications

### 11.1 Are tool pages indexable?

| Surface | Indexable? | Sitemap? | Verdict |
|---|---|---|---|
| `/recommend` | yes | yes (priority 0.8) | **fine.** SSR shell renders the quiz; results are client-side React state, so Google sees the tool, not personalized output. No thin/duplicate result-page risk. |
| `/compare` | yes | yes (priority 0.7) | **fine.** Same architecture — SSR shell + client-side compare. Stable URL with `?ids=` parameters does not generate distinct indexed URLs because the shell is identical. |
| `/tools/cost-calculator` | yes | yes (priority 0.7) | **fine in terms of indexation;** the `FinanceApplication` JSON-LD is the H2 issue (§5.6). |

**Result-page indexation:** none of the three tools generates thin / duplicate UGC pages. Architecture is correct out of the box. ✅

### 11.2 URL-wins doctrine compliance

| Surface | Compliance |
|---|---|
| `/recommend` direct link | ✅ opens directly; quiz state is fresh-session every time |
| `/recommend` shareable result link | ❌ — quiz answers are not pushed to URL. Future polish. |
| `/compare?ids=a,b,c` | ✅ shareable, opens directly |
| `/dashboard/saved` shared link | redirects to login with `returnTo` (per existing auth flow) |
| `/dashboard/compare` shared link | same |
| `/tools/cost-calculator` direct link | ✅ |
| `/tools/cost-calculator` shareable result | ❌ — calculator state is local, not URL-encoded. Future polish. |

No critical violations. Two minor "share your result" gaps that can be addressed post-launch.

### 11.3 No SEO changes proposed in this audit

Per audit-only scope: `/recommend`, `/compare`, and `/tools/cost-calculator` indexation policy stays as-is. The H2 fix (`FinanceApplication` → `EducationalApplication` or remove) is queued as a follow-up code PR (§17 PR 0f-fix-1), not implemented here.

---

## 12. Relationship to platform-v2 pathways

Per [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](../PATHWAY_DASHBOARD_ARCHITECTURE.md):

| Pathway | Tool fit | Notes |
|---|---|---|
| **USCE & Match (Pathway 1)** | natural — observership/externship/research recommendation, observership cost estimate, observership compare | exactly what the existing tools cover. All three tools are Pathway 1 first. |
| **Residency & Fellowship (Pathway 2)** | partial fit — fellowship guide already lives at `/residency/fellowship/guide`; no fellowship-recommend, no boards-prep cost calculator | future pathway-scoped tools (boards-prep cost calculator, fellowship-recommender, moonlighting-rate calculator) belong on `/residency/*` not `/tools` |
| **Practice & Career (Pathway 3)** | none today — career tools live under `/career/*` (out of audit scope) | jobs/contracts/visa/insurance tools are already pathway-scoped to `/career/*`. Don't migrate them into `/tools/*` |
| **Show All Pathways (meta)** | n/a | tool dashboard is per-pathway |

**Conclusion:** the three audited tools should remain at their current paths. Future pathway-scoped tools should live under `/residency/*` (Pathway 2) and `/career/*` (Pathway 3 — out of scope) rather than expanding `/tools/*`. Tag this audit's findings as **`pathway: usce_match`**.

---

## 13. Copy / marketing risk

| File | Quote | Status | Recommended fix |
|---|---|---|---|
| [`src/app/recommend/page.tsx:6`](../../../src/app/recommend/page.tsx) | "Program Finder — Find the Best Observership for You" | **H1** | "Program Finder — Match Programs to Your Profile" |
| [`src/app/recommend/page.tsx:8`](../../../src/app/recommend/page.tsx) | "find the best observership, externship, or research programs" | **H1** | "find observership, externship, or research programs that match your filters" |
| [`src/app/recommend/page.tsx:13`](../../../src/app/recommend/page.tsx) | OG "Find the Best Observership for You" | **H1** | mirror title fix |
| [`src/app/recommend/page.tsx:25`](../../../src/app/recommend/page.tsx) | JSON-LD "find the best…" | **H1** | mirror title fix |
| [`src/app/recommend/recommend-client.tsx:174`](../../../src/app/recommend/recommend-client.tsx) | "Finding your best matches…" | **H1** | "Finding your matches…" |
| [`src/app/recommend/recommend-client.tsx:187`](../../../src/app/recommend/recommend-client.tsx) | "Your Top Matches" | **H1** | "Your Matches" |
| [`src/app/recommend/recommend-client.tsx:269`](../../../src/app/recommend/recommend-client.tsx) | "we'll find the best programs for you" | **H1** | "we'll find programs that match your filters" |
| [`src/app/tools/cost-calculator/page.tsx:6`](../../../src/app/tools/cost-calculator/page.tsx) | "Cost Calculator — **Estimate** Your Observership Costs" | **fine** ("Estimate" is honest) | keep |
| [`src/components/tools/cost-calculator.tsx:194-196`](../../../src/components/tools/cost-calculator.tsx) | "Estimates based on average costs" | **fine** | acceptable; could strengthen with `lastUpdated` line |
| `<TipsToReduceCosts>` block at `/tools/cost-calculator` | several specific cost-saving tips | **fine** | content-honest; not financial advice |
| Anywhere | "personalized" / "AI-powered" / "guaranteed" / "exact cost" / "complete cost" | **absent** ✅ | confirmed via grep; no fake credibility claims |
| `<FloatingFinder>` title | "Program Finder" | **fine** | keep |

The phrase "best" appears 7+ times across `/recommend`. Replacing with "match" / "your matches" is the H1 fix. ~7 single-word swaps + a JSON-LD field. ~10-15 LOC.

---

## 14. Functional truth table

| Action | Real / Partial / Missing / Unsafe / Unknown |
|---|---|
| Recommendation page loads | **Real** |
| Recommendation uses real listing data | **Real** |
| Recommendation uses trust status | **Real** (order-by `lastVerifiedAt → linkVerified → views`) |
| Recommendation explains ranking | **Missing** — no per-result rationale (M3) |
| Visa filter is functional | **Partial** — only `need-support` filters; b1b2/j1/citizen are cosmetic (M1) |
| Budget filter is precise | **Partial** — falls back to "include if can't parse cost" (M2 sub-issue) |
| User can save recommendation | **Missing** — no snapshot |
| Cost calculator works | **Real** — client-side, hardcoded inputs |
| Calculator assumptions visible | **Partial** — minimal disclaimer; no source / `lastUpdated` (M2) |
| Calculator JSON-LD honest | **Unsafe** — `FinanceApplication` overclaims (H2) |
| Compare works (public) | **Real** — `/compare?ids=` |
| Compare works (persistent) | **Real** — `/dashboard/compare`, cap 3 |
| Compare shows trust/source fields | **Partial** — public path shows them, dashboard path does not (M3 sub) |
| Result pages noindex / private | **n/a** — architecture serves SSR shell only; client-state results not indexed (correct by construction) |
| Admin can audit quality | **Missing** |
| Saved listings work | **Real** |
| `<FloatingFinder>` link works | **Real** |
| Copy: "best" / "top" overclaims | **Unsafe** (H1) |

---

## 15. Risks found

### Critical (C-class)

**None.** Materially less severe than PR 0d / PR 0e.

### High (H-class) — ship a small fix PR before any v2 marketing push

| ID | File / route | Risk |
|---|---|---|
| **H1** | [`src/app/recommend/page.tsx:6,8,13,25`](../../../src/app/recommend/page.tsx) + [`src/app/recommend/recommend-client.tsx:174,187,269`](../../../src/app/recommend/recommend-client.tsx) | "best match" / "best programs" / "Top Matches" copy unsupported by any quality-ranking model. The engine filters and orders by trust+views. |
| **H2** | [`src/app/tools/cost-calculator/page.tsx:27`](../../../src/app/tools/cost-calculator/page.tsx) | `applicationCategory: "FinanceApplication"` JSON-LD overclaims for a static client-side estimator. Same FTC-pre-monetization risk class as PR #42's `/residency/finances` brand-name fix. Authorized SEO-impl exception class. |

### Medium (M-class)

| ID | File / route | Risk |
|---|---|---|
| **M1** | [`src/app/api/recommend/route.ts:36-39`](../../../src/app/api/recommend/route.ts) | Visa filter only honors `need-support`. The other 3 options collect data but do not constrain the query. Users on B1/B2 see results that may not accept B1/B2 visitors. |
| **M2** | [`src/components/tools/cost-calculator.tsx:7-32`](../../../src/components/tools/cost-calculator.tsx) | City-cost data hardcoded with no `lastUpdated`, no source attribution, no IMG-specific fee items (ECFMG, USMLE, malpractice, NPI, background check). Numbers age silently. |
| **M3** | `/recommend` results page + `/dashboard/compare` | Two related polish gaps: (a) no "why this matched" rationale on each result card; (b) the persistent compare dashboard at `/dashboard/compare` does NOT surface trust fields, while the public `/compare?ids=` path does. Mild inconsistency. |
| **M4** | `/recommend` quiz shareability | quiz answers are not pushed to URL (`?budget=...&specialty=...&visa=...&region=...`) — direct-share / refresh / "send to friend" loses state. |
| **M5** | Cost calculator scope | does not include common IMG-specific fees: ECFMG application, USMLE Step registration, malpractice insurance, NPI, hospital security clearance, background check, drug test. A user reading the total believes they have the complete cost; in practice, USMLE+ECFMG alone can add $4-6K. |

### Low (L-class)

| ID | File / route | Risk |
|---|---|---|
| **L1** | `/api/recommend` no rate limit | low traffic today; theoretical only. Same gap class as PR 0d's review/flag rate limit (PR #42 added those). Consider adding when volume rises. |
| **L2** | Budget regex parser falls back to "include" on parse failure | minor — could be tightened to "exclude on parse failure" to be conservative. |
| **L3** | No admin telemetry on tool usage | can't tell if `/recommend` returns 0-result responses or unusually narrow results. Defer. |

---

## 16. Recommended v2 decision

**Decision A6: option B — limited utility tools with conservative copy.**

Reasoning:

- Option **A** (treat as real-functional now) — **rejected.** "Best match" copy + `FinanceApplication` JSON-LD overclaim. Conservative copy is required.
- Option **B** (limited utility tools, conservative copy) — **chosen.** Tools work; framing must match what the engine actually does.
- Option **C** (hide / de-emphasize) — **rejected.** The tools are useful and demonstrably real. No reason to hide.
- Option **D** (build small fix PR before v2) — **chosen as parallel track.** PR 0f-fix-1 below.
- Option **E** (defer broad recommendation engine) — **rejected.** The recommendation engine is real-functional; defer would lose value.

The fix PR is small (~25-40 LOC code + copy) and worth doing before any v2 marketing push.

---

## 17. Recommended follow-up PRs

| PR | Type | Scope | Blocker? |
|---|---|---|---|
| **PR 0f-fix-1 (copy + small SEO)** | code (small) | H1: replace "best match" / "best programs" / "Top Matches" / "Finding your best matches" across `recommend/page.tsx` + `recommend-client.tsx` (7 swaps). H2: change `applicationCategory` from `"FinanceApplication"` to `"EducationalApplication"` (or remove the JSON-LD entirely). M1: drop the b1b2/j1/citizen dead branches from the visa filter UI, OR wire them to a real `Listing` field if one exists. ~25-40 LOC. Authorized SEO-impl exception (`FinanceApplication` removal) — same shape as PR #42's `AggregateRating` and PR #44's `DiscussionForumPosting`. | **YES** before v2 marketing push |
| **PR 0f-fix-2 (cost-calculator data hygiene)** | code (small) | M2: add a visible `Last reviewed: 2026-04` line + a "What's NOT included" section listing ECFMG, USMLE, malpractice, NPI, background check. No data update; just disclosure. ~30-50 LOC. | nice-to-have, not blocker |
| **PR 0f-fix-3 (recommend rationale + dashboard compare trust)** | code (medium) | M3a: per-result chips on `/recommend` showing "matched: visa support yes", "verified Apr 2026". M3b: surface `linkVerificationStatus` + `lastVerifiedAt` on `/dashboard/compare` to match the public path. ~80-120 LOC. | post-launch |
| **PR 0f-fix-4 (recommend quiz URL state)** | code (small) | M4: push quiz answers to URL via `useSearchParams` so direct-share / refresh works. ~30-50 LOC. | post-launch |
| **(future) recommendation persistence** | code (medium) + schema | new `Recommendation` model + snapshot save flow + share-link route. **Schema PR — only if authorized later.** | deferred |
| **(future) admin tool telemetry** | code | recommendation quality dashboard. | deferred |

**Batching recommendation:** **PR 0f-fix-1 + PR 0f-fix-2 batched as a single small "v2 tools truth-fix" PR** (~55-90 LOC). Same shape as PR #42 (review fix) and PR #44 (community fix). PR 0f-fix-3 and PR 0f-fix-4 are post-launch.

---

## 18. Do-not-do list

- **Do not** claim "best" or "guaranteed match" anywhere on `/recommend` until a real quality-ranking model exists (engagement weight, completion-rate, review-weighted, etc.).
- **Do not** mix paid placement into recommendations. `featured: true` is admin-curated for `<FeaturedListings>` only; it must not flow into `/recommend` ordering until a paid-placement disclosure policy exists.
- **Do not** call cost-calculator estimates exact, comprehensive, or financial advice. Keep the "Estimate" framing.
- **Do not** restore `applicationCategory: "FinanceApplication"` on the cost calculator until a real financial-advisory feature ships with appropriate disclosure.
- **Do not** add `Recommendation` / `AggregateRating` / `Review` JSON-LD to `/recommend` results.
- **Do not** index personalized / dynamic tool result pages — current architecture (SSR shell + client-state results) already prevents this; preserve it.
- **Do not** recommend visa / jobs / contracts / insurance from `/recommend` or `/tools/*` without dedicated disclaimers and source-link verification. (Career tools live under `/career/*` and are out of audit scope.)
- **Do not** hide recommendation logic — when M3 ships, surface why each listing was matched.
- **Do not** add `Recommendation` schema in this audit cycle. Defer.
- **Do not** rate-limit `/api/recommend` / `/api/compare` / `/api/saved` yet — low traffic, theoretical risk only. Add when volume rises (mirror PR #42's review rate-limit).
- **Do not** touch `/career/compare-states`, `/career/state-compare`, or any other `/career/*` tool. Out of scope.
- **Do not** migrate `/career/*` tools into `/tools/*`. Pathway scoping should remain.

---

## 19. Final recommendation

**Lock A6 = option B (limited utility tools, conservative copy).** Tools are real; framing must match.

**Action queue:**

1. **After midnight Pacific:** re-check PR #44 (community truth-safety fix); merge if Vercel rate-limit cleared and checks green.
2. **Then push this branch** — `local/docs-v2-audit-0f-recommend-tools` rebased on the post-#44 main, renamed to `docs/v2-audit-0f-recommend-tools`, and opened as a new PR (docs-only audit).
3. **Then proceed to PR 0g — cost-calculator flow audit** as the user has queued. (Note: substantial overlap with this audit's §5; expect PR 0g to focus on calculator-specific findings and may largely cite §5/§15 here.)
4. **After Phase 0 closes:** ship **PR 0f-fix-1 + PR 0f-fix-2 batched** as a single small "v2 tools truth-fix" PR (~55-90 LOC). Authorized SEO-impl exception for the `FinanceApplication` removal (mirrors PR #42 / PR #44).
5. PR 0f-fix-3 / -4 / future schema work all deferred to post-launch.

**Pathway tag:** `usce_match`. The three audited tools belong to Pathway 1 only. Pathway 2 tools should live under `/residency/*` (already do — fellowship guide). Pathway 3 tools live under `/career/*` (already do — out of scope here).

**No critical security gap.** Auth is correct on every authed route. Public routes are correctly public. The H-class findings are integrity / trust / SEO-credibility concerns that the proposed fix PR closes without schema changes.

**Local-only branch posture:** this audit was drafted on `local/docs-v2-audit-0f-recommend-tools` while PR #44 is unmerged + Vercel rate-limited. **Do not push** until after midnight Pacific. After PR #44 merges, this branch should be rebased onto fresh main, renamed to `docs/v2-audit-0f-recommend-tools`, and opened as a regular PR.

---

*End of PR 0f audit (drafted local-only, not yet pushed). Sibling audits: [POSTER_FLOW_AUDIT.md](POSTER_FLOW_AUDIT.md) (PR #32), [RESIDENCY_NAMESPACE_AUDIT.md](RESIDENCY_NAMESPACE_AUDIT.md) (PR #38), [APPLICATION_FLOW_AUDIT.md](APPLICATION_FLOW_AUDIT.md) (PR #40), [REVIEW_FLOW_AUDIT.md](REVIEW_FLOW_AUDIT.md) (PR #41), [COMMUNITY_FLOW_AUDIT.md](COMMUNITY_FLOW_AUDIT.md) (PR #43). Predecessor fix: [V2_COPY_TRUTH_FIX_LOG.md](V2_COPY_TRUTH_FIX_LOG.md) (PR #42, merged) + [V2_COMMUNITY_TRUTH_FIX_LOG.md](V2_COMMUNITY_TRUTH_FIX_LOG.md) (PR #44, open). Next: PR 0g — cost-calculator flow audit (significant overlap with §5/§15 of this audit).*
