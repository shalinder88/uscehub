# USCEHub Project Status — April 1, 2026

## What USCEHub Is
A three-phase physician career platform at uscehub.com serving International Medical Graduates (IMGs) and all physicians on J-1 waiver or H-1B visas. One site, three phases:
- **Phase 1 (LIVE):** USCE/Training — 207 observership/externship listings, browse/search, community
- **Phase 2 (Behind curtain):** Residency — fellowship guide, boards, survival, salary
- **Phase 3 (Behind curtain):** Career & Immigration — J-1 waiver intelligence, H-1B guide, job board, visa bulletin, contract tools

## Tech Stack
- Next.js 16 (App Router, TypeScript, Turbopack)
- Prisma v6 + PostgreSQL (Supabase — Transaction pooler port 6543)
- Tailwind CSS (dark mode default, Sasanova-inspired design tokens for Phase 2/3)
- Vercel (free Hobby tier — cron limited to 1x/day)
- Cloudflare (DNS/CDN), GitHub (shalinder88/uscehub)
- Domain: uscehub.com (~$10/year total cost)

## Current Scale
- **Phase 1:** 207 USCE listings, 37 states, live at uscehub.com
- **Phase 3:** 437+ physician jobs (30 manually verified + 407 from DOL LCA public data), 1,087 H-1B sponsor database, 50 state waiver pages, 13 specialty job pages, 10 blog posts
- **Total URLs in sitemap:** 500+
- **Site traffic:** ~390 visitors (growing, mostly organic)

## Current Issues

### 1. Vercel Deployment
- Free tier limits cron to 1x/day (was 3x, caused deployment block)
- Fixed: vercel.json cron changed to `0 8 * * *`
- Occasionally need `npx vercel --prod` CLI deploy if GitHub webhook misses

### 2. Phase 2/3 Not Live Yet
- Both have `robots: { index: false, follow: false }` in layout.tsx
- LAUNCH CHECKLIST exists at `/Users/shelly/usmle-platform/LAUNCH-CHECKLIST.md`
- Key launch steps: remove noindex, add to main navbar, update footer, submit sitemap

### 3. Job Data Legal Compliance
- **SAFE sources:** DOL LCA data (public domain), USCIS data hub (public domain), hospital career pages (factual data in our own words)
- **AVOID:** PracticeLink (ToS prohibits republishing/linking), PracticeMatch (same), Indeed (aggressive enforcement)
- **CAUTION:** Sound Physicians, USACS, MDOpts (reach out for partnerships)
- Compliance layer documented in `src/lib/job-source-compliance.ts`

### 4. Data Accuracy
- Triple-verified: immigration data 14/15 confirmed, 1 corrected (Texas flex slots)
- All legal claims audited: VA cap-exempt contradiction fixed, I-612 form references corrected, non-compete phrasing fixed, premium processing fee updated to $2,965
- ABIM pass rate corrected from 86% to 88%

### 5. Design System Split
- Phase 1 uses old slate-based light/dark mode (Inter font, ThemeProvider)
- Phase 2/3 uses Sasanova-inspired dark design tokens (Geist font)
- Need to unify before flipping the switch — or keep separate with phase-specific layouts

## What We Built (Phase 3 — 40+ pages)

### Immigration Intelligence (13 tools)
1. 50 state waiver intelligence with application windows
2. Interactive SVG map (colorblind-safe palette)
3. Conrad 30 slot tracker
4. 6 waiver pathway comparison (Conrad, ARC, HHS, DRA, SCRC, VA)
5. Step-by-step waiver process for all 6 pathways
6. Timeline calculator
7. HPSA score lookup
8. H-1B visa guide (cap-exempt employers, $100K fee, transfers)
9. Visa journey flowchart
10. Green card pathways (EB-2 NIW, EB-1, PERM)
11. Visa bulletin tracker (verified April 2026 DOS data)
12. Policy alert feed (8 alerts)
13. H-4 spouse guide (EAD, mental health, AC21 pathway)

### Career Tools (10 tools)
14. Contract checklist with red flags and liquidated damages data
15. Offer comparison (4-way side-by-side)
16. Salary benchmarks (26 specialties + RVU + state-by-state)
17. Malpractice guide
18. State financial comparison (50 states)
19. State medical licensing guide (IMLC, FCVS, fees)
20. Interview prep
21. Waiver problems guide (transfers, bankruptcy, non-competes in 15 states)
22. ECFMG certification pathway guide
23. Loan repayment guide (NHSC, PSLF, state programs)

