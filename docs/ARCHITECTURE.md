# USCEHub — Master Architecture

**Last updated:** May 2026  
**Status:** Active — this is the living single source of truth for product direction.

---

## Platform positioning

> A source-linked U.S. medical pathway platform,  
> with the deepest IMG pathway layer on the internet.

Not: IMG-only observership directory.  
Not: generic med-student portal.  
Not: physician career/insurance lead-gen site.

The "source-linked" qualifier is a hard design principle, not marketing. Every claim on the platform must trace to a verifiable, named source. This is what separates USCEHub from AI content farms and scraping aggregators.

---

## Audience model

**Universal sections** — serve all applicants and trainees:

| Audience | Examples |
|---|---|
| IMG graduates | primary, highest-pain segment |
| US MD students (M3/M4) | away rotations, Sub-Is, VSLO |
| DO students | COMLEX/USMLE, osteopathic programs |
| Caribbean students | affiliation requirements |
| Old-YOG reapplicants | 5+ years out, re-entry strategy |
| SOAP applicants | unfilled positions, scramble |
| Current residents | fellowship, moonlighting, finances |
| New attendings | contracts, salary, licensing |

**IMG Corner** — deep specialized layer for IMGs only. IMGs should feel:  
*"This section was built specifically for me."*

No mirrored "US Student Corner." US-grad context is delivered inline as callout notes, not as a parallel section.

---

## Information architecture

### Current nav (main site)
```
Browse | For Institutions | Community | IMG Corner
```

### Target nav — Phase 3+
```
Browse USCE | IMG Corner | Visa & Jobs | Tools | Resources
```

### Future nav (after Residency/Fellowship data is credible)
```
Browse USCE | IMG Corner | Visa & Jobs | Residency | Fellowship | Tools | Resources
```

**Rule:** Residency and Fellowship do not appear in the primary nav until the program intelligence layer is real — meaning program-level IMG %, visa history, matched profile data. Launching a thin directory against FREIDA's 13,000 programs is damaging, not helpful.

---

## Section map

### Browse USCE (Universal)
Source-linked observerships, electives, clerkships, visiting-student opportunities.  
For all audiences. Programs tagged with audience type (IMG grad, US M4, DO, Caribbean).  
Each program eventually has: IMG %, visa history, VSLO pathway, audition availability, community notes, interview intel.

### IMG Corner (IMG-specific)
The deepest IMG-specific resource on the internet. Sub-hub structure:

```
Start Here          — who this is for, how to use this section
ECFMG               — certification pathways, requirements, timelines
USCE for IMGs       — what counts, how much, how to get it, strategy
Old-YOG Strategy    — 5+ years out, what changes, what still works
Visa Basics         — J-1 vs H-1B, B-1/B-2 observer rules
Match Strategy      — competitiveness, specialty selection, risk calibration
Step Timeline       — Step 1/2/3 sequencing for IMGs specifically
Letters / CV / PS   — IMG-specific framing, what programs actually want
Interview           — how programs think about IMG interviews
J-1 / H-1B After Match — what happens at hire, waiver planning
SOAP / Unmatched    — what to do, how to recover, next cycle
Research            — research as an IMG, what counts, what doesn't
```

### Visa & Jobs (Universal with IMG depth)
Distinct lane. Current URL base: `/career/`.  
Covers all physicians but has heavy IMG-specific depth on immigration tools.

```
Primary:
  J-1 Waiver (hub + 50 state guides + tracker + map + timeline + process)
  Visa & Immigration (H-1B, visa journey, alerts, visa bulletin, greencard, citizenship)
  Jobs (waiver jobs, H-1B sponsors, HPSA lookup, locums)
  Offers & Practice (salary, contract, malpractice, licensing, credentialing, taxes, interview, loan repayment)

Secondary (demoted, not in primary nav):
  Immigration Attorneys
  For Employers
  H-4 Spouse
```

### Tools (Universal)
```
Program Finder (recommend quiz)
Compare Programs
Cost Calculator
Offer Comparison Tool        ← already built
Application Tracker          ← Phase 6
Competitiveness Tool         ← Phase 6
```

