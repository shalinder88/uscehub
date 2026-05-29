# Visa & Jobs — Positioning & Surfacing Decision

status: DECIDED (positioning) · IN PROGRESS (surfacing) · 2026-05-28
supersedes: nothing — first decision record for the career/immigration lane
authority: below USCEHUB_MASTER_BLUEPRINT.md and RULES.md; binding for this lane

## 0. One-paragraph summary

The career/immigration layer is ~80% built (37 `/career` routes, waiver/job/lawyer
data models, DOL + 50-state + waiver datasets) but orphaned from the main site and
`noindex`. We are NOT spinning out a new domain, and NOT launching a broad "Career"
product. We surface it as a narrow, high-intent **Visa & Jobs** lane inside USCEHub,
position J-1 jobs as an **intelligence layer** (not a full job board), and defer all
monetization. USCE stays the wedge; Visa & Jobs is the late-stage lane.

## 1. The decisions

1. **One site.** Keep it on uscehub.com. No new domain now (cold-start: zero SEO,
   zero trust, zero audience). Revisit a subdomain/standalone only after 3-6 months
   of real organic traffic to the lane.
2. **Public label = "Visa & Jobs."** Not "Career" (too broad — signals generic
   physician portal, dilutes the USCE trust wedge). Internal route stays `/career`.
3. **Placement = secondary, not top-level.** Tools dropdown + footer + contextual
   CTAs from visa-relevant pages. No standalone top-nav tab next to Browse.
4. **J-1 jobs = intelligence, not inventory.** Do not compete with PracticeLink /
   PracticeMatch / DocCafe / 3RNET on listing volume. Be the authority on *waiver
   eligibility* (which employer can sponsor, HPSA score, Conrad-30 cycle/cap,
   deadlines), sourced from public data.
5. **No monetization wired yet.** Attorney directory = flat sponsorship only (never
   a % of legal fees — ABA Model Rule 5.4(a) bars non-lawyer fee-splitting). Employer
   posts and insurance/recruiter affiliates come later, with FTC disclosure.
6. **No attorney/insurance CTAs on USCE browse cards.** Protect the trust wedge.

## 2. Audience & why this lane exists

USCE serves the **early-stage** IMG (Step exams, observerships). The Visa & Jobs
buyer is **late-stage** (final year of residency → attending: waiver job, lawyer,
insurance). They are the *same person offset by 5-7 years*. Consequences:

- We cannot monetize today's USCE users now; that's a long-nurture relationship
  (the White Coat Investor model — capture early with free value, monetize late via
  email/brand). The account list + future digest is the bridge across the gap.
- We acquire late-stage users **directly** via SEO on high-intent visa keywords
  (Conrad 30, J-1 waiver, HPSA, H-1B physician) — which the existing pages already
  target. The USCE brand lends domain authority but NOT topical relevance; these
  pages must earn their own ranking on visa intent.

## 3. Section architecture (the 37 routes, divided)

Five sections map the late-stage journey. Sub-nav should expose sections, not 37
flat siblings.

### S1 — Waiver Intelligence (the defensible, public-data core)
`/career/waiver` · `/waiver/map` · `/waiver/tracker` (Conrad 30 slots) ·
`/waiver/pathways` · `/waiver/process` · `/waiver/timeline` · `/waiver/hpsa-lookup` ·
`/waiver/[state]` · `/compare-states` · `/waiver-problems` · `/loan-repayment`

### S2 — Visa & Immigration (status/knowledge)
`/visa-bulletin` · `/visa-journey` · `/h1b` · `/greencard` · `/citizenship` ·
`/ecfmg` · `/h4-spouse` · `/alerts` (policy feed)

### S3 — Jobs (intelligence layer, not full board)
`/jobs` · `/jobs/[specialty]` · `/sponsors` (H-1B sponsor DB from DOL LCA) · `/locums`

### S4 — Offers & Practice Setup (late-stage attending setup)
`/salary` · `/offers` · `/contract` · `/licensing` · `/credentialing` ·
`/interview` · `/taxes` · `/malpractice`

