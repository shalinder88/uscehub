# USCEHub Platform v2 — strategy

**Status:** strategy doc, foundational. Lane / sequencing doctrine for the v2 overhaul.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md) and [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md). Where this doc and either of those disagree, those win.
**Authored:** 2026-04-29.
**Companion:** [USCEHUB_MASTER_BLUEPRINT.md §0](../codebase-audit/USCEHUB_MASTER_BLUEPRINT.md) — the long-term whole-pipeline platform vision. This file operationalizes the §0 vision into a build/launch discipline.

This is the **only** v2 strategy doc landing in this PR. Information architecture, homepage wireframe, navigation model, page template inventory, and launch plan are deliberately deferred to separate sessions because each requires product-level decisions that benefit from human input rather than Claude's first-draft solo work.

---

## TL;DR

USCEHub is a free physician career-pathway platform for the **whole physician pipeline** (IMG → resident → fellow → attending), not an observership directory. The current public wedge is verified USCE / observership / elective / clinical-experience data. v2 is the eventual full-platform site that adds match prep, fellowship pathway, attending jobs, J1/H1B-friendly jobs, visa support, attorney/recruiter/contract-review directories, adult-life finance setup tools, and an institution/recruiter/attorney marketplace.

We build v2 in a **separate long-running branch** so the live site stays stable while the bigger product is rebuilt. We do **not** drip a multi-month overhaul into `main` page-by-page.

---

## 1. Two lanes

### Lane 1 — stable production (`main`)

`main` is the live `uscehub.com`. Every push to `main` deploys within ~60–90 seconds via Vercel.

**Allowed on `main`:**

- bug fixes (correctness, audit-trail discipline, schema-default population)
- trust / copy corrections (PR #25 / #27 are the canonical examples)
- approved small homepage CTA additions (newsletter signup, social links, etc. — only after explicit user authorization per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md))
- ops cleanup (Vercel duplicate project, Prisma deprecation, GSC, mobile QA)
- cron checks / runbooks / audit docs
- emergency data-integrity fixes (cron FAIL, security, data-loss class — explicit-authorization same-day-merge per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md))

**Not allowed on `main`:**

- major redesign
- new top-nav verticals
- new homepage architecture
- new conversion / email / lead-capture system
- broad career / visa / fellowship public launch
- monetization flows
- subscriber tables (or any schema migration without explicit authorization — see §3)
- half-built public pages

Lane 1's job is to keep `uscehub.com` indexed, credible, and stable. Nothing more.

### Lane 2 — background v2 overhaul (`redesign/platform-v2`)

Long-running branch off `main`. Multi-week or multi-month timeline. Vercel auto-creates a preview URL for the branch; Hobby's deployment-protection 401-gates the URL by default, so it's a usable hosted staging environment that Google can't index.

**Allowed in Lane 2:**

- new information architecture
- new homepage / new navigation
- new top-level verticals (USCE / Match / Fellowship / Jobs / Visa / Tools / Resources / Institutions)
- new design system + component library
- internal preview routes
- mock pages
- content architecture
- visual polish
- UX flows
- audience-segment landing pages

**Not allowed in Lane 2:**

- merge to `main` until launch-ready
- change production sitemap / canonicals / metadata (those follow at launch with a coordinated SEO migration plan)
- send real emails
- touch production schema unless explicitly planned (see §3)
- expose unfinished pages on production
- destructive operations against any DB (production or staging)

Lane 2's job is to build the bigger site without disturbing the live site.

### Launch — single batch event

When v2 is ready, it merges to `main` as one controlled release. That's a *moment*, not a third lane. The launch checklist is in [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md) plus a future `LAUNCH_PLAN.md` (deferred — see §10).

---

## 2. Weekly Monday rebase ritual

Long-running branches without rebases bit-rot. By month two, the v2 branch becomes unmergeable and the temptation to "just do v2 work in one giant PR on main" defeats the entire dual-track model.

**Rule:**

```
Every Monday:
  git -C /Users/shelly/usmle-platform fetch origin
  git -C /Users/shelly/usmle-platform checkout redesign/platform-v2
  git -C /Users/shelly/usmle-platform rebase origin/main
  git -C /Users/shelly/usmle-platform push --force-with-lease
```

`--force-with-lease` (never plain `--force`) is the only force-push variant ever allowed in this project. It refuses if someone else pushed to the branch in the meantime.