### Resources (Universal)
```
Blog
Methodology
How It Works
About
```

### Residency / Fellowship (Deferred)
Exist at `/residency/*` but are NOT in main nav yet.  
Content (boards, salary, finances, moonlighting, survival, fellowship guide) is accessible via direct link and from IMG Corner.  
Do NOT promote to main nav until program-level data is credible.

---

## What stays permanently noindex

```
/admin/*
/dashboard/*
/poster/*
/auth/*
/usce/verified-preview/*
/community/*              — until active and moderated
/residency/community      — same
/career/community         — same
/clerkships/maine         — pilot, not ready
/clerkships/pilot         — pilot, not ready
/career/attorneys         — secondary, monetization, needs disclosure audit
/career/employers         — employer portal
/career/employers/post    — employer portal
/career/state-compare     — redirect page only
/career/sponsors          — thin, employer data
```

---

## Phase plan

### Phase 1 — Foundation (Weeks 1–2)
- [x] Analytics instrumentation (prerequisite — measure before indexing)
- [x] Noindex readiness matrix (`docs/NOINDEX_MATRIX.md`)
- [ ] Nav restructure: swap "For Institutions" + "Community" → "Visa & Jobs" + "IMG Corner" as primary
- [ ] Stabilize USCE listing accuracy

### Phase 2 — Visa & Jobs cleanup + Wave 1 indexing (Weeks 2–4)
- [ ] Remove layout-level `index: false` from `/career/layout.tsx`
- [ ] Add page-level `robots: { index: false }` to hold pages (attorneys, employers, sponsors, state-compare)
- [ ] Submit `/career/*` wave 1 pages to sitemap
- [ ] Community structured review intake (5 fields on program listing pages)

### Phase 3 — Homepage + nav rewrite (Weeks 3–5)
- [ ] Homepage hero: three-path orientation (Browse USCE / IMG Corner / Visa & Jobs)
- [ ] Update main nav to target architecture
- [ ] Old-YOG anchor in IMG Corner Start Here

### Phase 4 — Residency Wave 2 indexing (Weeks 5–8)
- [ ] Remove layout-level `index: false` from `/residency/layout.tsx`
- [ ] Add page-level noindex to `/residency/community`
- [ ] Submit residency pages to sitemap
- [ ] Link residency content from IMG Corner (boards, fellowship guide, survival, finances)

### Phase 5 — IMG Corner deep rebuild (Months 2–3)
- [ ] Sub-hub navigation tree within IMG Corner
- [ ] Old-YOG strategy page (premium anchor)
- [ ] ECFMG hub rebuild
- [ ] Step timeline for IMGs
- [ ] Match strategy + competitiveness guide

### Phase 6 — Data moat (Months 3–6)
- [ ] Scale USCE directory: 304 → 2,000+ (cron-extractor)
- [ ] Program-level intelligence fields (IMG %, visa history, matched profile)
- [ ] Application tracker (account feature)
- [ ] Competitiveness tool ("Am I competitive for X specialty?")
- [ ] Structured community review system (interview intel, program experience, visa signal)

### Phase 7 — Monetization (After traffic)
- [ ] Flat attorney sponsorship (with disclosure system + verified-above-paid rule)
- [ ] Employer job posts
- [ ] Insurance affiliate
- [ ] Recruiter lead-gen

**Rule:** No monetization before traffic exists, FTC disclosures are built, and click tracking is instrumented.

---

## What does not change

The 50+ career and residency content pages already built are structurally correct. The architecture change is **navigational and brand framing**, not content restructuring. Do not refactor working pages.

---

## Hard rules

1. No "US Student Corner" — US-grad context is inline callouts, not a section
2. No Residency/Fellowship in main nav until program data is credible
3. No hard gate, no root redirect, no separate domain
4. No global noindex flip — staged waves with per-page decisions
5. No monetization before traffic + disclosure system
6. No premature Residency directory competing with FREIDA at low scale
7. Analytics must be instrumented before Wave 1 indexing
8. "Source-linked" is a hard design principle on every page that gets indexed