### Job Board (core product)
24. Job search UI with filters (specialty, state, visa type, salary)
25. 13 specialty-specific job pages with salary benchmarks
26. 1,087 H-1B sponsor database (DOL LCA public data)
27. Employer job posting page with pricing tiers ($249-999)
28. Legal compliance layer for job sourcing

### Content
29. 10 SEO blog posts
30. Attorney directory (6 verified firms)

## Competitor Landscape

### Nobody does what we do. The gap is massive:

| Feature | USCEHub | PracticeLink | 3RNET | j-1waiver.com | Doximity |
|---------|---------|-------------|-------|---------------|----------|
| J-1 waiver job board | Yes (437+) | Checkbox filter | J-1 filter | Historical DB | No |
| Conrad 30 slot tracker | Yes (50 states) | No | Historical only | No | No |
| Visa bulletin for physicians | Yes | No | No | No | No |
| Waiver-specific contract checklist | Yes | No | No | No | No |
| 6 pathway comparison | Yes | No | No | No | No |
| Salary benchmarks (waiver-specific) | Yes (16 specialties) | No | No | USCIS raw data | General only |
| H-1B sponsor database | Yes (1,087) | No | No | Yes (paid) | No |
| State application windows | Yes (20 states) | No | No | No | No |
| H-4 spouse resources | Yes | No | No | No | No |
| Employer posting | Yes ($249-999) | Enterprise SaaS | Free | No | Enterprise |

### Key competitors:
- **PracticeLink:** 42K jobs, J-1 is afterthought. ToS blocks data reuse.
- **PracticeMatch:** 400K users, minimal J-1 content. ToS blocks data reuse.
- **3RNET:** Only source of historical Conrad 30 data. Nonprofit, basic UX.
- **j-1waiver.com:** Charges for USCIS sponsor data we provide free. Small operation.
- **Doximity:** 3M users, $643M revenue. Zero immigration features. Not competing with us.
- **Sound Physicians:** 116 visa positions. Direct employer, not a platform.
- **Physicians Thrive:** Contract review but zero waiver-specific knowledge.

## Monetization Path (In Order of Realism)

| Timeline | Revenue Source | Est $/Month |
|----------|---------------|-------------|
| Month 1-3 | Employer job postings ($249-999 each) | $500-2,000 |
| Month 3-6 | Immigration attorney sponsored listings ($500-2K/month) | $1,500-6,000 |
| Month 6-12 | Staffing company lead generation ($1K per placed physician) | $3,000-10,000 |
| Month 12+ | Premium tools (timeline tracker, alerts, contract review) | $2,000-5,000 |
| Month 12+ | Affiliates (WES 10%/sale, Lecturio 15%, Kaplan 2.4%) | $500-2,000 |