**Diagnostic: if conflicts become painful, stop and report.** Painful conflicts mean `main` and v2 are drifting too much — usually because Lane 1 is doing more than bug fixes, or because v2 is touching files that `main` is also editing (expected for `src/lib/`, less expected for `src/app/listing/[id]/page.tsx` once Lane 2 starts replacing it). The signal: pause both lanes, decide which lane should own the contested file, then resume.

**Rebase the planning branch too.** This `redesign/platform-v2-planning` branch (which holds future strategy docs as they're written one at a time) follows the same Monday ritual.

---

## 3. Schema-on-main only with explicit authorization

The hardest call in any long-running rebuild is when to land schema migrations. Two failed patterns:

- **Schema lands on the v2 branch, ships at launch.** Production DB doesn't carry unused tables, but v2 can't test against the real production DB until launch day. High risk at launch.
- **Schema lands on main automatically.** Unused tables sit in production for weeks. If v2 launches differently than planned, the leftover schema is technical debt.

**Decision: schema-on-main only with explicit user authorization.**

**Rules:**

- No schema migration lands automatically in either lane.
- If v2 needs schema (e.g. `EmailSubscription` for digests, `Subscriber` for alerts, new fields on `Listing`), I propose a small additive backward-compatible PR to `main` first.
- Only additive, backward-compatible changes are allowed. No `DROP COLUMN`, no `ALTER COLUMN ... NOT NULL` without a default, no `DROP TABLE`, no `prisma migrate reset`, no `prisma db push --accept-data-loss`.
- Migration PRs include a rollback plan and a "what queries change" note.
- The user authorizes each schema PR explicitly before I implement.
- Once authorized + merged on `main`, the v2 branch can develop against the real schema.

**Pattern proven on this project:**

- PR #6 (`20260428171752_baseline_existing_schema`) — created the migration history with no behavior change.
- PR #7 (`20260428173738_phase3_verification_fields`) — added `LinkVerificationStatus`, `FlagKind`, the `Listing` verification fields, the `FlagReport` extensions, the `DataVerification` extensions. All additive. All consumed gradually by PR #9 (cron) → #11 (405 fallback) → #12 (admin queue) → #13 (UI) → #16 (cards) → #17 (ordering) → #21 (digest preview) → #24 (broken-link kind).

The v2 lane should follow the same model: small additive schema PRs on `main`, gradual consumption.

---

## 4. SEO + Twitter/X growth gates

USCEHub's reach strategy must wait for the v2 platform to actually exist as a coherent product. Aggressive growth on the current narrow wedge would either (a) make us look like an "IMG observership directory" forever, narrowing the brand against Master Blueprint §0, or (b) overclaim a "whole physician pipeline platform" while only the USCE wedge is built — also a credibility hit.

### Allowed now

- write future SEO/Twitter positioning principles in this strategy doc
- define audience map (later session)
- define future content pillars (later session)
- define readiness gates (this section)
- define what must be true before public growth push
- watch GSC indexing for the existing USCE pages (per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md))
- maintain blog content discipline (PR #27 is the canonical example)

### Not allowed yet

- aggressive programmatic SEO publishing (state × specialty × audience matrix pages, etc.)
- broad Twitter/X campaign
- paid acquisition (Google Ads, Meta Ads, sponsored content)
- brand claims beyond current product reality ("whole physician pipeline" marketing before pages exist)
- weakening current USCE trust/data-quality work to chase reach
- linking from public pages to unfinished v2 verticals
- announcing v2 before it ships

### Readiness gates — all required before public growth push

1. **Trust system stable.** Cron has run cleanly for ≥4 consecutive scheduled ticks (~4 days). No FAIL from `scripts/check-verify-listings-cron.ts`. No mass `SOURCE_DEAD` / `PROGRAM_CLOSED` / `NO_OFFICIAL_SOURCE` from cron (those are admin-only).
2. **No stale public claims.** Stat counts, blog references, and metadata all reflect the current accurate state and don't overclaim verification (PR #25 + PR #27 close the current known gaps).
3. **Code/site architecture clean.** No half-built public pages. No top-nav links to dead routes. No broken internal links per `next build`.
4. **v2 platform shipped or at minimum the "framing rebrand" shipped.** USCEHub publicly positioned as the physician career-pathway platform (Master Blueprint §0), not an "IMG observership directory."
5. **Mobile QA done** on real iOS + real Android per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2.
6. **GSC + sitemap submission** completed per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 1.
7. **Data-quality story tellable in one paragraph.** "We list X programs with an official source on file across Y states; cron-verified daily; admin-triaged when the source breaks; users can report broken links." Concrete, defensible, no overclaiming.

Until all seven hold, growth stays in planning mode.

---

## 5. Product doctrine (recap)

### The long-term platform is not an observership directory

USCEHub is intended to become the **cleanest, most trusted physician career-pathway platform for the whole pipeline.**

### Long-term audience

- non-U.S. IMGs and U.S. IMGs (deepest content investment today)
- Caribbean IMGs, old-YOG IMGs, reapplicants
- visa-requiring applicants
- U.S. MD / DO medical students and graduates
- residents (USMG and IMG)
- fellows
- attendings, including new attendings entering jobs / contracts / insurance / relocation / financial setup
- visa-sponsored physicians at every career stage

### Current wedge

**Verified USCE / observership / elective / clinical-experience data.** This is the foundation, not the ceiling. Phase 3 (cron + admin queue + real verification UI + verification-aware ordering) shipped the trust engine. v2 builds the rest of the platform on top of that engine.

### Future verticals

Reaffirmed from Master Blueprint §0:

- **USCE** — observerships, externships, electives, research, postdoc
- **Match** — residency match prep, IMG strategy, SOAP, signaling, rank list, interviews
- **Fellowship** — subspecialty-by-subspecialty, visa-friendly fellowships
- **Jobs** — attending jobs, J1 waiver jobs, H1B-friendly physician jobs, locums / moonlighting, attending transition
- **Visa** — J1 vs H1B, Conrad 30, waiver guides, immigration attorney directory, state-by-state visa pathways
- **Tools** — saved programs, compare, alerts, deadline tracker, visa decision helper, fellowship competitiveness helper, cost calculator, email-gated PDF exports
- **Resources** — blog, methodology, IMG resources, FAQ
- **Institutions** — for-institutions onboarding, claim-listing flow, recruiter directory, attorney directory, contract review, future marketplace, future monetization

### Anti-narrowing rule (binding)

Do not describe USCEHub as "an observership directory" or "an IMG observership site" in any commit message, PR body, internal doc, public copy, or session handoff. The current verified-USCE wedge is the trust engine for clinical-experience data; the long-term product is the whole physician career pathway.

If a draft (mine or another agent's) implies the product is only observerships, treat that as drift and flag it before writing more code.

---

## 6. Hard sequencing

Reaffirmed from Master Blueprint §0 hard sequencing rule. Lane 2 must respect the same order:

1. **Stabilize the USCE trust / data-quality engine** (Phase 3 — verification cron, admin queue, real public verification UI). **Done** modulo PR #25 / #27 batch review and §9.3 of the audit.
2. **Saved / compare / alerts on top of trustworthy data.** Saved + compare scaffolding exists (Prisma models, `/dashboard/saved`, `/dashboard/compare`, `/compare`); alerts pending. Lane 1 maintains; Lane 2 redesigns the surfaces if needed.
3. **Expand into career, visa, fellowship, and new-attending support.** Lane 2 builds the new top-level verticals.
4. **Marketplace / monetization.** Final tier; everything before it must be solid.

Conversion architecture (Phase 3.6 send path), fellowship pages, monetization, marketplace, and a cron schedule beyond the existing two are **all gated** on the trust engine being stable in production for at least one full week of clean ticks.

---

## 7. What may still ship on main during v2 build

Lane 1 stays open for these specific categories. Each is small and additive — never a redesign by a thousand cuts.

- **Trust corrections** — wording fixes for verification language consistency (PR #25, PR #27 are the template).
- **GSC / sitemap submission** — operator task; runbook in [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 1.
- **Mobile QA fixes** — one bug per small PR per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2.
- **Ops scripts / runbooks / audit docs** — read-only diagnostics, runbooks, and gap audits.
- **Approved small homepage CTA additions** — newsletter signup, social links, "follow updates" — only with explicit user authorization. **Real email capture / subscriber storage waits** (see §3 — that's a schema PR).
- **Admin queue usage docs** — operator-facing runbook for `/admin/verification-queue`.
- **Official-source wording fixes** — anywhere the codebase or docs still say "verified" for the broad pool.
- **Blog content cleanup** — same vocabulary doctrine as PR #27.
- **Cron monitoring** — daily run of `scripts/check-verify-listings-cron.ts` and operator action on any FAIL.

What stays out of Lane 1 even if it looks small:

- **New top-nav items.** Even one new top-level link (e.g. adding "Fellowship" to the nav) implies a public commitment to a vertical that doesn't exist yet. Belongs in v2.
- **New routes under any of the future-vertical paths** (`/match/*`, `/fellowship/*`, `/jobs/*`, `/visa/*`, `/tools/*`, `/institutions/*`). Same reason.
- **Real email sends.** Until the 8 prerequisites in [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](../codebase-audit/PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §6 are met (consent, unsubscribe, schema, etc.), no real send.
- **Schema migrations.** Per §3.

---

## 8. What v2 will look like (high-level scaffold only)

This section is a placeholder for the deeper IA / nav / wireframe / template work. It captures the user-approved scaffold from Master Blueprint §0 and stops there.

**Eight top-level verticals (probable nav order):**

```
USCE | Match | Fellowship | Jobs | Visa | Tools | Resources | For Institutions
```

The detailed page hierarchy under each vertical is **deferred to `INFORMATION_ARCHITECTURE.md`** — a separate session that benefits from product-level decisions (e.g., do residents/fellows/attendings each get their own top-nav lane, or do they all live under "Career Path"?).

**Build order rule** (from Master Blueprint §13): start with USCE consolidation (the existing wedge re-skinned), then Match Prep, then Career Path (Jobs + Visa), then Tools, then Institutions. Don't ship all eight verticals on launch day if some are skeletal.

---

## 9. Preserve existing work

Reiterating constraints that bind v2:

- **Do not delete or disable `/career` or `/careers`** per [RULES.md](../codebase-audit/RULES.md) §2 hard protection list.
- **Do not remove existing careers backend/backsite work.** Aspirational Prisma models (`WaiverJob`, `WaiverState`, `Lawyer`, `FellowshipProgram`, `DataVerification`) are preserved as aspirational.
- **Do not disable the site or hard-gate listings.** Public content stays free and crawlable per [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md).
- **Do not change schema** without explicit authorization (§3).
- **Do not make SEO-risky page changes** on main (sitemap, robots, canonical, metadata, JSON-LD all stay frozen on main during v2 build; SEO migration is part of the launch event).
- **Do not large-UI-overhaul on main.** That's literally the point of Lane 2.
- **Both stashes preserved** (`stash@{0}: cleanup/01-trust-counts-foundation`, `stash@{1}: jobs expansion`).

---

## 10. Future docs (deferred — separate sessions)

Each of these is a real product decision artifact, not a Claude first-draft. They are deferred to separate sessions where the user can react to one at a time.

| Doc | Why deferred |
|---|---|
| `INFORMATION_ARCHITECTURE.md` | Decides whether residents/fellows/attendings each get top-nav lanes or share "Career Path." Decides URL structure for each vertical. |
| `HOMEPAGE_V2_WIREFRAME.md` | Decides the homepage hero pitch (audience-first vs vertical-first), the stat surface (which numbers, which words), and the primary CTA (browse vs save vs alerts). |
| `NAVIGATION_MODEL.md` | Decides the nav order, mobile collapsing, breadcrumbs, footer link map. Coupled to IA. |
| `PAGE_TEMPLATE_INVENTORY.md` | Lists every page type v2 needs (vertical landing, listing detail, pathway guide, tool, blog post, etc.) and what their shared template needs. Component-library decision. |
| `LAUNCH_PLAN.md` | The actual release-event plan: SEO migration steps, sitemap rebuild, redirects, communication, post-launch monitoring. Drafted near launch readiness. |
| `DESIGN_SYSTEM.md` (optional) | Token / type / spacing / color decisions. Could land before or alongside template inventory. |
| `CONTENT_MODEL.md` (optional) | Decides which content lives in the DB vs in markdown vs in static MDX. Coupled to schema. |

When a session opens with "let's draft the IA doc," that's the trigger to write `INFORMATION_ARCHITECTURE.md` next. Not before.

---

## 11. What this PR did NOT do

- Did **not** create the `redesign/platform-v2` long-running branch. That gets created when the first v2 implementation starts. This planning branch (`redesign/platform-v2-planning`) is for strategy docs only and merges to `main` (after batch review) like any other docs PR.
- Did **not** modify `vercel.json`, schema, sitemap, robots, canonical, JSON-LD, or any production page.
- Did **not** add any public-facing route, copy, or component.
- Did **not** start IA, wireframe, nav, template, design system, or launch plan work — those are explicitly deferred to separate sessions per §10.
- Did **not** auto-merge — this is a foundational doc and worth your batch review even though Mode A would technically allow docs-only auto-merge. Stops at PR-open.

---

## SEO impact of this doc

```
SEO impact:
- URLs changed:        none
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal strategy doc
```

## /career impact of this doc

None. `/career` is preserved per RULES.md §2.

## Schema impact of this doc

None. Schema-on-main rule (§3) requires explicit authorization for any future migration.
