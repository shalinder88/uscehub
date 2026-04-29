# USCEHub v2 — Pathway Dashboard Architecture

**Doc status:** Binding once approved. Final consensus product structure for v2 personalization. Implementation deferred until Phase 0 audits land + explicit user authorization.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md), and [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md). Where any conflict, those win.
**Authored:** 2026-04-29.
**Companion docs:** [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md) §3-§16, [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md), [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md), [NAVIGATION_MODEL.md](NAVIGATION_MODEL.md), [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md), [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md), [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md), [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md), [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md), [EXISTING_SURFACE_INVENTORY.md](EXISTING_SURFACE_INVENTORY.md).

> **Naming consensus reached.** Path 1 = **USCE & Match** (rejected: "Get Into Residency" — pushy/imperative; "Pre-Residency" — defines by negation). Path 2 = **Residency & Fellowship** (rejected: "Training & Fellowship" — too vague). Path 3 = **Practice & Career** (rejected: "Career Launch" — excludes established attendings). All three follow symmetric `[noun] & [noun]` pattern. Subcopy carries the inclusion message at every surface.

---

## 1. Executive decision

**One USCEHub brand. Task-based public navigation. Pathway-based personalized dashboard. Three pathways + Show All Pathways. Soft selector, never a hard gate.**

### 1.1 What this doc is

The final v2 pathway-dashboard architecture. Defines:
- The four pathway modes
- How users discover and switch between them
- How global navigation interacts with pathway personalization
- How content surfaces are canonical-per-topic but pathway-aware in framing
- How preference is stored, refreshed, and migrated
- How the system handles transitions (final-year fellow → attending, applicant → resident)
- How the architecture rolls back if it harms conversion

### 1.2 What this doc is NOT

- Not authorization to implement. Implementation requires explicit user approval after Phase 0 audits.
- Not a UI specification. Visual design lives in [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md) + future wireframe docs.
- Not a schema specification. Pathway preference at v2 launch is anonymous-only via localStorage. Profile sync requires an authorized future schema PR per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).
- Not a launch plan. Sequencing per §23.

### 1.3 Final locked decisions

```
USCEHub remains one brand.
The public site uses task-based navigation.
The personalized product layer uses pathway-based dashboards.

Do not create three separate websites.
Do not create one giant dashboard.
Do not use a blocking first-visit modal.
Do not force account creation to personalize.

Use optional pathway selector + persistent switcher.

Final public pathway labels:
- USCE & Match
- Residency & Fellowship
- Practice & Career
- Show All Pathways

Final internal keys:
- usce_match
- residency_fellowship
- practice_career
- all_pathways
```

Residency & Fellowship sub-sections remain provisional pending PR 0b /residency audit.

### 1.4 Why each rejected alternative was rejected

| Path | Rejected | Why |
|---|---|---|
| 1 | "Get Into Residency" | imperative tone; implies struggle/scarcity; breaks symmetry |
| 1 | "Pre-Residency" | defines by negation; demeaning to some; breaks symmetry |
| 1 | "Residency Entry" | user explicitly disliked "entry" |
| 1 | "Applicant" | rigid identity; doesn't anchor wedge |
| 2 | "Training & Fellowship" | "Training" too vague |
| 2 | "Resident / Fellow" | identity-only, not job-to-be-done |
| 3 | "Career Launch" | implies new attending only; excludes established |
| 3 | "Attending Path" | clinical-only feel; excludes graduating fellow |
| 3 | "Career Path" | too generic |
| 3 | "Practice" alone | clinical-only feel |

### 1.5 Why each chosen label was chosen

- **USCE & Match:** symmetric with other paths; anchors current strongest wedge first; covers the two primary jobs-to-be-done of pre-residency users; concrete, not abstract.
- **Residency & Fellowship:** clearer than "Training"; immediately recognized; preserves dual lanes (resident-not-pursuing-fellowship + fellowship-applicant) without forcing identity.
- **Practice & Career:** covers practice (clinical) + career (jobs/contracts/transitions); inclusive of every stage from final-year trainee to senior attending; doesn't trap users in "new" framing.
- **Show All Pathways:** lets users opt out of personalization; default for skippers and cross-stage browsers.

---

## 2. Public global navigation

Task-based. Eight items per [INFORMATION_ARCHITECTURE.md §3](INFORMATION_ARCHITECTURE.md):

```
USCE  |  Match  |  Fellowship  |  Jobs  |  Visa  |  Tools  |  Resources  |  For Institutions (utility)
```

**My Pathway is a dashboard/product area, not a global audience-nav replacement.**

### 2.1 Why not audience-only nav

NN/g warns audience-only navigation degrades usability when users belong to multiple categories. Real overlap examples:

- A resident applying for fellowship is a "Resident" + a "fellowship applicant" — straddles audiences.
- A fellow shopping attending jobs is a "Fellow" + a "Practice & Career" user — straddles.
- An attending changing jobs is "Attending" but their content needs match a graduating fellow.
- A J1 visa-dependent user is the same content domain whether they're applicant, resident, or attending.

Task-based public nav avoids forcing users to pick an identity to find their task.

### 2.2 Where pathway personalization lives

Pathway personalization lives in:
- The pathway selector on the homepage (below the USCE-first hero)
- The `/dashboard/*` namespace (logged-in)
- Soft personalization on public pages when localStorage preference is set (per §15)

Pathway personalization does NOT replace public global nav. Both coexist.

---

## 3. Final pathway modes

### 3.1 Path 1 — USCE & Match

**Internal key:** `usce_match`

**Audience:**
- IMG (non-U.S. and U.S.)
- U.S. medical student (clinical years onward)
- U.S. graduate
- unmatched applicant (post-Match unmatched)
- reapplicant (entering subsequent Match cycles)
- SOAP applicant (in or post-SOAP)
- old-YOG applicant (graduated > 5 years ago)
- visa-dependent applicant

**Needs:**
- USCE (observerships, externships, electives)
- research opportunities
- Match strategy
- program comparison
- application documents (CV, personal statement, LORs)
- interview prep
- visa basics
- application tracker

**Default CTA:**

> Find verified USCE programs

**Sub-states:**

```
first_time_applicant
reapplicant
unmatched
soap
old_yog
visa_dependent
```

**Empty-state CTAs (per sub-state):**

