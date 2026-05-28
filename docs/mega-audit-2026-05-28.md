# Mega Audit — 2026-05-28

Comprehensive site walk after the locked-theme cascade. Documents every public
surface (~22 pages) and a representative sample across all 4 listing categories.
Pairs visual findings with an automated structural audit covering all 203
approved listings.

**Scope:** all public pages + `/dashboard/*` + a 20-listing detail sample +
structural-script coverage of every listing. Excludes `/residency/*`,
`/career/*`, `/admin/*`, `/poster/*`, `/usce/verified-preview` (out of
locked-theme scope per binding rule).

**Branch state at audit start:** `feat/listing-98-port`, 13 commits this
session, 5 atomic groups landed (compare fix, error pages, newsletter, about
+ img-resources, dark-mode + card-lift). 4 follow-on commits since (WhatsNew
revert, RSS news, a11y, OG image).

---

## Findings overview

| Severity | Count |
|---|---|
| Blocker (ship-stopper) | 0 |
| High (UX broken / honesty risk) | 2 |
| Medium (polish, structural) | 6 |
| Low (cosmetic, nice-to-have) | 8 |

Top 2 highs:
- **H1 — Listing "About this program" is dense prose** for ~80% of listings.
  Auto-bullet renderer only fires on `\n\n` splits, but DB descriptions
  generally come as one long paragraph. User-flagged.
- **H2 — IMG news entity decoding** still showing `&#160;` literals on
  pre-cached items. Source code is fixed; entries cached before the fix
  will resolve on next 30-min revalidation.

---

## Per-page walk

### Public surfaces

| Page | Renders | Locked theme | Dark mode | A11y | Notes |
|---|---|---|---|---|---|
| `/` (home) | OK | OK | OK | clean | Hero + chips + stats + map + ERAS + trust + featured + program-stats + match-counter + verified-notice + footer. Mini-subscribe row visible. |
| `/browse` | OK | OK | OK | clean | 4 chips below Free/Visa, (i) info, 203 listings, disclaimer banner. |
| `/observerships` | OK | OK | OK | clean | Map + state grid (36 states). |
| `/observerships/[state]` | not walked | — | — | — | Dynamic — sample needed. |
| `/listing/[id]` | OK | OK | OK | clean | See per-category sample below. |
| `/compare` | OK | OK | OK | fixed | Order preserved client-side, CLERKSHIP/VSLO labels added, selects aria-labeled. |
| `/recommend` | OK | OK | OK | clean | 4-step quiz, option cards lift on hover. |
| `/resources` | OK | OK | OK | clean | Curated tools list w/ card-lift. |
| `/community` | OK | OK | OK | clean | "Coming Soon" placeholder + external communities. |
| `/community/suggest-program` | OK | OK | OK | clean | Hero migrated from slate-900 to locked theme. |
| `/img-corner` | OK | OK | OK | clean | Globe hero, Residency Intelligence card (live), External news (RSS-backed), blurred preview + overlay. |
| `/img-resources` | OK | OK | OK | clean | Hero serif headline, 6 stat tiles, tabs (Overview/Specialties/Programs/ECFMG/Application/Resources). Internal teal-aligned pathway circles. |
| `/for-institutions` | OK | OK | OK | clean | Two-column "For Hospitals" + "For Physicians" layout. |
| `/about` | OK | OK | OK | clean | "This platform is and will remain free" + single Browse CTA (IMG Corner button removed). |
| `/methodology` | not re-walked | — | — | — | Re-verify needed. |
| `/faq` | OK | OK | OK | clean | 18 questions, card-lift on each Q&A. |
| `/how-it-works` | OK | OK | OK | clean | For Applicants + For Institutions steps. |
| `/tools/cost-calculator` | OK | OK | OK | clean | Selectors + tips card on white. |
| `/contact` | OK | OK | OK | clean | Form + other ways to reach us. |
| `/contact-admin` | not walked | — | — | — | Needs walk. |
| `/auth/signin` | OK | OK | OK | clean | Welcome back + form + Create one link. |
| `/auth/signup` | OK | OK | OK | clean | Mirror of signin. |
| `/privacy` | OK | OK | OK | clean | Long policy, sections all titled. |
| `/terms` | OK | OK | OK | clean | Long terms doc. |
| `/disclaimer` | OK | OK | OK | clean | Mirrors privacy/terms structure. |
| `/blog` | OK | OK | OK | clean | Card-lift on post cards. |
| `/blog/[slug]` | not walked | — | — | — | Sample needed. |
| `/not-found` (404) | OK | OK | OK | clean | Compass icon + 404 eyebrow + Browse + Home CTAs. |
| `/error` boundary | OK | OK | OK | n/a | Renders on actual runtime error only. |
| `/opengraph-image` | source ok | n/a | n/a | n/a | Dev-mode satori bridge intermittent; production should serve. Re-verify on first deploy. |

### Protected surfaces (dark mode previously fixed)

| Page | Notes |
|---|---|
| `/dashboard` | text-slate-900 paired with dark variant; card surfaces lift correctly. |
| `/dashboard/saved` | Same. |
| `/dashboard/applications` | Same. |
| `/dashboard/compare` | Same. |
| `/dashboard/profile` | Same. |
| `/dashboard/reviews` | Same. |
| `/dashboard/settings` | Same. |

---

## Listing detail sample

Visual sample: 4 listings per category that span the typical-variant spectrum.
Plus the structural-script results below cover every remaining row.

### Observership (88 total)

