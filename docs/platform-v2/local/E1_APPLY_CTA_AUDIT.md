# E1 — Apply CTA audit pass

Local-only audit + minimal corrective edits. No schema, no auth, no
RBAC, no document upload. Branch: `local/e1-apply-cta-audit`.
Not pushed.

This is the first implementation slice from the P95-E
candidate-intake plan. Goal: ensure USCEHub does not imply it is the
official application system for every hospital. Centralize listing
CTAs through the existing `listing-cta.ts` chokepoint and soften
metadata/JSON-LD/FAQ language that drifted into "apply through
USCEHub" framing.

## 1. Search scope

- All `*.tsx` and `*.ts` under `src/`.
- Phrases searched:
  - "Apply Now" / "Apply now" / "apply now"
  - "Submit application" / "Submit Application"
  - "Apply through" / "Apply Today" / "Start application" / "Begin application"
  - "Application Form" / "Application portal" / "Application system"
  - "through USCEHub" / "on USCEHub" / "via USCEHub"
  - "USCEHub application" / "USCEHub apply"
  - "official application"
  - "candidate" / "interest" / "intake"
  - inline `>Apply<`, `"Apply"`, `'Apply'` in JSX

## 2. Findings

### 2.1 Already correct (no edit needed)

- `src/lib/listing-cta.ts` — sole chokepoint. Returns "Apply Now"
  ONLY when `linkVerificationStatus === "VERIFIED"` (or legacy
  `linkVerified === true`) AND has a `websiteUrl`. The `href` in
  that case points at the institution's own URL with
  `external: true`. Clicking sends the applicant off USCEHub to the
  institution's own page. Not an overclaim.
- `src/app/listing/[id]/page.tsx` — uses `decideListingCta` /
  `ctaCaption` via `lib/listing-display.ts`. No inline CTA strings.
- `src/lib/listing-display.ts` — pure consumer of the chokepoint.
- `src/components/home/eras-countdown.tsx` — "apply now" refers to
  ERAS (NRMP), a third-party process, not USCEHub. Acceptable
  in context.
- Career, residency, licensing pages — every "Apply through ECFMG /
  state pharmacy / DEA" instructs about a third-party process, not
  USCEHub. Acceptable.
- `src/app/how-it-works/page.tsx` `applicantSteps[2]` — already
  conservative ("Follow each listing's institution-preferred
  application method (linked from the listing). Save listings and
  track opportunities you're interested in from your dashboard.
  Some listings may support platform-tracked applications when
  available."). No edit.
- `src/app/how-it-works/page.tsx` `institutionSteps[2]` — already
  conservative ("Direct applicants to your institution's preferred
  application method, linked from your listing. Where applicants
  choose to track interest on the platform, you can see it from
  the institution dashboard."). No edit.
- `src/app/for-institutions/page.tsx` — "manage applications" copy
  already qualified by the coordinator-correction subsection landed
  in #61. Acceptable.

### 2.2 Unsafe phrases found and replaced (3)

| File | Old | New |
| --- | --- | --- |
| `src/app/how-it-works/page.tsx` (page metadata `description`) | "…Browse opportunities, apply to programs, and manage listings — all in one free platform." | "…Browse source-linked opportunities, follow each program's official application path, and manage listings — all on one free platform." |
| `src/app/how-it-works/page.tsx` (JSON-LD `name`) | "How to Find and Apply for Observerships, Externships, and Research Programs" | "How to Find Observerships, Externships, and Research Programs and Apply via Each Program's Official Source" |
| `src/app/how-it-works/page.tsx` (JSON-LD `description`) | "…find and apply for clinical experience opportunities in the United States through USCEHub." | "…find U.S. clinical experience opportunities on USCEHub and apply via each program's official source." |
| `src/app/faq/page.tsx` (Q1 answer) | "Each listing includes specific application instructions. Some programs accept applications directly through our platform, while others redirect you to the institution's application portal." | "Each listing links to the institution's official source — the institution's own page is always the canonical place to apply. In the future, participating programs may choose to let applicants express interest through USCEHub, but the official source remains authoritative." |

The FAQ entry uses **future-tense** for the participating-program
intake because there is no formal "participating programs" tier in
production today: there is no `Organization.acceptsIntake` flag and
no `Listing.isParticipating` field, and `POST /api/applications`
accepts an application against any APPROVED listing without an
opt-in distinction. Verified by grepping for
`participating|acceptsIntake|isParticipating` — zero hits in
non-doc source. The future-tense framing is honest about the
roadmap (P95-E Track 2) without overclaiming the current state.

The how-it-works metadata changes touch the rendered `<meta>`
description, the OG-fallback description (page metadata cascades),
and the JSON-LD `HowTo` schema. No visible page copy was changed —
the on-page steps already used conservative language.

### 2.3 Considered and intentionally NOT changed

- `listing-cta.ts` "Apply Now" label on verified listings. Verified
  + external href to the institution's URL is correct UX; "Apply
  Now" here means "we'll deep-link you to the institution's apply
  page." Renaming to "Apply via Official Source" would be more
  defensive but at the cost of a worse-known CTA pattern. Logged
  for future review only.
- `for-institutions/page.tsx` JSON-LD service description — uses
  "manage applications" but in the context of institution-side
  listing management (not implying USCEHub is the application
  system applicants use to apply). Acceptable.
- Career/residency third-party "apply through ECFMG/state board"
  language — not USCEHub-specific.

## 3. Behavior preservation

- `decideListingCta` decision tree: unchanged.
- `ctaCaption`: unchanged.
- `Application` POST flow: unchanged.
- Listing detail UI: unchanged.
- For-Institutions UI: unchanged.
- Methodology UI: unchanged.
- Sitemap, robots, canonical: unchanged.
- Metadata `title` on each page: unchanged.
- All other JSON-LD documents: unchanged.

## 4. Forbidden-path scan

```
git diff --name-only
```

| Path | Allowed? |
| --- | --- |
| `src/app/how-it-works/page.tsx` | yes — page-level metadata + JSON-LD softened, not pathway-related |
| `src/app/faq/page.tsx` | yes — FAQ schema description |

No edits to `prisma/`, `sitemap.ts`, `robots.ts`, `middleware`,
`/career`, `/careers`, `/residency`, `/fellowship`, `/practice`,
`.vercel/`, cron, or auth.

## 5. Overclaim re-scan

After edits:

- "Apply through USCEHub" — none.
- "Official application system" — none.
- "Hospital-approved" — none.
- "Verified by hospitals" — none.
- "Guaranteed" application/placement/match — none.
- "Best programs" — pre-existing on `recommend-client.tsx` (out of
  scope for this branch; #47 covered it).
- "Largest" structured-database — already removed in #57.

## 6. PR split recommendation (when implementation is approved)

A single PR is fine for this size: 2 files, 4 strings, no behavior
change, no schema, no auth. Suggested title:

`chore/apply-cta-audit-pass`

Body should reference the P95-E audit doc and call out the Track 1 /
Track 2 doctrine.

## 7. Hard rules carried forward

- No push.
- No PR.
- No deploy.
- No Vercel mutation.
- No schema/migration.
- No auth/RBAC.
- No document upload.
- No #52 interaction.
- No new role values.
- No new outbound email.
