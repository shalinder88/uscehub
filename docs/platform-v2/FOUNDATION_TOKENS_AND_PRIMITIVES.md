# Platform v2 Foundation: Tokens and Primitives (PR P1-1)

**Status:** initial scaffold
**Branch:** `build/p1-foundation-tokens-primitives`
**Sources of truth this aligns with:**
- [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](PATHWAY_DASHBOARD_ARCHITECTURE.md)
- [`HOMEPAGE_V2_WIREFRAME.md`](HOMEPAGE_V2_WIREFRAME.md)
- [`NAVIGATION_MODEL.md`](NAVIGATION_MODEL.md)
- [`SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md`](SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md)
- [`TRUST_AND_MONETIZATION_POLICY.md`](TRUST_AND_MONETIZATION_POLICY.md)
- [`audits/REVIEW_FLOW_AUDIT.md`](audits/REVIEW_FLOW_AUDIT.md) §9
- [`audits/V2_COPY_TRUTH_FIX_LOG.md`](audits/V2_COPY_TRUTH_FIX_LOG.md), [`V2_COMMUNITY_TRUTH_FIX_LOG.md`](audits/V2_COMMUNITY_TRUTH_FIX_LOG.md), [`V2_RECOMMEND_COST_TRUTH_FIX_LOG.md`](audits/V2_RECOMMEND_COST_TRUTH_FIX_LOG.md)

This is the **first** real-build PR after Phase 0. Scope is intentionally narrow: add isolated tokens + primitives that future Pathway #1 PRs (P1-2 → P1-8) will compose. **No public route launches in this PR.**

---

## What was added

### Library

| File | Purpose |
|---|---|
| [`src/lib/platform-v2/tokens.ts`](../../src/lib/platform-v2/tokens.ts) | Pathway keys/labels/descriptions, trust statuses + labels + hints, module keys/labels/descriptions, conservative empty-state copy, URL-wins helpers (`RETURN_TO_PARAM`, `PATHWAY_LOCALSTORAGE_KEY`). |
| [`src/lib/platform-v2/pathways.ts`](../../src/lib/platform-v2/pathways.ts) | Type guards (`isPathwayKey`), lookup (`getPathway`), default + resolution helpers (`DEFAULT_PATHWAY_KEY`, `resolvePathwayKey`). |
| [`src/lib/platform-v2/index.ts`](../../src/lib/platform-v2/index.ts) | Barrel export. |

### Components

All in `src/components/platform-v2/`:

| Component | Use case | Import |
|---|---|---|
| `<PathwayCard>` | Selectable pathway tile (PR P1-2 homepage selector). Renders as `<button>` when `onSelect` passed, else display-only `<div>`. | `import { PathwayCard } from "@/components/platform-v2"` |
| `<TrustCue>` | Conservative source-link verification chip + optional "Report issue" affordance + last-reviewed line. | same |
| `<ModuleCard>` | Dashboard / homepage module tile (PR P1-3 dashboard shell). Renders as `<Link>` when `href` passed. **Strict no-fake-counts doctrine.** | same |
| `<SectionHeader>` | Reusable section heading with eyebrow / title / description / action slot. | same |
| `<EmptyState>` | Empty-state pattern with conservative copy and optional CTA. | same |

### Docs

This file (`FOUNDATION_TOKENS_AND_PRIMITIVES.md`).

---

## What this PR does NOT do

| Forbidden | Status |
|---|---|
| Launch any v2 public route | not done |
| Replace homepage | not done |
| Add a pathway selector to the homepage | not done (queued for PR P1-2) |
| Modify dashboard routes | not done (queued for PR P1-3) |
| Touch `/career` or `/careers` | not touched |
| Modify schema / migrations / seed | not touched |
| Modify `sitemap.ts` / `robots` / canonical / JSON-LD / redirects | not touched |
| Add cron / send email / monetization | not touched |
| Modify auth / session logic | not touched |
| Drop stashes / delete branches / force push | not done |

The PR adds isolated files; existing production surfaces are untouched.

---

## How to use

### Pathway primitives