| Sub-state | Empty-state CTA |
|---|---|
| `first_time_applicant` | Find verified USCE programs |
| `reapplicant` | Plan your reapplication |
| `unmatched` | Find post-Match opportunities |
| `soap` | Find post-Match opportunities |
| `old_yog` | Find IMG-friendly programs |
| `visa_dependent` | Browse visa-friendly USCE & residency resources |

**Public selector subcopy:**

> For IMGs, U.S. medical students and graduates, reapplicants, SOAP candidates, and old-YOG applicants. USCE, Match strategy, documents, interviews, research, and visa basics.

### 3.2 Path 2 — Residency & Fellowship (provisional pending PR 0b)

**Internal key:** `residency_fellowship`

**Audience:**
- incoming resident (matched, pre-PGY-1)
- resident (PGY-1 through senior)
- chief resident
- fellow
- fellowship applicant (resident applying to fellowship)
- visa-dependent trainee

**Needs:**
- boards (Step 3, board exam timeline)
- ITE / in-training exam timeline
- fellowship planning
- research / CV building
- conference abstracts
- moonlighting
- procedures / logs
- housing / relocation
- visa transition
- early job-search prep
- compensation basics (stipend / benefits)
- contract basics
- insurance basics (especially own-occupation disability while training)
- wellness / burnout
- pre-attending preparation

**Default CTA:**

> Plan your next training or career step

**Sub-states:**

```
incoming_resident
early_resident
senior_resident
chief
fellowship_applicant
fellow
graduating_soon
visa_dependent
```

**Empty-state CTAs:**

| Sub-state | Empty-state CTA |
|---|---|
| `incoming_resident` | Get ready for intern year |
| `early_resident` | Plan boards and research |
| `senior_resident` | Plan fellowship or attending step |
| `chief` | Survive chief year and plan ahead |
| `fellowship_applicant` | Find fellowship pathways |
| `fellow` | Plan attending transition |
| `graduating_soon` | Build your attending launch plan |
| `visa_dependent` | Plan visa transition during training |

**Important:** Insurance, contracts, compensation, visa, and jobs are **secondary in Residency & Fellowship**, not hidden. AAMC's resident/fellow stipends and benefits surveys + AMA reporting on resident pay by PGY year confirm compensation/benefits is a resident need, not only an attending need.

This solves the final-year resident/fellow problem: they remain in Residency & Fellowship default identity, but the bridge module (§11) surfaces Practice & Career content so they can plan jobs/contracts/disability insurance/visa timeline before graduation without changing pathway.

**This path must be reconciled after PR 0b /residency audit.** The existing `/residency/*` (12 subroutes including `/residency/fellowship` fellowship database) is not yet audited; final dashboard structure depends on whether `/residency/*` becomes the canonical surface or migrates per [V2_DECISION_REGISTER.md A1](V2_DECISION_REGISTER.md).

**Public selector subcopy:**

> For incoming residents, residents, chief residents, fellows, and fellowship applicants. Boards, fellowship planning, research, moonlighting, procedures/logs, housing, visa transition, and pre-attending preparation.

### 3.3 Path 3 — Practice & Career

**Internal key:** `practice_career`

**Audience:**
- final-year resident / fellow (job-hunting, contract review, visa planning)
- graduating trainee
- new attending (year 1–3)
- established attending (year 4–15)
- senior attending (year 15+)
- visa-dependent physician at any stage
- attending changing jobs
- locums-curious physician
- locums-active physician
- non-clinical physician (admin / research / biotech / education / public health)
- physician pursuing partnership / equity / second income
- physician planning retirement / succession / transition

**Needs:**
- attending jobs
- J1 waiver jobs
- H1B-friendly jobs
- green card timeline
- contracts
- compensation
- RVU / base / bonus
- locums
- malpractice / tail
- disability insurance
- life insurance
- physician mortgage / home
- relocation
- recruiter help
- attorney help
- partnership / equity
- second income (consulting, expert witness, telemedicine)
- direct primary care / concierge medicine
- non-clinical roles
- retirement / succession
- burnout / late-career planning

**Default CTA:**

> Build your practice and career plan

**Sub-states:**

```
graduating_soon
new_attending
established_attending
senior_attending
changing_jobs
locums
visa_dependent
non_clinical
partnership_equity
retirement_succession
```

**Empty-state CTAs:**

| Sub-state | Empty-state CTA |
|---|---|
| `graduating_soon` | Build your attending launch plan |
| `new_attending` | Optimize your first attending year |
| `established_attending` | Compare jobs and compensation |
| `senior_attending` | Plan partnership, succession, or transition |
| `changing_jobs` | Find better-fit attending jobs |
| `locums` | Explore locums opportunities |
| `visa_dependent` | Plan your visa pathway |
| `non_clinical` | Explore nonclinical physician roles |
| `partnership_equity` | Understand partnership and equity paths |
| `retirement_succession` | Plan transition, succession, or retirement |

**Default for unspecified sub-state:** "Build your attending launch plan" (tilts to graduating + new attending, the largest cohort by volume; established attending immediately switches sub-state via filter chip).

**Public selector subcopy:**

> For final-year trainees and physicians at every career stage — from graduating to senior. Jobs, contracts, visa pathway, compensation, insurance, locums, partnership, retirement, nonclinical roles, and transitions.

### 3.4 Path 4 — Show All Pathways

**Internal key:** `all_pathways`

**Audience:**
- undecided user
- user browsing broadly
- multi-stage user (resident applying to fellowship + scoping attending jobs simultaneously)
- researcher / journalist / aggregator
- user who skipped selector
- user whose needs span multiple stages

**Default behavior:**

Show sectioned content across all pathways without forcing personalization.

**Public selector subcopy:**

> Browse without personalization. Best if you are undecided, researching broadly, or your needs span multiple stages.

**Default for selector skippers:** `all_pathways`

**No sub-states.** All Pathways is the un-filtered view; sub-state filtering applies only inside specific pathways.

---

## 4. Pathway selector

Use **three primary visible cards** below the USCE-first hero, plus a **smaller Show All option**.

### 4.1 Selector layout

