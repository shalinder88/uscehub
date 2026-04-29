# V2 Community Truth-Safety Fix Log (PR 0e-fix)

**PR title:** Fix community truth and placeholder SEO
**Branch:** `fix/community-truth-safety`
**Source audit:** [COMMUNITY_FLOW_AUDIT.md](COMMUNITY_FLOW_AUDIT.md) (PR 0e, merged at `63815dc`).
**Pattern precedent:** [V2_COPY_TRUTH_FIX_LOG.md](V2_COPY_TRUTH_FIX_LOG.md) (PR #42 — review-flow truth/safety fix).
**Scope:** small surgical changes that close PR 0e audit findings C1, C2, C3, H1, H2, H3, H4. **No** new backend, **no** schema, **no** real emails, **no** monetization, **no** `/career` changes, **no** broad redesign.

---

## What was fixed

### A. Fake community content removed (PR 0e audit C1)

`src/components/community/community-tabs.tsx` was wholly rewritten. The previous implementation contained:

- Hardcoded fake "Dr." users rendered as live swap-board posts (`Dr. Amira K.`, `Dr. Raj P.`, `Dr. Maria L.`).
- Hardcoded fake discussion threads (`Dr. Sarah M.`, `Dr. Ahmed R.`, `Dr. Li W.`, `Dr. Priya N.`, "USCEHub Team") with fabricated reply counts (`replyCount: 47`, etc.) and fabricated dates.
- A "Swap Board" tab with a fake-data render path.
- A "Discussions" tab with a fake-data render path.
- A `categoryBadgeVariant` / `reasonBadgeVariant` styling layer that only mattered to the fake data.
- A non-functional "Contact" button on swap-post cards (no `onClick`, no `href`).

The rewritten file:

- Drops every `Dr.`-named seed entry, every fake post, every fabricated count.
- Drops the "Swap Board" and "Discussions" tabs entirely (no fake data, no in-memory submission paths to confuse for real ones).
- Keeps the **real third-party external community links** (Reddit r/IMGreddit, r/residency, r/Step1, r/Step2, Student Doctor Network, IMG Friendly Programs Spreadsheet) — these are unambiguously off-platform, useful, and not mistaken for USCEHub-hosted content.
- Keeps the **real official-resource links** (ECFMG, USMLE, NRMP, ERAS, FREIDA).
- Adds an honest "Coming Soon" tile matching the `/residency/community` pattern.
- Exposes a single CTA path to `/contact-admin` (the only real admin-side message channel).

### B. In-memory fake submission removed (PR 0e audit C3)

The previous `handleSwapSubmit` and `handleDiscussionSubmit` functions wrote to local `useState` only and rendered the new entry as if it were persisted, with no API call. **Both functions and their forms are gone.** No client-only fake submission path remains in the rewritten component.

### C. `SuggestProgramForm` honesty fix (PR 0e audit C3)

The previous `SuggestProgramForm` had a `handleSubmit` that flipped `submitted = true` and showed "Thank you for your submission!" — its own source comment said `// In a real app this would call an API`. There is no API.

The rewritten `SuggestProgramForm`:

- Renders no input fields at all.
- Shows "Program suggestion intake is not live yet."
- Routes users to `/contact-admin` (the real-functional path backed by `AdminMessage` + `/api/admin-messages`).
- Cannot fail-closed misleadingly because it has no submit path to fail on.

No new API route was created. No new schema. No fake-success path remains.

### D. Dead "Contact" button removed (PR 0e audit H3)

The non-functional swap-card "Contact" button was removed when the swap board was dropped. No replacement; the swap board itself is gone until a real implementation ships.

### E. `DiscussionForumPosting` JSON-LD removed (PR 0e audit C2 — authorized SEO impl change)

`src/app/community/page.tsx` previously emitted:

```json
{
  "@context": "https://schema.org",
  "@type": "WebPage",
  "name": "IMG Community — USCEHub",
  "mainEntity": {
    "@type": "DiscussionForumPosting",
    "headline": "IMG Community Forum",
    ...
  }
}
```

This asserted to Google that USCEHub hosts a discussion forum. None exists. The entire JSON-LD block has been removed from `/community/page.tsx`. The `BreadcrumbSchema` (a different, valid structured data) is preserved.

This is the **single authorized SEO-implementation exception class** for this PR, mirroring how PR #42 removed unsupported `AggregateRating` JSON-LD from `/listing/[id]`.

### F. Placeholder pages set to `noindex` (PR 0e audit H2 — authorized indexation cleanup)

Both `/community` and `/community/suggest-program` now emit `robots: { index: false, follow: true }` via Next.js metadata. This prevents search engines from indexing the placeholder pages while still letting them follow internal links elsewhere on the site (so SEO juice routing is preserved on real pages).

### G. Sitemap entries removed (PR 0e audit H2)

`src/app/sitemap.ts` previously listed both `/community` and `/community/suggest-program` for crawling. **Both entries are removed.** A short inline comment marks the removal and points to this audit. **No other sitemap entries were touched.** The `noindex` metadata in §F is the primary protection; the sitemap removal is defense-in-depth.

### H. Copy softening (PR 0e audit H1)

- `/community` page metadata: title "IMG Community" → "IMG Community — Coming Soon"; description rewritten to drop "Connect with fellow IMGs … share … ask questions" claims.
- `/community/suggest-program` page metadata: similarly softened.
- The h1/hero copy on `/community` now says "Community features are being planned … not live yet … will launch only after moderation and safety controls are ready."
- All content in the rewritten `<CommunityTabs>` is honestly-framed.

### I. Nav / footer demotion (PR 0e audit H4)

**No change shipped.** The COMMUNITY_FLOW_AUDIT.md §13 H4 fix said: "if community goes 'Coming Soon', the nav link can stay (residency-community pattern)". Since this PR adopts the residency-community pattern (Coming Soon + noindex), the nav link is left as `Community`. Users clicking through reach an honest placeholder.

---

## Files changed

| File | Class | Why |
|---|---|---|
| `src/app/community/page.tsx` | code (small) | C2, F, H1 — drop forum JSON-LD, add noindex, soften metadata + h1 |
| `src/app/community/suggest-program/page.tsx` | code (small) | F, H1 — add noindex, soften metadata |
| `src/components/community/community-tabs.tsx` | code (full rewrite) | C1, B, C3, H3 — drop all fake data, drop in-memory submissions, replace `<SuggestProgramForm>` with honest placeholder, drop dead Contact button |
| `src/app/sitemap.ts` | code (small) | G — remove the two /community entries |
| `docs/platform-v2/audits/V2_COMMUNITY_TRUTH_FIX_LOG.md` | docs | this file |

**Forbidden paths verified untouched:** `/career`, `/careers`, `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `vercel.json`, `src/app/robots.ts`, `src/middleware.ts`, any cron route, `src/lib/email.ts`, monetization. No new API route. No new schema. No new public route. No real-email send. `/residency/community` left untouched (it is the honest reference pattern).

---

## What was intentionally not fixed

Documented for the future-community track. **None of these are required before v2 launch given the §A–§G changes:**

- **Real `/api/community-posts` and `/api/community-comments` routes.** Deferred to post-launch. Schema models exist as orphan tables; intentionally left untouched.
- **Admin moderation tooling for community.** No `/admin/community-posts` page, no `PATCH /api/community-posts/[id]`. Deferred.
- **Public handle / anonymity-by-default policy.** `User.publicHandle` field absent; deferred to a future schema PR (post-launch). Until then, no real community surface ships.
- **Report / moderation workflow scoped to community content.** PR 0d's `<FlagButton>` is not wired to a community target. Deferred.
- **Private messaging.** Not modeled, not built; deferred indefinitely.
- **Mentorship matching / `VerifiedExpert` primitive.** Not modeled; deferred.
- **Public forum indexing policy.** `noindex` is the current posture for both `/community` and `/community/suggest-program`. Re-introduce indexability only when a real moderated forum exists (with thin-content / duplicate-content guards).
- **Review / `Article` / `Comment` / `DiscussionForumPosting` JSON-LD on community pages.** Suppressed; do not re-introduce until a real moderated community surface exists with a minimum-quality threshold. Same posture as PR #42 took for `AggregateRating`.
- **Schema cleanup of `CommunityPost` + `CommunityComment` orphan tables.** Deferred. Removing them is a migration; the cost of leaving the tables is minimal because no API touches them.
- **Cross-pathway community.** Per-pathway scope (`CommunityPost.phase`) is the right approach when ever wired; not a fix for now.
- **`/career/community`.** Out of scope per `/career` guardrail. Not read, not modified.

---

## Audit decision deltas

| Audit | Before this PR | After this PR |
|---|---|---|
| **A5** (community flow, PR 0e) | option C/E hybrid (keep aspirational; defer real community to post-launch) | **closed for v2 launch.** Placeholder is honest, `DiscussionForumPosting` JSON-LD removed, sitemap entries removed, `noindex` set. Real community remains a post-launch project. |

---

## Resume order

1. Merge this PR if checks are clean.
2. Resume **PR 0f — recommend / tools audit** (covers `/api/recommend`, `/recommend`, `/tools/cost-calculator`).
3. Then **PR 0g — cost-calculator flow audit**.
4. After Phase 0 closes: real community work (admin moderation, abuse infrastructure, public-handle schema migration, real `/api/community-posts`) tracked as post-launch.