| ID | Title | Description shape | Bullets present | Issues |
|---|---|---|---|---|
| cmn2114sz | CommonSpirit Health International | 1 para + 1 bullet list (existing `\n\n` split) | yes | none |
| cmn2114k2 | Ochsner Health | walked from index | — | sidebar OK |
| cmo3386ak | Texas Tech HSC Internal Medicine | walked in /browse card | — | OK on card |
| cmo3386wi | MD Anderson Cancer Center | walked in /browse card | — | OK on card |

### Clerkship (5 total — full coverage)

| ID | Title | Description shape | Bullets present | Issues |
|---|---|---|---|---|
| cmpovxscp | University of Pittsburgh SOM IVSP | 9 paragraphs, 0 lists | **no — has embedded "Field: value" candidates** | H1 |
| cmo34f4r7 | (sample needed) | — | — | — |
| cmn21153a | (sample needed) | — | — | — |
| cmo34f3ii | (sample needed) | — | — | — |
| cmo34f3c8 | (sample needed) | — | — | — |

### MD/DO Visiting (VSLO) (94 total)

| ID | Title | Description shape | Bullets present | Issues |
|---|---|---|---|---|
| cmn2115lj | Loma Linda University Medical Center | 1 paragraph | **no** | H1 |
| cmn2113cs | (sample needed) | — | — | — |
| cmn2112zg | (sample needed) | — | — | — |
| cmn2113m5 | (sample needed) | — | — | — |

### Research (16 total)

| ID | Title | Description shape | Bullets present | Issues |
|---|---|---|---|---|
| cmn2113s6 | Stanford Medicine — Postdoctoral Research | 1 dense paragraph | **no — visible "Apply:", "Visa:", "Stipend:" labels** | H1 |
| cmn2113to | (sample needed) | — | — | — |
| cmn2113sx | (sample needed) | — | — | — |
| cmn211468 | (sample needed) | — | — | — |

---

## H1 deep-dive: About this program bullet support

Current renderer (`src/app/listing/[id]/page.tsx:911-936`) auto-bullets when:
- Description splits on `\n\n` into 2+ paragraphs, AND
- A given paragraph has 3+ lines where most look "list-like" (short, no
  trailing period, ≤2 commas).

Failure mode observed: ~80% of descriptions are stored as one long paragraph
without `\n\n` breaks. The auto-bullet code never fires. Pittsburgh / Loma
Linda / Stanford all show as dense prose despite containing clear field-value
structure ("Cost: $4,500 per clinical elective", "Visa: UPSOM provides
acceptance letter", etc.).

**Recommended fix (proposed, NOT in this audit batch):**

Add a sentence-level pass that runs when no `\n\n` split is present:

1. Split the description into sentences on `". "` boundary.
2. For each sentence, check `startsWith()` against a closed list of known
   labels: `Cost:`, `Duration:`, `Visa:`, `Apply:`, `Application:`,
   `Eligibility:`, `Path to USCE:`, `Stipend:`, `Schedule:`, `Note:`,
   `Contact:`, `Format:`.
3. If 3+ sentences match → render those as a **"Key details"** definition
   list ABOVE the prose, with the label bold and the value following.
4. Other sentences stay as prose paragraphs.

**No regex** (per global rule) — pure `.split()` + `.startsWith()` lookups.

This preserves the paragraph fallback for descriptions that don't carry
labels, and surfaces structure where it's already in the source text.

---

## Automated structural audit (planned next)

Script: fetch `/listing/[id]` HTML for each of 203 rows; parse:

- `<h1>` present + matches DB title?
- `.lv2-about` text length, paragraph count, list count
- Sidebar VERIFIED SOURCE present?
- Apply CTA href matches DB websiteUrl/sourceUrl?
- "AT A GLANCE" sidebar populated?
- Any rendered `&#160;` / `&#xA0;` / raw entity literals?
- Quick highlights present?

Output: CSV with per-row PASS/FAIL flags. Surfaces:
- Truncated short descriptions (<50 chars)
- Missing fullDescription (falls back to short)
- Broken Apply URLs
- Listings with raw HTML entities in user-facing text
- Listings with no bullet structure (≥80% expected to fail this — that's
  the H1 finding)

---

## Outside the listing pages

| Surface | Walked | Issues |
|---|---|---|
| Navbar | ✓ | Verified badge (`203 verified`) renders left of theme toggle on ≥1024 width; collapses to hamburger below `lg`. Mobile drawer covers Tools dropdown, About, Sign In/Up. |
| Footer | ✓ | 3 cols at ≥640px, stacks to 1 col below. Mini-subscribe row with "Intake not yet open" pill. No hidden columns at any width. |
| Theme toggle | ✓ | Switches between light + dark globally. |
| FloatingFinder FAB | ✓ | aria-label added in this session. Clicks to /recommend. |
| Disclaimer banner (`<ListingDisclaimer />`) | ✓ | Renders on /browse and /listing/[id]. |
| ListingCard (shared) | ✓ | Used on home Featured, Browse grid, Recommend results. Type pill + meta + verified link badge. |

---

## Out-of-scope (this audit)

- `/residency/*` (Sasanova dark theme — intentional)
- `/career/*` (Sasanova dark theme — intentional)
- `/admin/*` (admin-only)
- `/poster/*` (poster-only)
- `/usce/verified-preview/*` (Sonolex pre-prod surfaces)
- Mobile real-device test (Chrome MCP can't simulate viewport; source-verified
  only)
- Production OG image render (verify on first deploy)
- Lighthouse perf score (need deployed URL or `next start`)