```
┌────────────────────────────────────────────────────────────────┐
│  Choose your pathway                                            │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐ │
│  │ USCE & Match    │  │ Residency &     │  │ Practice &      │ │
│  │                  │  │ Fellowship       │  │ Career          │ │
│  │ For IMGs, U.S.  │  │ For incoming    │  │ For final-year  │ │
│  │ medical students │  │ residents,       │  │ trainees and    │ │
│  │ and graduates,   │  │ residents, chief │  │ physicians at   │ │
│  │ reapplicants,   │  │ residents,       │  │ every career    │ │
│  │ SOAP candidates,│  │ fellows, and    │  │ stage — from    │ │
│  │ and old-YOG    │  │ fellowship       │  │ graduating to   │ │
│  │ applicants...    │  │ applicants...   │  │ senior...       │ │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘ │
│                                                                  │
│            Show all pathways (smaller text link)                │
└────────────────────────────────────────────────────────────────┘
```

### 4.2 Card subcopy (final)

| Card | Subcopy |
|---|---|
| **USCE & Match** | For IMGs, U.S. medical students and graduates, reapplicants, SOAP candidates, and old-YOG applicants. USCE, Match strategy, documents, interviews, research, and visa basics. |
| **Residency & Fellowship** | For incoming residents, residents, chief residents, fellows, and fellowship applicants. Boards, fellowship planning, research, moonlighting, procedures/logs, housing, visa transition, and pre-attending preparation. |
| **Practice & Career** | For final-year trainees and physicians at every career stage — from graduating to senior. Jobs, contracts, visa pathway, compensation, insurance, locums, partnership, retirement, nonclinical roles, and transitions. |
| Show all pathways | Browse without personalization. Best if you are undecided, researching broadly, or your needs span multiple stages. |

### 4.3 Selector rules

- **Optional.** User does not have to pick.
- **Skippable.** "Show all pathways" or just scrolling past is fine.
- **No blocking modal.** Selector is below the hero, not as a modal overlay.
- **No forced account creation.** Anonymous users select; preference stored in localStorage.
- **Cache in localStorage.** Per §14.
- **Future profile sync** only if logged in AND schema is explicitly authorized per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).
- **Always switchable** at any time per §13.

### 4.4 Rejected for v2 launch

- Hard modal asking "Who are you?" before showing site content
- Forced account creation to personalize
- Fully separate websites per pathway
- Four equal large pathway cards (would visually overcrowd)
- Audience-only global navigation (NN/g failure mode)

---

## 5. Homepage placement

**Current live homepage remains USCE-first for at least 6 months or until v2 platform pages are real.**

### 5.1 V2 homepage order

```
1. USCE / trust wedge hero
   - H1: "Verified clinical training, match prep, visa, and physician
     career pathways — in one place."
   - Sub: "Free for physicians and trainees. Trusted source links,
     current verification status, and the tools to plan every step."
   - Primary CTA: Find USCE
   - Secondary CTA: Choose your pathway

2. Choose your path cards (per §4)

3. Trust engine strip
   - Official sources on file
   - Last verified dates
   - Broken-link reporting
   - Human / admin review

4. Tools block (save / compare / alerts / checklist / visa decision helper)

5. Recently verified / source-linked opportunities

6. Resource / content block (blog, methodology, FAQ)
```

### 5.2 Why USCE-first stays for ≥ 6 months

- Current organic intent is mostly USCE / IMG / observership.
- Replacing the hero with a generic "physician pipeline" claim before v2 content is real would confuse users AND Google.
- USCE is the wedge that converts; defends the SEO and conversion funnel during v2 buildout.
- Per [PLATFORM_V2_STRATEGY.md §17](PLATFORM_V2_STRATEGY.md): readiness gate #4 = "v2 platform shipped or framing rebrand shipped." Until then, USCE-first.

### 5.3 Do not make the selector the entire hero

The pathway selector sits **below** the USCE hero, not in place of it. USCE is the strongest converting surface today; users arriving for "verified IMG observership" should not land on a 3-card pathway selector.

---

## 6. Dashboard shell

Each pathway dashboard contains:

- Headline
- Next best action
- Checklist
- Saved items
- Alerts
- Recommended resources
- Tools surface
- Timeline
- Trusted / source-linked opportunities
- Bridge module to next pathway when relevant (§11)

### 6.1 Desktop layout

