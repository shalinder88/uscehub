# `/residency/*` namespace audit (PR 0b)

**Doc status:** Binding factual reference + recommendation. Read-only investigation.
**Authority:** lower than [RULES.md](../../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](../PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.
**Audit target:** `/residency/*` URL tree (14 routes, 6,785 LOC) + `FellowshipProgram` Prisma model + fellowship/match content + decision A1 in [V2_DECISION_REGISTER.md](../V2_DECISION_REGISTER.md).

---

## 1. Executive verdict

**Keep `/residency/*` canonical for v2 launch. Do NOT create `/match` or `/fellowship` top-level URL trees at launch.**

Five concrete sub-recommendations:

1. **`/residency/*` URL tree stays unchanged** — preserves 6,785 LOC of substantive content that's already shipped.
2. **`/residency/*` is a content surface, not the dashboard** — the v2 Residency & Fellowship pathway dashboard lives at `/dashboard` per [PATHWAY_DASHBOARD_ARCHITECTURE.md §6.3](../PATHWAY_DASHBOARD_ARCHITECTURE.md). The dashboard surfaces `/residency/*` content via cards.
3. **Remove `/residency/*` entries from sitemap.ts** — entire surface is `noindex, follow` per layout; sitemap entries are useless and cause GSC warnings.
4. **Fix `/residency/finances` insurance carrier recommendations** — current copy names Guardian, MassMutual, Principal, Ohio National, Ameritas with phrasing "most commonly recommended" — pre-monetization FTC risk per [TRUST_AND_MONETIZATION_POLICY.md §4](../TRUST_AND_MONETIZATION_POLICY.md). Small follow-up PR.
5. **Fellowship database stays sample-only at v2 launch** — the existing 11-program sample with honest "Database in development" banner is acceptable. `FellowshipProgram` Prisma model stays aspirational per [RULES.md](../../codebase-audit/RULES.md) §2.

This validates [PATHWAY_DASHBOARD_ARCHITECTURE.md](../PATHWAY_DASHBOARD_ARCHITECTURE.md) Path 2 (Residency & Fellowship) **as-written**, with minor reconciliation in [V2_DECISION_REGISTER.md A1](../V2_DECISION_REGISTER.md): lock as option (a) keep `/residency/*` canonical.

---

## 2. Existing route inventory

### 2.1 Live routes under `/residency/*` (14 total)

| Route | LOC | Purpose | Indexable? | Sitemap? |
|---|---|---|---|---|
| `/residency` | 194 | "Residency Command Center" hero + stat cards + "What's New" | **noindex** | yes ⚠ |
| `/residency/boards` | 43 (page) + 129 (client) | Board exam guides (ABIM/ABFM/ABP/ABS/ABPN/ABPath) | noindex | yes ⚠ |
| `/residency/community` | 38 + 109 | Resident community placeholder | noindex | no |
| `/residency/fellowship` | 38 + 205 (`fellowship-client.tsx`) | Fellowship database UI (sample-only, "in development" banner) | noindex | no |
| `/residency/fellowship/guide` | 880 | Fellowship strategy guide (PGY-1 to Match Day, IMG considerations) | noindex | yes ⚠ |
| `/residency/finances` | 637 | Financial planning (loans, disability, IRA, budgeting) | noindex | no |
| `/residency/moonlighting` | 858 | Moonlighting guide | noindex | no |
| `/residency/post-match` | 292 | Post-Match checklist | noindex | yes ⚠ |
| `/residency/procedures` | 663 | Procedures/logs guide | noindex | no |
| `/residency/research` | 894 | Research / CV building | noindex | no |
| `/residency/resources` | 97 | Teaching resources index | noindex | no |
| `/residency/salary` | 742 | Salary & contracts (12 specialties) | noindex | yes ⚠ |
| `/residency/survival` | 878 | Survival guide (intern year through chief) | noindex | yes ⚠ |
| (layout) | 34 | Custom layout w/ `index: false, follow: false` | — | — |
| (nav) | 54 | Custom 4-tab sub-nav (Fellowship Guide / Boards / Survival / Salary & Contracts) | — | — |

**Total: 6,785 LOC of substantive content.**

### 2.2 Sitemap-vs-meta-robots contradiction

[`src/app/residency/layout.tsx:17-20`](../../../src/app/residency/layout.tsx) sets:

```ts
robots: {
  index: false,
  follow: false,
},
```

This applies to **all 14 routes** under `/residency/*` via Next.js metadata inheritance.

But [`src/app/sitemap.ts`](../../../src/app/sitemap.ts) **explicitly includes** these `/residency/*` URLs:
- `/residency`
- `/residency/fellowship/guide`
- `/residency/boards`
- `/residency/survival`
- `/residency/salary`
- `/residency/post-match`

**Result:** Google receives sitemap entries → crawls the URLs → finds `noindex` meta → does not index → reports "Submitted URL marked noindex" in GSC. This is a wasted-crawl-budget + GSC-warning issue, not a security/SEO risk per se.

**Fix (separate small PR):** remove the 6 `/residency/*` entries from sitemap.ts. No SEO loss because they're already noindex; the sitemap entries serve no indexability purpose.

### 2.3 No related API routes

```bash
$ find src/app/api -type f | grep -iE "residency|fellowship|match"
(no matches)
```

`/residency/*` pages are entirely server-rendered with static data from `src/lib/residency-data.ts` (566 LOC). No runtime DB queries.

### 2.4 No `/match` or `/fellowship` top-level routes

Neither URL tree exists today. The v2 Information Architecture proposed these as new top-nav verticals, but they are entirely future.

### 2.5 `/freida` redirect (existing)

[`next.config.ts:41-42`](../../../next.config.ts) — `/freida` → `/img-resources` (301). Independent of `/residency/*` audit; mentioned for completeness.

---

## 3. Data model inventory

### 3.1 `FellowshipProgram` Prisma model (line 383 of schema)

```prisma
model FellowshipProgram {
  id                  String        @id @default(cuid())
  name                String
  specialty           String
  institution         String
  city                String
  state               String
  visaSponsorship     Boolean       @default(false)
  requiresUSTraining  Boolean       @default(false)
  matchParticipation  Boolean       @default(false)
  applicationDeadline String?
  duration            String?
  positions           Int?
  description         String?
  requirements        String?
  websiteUrl          String?
  sourceType          SourceType    @default(OFFICIAL)
  lastVerified        DateTime?
  verifiedBy          String?
  status              ListingStatus @default(APPROVED)
  createdAt           DateTime      @default(now())
  updatedAt           DateTime      @updatedAt

  @@index([specialty])
  @@index([state])
  @@map("fellowship_programs")
}
```

**Status:** model exists in `prisma/schema.prisma`, table `fellowship_programs` exists in production DB, but **never queried anywhere in the codebase**.

```bash
$ grep -rn "fellowshipProgram\|FellowshipProgram\.findMany\|prisma.fellowshipProgram" src/ scripts/
(no matches)
```

Per [RULES.md](../../codebase-audit/RULES.md) §2, `FellowshipProgram` is on the **hard protection list** — preserved as aspirational, do not drop.

### 3.2 Static fellowship sample (`src/lib/residency-data.ts`)

566 LOC, including:

- `TEACHING_RESOURCES[]` (lines 46-228) — used by `/residency/resources`
- `BOARD_EXAMS[]` (lines 241-355) — used by `/residency/boards`
- `SURVIVAL_TIPS[]` (lines 356-454) — used by `/residency/survival`
- `SAMPLE_FELLOWSHIPS[]` (lines 455-558) — **11 programs** — used by `/residency/fellowship`
- `FELLOWSHIP_SPECIALTIES[]` derived from SAMPLE_FELLOWSHIPS
- `FELLOWSHIP_STATES[]` derived from SAMPLE_FELLOWSHIPS

**`/residency/fellowship` UI banner** (lines 45-57 of `fellowship-client.tsx`):

> "Database in development. We are building the most comprehensive fellowship database for IMGs and all residents. The programs below are sample entries. Full database launching soon with 1,000+ programs."

This is **honest framing** — the 11 sample programs are clearly labeled. No deceptive overclaim.

### 3.3 Schema-vs-static divergence

The `FellowshipProgram` Prisma model has fields the static `SAMPLE_FELLOWSHIPS` interface doesn't carry (e.g., `lastVerified`, `verifiedBy`, `status`). When/if the fellowship database moves from sample to real DB-backed, the `FellowshipProgram` model can be hydrated from authentic sources (FREIDA, NRMP, ACGME, individual program websites) per [PATHWAY_DASHBOARD_ARCHITECTURE.md §3.2](../PATHWAY_DASHBOARD_ARCHITECTURE.md) authentic-source rule.

### 3.4 No `ResidencyProgram` model

There is **no** `ResidencyProgram` Prisma model. Residency-program-level content lives in:
- `Listing` model (when applicable to USCE adjacent or research)
- Static content in `/residency/*` pages
- Cross-references to FREIDA / NRMP via external links

This is fine; FREIDA owns residency-program data canonically (13,000+ programs). USCEHub doesn't need to duplicate.

### 3.5 No `MatchData` model

No model for Match cycle data. Match-related content in `/residency/post-match` is hand-written editorial.

---

## 4. Current user capabilities

What can a user do today on `/residency/*`?

| Capability | Status |
|---|---|
| Browse residency overview | ✅ `/residency` hero + stat cards |
| Read fellowship strategy guide | ✅ `/residency/fellowship/guide` (880 LOC) |
| Browse fellowship database | ⚠ `/residency/fellowship` sample-only (11 programs) with "in development" banner |
| Filter fellowships by specialty/state/visa | ✅ on sample data only |
| Search fellowships | ✅ on sample data only |
| Read board exam guides | ✅ `/residency/boards` accordion (6 boards) |
| Read survival guide | ✅ `/residency/survival` (878 LOC) |
| Read salary guide | ✅ `/residency/salary` (12 specialties, 742 LOC) |
| Read finances guide | ⚠ `/residency/finances` (637 LOC; **specific insurance brand recommendations without disclosure** — see §5.2) |
| Read moonlighting guide | ✅ `/residency/moonlighting` (858 LOC) |
| Read procedures guide | ✅ `/residency/procedures` (663 LOC) |
| Read research guide | ✅ `/residency/research` (894 LOC) |
| Browse teaching resources | ✅ `/residency/resources` (97 LOC, links to TEACHING_RESOURCES) |
| Read post-Match checklist | ✅ `/residency/post-match` (292 LOC) |
| Save / compare programs | ❌ no save/compare UI on /residency/* |
| Apply via platform | ❌ no application flow on /residency/* |
| External source links | ✅ extensively (NRMP, ABIM, ABFM, ACGME, FREIDA, AMA, CMS, AMN Healthcare cited) |

The surface is **content-rich but tool-thin.** It is essentially a high-quality long-form content hub for residents/fellows; the v2 dashboard (per [PATHWAY_DASHBOARD_ARCHITECTURE.md](../PATHWAY_DASHBOARD_ARCHITECTURE.md)) adds the tool layer (save / compare / alerts / checklist) on top.

---

## 5. Content and trust quality

### 5.1 Strengths

- **Specific sourced claims.** "What's New" section on `/residency` page cites NRMP SMS, official board pass rates, CMS PFS Final Rule, AMN Healthcare 2025. Each claim attributed.
- **`VerifiedBadge` component used.** `/residency/boards` uses `VerifiedBadge date="March 2026" sources={["ABIM", "ABFM", ...]}` — explicit freshness + source disclosure. Good pattern.
- **Honest empty-state framing.** Fellowship database banner clearly says "Database in development. The programs below are sample entries."
- **Specific data points.** "2025 Fellowship Match: Largest in History — 9,950 Positions. Cardiology filled 100% of 1,347 slots. ID dropped to 60.9%." Accurate per NRMP SMS data.
- **External source links.** FREIDA, NRMP, ECFMG, ABMS, ACGME extensively cited.

### 5.2 Trust risks

**R1 (medium): `/residency/finances` insurance carrier recommendations.**

Lines 109-112 of `src/app/residency/finances/page.tsx`:

> "Guardian, MassMutual, Principal, Ohio National, and Ameritas are the most commonly recommended for physician disability policies. Work with an independent insurance broker who specializes in physicians..."

**Problem:** the page names 5 specific commercial insurance brands with phrasing "most commonly recommended" — without:
- Citation for the claim ("commonly recommended" by whom?)
- Disclosure of any sponsorship / affiliate relationship
- Methodology for the selection

Per [TRUST_AND_MONETIZATION_POLICY.md §4](../TRUST_AND_MONETIZATION_POLICY.md): naming specific commercial products without citation or disclosure is FTC-adjacent risk, even if no current sponsorship exists. A user clicking through to one of these brands might assume USCEHub vouches for them.

**Recommended fix (separate small PR):** rewrite the section to either:
- (a) Cite the source of the "commonly recommended" claim (e.g., White Coat Investor, FTC consumer guidance, peer-reviewed source), OR
- (b) Soften the language ("Several physician-focused disability insurers exist; here are 5 commonly cited examples — research and consult an independent broker"), OR
- (c) Remove specific brands entirely and link to a third-party comparison (e.g., White Coat Investor disability insurance page).

**Severity:** medium. Not currently illegal (no sponsorship exists), but pre-monetization the disclosure pattern needs to be set right.

**R2 (low): Fellowship database overclaim.**

Banner says "Full database launching soon with 1,000+ programs." This is a soft promise of future content. If the database doesn't materialize within reasonable timeline, the claim becomes stale.

**Recommended fix:** soften to "Full database in development." Drop the "1,000+" specific claim until DB is hydrated.

**R3 (low): "What's New" timestamps.**

`/residency/page.tsx:67-92` shows 4 "What's New" cards dated "March 2026". These need ongoing freshness — if they go 6+ months without updates, they look stale. Either auto-pull from a dated content source or set a calendar reminder to refresh quarterly.

### 5.3 Stale claims search

```bash
$ grep -rn "207\+ verified\|largest structured database\|hand-picked" src/app/residency/
(no matches)
```

Good — none of the legacy "207+ verified" or "largest structured database" claims appear in `/residency/*`. The trust-language doctrine from PR #25 + PR #27 already holds here.

---

## 6. SEO / indexation analysis

### 6.1 Current indexable status

**Entire `/residency/*` surface is `noindex, follow`** via layout-level metadata. Verified via:
- Line 17-20 of `src/app/residency/layout.tsx`: `robots: { index: false, follow: false }`
- Per-page `alternates.canonical` is set but irrelevant when meta robots blocks indexing.

**Implication:** `/residency/*` does NOT appear in search engine results. No SEO equity to preserve. Migration / restructure / 301 redirects have **zero SEO cost.**

### 6.2 Sitemap entries (6 URLs)

[`src/app/sitemap.ts`](../../../src/app/sitemap.ts) includes:
- `/residency` (priority 1.0, changeFrequency: daily)
- `/residency/fellowship/guide`
- `/residency/boards`
- `/residency/survival`
- `/residency/salary`
- `/residency/post-match`

These are bloat — Google fetches them, sees `noindex`, reports "Submitted URL marked noindex" in GSC.

**Fix:** remove these 6 entries from sitemap.ts. Separate small PR (~10 LOC change). No SEO impact.

### 6.3 Canonical URLs

Each subpage sets its own `alternates.canonical`. Correct pattern for a multi-route surface, but irrelevant given `noindex`. When/if `/residency/*` is later un-noindexed, the canonical infrastructure is already in place.

### 6.4 Per-page metadata

Most subpages have proper `title` + `description` + `openGraph`. A few (e.g., `/residency/survival/page.tsx`) skip `title` directly; let me note that in §11 follow-ups.

### 6.5 No structured data risk

Only `WebPage` JSON-LD on `/residency` (line 95-107 of page.tsx). No `EducationalOccupationalProgram`, no `FAQPage`, no `Article`. Lean structured data — fine for the noindex state.

### 6.6 If un-noindexed in the future

If a future PR removes the layout-level noindex (to publish the content), the §9 quality gate from [PLATFORM_V2_STRATEGY.md](../PLATFORM_V2_STRATEGY.md) applies:

- Each page would need a unique editorial intro (mostly already there)
- Each page would need T1/T2 source citations (mostly already there per §5.1)
- Pages would need to pass the human review queue
- Sitemap would re-include them once approved

**Recommend: keep noindex at v2 launch** — content is internal-grade right now; v2 dashboard surfaces it to logged-in users without needing public crawling. Public exposure can be a Phase C+ decision.

---

## 7. Relationship to pathway architecture

### 7.1 How `/residency/*` maps to "Residency & Fellowship" pathway

| Pathway 2 module ([PATHWAY_DASHBOARD_ARCHITECTURE.md §3.2](../PATHWAY_DASHBOARD_ARCHITECTURE.md)) | Existing `/residency/*` content | Status |
|---|---|---|
| Boards / ITE timeline | `/residency/boards` (ABIM/ABFM/ABP/ABS/ABPN/ABPath) | ✅ live |
| Fellowship planning | `/residency/fellowship/guide` (880 LOC) | ✅ live |
| Research / CV | `/residency/research` (894 LOC) | ✅ live |
| Moonlighting | `/residency/moonlighting` (858 LOC) | ✅ live |
| Procedures / logs | `/residency/procedures` (663 LOC) | ✅ live |
| Housing / relocation | (none yet) | ❌ gap |
| Visa transition | (none in /residency; lives in /career/h1b, /career/waiver) | cross-link |
| Job-search prep | `/residency/salary` (742 LOC, includes contracts + RVUs) | ✅ live |
| Compensation basics | `/residency/salary` | ✅ live |
| Contracts basics | `/residency/salary` (contract section) | ✅ live |
| Insurance basics | `/residency/finances` (disability insurance section — needs disclosure fix R1) | ⚠ live with trust risk |
| Wellness / burnout | `/residency/survival` (878 LOC, includes burnout) | ✅ live |
| Pre-attending preparation | `/residency/finances` (loans, IRA) + `/residency/salary` (contracts) | ✅ live |

**Coverage: 11 of 13 Path 2 modules already have content. 2 gaps (Housing/relocation, Visa transition).**

### 7.2 Path 2 label remains correct

"Residency & Fellowship" is the right label. The existing surface is exactly what the label promises:
- "Residency" content (boards, survival, moonlighting, procedures, research, salary, post-match, finances, community, resources)
- "Fellowship" content (fellowship/guide strategy + fellowship database UI placeholder)

No relabeling needed. The `[noun] & [noun]` symmetry per [PATHWAY_DASHBOARD_ARCHITECTURE.md §1.5](../PATHWAY_DASHBOARD_ARCHITECTURE.md) remains intact.

### 7.3 `/match` should NOT be a separate top-level URL tree

The Match concept already lives within `/residency/*`:
- `/residency/post-match` — Post-Match Day operational checklist
- `/residency/fellowship/guide` — fellowship match strategy
- `/img-resources` — IMG match strategy
- `/blog/*` — multiple match-strategy blog posts

Creating a parallel `/match/*` URL tree would:
- Duplicate ~6,785 LOC of content (or split it awkwardly)
- Create canonical confusion (which URL is authoritative for "fellowship match strategy"?)
- Violate the canonical-content-per-topic rule from [PATHWAY_DASHBOARD_ARCHITECTURE.md §8](../PATHWAY_DASHBOARD_ARCHITECTURE.md)
- Increase sitemap size without adding new content

**Recommendation:** Match content stays inside `/residency/*` (and `/img-resources/*` for IMG-specific match strategy). The "Match" top-nav item in [PATHWAY_DASHBOARD_ARCHITECTURE.md §2](../PATHWAY_DASHBOARD_ARCHITECTURE.md) (per the eight-vertical task-based nav) **redirects users to `/residency/post-match` and `/residency/fellowship/guide` rather than to a new `/match` URL tree.**

This means: **the eight-vertical nav has "Match" as a label, not a URL prefix.** Clicking "Match" lands the user on a curated landing — likely a small new `/match` page (a thin wrapper) that links into `/residency/*` and `/img-resources/*`. Or even simpler: "Match" nav item links directly to `/residency/post-match` (Match Day operations) or `/img-resources` (IMG match strategy).

This is a **revision to PATHWAY_DASHBOARD_ARCHITECTURE.md §2 wording** — not a structural change, just a clarification.

### 7.4 `/fellowship` should NOT be a separate top-level URL tree

Same logic as §7.3. Fellowship content already at `/residency/fellowship` and `/residency/fellowship/guide`. Adding `/fellowship/*` parallel tree creates duplication.

**Recommendation:** "Fellowship" eight-vertical nav item links to `/residency/fellowship/guide`. Or a thin `/fellowship` curated landing that points into `/residency/fellowship/guide`.

### 7.5 Bridge module (Path 2 → Path 3)

Per [PATHWAY_DASHBOARD_ARCHITECTURE.md §11.2](../PATHWAY_DASHBOARD_ARCHITECTURE.md), the "Preparing for Practice & Career" bridge module inside Residency & Fellowship dashboard. Existing content support:

| Bridge card | Existing content URL |
|---|---|
| Job search basics | `/residency/salary` (contract section) |
| Contract basics | `/residency/salary` |
| Visa timeline | `/career/h1b`, `/career/waiver`, `/career/visa-bulletin`, `/career/visa-journey` |
| Disability insurance | `/residency/finances` (with R1 disclosure fix) |
| Pay structure | `/residency/salary` |
| Relocation | (no existing page; gap from §7.1) |

5 of 6 bridge cards have existing content. Relocation is the only gap.

---

## 8. Risks found

| # | Severity | Risk | Resolution |
|---|---|---|---|
| R1 | Medium | `/residency/finances` recommends specific insurance brands without citation or disclosure | Small content PR; rewrite or cite source |
| R2 | Low | Fellowship database "1,000+ programs" overclaim | Small content PR; soften wording |
| R3 | Low | "What's New" timestamps will go stale without ongoing curation | Operational (refresh quarterly) |
| R4 | Low | Sitemap.ts includes 6 `/residency/*` entries that are noindex | Small PR; remove sitemap entries |
| R5 | Low | `/residency/survival/page.tsx` skips explicit `title` metadata | Small PR; add explicit `title` |
| R6 | Low | `FellowshipProgram` Prisma model exists but unused | Acceptable; preserved per RULES.md §2 |
| R7 | Low | `Organization.institutionalEmail` (Boolean) vs `PosterProfile.institutionalEmail` (String) name collision | Already noted in [POSTER_FLOW_AUDIT.md §8.3](POSTER_FLOW_AUDIT.md); deferred |
| R8 | Low | Custom `/residency/*` nav doesn't map to v2 pathway switcher | Future v2 implementation; not a launch-blocker |

**No critical or high-severity risks.** R1 is the only one that could cause near-term FTC concern; the rest are content / SEO hygiene.

---

## 9. Recommended v2 path

### 9.1 Decision A1 lock

Per [V2_DECISION_REGISTER.md A1](../V2_DECISION_REGISTER.md): three options were on the table.

**Audit recommends: option (a) — keep `/residency/*` canonical for v2 launch.**

Rationale:
- 6,785 LOC of substantive content already shipped
- Zero SEO equity to preserve (entire surface noindex)
- Path 2 dashboard at `/dashboard` surfaces `/residency/*` content via cards
- No need to rebuild
- "Match" + "Fellowship" eight-vertical nav items become labels-with-thin-landings, not parallel URL trees

### 9.2 What stays unchanged

- All 14 routes under `/residency/*`
- Custom layout with noindex
- Custom 4-tab sub-nav (Fellowship Guide / Boards / Survival / Salary & Contracts)
- Static data in `src/lib/residency-data.ts`
- `FellowshipProgram` Prisma model (preserved per RULES.md §2; aspirational)
- All per-page metadata + canonicals + JSON-LD

### 9.3 What changes (separate small PRs)

1. **Remove `/residency/*` entries from sitemap.ts** (small PR, ~10 LOC).
2. **Fix `/residency/finances` insurance brand disclosure** per R1 (small content PR, ~30 LOC).
3. **Soften fellowship database "1,000+ programs" claim** per R2 (small content PR, ~5 LOC).
4. **Add explicit `title` metadata to `/residency/survival/page.tsx`** per R5 (small PR, ~3 LOC).

Total: 4 small PRs, ~50 LOC combined. None block v2 launch.

### 9.4 What v2 launch adds on top of `/residency/*`

- Path 2 dashboard at `/dashboard` (logged-in) — surfaces `/residency/*` content via cards
- Top-right utility pill "Pathway: Residency & Fellowship ▾" once preference set
- Bridge module "Preparing for Practice & Career" inside Path 2 dashboard
- Sub-state filter chips (incoming_resident / early_resident / senior_resident / chief / fellowship_applicant / fellow / graduating_soon / visa_dependent)
- Cross-path search with native-pathway labels
- Pathway-aware notification defaults

None of these touch the `/residency/*` URL tree or its content.

### 9.5 What does NOT change at v2 launch

- `/residency/*` URLs stay
- `/residency/*` content stays
- `/residency/*` noindex stays
- No `/match/*` URL tree created
- No `/fellowship/*` URL tree created
- No 301 redirects from `/residency/*` → anything
- `FellowshipProgram` model stays aspirational (unused)
- Sample fellowship database stays as-is (with R2 wording softened)

---

## 10. Required follow-up PRs

After this audit lands:

| PR | Type | Scope | Priority |
|---|---|---|---|
| **0b-fix-1** | Content | `/residency/finances` insurance disclosure fix (R1) | medium (do before any monetization) |
| **0b-fix-2** | Content | Fellowship database wording softening (R2) | low |
| **0b-fix-3** | SEO | Remove `/residency/*` entries from sitemap.ts (R4) | low (operational hygiene) |
| **0b-fix-4** | Metadata | `/residency/survival` explicit title (R5) | low |

These can be done in a single combined "Residency content + sitemap cleanup" PR (~50 LOC total) or four separate small PRs. **Recommend combined PR** for review efficiency.

### 10.1 Phase 0 audit sequence continues

Per [V2_PR_BREAKDOWN.md Phase 0](../V2_PR_BREAKDOWN.md):

- ✅ PR 0a poster audit (`POSTER_FLOW_AUDIT.md`) — done, 5 fix PRs landed
- ✅ PR 0b residency audit (this) — in progress
- ⏳ PR 0c application flow audit (decision A3)
- ⏳ PR 0d review flow audit
- ⏳ PR 0e community flow audit
- ⏳ PR 0f recommend tool audit
- ⏳ PR 0g cost calculator audit

After 0c through 0g, Phase A foundation PRs (design tokens, primitives, nav, footer, layout) on `redesign/platform-v2` long-running branch.

---

## 11. User decisions needed

These surfaced in the audit and need user resolution. Each maps to [V2_DECISION_REGISTER.md](../V2_DECISION_REGISTER.md) entries:

### 11.1 Resolved by this audit

- **A1 (residency namespace fate):** lock as option **(a) keep `/residency/*` canonical**.
- **B7 (`/about/methodology` vs `/methodology`):** unaffected by this audit; defer to launch event.

### 11.2 New decisions surfaced

1. **Combined cleanup PR vs four separate PRs.** Recommend combined (~50 LOC).
2. **Insurance disclosure rewrite approach.** Three options:
   - (a) Cite the source of "commonly recommended" claim
   - (b) Soften language, no specific recommendations
   - (c) Remove specific brands; link to third-party comparison
   Recommend (b) at v2 launch; (a) post-launch with proper sourcing.
3. **"Match" eight-vertical nav target.** Three options:
   - Thin `/match` curated landing that points into `/residency/post-match` + `/img-resources`
   - Direct link to `/residency/post-match` (no new URL)
   - Direct link to `/residency/fellowship/guide` if Match is fellowship-stage focused
   Recommend a thin `/match` landing for SEO + curated framing.
4. **"Fellowship" eight-vertical nav target.** Same options. Recommend thin `/fellowship` landing pointing to `/residency/fellowship/guide`.
5. **Whether to expose `/residency/*` to Google later.** Currently noindex. Reconsider Phase C+ once §9 quality gate audit complete on each page.
6. **Fellowship database hydration timeline.** Currently 11 sample programs. When to hydrate `FellowshipProgram` model with real data? Defer; tied to §10 future scoping.
7. **Whether to add `/residency/housing` and `/residency/relocation`.** Identified gaps in §7.1. Defer; could be part of Phase C+ Practice & Career bridge content build-out.

---

## 12. Final recommendation

### 12.1 Verdict

**Merge this audit doc.** It establishes:

1. `/residency/*` stays canonical for v2 launch (decision A1 lock = option a).
2. `/match` and `/fellowship` are eight-vertical nav labels with thin landings, NOT parallel URL trees.
3. Path 2 (Residency & Fellowship) in [PATHWAY_DASHBOARD_ARCHITECTURE.md](../PATHWAY_DASHBOARD_ARCHITECTURE.md) needs only minor wording revisions; structural model is correct.
4. 4 small follow-up content/SEO PRs (~50 LOC combined) close R1-R5 risks.
5. `FellowshipProgram` model stays aspirational per RULES.md §2.

### 12.2 Revisions to PATHWAY_DASHBOARD_ARCHITECTURE.md

After this audit lands, a small in-place revision to [PATHWAY_DASHBOARD_ARCHITECTURE.md](../PATHWAY_DASHBOARD_ARCHITECTURE.md):

- §2 nav item explanation: "Match" and "Fellowship" labels link to thin curated landings or directly into `/residency/*`, not to parallel URL trees.
- §3.2 Path 2 sections: remove the "provisional pending PR 0b" markers; resolution is locked.
- §11.2 bridge module: confirm content URL anchors (`/residency/salary`, `/residency/finances`, etc.).
- §18 existing route implications: lock A1 = (a).

### 12.3 Next audit

**PR 0c — `Application` model + `/api/applications` + `/dashboard/applications` audit.** Unblocks decision A3 (application flow real-functional vs aspirational; affects homepage copy per [HOMEPAGE_V2_WIREFRAME.md §12](../HOMEPAGE_V2_WIREFRAME.md)).

### 12.4 What this audit does NOT do

- Does NOT modify any source code.
- Does NOT modify schema.
- Does NOT touch `/career` or `/careers`.
- Does NOT touch SEO implementation (sitemap.ts, robots.txt, canonical, JSON-LD, redirects).
- Does NOT implement any of the 4 fix PRs from §10.
- Does NOT revise PATHWAY_DASHBOARD_ARCHITECTURE.md (separate follow-up).

---

## SEO impact

```
SEO impact:
- URLs changed:        none (audit doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none (existing /residency/* stays noindex)
- internal links:      none changed
- risk level:          ZERO — internal audit doc
```

## /career impact

None. `/career/*` and `/careers/*` preserved unchanged per [RULES.md](../../codebase-audit/RULES.md) §2. Cross-references only.

## Schema impact

None. §3 enumerates existing `FellowshipProgram` model for cross-reference; no proposed changes.

## Authorization impact

None. Documenting reality is not authorization to change reality. Each follow-up fix (§10) requires its own PR + review.