### S5 — Monetization surfaces (present, NOT wired/sold — deferred)
`/employers` + `/employers/post` (employer-side job posting) · `/attorneys`
(lawyer directory — flat sponsorship later)

## 4. Surfacing buckets

- **Surface now** (on-brand, public-data, defensible): S1, S2, S3.
- **Needs copy QA before surfacing**: S4 — especially `/taxes` (needs tax-advice
  disclaimer) and `/malpractice` (insurance disclaimer); plus the landing-page stat
  reconciliation ("25+ tools" vs "29 jobs" vs "13/16/26 specialties" — pick one
  sourced set).
- **Monetization later** (keep page, soften CTA to "contact"/"coming soon", do NOT
  take money): S5 — `/employers*` ($249/listing CTA is copy-only today), `/attorneys`.
- **Hidden / dedupe**: `/career/community` (premature "Attending Community" board —
  keep `noindex`, not in nav). `/career/state-compare` → merge into `/compare-states`
  (true duplicate).

## 5. The two publish levers (do not conflate)

- **Lever 1 — nav entry** (navbar Tools dropdown + footer): humans can reach it.
  Reversible, low-risk. **Doing now.**
- **Lever 2 — remove `noindex`** (single line in `src/app/career/layout.tsx`): Google
  can index it. This is the real "publish" act and unlocks the SEO thesis. Stage it
  **page-by-page after copy QA** — index S1/S2/S3 clean pages first; keep S4 (until QA)
  and S5 (monetization) and `/community` `noindex`. **NOT doing yet — deliberate.**

## 6. Job strategy — public sources (intelligence, not scraping)

Build the eligibility layer from public data; link out to employer-direct postings
under the existing discovery→verify→attribute workflow (`waiver-jobs-data.ts`).
Never scrape gated aggregators.

- **HRSA Health Workforce Connector** (`connector.hrsa.gov`) — public federal job
  board, every posting inside a HPSA. Primary J-1-eligible source.
- **50 state Conrad 30 pages** — slots, cycles, deadlines, participating facilities.
- **HRSA HPSA / MUA data + FQHC roster** — who *can* sponsor and the score.
- **3RNET** — public rural/underserved network with state J-1 infrastructure.
- **DOL LCA data** — employer H-1B sponsorship history (already in `dol-jobs-data.ts`).
- **Employer-direct career pages** — the actual posting we link to.

Product claim = "visa-relevant physician employer intelligence." NOT "every J-1 job."
Do not claim >50% job coverage. The right metric is completeness of *eligibility
data*, not share of recruiter postings.

## 7. Monetization order (all deferred, all disclosed)

1. Attorney directory — **flat monthly sponsorship / featured placement only.**
   No percentage of legal fees (ABA Model Rule 5.4(a)).
2. Employer featured / paid waiver-friendly job post.
3. Insurance affiliate (disability, malpractice) — FTC-disclosed sponsored/affiliate.
4. Recruiter lead-gen — later.
Verified content always ranks above paid (TRUST_AND_MONETIZATION_POLICY.md).

## 8. Phase plan

- [x] **A** — This decision record.
- [~] **B** — Lever 1: surface "Visa & Jobs" in navbar Tools dropdown + footer.
- [ ] **C** — Copy QA: reconcile landing stats; retitle metadata to Visa & Jobs;
  add tax/insurance disclaimers on S4.
- [ ] **D** — Dedupe `state-compare` → `compare-states`; group sub-nav by S1-S5.
- [ ] **E** — Lever 2: remove `noindex` page-by-page (S1/S2/S3 first) — explicit
  go-ahead required; this is the publish decision.
- [ ] **F** — Monetization (much later): attorney flat sponsorship → employer posts →
  insurance affiliate, each with disclosure. Separate approval.

## 9. Revisit triggers

- Separate domain/subdomain: only after 3-6 months of real organic visa-keyword
  traffic proving the lane ranks and converts.
- Full job board: only if we can demonstrably beat the aggregators on a defined
  J-1 slice — otherwise stay intelligence-only.