```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo] USCE Match Fellowship Jobs Visa Tools Resources           │
│                                              [Pathway: Practice  │
│                                              & Career ▾] [Avatar]│
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  Your pathway: Practice & Career                                  │
│  Sub-state: [All] [Graduating soon] [New attending]               │
│             [Changing jobs] [Visa] [Locums] [More ▾]              │
│                                                                   │
│  Next best action                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Build your attending launch plan                            │ │
│  │ Start with a contract review checklist                       │ │
│  │ [Start checklist]                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌──────────────────────┬────────────────────┬─────────────────┐ │
│  │ Saved items          │ Recommended         │ Deadlines /     │ │
│  │ • Job listing 1      │ • Visa-friendly     │ Recently        │ │
│  │ • Job listing 2      │   attending jobs    │ verified         │ │
│  │ • Compare set        │ • Contract checklist │                 │ │
│  │ See all →            │ • Disability insur.  │ Conrad 30 J1    │ │
│  │                      │   options            │ deadline 12/15  │ │
│  └──────────────────────┴────────────────────┴─────────────────┘ │
│                                                                   │
│  Tools                                                            │
│  [Save] [Compare] [Alerts] [Checklist] [Visa decision helper]    │
│                                                                   │
│  Bridge: Preparing for Practice & Career (if Path 2)              │
│  OR Preparing for Residency (if Path 1)                           │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### 6.2 Mobile layout

```
┌──────────────────┐
│ [☰] USCEHub  🔍   │
│ Pathway: P & C ▾ │ ← sticky pathway pill
├──────────────────┤
│                   │
│ Next best action  │
│ Build your        │
│ attending launch  │
│ plan...           │
│                   │
│ [Sub-state chips] │
│                   │
│ Saved items       │
│ Recommended       │
│ Deadlines         │
│ Tools             │
│ Bridge module     │
│                   │
├──────────────────┤
│ Home │Browse│Saved│Account│
└──────────────────┘
```

### 6.3 Dashboard URL structure

**Use existing `/dashboard/*` namespace. Do NOT introduce `/my-pathway` URL.**

```
/dashboard               — pathway-aware home (Path-specific landing)
/dashboard/saved         — saved items (path-aware filter)
/dashboard/compare       — compare drawer
/dashboard/applications  — application tracker (per A3 audit)
/dashboard/checklist     — checklist (path-specific content)
```

**Why keep `/dashboard`:** existing URLs already exist (`/dashboard/saved`, `/dashboard/compare`). Renaming creates redirect debt. Rebrand the UI label ("My Pathway") not the URL.

### 6.4 Top-right utility pill

```
[Pathway: Practice & Career ▾]
```

- Visible **only after preference is set** (no clutter for users without preference).
- Click to expand: shows current pathway + subcopy + "Switch pathway" link.
- Mobile equivalent: small sticky pill at top of dashboard.

---

## 7. Universal tools layer

Tools are global; content is pathway-aware.

### 7.1 Universal tools

```
Search          — global search across all pathways
Save            — save listings/programs/jobs/articles
Compare         — compare 2-4 items side-by-side
Alerts          — digest + deadline reminders (per §16)
Checklist       — career-stage checklist (path-specific items)
Calendar / deadlines — application/board/visa timeline
Document tracker — future (CV, transcripts, LORs)
Application tracker — Existing /api/applications + Application model
                       per [V2_DECISION_REGISTER.md A3](V2_DECISION_REGISTER.md)
```

### 7.2 Pathway-specific content inside shared tools

| Tool | USCE & Match | Residency & Fellowship | Practice & Career |
|---|---|---|---|
| Save | USCE listings, Match strategy guides | Fellowship programs, board prep, research | Job listings, contract templates, recruiter profiles |
| Compare | Programs side-by-side | Fellowship programs side-by-side | Job offers side-by-side |
| Alerts | New verified USCE, application deadlines | Fellowship deadlines, conference abstracts | Visa-friendly jobs, contract resources |
| Checklist | USCE → ERAS → interviews → rank list | boards → fellowship → research → moonlighting → job prep | jobs → contracts → visa → insurance → relocation → compensation |

---

## 8. Canonical content rule

**Do not duplicate content trees per dashboard.**

### 8.1 Canonical examples

```
✅ /visa/* — all visa content (J1, H1B, Conrad 30, green card, etc.)
✅ /jobs/* — all job content (J1 waiver, H1B-friendly, locums, attending)
✅ /tools/* — all interactive tools
✅ /resources/* — all editorial content (blog, methodology, IMG resources)
✅ /usce/* — all USCE-related content (or existing /observerships/*, /listing/*)
⏸ /fellowship/* — depends on PR 0b /residency audit
⏸ /residency/* — depends on PR 0b /residency audit
```

### 8.2 Forbidden patterns

```
❌ /usce-match/visa
❌ /residency-fellowship/visa
❌ /practice-career/visa
❌ /usce-match/jobs
❌ /residency-fellowship/jobs
❌ /practice-career/jobs
```

These would create:
- 3× SEO duplication (same content, multiple canonical URLs)
- 3× content maintenance burden
- Conflicting freshness (one path's visa content updated, others stale)
- AI-search confusion (which URL is authoritative?)

### 8.3 Dashboard surfacing rule

Each pathway dashboard surfaces content **with path-specific framing**, linking to the canonical URL.

Example: `/visa/j1-waiver` is the canonical page. Three dashboards surface it differently:

```
USCE & Match dashboard:
  Card title: "Visa basics: J1 waiver later"
  Description: "If you're matching into J1, here's the basics of waiver options"
  Link: /visa/j1-waiver

Residency & Fellowship dashboard:
  Card title: "Visa transition: J1 to waiver"
  Description: "Plan your transition before graduation"
  Link: /visa/j1-waiver

Practice & Career dashboard:
  Card title: "J1 waiver job search"
  Description: "Find Conrad 30 jobs in your specialty + state"
  Link: /jobs/j1-waiver (job listings) cross-linked to /visa/j1-waiver (rules)
```

Same canonical URL, different framing, different sibling-cards on each dashboard.

---

## 9. Content priority matrix

| Topic | USCE & Match | Residency & Fellowship | Practice & Career |
|---|---|---|---|
| USCE | **Primary** | Search-only | Search-only |
| Match | **Primary** | Secondary | Hidden |
| Fellowship | Secondary | **Primary** | Secondary |
| Jobs | Hidden | Secondary | **Primary** |
| Visa | Secondary | Secondary | **Primary** |
| Contracts | Hidden | Secondary | **Primary** |
| Insurance | Hidden | Secondary | **Primary** |
| Compensation | Hidden | Secondary | **Primary** |
| Housing / Relocation | Secondary | Secondary | Secondary |
| Research | **Primary** | **Primary** | Secondary |
| Boards | Hidden | **Primary** | Secondary |
| Moonlighting / Locums | Hidden | Secondary | **Primary** |
| Wellness / Burnout | Secondary | Secondary | Secondary |
| Partnership / Equity | Hidden | Hidden | **Primary** (sub-state: established_attending, senior_attending) |
| Retirement / Succession | Hidden | Hidden | **Primary** (sub-state: senior_attending) |
| Nonclinical roles | Hidden | Secondary | Secondary (sub-state: non_clinical) |
| Tools | **Primary** | **Primary** | **Primary** |
| Resources | **Primary** | **Primary** | **Primary** |

### 9.1 Important defaults

- **USCE is primary only in USCE & Match.** Other pathways treat USCE as search-only (an attending who searches "observership" finds it; doesn't get USCE cards on their dashboard).
- **Insurance, contracts, compensation, visa, and jobs are SECONDARY in Residency & Fellowship**, not hidden. Final-year trainees need this content during training; the bridge module (§11) surfaces it without forcing pathway switch.
- **Practice & Career is primary for jobs, contracts, visa, insurance, compensation, locums, partnership, retirement, nonclinical roles.** This is the path's depth.
- **Wellness / burnout is secondary in all three pathways.** Cross-cutting concern.
- **Locums is primary in Practice & Career.** Moonlighting is secondary in Residency & Fellowship (similar but not identical).
- **Research is primary in USCE & Match and Residency & Fellowship.** Different lifecycle stages but same domain.

### 9.2 Matrix values defined

| Value | Behavior |
|---|---|
| **Primary** | Featured on dashboard, prominent placement, first-class CTA |
| **Secondary** | Surfaced on dashboard, lower placement, less prominent |
| **Hidden-by-default** | Not surfaced on dashboard; available via search and direct URL |
| **Search-only** | Not surfaced on dashboard at all; available only via search results |

---

## 10. Sub-state UX

Sub-states are **filter chips inside dashboards**. Do NOT show all sub-states as equal first-level options on mobile.

### 10.1 Practice & Career visible chips

```
[All]  [Graduating soon]  [New attending]  [Changing jobs]  [Visa]  [Locums]  [More ▾]
```

`[More ▾]` expands:
```
[Established]  [Senior]  [Nonclinical]  [Partnership]  [Retirement / Succession]
```

Five primary visible chips + "More" reduces visual overwhelm; advanced sub-states stay accessible.

### 10.2 Residency & Fellowship visible chips

```
[All]  [Incoming]  [Early resident]  [Senior resident]  [Fellow]  [Fellowship applicant]  [Graduating soon]  [Visa]
```

All 8 sub-states fit in a single horizontal chip strip without "More" expansion (mobile horizontal-scroll handles narrow viewports).

### 10.3 USCE & Match visible chips

```
[All]  [First-time]  [Reapplicant]  [SOAP / unmatched]  [Old YOG]  [Visa]
```

All 6 sub-states visible in one strip.

### 10.4 Sub-state interaction model

- Selecting a sub-state **narrows dashboard modules** (filters which cards appear, which checklist items show, which alerts default-on).
- Selecting a sub-state **does NOT change global pathway** unless user explicitly confirms.
- Sub-state preference persists in localStorage alongside pathway preference (per §14).
- User can multi-select sub-states (e.g., "Visa" + "Changing jobs" together).

---

## 11. Bridge modules

Bridge modules handle stage overlap without forcing pathway switching.

### 11.1 USCE & Match → Residency & Fellowship

**Module title:** "Preparing for Residency"

**Inline preview cards:**
- Intern-year basics
- Housing / relocation
- Boards overview (Step 3 timeline)
- Research planning during residency
- Visa transition (J1, H1B post-Match)
- What to do after Match Day

**CTA:** "See Residency & Fellowship resources →"

### 11.2 Residency & Fellowship → Practice & Career

**Module title:** "Preparing for Practice & Career"

**Inline preview cards:**
- Job search basics
- Contract basics
- Visa timeline (J1 waiver / H1B / green card)
- Disability insurance (own-occupation, lock rates during training)
- Pay structure (RVU / base / bonus)
- Relocation planning

**CTA:** "See Practice & Career resources →"

### 11.3 Bridge module behavior

Bridge modules:
- **Keep user in current dashboard.** No automatic pathway switch.
- **Link to canonical content.** `/visa/*`, `/jobs/*`, etc.
- **Optionally offer pathway switch.** Bottom of bridge module: "Switch to {other pathway}" small CTA.
- **Do not require identity change.** A senior resident reading Practice & Career bridge content is still in Residency & Fellowship.

### 11.4 Why bridges, not full content

Bridges show **inline preview** (4-6 cards) rather than full Practice & Career content. This:
- Surfaces relevant cross-stage content
- Doesn't overwhelm the current dashboard
- Lets the user decide whether to dive in (via card click) or switch pathway (via bottom CTA)

### 11.5 No bridge from Practice & Career

Practice & Career is the latest stage; no further pathway to bridge to. Bridge modules are forward-only (1→2, 2→3).

---

## 12. All Pathways mode

### 12.1 Public homepage in All Pathways mode

Use **sectioned content carousels**:

```
┌──────────────────────────────────────────────────────────────────┐
│ Hero (USCE-first)                                                  │
│ Find verified clinical training, match prep, visa, and physician  │
│ career pathways — in one place.                                    │
│ [Find USCE]                                                        │
├──────────────────────────────────────────────────────────────────┤
│ Choose your pathway (selector)                                     │
├──────────────────────────────────────────────────────────────────┤
│ ▼ USCE & Match (carousel)                                          │
│   Card 1 │ Card 2 │ Card 3 │ Card 4 │ See all →                  │
├──────────────────────────────────────────────────────────────────┤
│ ▼ Residency & Fellowship (carousel)                                │
│   Card 1 │ Card 2 │ Card 3 │ Card 4 │ See all →                  │
├──────────────────────────────────────────────────────────────────┤
│ ▼ Practice & Career (carousel)                                     │
│   Card 1 │ Card 2 │ Card 3 │ Card 4 │ See all →                  │
├──────────────────────────────────────────────────────────────────┤
│ Trust strip / Tools / Resources                                    │
└──────────────────────────────────────────────────────────────────┘
```

### 12.2 Logged-in dashboard in All Pathways mode

Use **tabs**:

```
┌──────────────────────────────────────────────────────────────────┐
│ Pathway: All Pathways ▾                                            │
│ [All] [USCE & Match] [Residency & Fellowship] [Practice & Career] │
├──────────────────────────────────────────────────────────────────┤
│ All tab: shows merged content with pathway labels per card         │
│ Other tabs: filter to that pathway's content                       │
└──────────────────────────────────────────────────────────────────┘
```

### 12.3 Default for selector skippers

`all_pathways` — un-personalized view; sectioned content as above.

### 12.4 All Pathways must not become chaos

The risk: "All Pathways" becomes a kitchen-sink view that doesn't serve any audience well. Mitigation:
- **Sectioned, not merged.** Each pathway gets its own carousel/section, not one giant feed.
- **Path-tagged cards.** Every card in All Pathways shows its native pathway label (e.g., "USCE & Match" badge).
- **"See all →" links** at the end of each carousel let the user dive into a specific pathway.

---

## 13. Switching rules

### 13.1 Switch surfaces

- **Top pill (desktop + mobile):** "Pathway: Practice & Career ▾"
- **Profile setting:** explicit pathway selector in user profile
- **Mobile bottom-nav / Profile:** Profile screen shows pathway switch
- **Reconfirmation prompts** (§14)

### 13.2 What happens on switch

- **Saved items: KEEP all.** A user with 12 saved listings switching from Path 1 to Path 3 keeps all 12. Some are USCE (now hidden-by-default in Path 3 dashboard but accessible via "All saved").
- **Compare list: KEEP all.** Cross-path compare allowed.
- **Alerts: KEEP current subscriptions.** No auto-resubscribe to other path's defaults.
- **Checklist: SWITCH context.** New path's checklist becomes active; old checklist preserved (accessible via "Previous checklist" link).
- **Cross-path recommendations: ALLOWED.** "Looking for X? It's typically in [other pathway]" cues remain.
- **Search: REMAINS cross-path.** Per §16, search ranks by current pathway but always returns results from all paths.
- **Pathway pill: UPDATES** to new label.
- **Dashboard layout: RE-RENDERS** with new path's modules.

### 13.3 No permanent lock-in

Switching is fast (single click), reversible (single click back), and never destructive. The user can switch back and forth without losing data.

### 13.4 Cross-path search cue

```
Search: "J1 waiver"
Results:
  ✓ /visa/j1-waiver — "Usually part of Practice & Career"
  ✓ /jobs/j1-waiver/california — "Usually part of Practice & Career"
  ✓ /resources/blog/j1-waiver-explained — "Usually part of Practice & Career"
```

The "Usually part of..." cue indicates the result's native pathway. Pathway preference affects ranking, not access.

### 13.5 Server-side preference precedence (future)

When schema authorization arrives + `User.pathwayPreference` exists:
- Server-side (profile) preference wins over localStorage on conflict.
- One-time prompt on conflict: "Your account says X; this device says Y. Which is current?"

---

## 14. Preference freshness

### 14.1 localStorage shape (v2 launch)

```
pathwayPreference         = usce_match | residency_fellowship | practice_career | all_pathways
pathwayPreferenceUpdatedAt = ISO date
pathwaySubState           = (optional) current sub-state key
pathwaySubStateUpdatedAt  = (optional) ISO date
```

### 14.2 Reconfirmation triggers

Reconfirm pathway preference:

- **Every 6 months.** Soft prompt: "Last set 6 months ago — still right?"
- **After major milestones.** If we can detect (via behavior signals), e.g., user repeatedly opens Path 2 content while in Path 1.
- **When user behavior heavily contradicts current preference.** E.g., USCE & Match user repeatedly opens Practice & Career content over multiple sessions.

### 14.3 Behavior-driven reconfirmation examples

- USCE & Match user repeatedly opens Residency & Fellowship content → ask if they matched or moved stages.
- Residency & Fellowship user repeatedly opens Practice & Career content → ask if they're preparing for attending life (and offer to switch with bridge module guidance).
- Practice & Career user repeatedly opens USCE content → keep search results open but do not auto-prompt switch (often legitimate cross-stage curiosity for established attendings).

### 14.4 Reconfirmation UI

- **Soft prompt, not modal.** Banner at top of dashboard.
- **One-click confirm or switch.** "Yes, still {path}" / "Switch to {other path}" / "Maybe later."
- **Trackable.** Each prompt firing + user action logged to analytics (§22).

### 14.5 No schema implementation now

All preference state lives in localStorage at v2 launch. Schema sync is a future authorized PR per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).

---

## 15. Auth boundary

### 15.1 Logged-out + localStorage preference

- **Soft personalization on public pages.** Path-aware tools / cards / recently-verified surfaces.
- **No private dashboard access.** `/dashboard/*` requires sign-in.
- **Pathway pill visible** if preference set; absent if no preference.

### 15.2 Logged-in

- **`/dashboard/*` remains auth-gated.**
- **Future profile sync** requires schema authorization. Until then, logged-in users use localStorage preference (same as anonymous).
- **When schema lands:** `User.pathwayPreference` field; logged-in users sync localStorage → profile on first login post-schema.

### 15.3 All Pathways mode

- **Default for skippers.** User who doesn't pick a card → `all_pathways` preference cached.
- **Explicit option.** Visible in selector ("Show all pathways") and in pill dropdown ("All pathways").

### 15.4 Cross-device limitation acknowledgment

localStorage doesn't sync across devices. A user with Path 2 preference on phone has no preference on laptop until they pick again or sign in (future schema).

This is acceptable for v2 launch. Logged-in cross-device sync arrives with future authorized schema PR.

---

## 16. Notification defaults

Alerts / digests are **pathway-aware**.

### 16.1 USCE & Match defaults

- Newly verified USCE programs (matching state/specialty filters)
- USCE application deadlines
- Match-related deadlines (ERAS open, signaling, MSPE release, rank list, Match Day)
- Research opportunities
- Document / checklist reminders

### 16.2 Residency & Fellowship defaults

- Boards reminders (Step 3, board exam timeline)
- Fellowship match updates / deadlines
- Moonlighting resources
- Conference / research deadlines
- Training-to-practice reminders (final-year prep)

### 16.3 Practice & Career defaults

- Visa-friendly attending jobs
- Contract resources / checklists
- Attorney / recruiter updates
- Insurance / checklist reminders
- Locums opportunities
- Compensation / negotiation resources

### 16.4 Cross-path subscriptions

**Opt-in only.** A user in Path 1 can subscribe to Path 3 jobs digest, but only by explicitly opting in. Default: only current-path content.

### 16.5 No real email at v2 launch

Per [MESSAGING_AND_ALERTS_POLICY.md §2.1](MESSAGING_AND_ALERTS_POLICY.md): no real send until 8 prerequisites met (consent flow, unsubscribe, preference center, sender DNS, postal address, etc.). Until then, alert subscriptions are stored as preferences but not actually fired.

---

## 17. Data model implications

**Do not implement now.**

### 17.1 Possible future fields (schema requires authorization)

```prisma
model User {
  // existing fields ...
  pathwayPreference       PathwayPreference?  // enum
  pathwayPreferenceUpdatedAt DateTime?
  pathwaySubState         String?              // sub-state key
  pathwaySubStateUpdatedAt DateTime?
  careerStage             CareerStage?         // future enum
  specialtyInterest       String[]             // future
  visaNeed                VisaType?            // future enum
  locationPreference      String[]             // future
  alertPreferences        Json?                // future
  notificationPreferences Json?                // future
}

enum PathwayPreference {
  USCE_MATCH
  RESIDENCY_FELLOWSHIP
  PRACTICE_CAREER
  ALL_PATHWAYS
}
```

### 17.2 Authorization gate

All schema work requires **explicit user authorization** per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md). No PR in this doc set authorizes any schema change.

### 17.3 v2 launch state

At v2 launch: pathway preference is **anonymous-only** via localStorage. Logged-in users have the same localStorage-only preference until a future authorized schema PR adds `User.pathwayPreference`.

---

## 18. Existing route implications

### 18.1 Do not delete

- `/residency` and 11 subroutes (per [EXISTING_SURFACE_INVENTORY.md §2.3](EXISTING_SURFACE_INVENTORY.md))
- `/poster` and 5 subroutes (per [EXISTING_SURFACE_INVENTORY.md §2.2](EXISTING_SURFACE_INVENTORY.md))
- `/career` and 27 subroutes (per [RULES.md](../codebase-audit/RULES.md) §2 hard protection)
- `/dashboard` and existing subroutes
- `/recommend`
- `/tools` and `/tools/cost-calculator`
- `/community`

### 18.2 Dashboards link to existing surfaces

Dashboards surface canonical content from existing routes. Examples:

- USCE & Match dashboard "Recommended USCE programs" card → links to `/observerships/[state]` or `/listing/[id]`
- Residency & Fellowship dashboard "Fellowship programs" card → links to `/residency/fellowship` (pending PR 0b audit)
- Practice & Career dashboard "Visa-friendly jobs" card → links to `/jobs/j1-waiver` or `/career/jobs` (preserved)

### 18.3 Phase 0 audit dependencies

- **/poster needs PR 0a** (already done — see [POSTER_FLOW_AUDIT.md](audits/POSTER_FLOW_AUDIT.md)) before institution dashboard / claim decisions.
- **/residency and /residency/fellowship need PR 0b** before final Residency & Fellowship dashboard decisions (decision A1).
- **/recommend and /tools** remain canonical tool surfaces unless later changed.
- **/career** remains protected and untouched unless explicitly authorized per [RULES.md](../codebase-audit/RULES.md) §2.