```ts
import { PATHWAYS, PATHWAY_KEYS, getPathway, isPathwayKey } from "@/lib/platform-v2";

// Iterate the four pathways for a selector:
for (const p of PATHWAYS) {
  // p.key, p.label, p.description
}

// Validate a value of unknown provenance (URL param, localStorage):
const raw = searchParams.get("pathway");
if (isPathwayKey(raw)) {
  // ...
}

// Resolve with fallback to USCE & Match:
const key = resolvePathwayKey(raw);
```

### `<PathwayCard>`

```tsx
import { PathwayCard } from "@/components/platform-v2";
import { PATHWAY_KEYS } from "@/lib/platform-v2";

<PathwayCard
  pathwayKey={PATHWAY_KEYS.USCE_MATCH}
  eyebrow="Pathway 1"
  title="USCE & Match"
  description="Observerships, externships, research, application planning, and Match strategy."
  active={current === PATHWAY_KEYS.USCE_MATCH}
  onSelect={(key) => setCurrent(key)}
/>
```

### `<TrustCue>`

```tsx
import { TrustCue } from "@/components/platform-v2";
import { TRUST_STATUSES, REPORT_ISSUE_LABEL } from "@/lib/platform-v2";

<TrustCue
  status={TRUST_STATUSES.VERIFIED}
  lastReviewed="Last verified: April 14, 2026"
  reportHref="/contact-admin"
  reportLabel={REPORT_ISSUE_LABEL}
/>

// Conservative defaults — never says "verified" unless status supports it:
<TrustCue status={TRUST_STATUSES.ON_FILE} />
// Renders: "Source on file" amber chip with hint
//   "Source URL on file but not freshly verified — confirm details on the institution page."
```

### `<ModuleCard>`

```tsx
import { ModuleCard } from "@/components/platform-v2";
import { MODULE_KEYS, MODULE_LABELS, MODULE_DESCRIPTIONS } from "@/lib/platform-v2";

<ModuleCard
  title={MODULE_LABELS[MODULE_KEYS.SAVED_LISTINGS]}
  description={MODULE_DESCRIPTIONS[MODULE_KEYS.SAVED_LISTINGS]}
  href="/dashboard/saved"
  status={`${realCount} saved`}
  statusTone="neutral"
/>

// HARD RULE: do NOT pass a fake count. If you don't yet have real data,
// omit `status` entirely. Show real or omit.
```

### `<SectionHeader>` and `<EmptyState>`

```tsx
import { SectionHeader, EmptyState } from "@/components/platform-v2";
import { EMPTY_STATE_COPY } from "@/lib/platform-v2";

<SectionHeader
  eyebrow="USCE & Match"
  title="Suggested listings"
  description="Listings matching your filters."
  action={<Link href="/recommend">Adjust filters</Link>}
/>

<EmptyState
  title={EMPTY_STATE_COPY.SAVED_LISTINGS.title}
  description={EMPTY_STATE_COPY.SAVED_LISTINGS.description}
  action={<Link href="/browse">Browse listings</Link>}
/>
```

---

## Doctrine these primitives encode

### URL-wins (per [`SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md`](SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md))

- **`PathwayCard` does NOT navigate.** It emits `onSelect(key)` upward; the parent decides what to do (write localStorage, scroll, etc.). Selecting a pathway is a soft preference, not a route change.
- **`PATHWAY_LOCALSTORAGE_KEY`** is exposed in tokens for the parent to use, but **primitives never touch localStorage themselves**. The boundary stays clean.
- **`RETURN_TO_PARAM`** is a constant for callers wiring `returnTo` flows — not used inside any primitive directly.
- Primitives never read or write `URLSearchParams`. The page level owns URL state.

### No fake metrics (per [`audits/REVIEW_FLOW_AUDIT.md`](audits/REVIEW_FLOW_AUDIT.md) and [`V2_COMMUNITY_TRUTH_FIX_LOG.md`](audits/V2_COMMUNITY_TRUTH_FIX_LOG.md))

- **`<ModuleCard status={...}>` is opt-in.** Parent supplies real counts or omits the chip. The primitive does not invent "5 saved" / "3 unread" / "trending" labels.
- **`<EmptyState>`** must never nudge with manufactured social proof. `EMPTY_STATE_COPY` defaults are conservative.
- **`<TrustCue>`** never says "Verified" for `on-file` / `unverified` / `needs-recheck`. Word-by-word audit: search the source — there is exactly one `verified` label, and it gates on `status === verified`.

