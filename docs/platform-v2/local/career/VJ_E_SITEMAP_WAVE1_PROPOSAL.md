# VJ-E Sitemap Wave 1 Proposal — /career/*

**Date:** May 2026  
**Status:** PROPOSAL ONLY — sitemap not yet edited  
**Prerequisite:** VJ_E_INDEXABILITY_AUDIT.md must be reviewed and approved  
**Gate:** Analytics instrumentation confirmed + owner "go" before adding these URLs

---

## URLs proposed for sitemap (Wave 1)

33 career routes. Organized by section.

### Hub

```
https://uscehub.com/career
```

### Visa & Immigration

```
https://uscehub.com/career/visa
https://uscehub.com/career/visa-journey
https://uscehub.com/career/visa-bulletin
https://uscehub.com/career/alerts
https://uscehub.com/career/h1b
https://uscehub.com/career/h4-spouse
https://uscehub.com/career/greencard
https://uscehub.com/career/citizenship
```

### J-1 Waiver

```
https://uscehub.com/career/waiver
https://uscehub.com/career/waiver/pathways
https://uscehub.com/career/waiver/process
https://uscehub.com/career/waiver/timeline
https://uscehub.com/career/waiver/tracker
https://uscehub.com/career/waiver/map
https://uscehub.com/career/waiver/hpsa-lookup
https://uscehub.com/career/waiver-problems
```

Note on `/career/waiver/[state]`: 50 state pages exist at `/career/waiver/[state-slug]`. These are already individually sourced with generateMetadata and per-state canonicals. Recommend adding all 50 to sitemap in the same wave. Slugs are generated from `getAllWaiverStateSlugs()` in `src/lib/waiver-data.ts`.

### Jobs

```
https://uscehub.com/career/jobs
```

Note on `/career/jobs/[specialty]`: specialty pages are dynamically generated. Add slugs to sitemap alongside the hub. Slugs are keys of `SPECIALTY_JOBS` in `src/app/career/jobs/[specialty]/page.tsx`. Current known slugs: pulmonary-critical-care, critical-care (and others in the data file — full list needs extraction before sitemap entry).

### Offers & Practice

```
https://uscehub.com/career/practice
https://uscehub.com/career/salary
https://uscehub.com/career/offers
https://uscehub.com/career/contract
https://uscehub.com/career/malpractice
https://uscehub.com/career/licensing
https://uscehub.com/career/credentialing
https://uscehub.com/career/interview
https://uscehub.com/career/taxes
https://uscehub.com/career/loan-repayment
https://uscehub.com/career/locums
https://uscehub.com/career/compare-states
https://uscehub.com/career/ecfmg
```

---

## URLs NOT in sitemap (HOLD)

```
https://uscehub.com/career/community       — community not active
https://uscehub.com/career/attorneys       — monetization, disclosure audit pending
https://uscehub.com/career/employers       — employer portal
https://uscehub.com/career/employers/post  — form page
https://uscehub.com/career/sponsors        — thin employer data
https://uscehub.com/career/state-compare   — redirect only
```

---

## Implementation note

Next.js sitemap can be configured in `src/app/sitemap.ts` or `src/app/sitemap.xml/route.ts`. Current sitemap implementation location needs to be identified before editing.

Add Wave 1 URLs with:
- `lastModified`: current date at time of submission
- `changeFrequency`: "monthly" for static pages, "weekly" for tracker/bulletin/alerts
- `priority`: 0.8 for hubs, 0.7 for content pages, 0.6 for tools/calculators

Do NOT edit sitemap until owner confirms:
- [ ] Analytics instrumented
- [ ] Wave 1 audit reviewed and approved
- [ ] Canonicals added to sub-layout pages (recommended)
- [ ] "go" explicitly given