---

## 19. Monetization / disclosure implications

**Practice & Career is where monetization will eventually concentrate.** Per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md):

### 19.1 Eventual monetization surfaces (in Practice & Career)

- Recruiters
- Attorneys
- Contract review
- Mortgage
- Insurance (disability, life, malpractice)
- Locums companies
- Nonclinical role placement
- Partnership / equity advisory

### 19.2 Rules

- **Sponsored labels required.** Per [TRUST_AND_MONETIZATION_POLICY.md §4](TRUST_AND_MONETIZATION_POLICY.md), every paid placement carries a "Sponsored" badge.
- **Paid placement cannot override trust.** Per [TRUST_AND_MONETIZATION_POLICY.md §3](TRUST_AND_MONETIZATION_POLICY.md), `VERIFIED` listings sort above sponsored listings.
- **Disclosure banner required** for partner / vendor sections.
- **No monetization implementation in this doc.** Each monetization mode requires its own authorization per [TRUST_AND_MONETIZATION_POLICY.md §13](TRUST_AND_MONETIZATION_POLICY.md).
- **No paid sponsorship before disclosure policy and trust separation are implemented.**
- **No dark patterns.** Per [TRUST_AND_MONETIZATION_POLICY.md §10](TRUST_AND_MONETIZATION_POLICY.md).
- **No selling trust.** Verification is not for sale.