### Monetization principles:
- Physicians use for FREE (they're the traffic engine)
- Employers, attorneys, and staffing companies PAY
- Revenue from employer side is proven (PracticeLink charges enterprise SaaS)
- Lawyer referral fees are ILLEGAL (ABA Rule 5.4a) — use advertising/sponsorship model instead
- Immigration lawyer advertising: $500-2K/month per firm is realistic

## Path Forward (Priority Order)

### Immediate (Before Launch)
1. **Get jobs ON our site** — not linking out. Currently 437, need 1,000+
2. **Import more DOL LCA data** — FY2024 Q4 and FY2023-2024 historical
3. **Build city intelligence** — Census data (foreign-born %, median rent), nearest airport, hospital profiles
4. **Fix career landing page** — 5 visual cards, not 24 tool links
5. **Remove noindex from Phase 2/3 when ready** — the single biggest SEO unlock

### Short-term (Month 1-3)
6. **Employer outreach** — email GME offices with verification template
7. **GME outreach script** — spreadsheet of 207 listings with personalized emails
8. **Start blog content engine** — 3-4 posts/week targeting long-tail keywords
9. **Apply for affiliate programs** — WES ($16-20/referral), Lecturio (15%), Kaplan (2.4%)
10. **Submit to Google Search Console** — sitemap with 500+ URLs

### Medium-term (Month 3-6)
11. **Build automated job refresh** — 3x daily agent pulls from DOL + employer sites
12. **County-level HPSA map** — download HRSA shapefiles, build interactive drill-down
13. **Employer self-posting portal** — hospitals post directly, we moderate
14. **Attorney directory expansion** — approach 5-10 firms for $500-2K/month listings
15. **Community features** — forums, employer reviews (anonymous + verified)

### Long-term (Month 6-12)
16. **Personalized dashboard** — saved jobs, visa bulletin alerts, timeline tracker
17. **USCIS case status integration** — auto-check for status changes
18. **Contract review tool** — automated red flag detection with MGMA benchmarks
19. **Premium tier** — $19/month for alerts, saved searches, priority support
20. **Mobile app** — push notifications for visa bulletin, slot tracker, policy changes

## Possible Complications

### Technical
- **Vercel free tier limits** — 100 deploys/day, 1 cron/day, 10s function timeout. May need Pro ($30/month) if traffic grows.
- **Supabase free tier** — 500MB database, 2GB bandwidth. Fine for now, may need paid ($25/month) at scale.
- **Large data files** — sponsor-data.ts is 132KB, dol-jobs-data.ts growing. May need to move to database queries instead of static imports.
- **react-simple-maps** requires React 16/17/18 but we're on React 19. The SVG map works but the package isn't officially compatible.

### Legal
- **Job data sourcing** — PracticeLink/PracticeMatch ToS prohibit data reuse. We source from employer sites and DOL public data instead.
- **Immigration advice disclaimer** — everything must say "not legal advice, consult an attorney." Already in terms and per-page disclaimers.
- **$100K H-1B fee** — if enacted permanently, drastically reduces employer H-1B sponsorship. We need to monitor and update content.
- **Conrad 30 authorization lapsed** — program technically expired Sept 30, 2025. H.R. 1585 pending. Physicians who got J-1 after Oct 1, 2025 may not be eligible.

### Business
- **Chicken-and-egg** — need jobs to attract physicians, need physicians to attract employers. DOL data solves the cold start.
- **No revenue yet** — $0 income, ~$10/year cost. Need employer postings or attorney listings to break even.
- **Solo founder** — Singh is a working intensivist. Limited time for sales/marketing. AI content generation helps.
- **Trust takes time** — physicians are skeptical. Every data error costs credibility. Triple-verify everything.

## Key Data Sources (All Free, Public Domain)
- DOL LCA Disclosure: `dol.gov/agencies/eta/foreign-labor/performance` — physician salary + employer data
- USCIS H-1B Data Hub: `uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub` — approval rates
- HRSA HPSA: `data.hrsa.gov/data/download` — shortage area designations
- Census ACS: `api.census.gov` — foreign-born %, median rent, languages
- CMS Hospital Compare: `data.cms.gov/provider-data/topics/hospitals` — hospital star ratings
- NRMP: `nrmp.org/match-data` — match statistics
- DOS Visa Bulletin: `travel.state.gov` — priority date tracking
- 3RNET: `3rnet.org/j1-filled` — historical Conrad 30 slot data

## Files to Know
- `src/lib/waiver-jobs-data.ts` — 30 manually verified jobs + helper functions
- `src/lib/dol-jobs-data.ts` — 407 DOL-sourced job entries
- `src/lib/sponsor-data.ts` — 1,087 H-1B sponsor database
- `src/lib/waiver-data.ts` — 50 state Conrad 30 intelligence
- `src/lib/visa-bulletin-data.ts` — April 2026 visa bulletin
- `src/lib/policy-alerts-data.ts` — 8 immigration policy alerts
- `src/lib/job-source-compliance.ts` — legal compliance registry
- `src/lib/blog-data.ts` — 10 blog posts
- `src/lib/residency-data.ts` — board exam data, teaching resources
- `LAUNCH-CHECKLIST.md` — step-by-step launch guide
- `vercel.json` — cron config (1x/day on free tier)
- `scripts/output/` — raw research data, DOL imports, city profiles

## The One-Line Summary
USCEHub is the only platform that connects verified J-1 waiver jobs + Conrad 30 slot tracking + visa bulletin interpretation + salary benchmarks + contract red flags + H-1B sponsor database in one place. Nobody else does more than one of these. The moat is cross-phase verified data inside one continuous physician workflow.