### Pathway scoping

- The four pathway keys (`usce_match`, `residency_fellowship`, `practice_career`, `all_pathways`) are stable. Renaming them requires a coordinated migration of localStorage values and any future analytics events.
- USCE & Match is `DEFAULT_PATHWAY_KEY` because Pathway #1 ships first.

### Reviews ≠ source verification

- `<TrustCue>` describes the **source link** only. Reviews are a separate user-content moderation system (PR #41 audit). The two should sit visually separated; PR #42 added the inline separator copy on `/listing/[id]`. Future surfaces using `<TrustCue>` should respect that boundary.

---

## How future PRs should use this

Recommended composition order:

1. **PR P1-2 — Homepage USCE-first selector**
   - Use `<PathwayCard>` wrapped around the existing hero section.
   - Default to `DEFAULT_PATHWAY_KEY = "usce_match"`.
   - Persist selection via `PATHWAY_LOCALSTORAGE_KEY`.
   - **No URL preference.** URL wins.
   - **No redirect.** Selecting a pathway only changes which modules are emphasized below.

2. **PR P1-3 — USCE & Match dashboard shell**
   - Compose `<SectionHeader>` + several `<ModuleCard>`s.
   - Modules: `MODULE_KEYS.SAVED_LISTINGS`, `MODULE_KEYS.COMPARE`, `MODULE_KEYS.SUGGESTED_LISTINGS`, `MODULE_KEYS.COST_ESTIMATOR`, `MODULE_KEYS.CHECKLIST`, `MODULE_KEYS.ALERTS_PREVIEW`.
   - Use `<EmptyState>` for empty modules.
   - **No fake counts.** Omit `status` until real data is wired.

3. **PR P1-4 — Listing detail trust/action cleanup**
   - Replace ad-hoc trust chips on `/listing/[id]` with `<TrustCue>`.
   - Maps existing `LinkVerificationStatus` enum values to `TrustStatus` values.
   - Preserves the PR #42 review-vs-verification separator copy.

4. **PR P1-5 — Save / compare / recommend polish**
   - Reuses existing `<ListingCard>` + new `<TrustCue>` for consistent trust-language.
   - Conservative recommendation copy (already shipped in PR #47).

5. **PR P1-6 — Cost calculator launch-safe verify**
   - Likely collapses to a verification pass since PR #47 already shipped the truth-fix. Add no new scope.

6. **PR P1-7 — Checklist module**
   - Uses `<ModuleCard>` + `<EmptyState>` from this PR.
   - Local/user-level only.
   - **No real email** until P1-8 confirms launch readiness.

7. **PR P1-8 — QA + release batch**
   - Mobile QA, shared-link QA, `noindex` review, trust-copy review, rollback plan, screenshots → deployment window.

---

## Testing

This PR adds primitives only; there is no user-facing UI to QA yet. Verification is type / lint / build only:

- `npx tsc --noEmit` clean
- `npm run lint` 0 errors (pre-existing warnings unchanged)
- `npm run build` clean

When PR P1-2 wires `<PathwayCard>` into the homepage selector, **manual interaction QA via the preview environment is required** before merge — this is when the user-facing UI first appears.

---

## What is intentionally deferred

| Concept | Why |
|---|---|
| Storybook / component playground | Out of scope — no public dev route. Add only if explicitly authorized. |
| `<PathwayContextProvider>` | Pathway preference is localStorage-only at v2 launch. Context is overkill until multiple disjoint surfaces need it. |
| Server-side pathway preference | Forbidden for v2 launch (no schema). Stays localStorage-only. |
| Analytics events on `<PathwayCard onSelect>` | Out of scope — analytics integration is a separate PR. |
| Animation / motion | Defer to a Phase 2 motion-system PR. |
| RTL / locale | Out of scope. |
| Theme variants beyond default-and-dark | Out of scope. |

---

*End of FOUNDATION_TOKENS_AND_PRIMITIVES.md. Next: PR P1-2 — homepage USCE-first selector.*