### 19.3 USCE & Match + Residency & Fellowship

Lower monetization volume (these audiences pay USCEHub nothing — institutional sponsors pay USCEHub to reach them).

---

## 20. Feature flag / rollback

The pathway dashboard architecture must be **feature-flag-able**.

### 20.1 Why

If pathway routing degrades conversion, increases bounce, or causes user confusion, we need a kill switch — not a code revert per [PLATFORM_V2_STRATEGY.md §20](PLATFORM_V2_STRATEGY.md).

### 20.2 Flag granularity

A feature flag at the pathway-routing level allows:
- **Global off:** all users see un-personalized homepage; pathway selector hidden; dashboard reverts to legacy view.
- **Logged-in only:** anonymous users see un-personalized; logged-in users see pathway dashboard.
- **Cohort-based:** percentage rollout (e.g., 25% of users see pathway feature).

### 20.3 No production dependency until launch approved

The pathway feature must not become a hard dependency for any other feature. If we turn it off, the rest of the site continues to work.

---

## 21. Accessibility and mobile notes

### 21.1 Accessibility

- **Selector cards** need ARIA roles (`role="button"` or wrap in `<button>`).
- **Keyboard navigation** required: Tab through cards, Enter to select, Esc to dismiss any prompt.
- **Visible focus state** required: keyboard-focused card has visible outline (4.5:1 contrast minimum).
- **Switch action immediate.** No confirm dialog on pathway switch (saved items preserved per §13.2; reversibility makes confirm unnecessary friction).
- **No hidden critical content behind hover-only UI.** Sub-state filters and switcher accessible via tap/click on touch devices.
- **Screen reader landmarks:** dashboard sections use `<nav>`, `<main>`, `<aside>` semantically.

### 21.2 Mobile

- **Bottom nav has four items:** Home / Browse / Saved / Account.
- **No Checklist item in bottom nav.** Checklist lives inside dashboard.
- **Sticky pathway pill stays small** (24-32px height). Only when preference set.
- **Sub-state chips horizontally scroll** on narrow viewports.
- **Touch targets ≥ 44pt × 44pt** per Apple HIG / Material guidelines.

### 21.3 Cross-browser parity

Pathway features tested on:
- Chrome (latest)
- Safari (macOS + iOS)
- Firefox
- Edge

`backdrop-filter` (used in sticky nav per [NAVIGATION_MODEL.md §15](NAVIGATION_MODEL.md)) requires Safari 9+ fallback.

---

## 22. Analytics notes

Track later (not implemented in this doc):

```
pathway_selected               — user picks a pathway (with sub-state if any)
pathway_skipped                — user dismisses selector or scrolls past
pathway_switched               — user changes pathway via pill / profile
pathway_reconfirmed            — user confirms pathway on prompt
substate_selected              — user picks a sub-state filter chip
cross_path_result_clicked      — user clicks a search result from another pathway
bridge_module_clicked          — user clicks a bridge-module card
dashboard_empty_state_clicked  — user clicks empty-state CTA
save_activated_by_pathway      — save-listing event tagged with current pathway
compare_activated_by_pathway   — compare-flow event tagged with current pathway
alert_subscribed_by_pathway    — alert-subscription event tagged with current pathway
```

### 22.1 Goals of measurement

- **Per-pathway DAU / WAU** — how active is each pathway.
- **Cross-path switch rate** — how often users switch pathways.
- **Skip-selector rate** — how many users decline to pick.
- **Per-pathway conversion** — saved/compared/applied per pathway.
- **Bridge-module CTR** — does the bridge module drive engagement.
- **Reconfirmation acceptance rate** — do users confirm pathway when prompted.

### 22.2 No analytics implementation in this PR

These events are documented for future build per a separate METRICS doc (deferred).

---

## 23. Launch sequencing

### Phase 1 — docs only

✅ This doc + earlier planning batch (PR #30) on main.

### Phase 2 — Phase 0 audits

- ✅ PR 0a poster audit ([POSTER_FLOW_AUDIT.md](audits/POSTER_FLOW_AUDIT.md), PR #32 OPEN)
- ⏳ PR 0b residency audit (next)
- ⏳ PR 0c application flow audit
- ⏳ PR 0d review flow audit
- ⏳ PR 0e community flow audit
- ⏳ PR 0f recommend tool audit
- ⏳ PR 0g cost-calculator audit

### Phase 3 — revise this doc after PR 0b

After 0b residency audit lands, revise §3.2 (Path 2) + §18 (existing route implications) to reflect findings. Same in-place pattern as PR #30 revision after PR #31 audit.

### Phase 4 — dashboard wireframes

Visual wireframes for each pathway dashboard. Separate doc.

### Phase 5 — non-public preview dashboard shell

Build the v2 dashboard shell on `redesign/platform-v2` branch. Renders pathway selector + dashboard skeleton. No pathway-specific content yet.

### Phase 6 — localStorage-only preference

Wire up localStorage preference reading + writing. Pathway pill renders. No schema change.

### Phase 7 — logged-in profile sync (only if schema authorized)

Future: add `User.pathwayPreference` field via authorized schema PR. Sync localStorage ↔ profile.

---

## 24. Staged content rollout

### 24.1 At v2 launch

- **USCE & Match** should be substantially built (current strongest wedge).
- **Residency & Fellowship** can be skeletal but honest. Existing `/residency/*` likely surfaces here pending PR 0b audit.
- **Practice & Career** can be skeletal but honest. Existing `/career/*` preserved (per [RULES.md](../codebase-audit/RULES.md) §2); v2 `/jobs/*`, `/visa/*`, etc. URLs may be skeletal.
- **All Pathways** works by grouping available content; no extra build cost.

### 24.2 Post-launch

- Fill Residency & Fellowship content depth (per PR 0b reconciliation).
- Fill Practice & Career content depth.
- Add specialty / location / sub-state depth (progressive disclosure dimensions).
- Add pathway timeline view (Phase D feature).
- Add deeper notification preferences.
- Reconfirm and adjust based on usage telemetry.

### 24.3 Don't overclaim

Do not market USCEHub as "all three pathways equally complete" at launch. Honest framing: "USCE & Match is fully built; Residency & Fellowship and Practice & Career are growing — be the first to know when content lands."

---

## 25. Open decisions

These are documented for future user resolution. Each maps to [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md) entries or new entries to add.

### 25.1 Naming

1. **Final lock on Path 1 label.** "USCE & Match" recommended. Alternatives: "Match & USCE", "Pre-Residency". **Recommend: USCE & Match.**
2. **Final lock on Path 2 label.** "Residency & Fellowship" recommended. Alternative: "Training & Fellowship". **Recommend: Residency & Fellowship.**
3. **Final lock on Path 3 label.** "Practice & Career" recommended. Alternatives: "Physician Career", "Practice Life". **Recommend: Practice & Career.**

### 25.2 Content scope

4. **Practice & Career retirement / succession at launch or later?** **Recommend: launch with skeletal content + sub-state filter; flesh out post-launch.**
5. **Residency & Fellowship insurance / pay widgets at launch or later?** **Recommend: skeletal at launch (links to canonical /visa, /jobs, etc.); flesh out as bridge module post-launch.**

### 25.3 URL structure

6. **Dashboard URL: stay `/dashboard/*` only or add path-specific tabs (e.g., `/dashboard/usce-match`)?** **Recommend: stay `/dashboard/*` only; pathway is state, not URL.**

### 25.4 Marketing / SEO

7. **How does homepage balance shift after v2 launch?** When USCE & Match dashboard is fully built and Paths 2/3 catch up, the homepage hero may evolve from "USCE-first" to "physician-pathway-first." **Recommend: revisit at v2 launch + 6 months.**
8. **How is cross-path search labeled?** Currently: "Usually part of [other pathway]." Alternative: "Practice & Career topic." **Recommend: "Usually part of..." (less category-feeling).**

### 25.5 Implementation

9. **Feature flag mechanism.** Vercel feature flags? GrowthBook? Per [PLATFORM_V2_STRATEGY.md §20](PLATFORM_V2_STRATEGY.md), feature flag implementation is deferred but architecturally required. **Recommend: deferred decision; pathway feature must be flag-able by launch.**
10. **Reconfirmation timing.** Every 6 months default (this doc). Alternatives: 3 months for sub-state, 12 months for path. **Recommend: 6 months for path, 3 months for sub-state.**

### 25.6 Phase 0 audit reconciliation

11. **How existing /residency routes map into Residency & Fellowship.** Decision A1 in [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md). **Recommend: keep `/residency/*` canonical for v2 launch; surface in Path 2 nav.**
12. **How existing /poster routes map into future institution features.** Per [POSTER_FLOW_AUDIT.md](audits/POSTER_FLOW_AUDIT.md): extend `/poster/*` (decision A2). **Recommend: extend, not replace.**

---

## 26. SEO impact

```
SEO impact:
- URLs changed:        none (architecture doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none (existing /dashboard/* stays noindex per existing layout)
- internal links:      none changed
- risk level:          ZERO — internal pathway architecture doc
```

## 27. /career impact

None. `/career/*` and `/careers/*` preserved unchanged per [RULES.md](../codebase-audit/RULES.md) §2.

## 28. Schema impact

None directly. §17 enumerates future possible fields; each requires explicit authorization per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).

## 29. Authorization impact

None. This doc specifies pathway architecture; implementation requires:

1. PR 0b residency audit (next Phase 0 audit) — unblocks Path 2 finalization.
2. Subsequent schema authorization for `User.pathwayPreference` (when ready for logged-in cross-device sync).
3. Per-launch staging per §23.
4. Each monetization launch (per Practice & Career path) requires its own authorization per [TRUST_AND_MONETIZATION_POLICY.md §13](TRUST_AND_MONETIZATION_POLICY.md).

This doc is the binding architectural reference. Implementation is gated.
