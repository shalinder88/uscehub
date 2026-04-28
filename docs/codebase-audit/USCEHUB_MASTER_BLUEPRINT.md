# USCEHub Master Blueprint

**Status:** strategic source of truth for product direction.
**Authority:** lower than [RULES.md](RULES.md). Where this doc and RULES.md disagree, RULES.md wins. RULES.md governs preservation, deletion, git safety, and the `/career` hard protection list. This doc governs WHAT we eventually build, in what order, and for whom — not whether we are allowed to delete things.
**Implementation rule:** documenting a phase here is **not** authorization to implement it. Implementation only happens when the relevant phase becomes the active phase per §13. Phase 0 is the active phase today.

---

## 1. Core decision

USCEHub is the free physician training pathway platform.

It serves medical trainees and physicians whose journey runs through:
- U.S. clinical experience
- residency match
- fellowship match
- visa decisions
- J1/H1B career transition
- waiver jobs
- attending career transition

Content depth should correlate with audience need. The deepest content investments are in the most opaque, expensive, and underserved parts of the pathway. Today, those pain points concentrate heavily around:
- non-U.S. IMGs
- U.S. IMGs
- USCE discovery
- residency match strategy
- fellowship match strategy
- J1/H1B decisions
- Conrad 30 / J1 waiver jobs
- physician immigration / legal navigation
- attending transition

This is not deceptive positioning. USCEHub is not "secretly IMG." It is a physician training infrastructure platform that builds deepest where the gaps are widest.

---

## 2. Audience hierarchy

### Primary
- non-U.S. IMGs
- U.S. IMGs
- Caribbean IMGs
- old-YOG IMGs
- reapplicants
- visa-requiring applicants

### Co-primary long-term
- IMG residents
- IMG fellows
- visa-sponsored physicians
- residents / fellows approaching J1 / H1B / waiver / attending decisions

### Secondary
- U.S. MD / DO students and residents — only where their needs overlap with match prep, fellowship prep, away rotations, SOAP, rank list strategy, interview prep, and career transition

### Institutional / marketplace side
- hospitals
- residency / fellowship programs
- observership hosts
- private practices accepting observers
- GME offices
- immigration attorneys
- physician recruiters
- contract review services
- physician financial services (later)

### Explicit rules
- **Do not** build a separate USAMG website.
- **Do not** split domains.
- **Do not** dilute USCEHub into a generic med-student blog.
- **Do** include U.S. MD / DO users where the tools overlap.

---

## 3. Public positioning

Canonical public positioning:

> "USCEHub is a free physician training and career pathway platform for U.S. clinical experience, residency, fellowship, visa navigation, and attending transition."

Avoid broad public framing like:
- "biggest IMG site"
- "IMG-only platform"
- "IMG advantage site"
- "IMG jobs site"
- "helping IMGs take rural jobs"
- "J1 waiver jobs for IMGs" as the homepage identity

But **do not hide IMG value where it belongs.**

IMG-specific pages can be direct:
- verified USCE for IMGs
- IMG-friendly residency strategy
- J1 vs H1B for IMGs
- Conrad 30 / J1 waiver guidance
- visa-sponsored physician career pathway

---

## 4. Channel-specific positioning

| Channel | Framing |
|---|---|
| Homepage | Free physician training and career pathway platform: USCE, residency, fellowship, visa, attending career |
| `/img-resources` | Direct IMG-specific framing |
| `/visa-and-career` or Career Path | Direct visa / IMG content, but professional and factual |
| WhatsApp / Telegram IMG groups | Lead with IMG value: verified USCE, match, visa / career resources |
| Facebook IMG groups | Lead with IMG value and free database |
| r/IMG and r/USMLE | IMG-specific value, no apology |
| r/Residency, r/medicine, r/medicalschool | Trainee infrastructure framing; ask for data accuracy feedback |
| X / personal account | Tactical, factual, no IMG-vs-AMG debate |
| Institution outreach | "Reach medical trainees and IMG / U.S.-trained applicants seeking USCE, residency, fellowship, and career pathway resources" |
| Attorney / recruiter outreach | "Reach visa-sponsored physicians and trainees approaching J1 / H1B / waiver / attending decisions" |
| Press / business / acquirer framing | Free physician training pathway infrastructure with data moat |

**Operational rule.** Channel-specific positioning is not deception. Each audience receives the part of the value proposition relevant to them.

---

## 5. Anti-IMG backlash policy

There is anti-IMG resentment in some public U.S. trainee / physician spaces, especially around residency competition, rural labor markets, visa sponsorship, and job competition. This is a tactical messaging risk, not a reason to shrink the product.

Rules:
- **Do not** post "biggest IMG site" framing in broad Reddit or physician spaces.
- **Do not** engage in IMG-vs-AMG debates on X, Reddit, or comments.
- **Do not** argue politics or labor-market resentment.
- **Do not** make the brand defensive.
- Stay factual, source-linked, and infrastructure-focused.
- In IMG-specific communities, lead clearly with IMG value.
- In broad communities, ask for data accuracy feedback and frame as free training / career infrastructure.

Public Reddit-safe example post:

> "I'm building a free database of clinical training and physician career resources. It includes USCE opportunities, residency / fellowship resources, visa / career guides, and verified source links. Looking for feedback on missing programs or inaccurate data."

---

## 6. Comment / community moderation policy

Even though the community layer is not built now, the policy is documented here so it exists before the layer ships.

Before any user comments / community feature ships:
- require accounts for comments
- allow factual correction of program data
- allow disagreements about sources, deadlines, eligibility, and program details
- remove identity-based attacks against IMGs, U.S. AMGs, DOs, Caribbean graduates, visa-sponsored physicians, or any national group
- remove flamewars about "IMGs taking spots / jobs"
- remove personal attacks
- preserve screenshots / audit trail for removed comments where appropriate
- prioritize institutional credibility over unmoderated engagement

**Rule.** Community is **not** Phase 0 or Phase 1. It is deferred. Moderation policy must exist *before* any community feature ships.

---

## 7. Product architecture

Replace five-lane thinking with **four** top-level lanes:

`USCE | Match Prep | Career Path | Tools`

### USCE
- observerships
- externships
- electives
- research positions
- free / paid USCE
- state / specialty filters
- source links
- verified listings
- host / institution profiles

### Match Prep
- residency match prep
- fellowship match prep
- IMG-friendly residency strategy
- U.S. IMG strategy
- non-U.S. IMG strategy
- Caribbean IMG strategy
- old-YOG strategy
- low-score strategy
- reapplicant strategy
- SOAP
- rank list
- interviews
- signaling
- fellowship strategy by subspecialty

### Career Path
- J1 vs H1B
- Conrad 30
- J1 waiver jobs
- H1B-friendly physician jobs
- state-by-state waiver guides
- physician immigration attorneys
- recruiters
- contract review
- attending transition
- locums / moonlighting
- later financial / insurance content

### Tools
- saved programs
- compare programs
- cost calculator
- timeline generator
- deadline tracker
- visa decision helper
- fellowship competitiveness helper
- email-gated PDF exports later

### Footer
- Resources
- Blog
- Methodology
- For Institutions
- About
- Contact
- Report an Update

> **Important.** Do **not** implement this nav during Phase 0. This is future architecture. Cleanup PR1 still comes first.

---

## 8. Fellowship strategy

Fellowship belongs inside USCEHub.

### Reason
It extends the lifecycle:

```
USCE applicant → residency applicant → resident → fellowship applicant → fellow → visa / job transition → attending
```

Fellowship-stage users are closer to monetization than USCE users because they are nearer to:
- J1 waiver decisions
- H1B decisions
- immigration attorneys
- recruiter relationships
- contract review
- disability insurance
- physician mortgage
- locums
- attending transition

Fellowship content should not be IMG-only. It should serve all residents / fellowship applicants, while including IMG / visa-specific guidance where relevant.

**Fellowship lives under Match Prep**, not as a separate top-level lane.

### Suggested future URL structure
- `/match-prep/fellowship`
- `/match-prep/fellowship/internal-medicine`
- `/match-prep/fellowship/cardiology`
- `/match-prep/fellowship/gastroenterology`
- `/match-prep/fellowship/hematology-oncology`
- `/match-prep/fellowship/pulmonary-critical-care`
- `/match-prep/fellowship/rheumatology`
- `/match-prep/fellowship/endocrinology`
- `/match-prep/fellowship/nephrology`
- `/match-prep/fellowship/infectious-disease`
- `/match-prep/fellowship/geriatrics`
- `/match-prep/fellowship/pediatrics`
- `/match-prep/fellowship/neonatology`
- `/match-prep/fellowship/pediatric-cardiology`
- `/match-prep/fellowship/pediatric-critical-care`
- `/match-prep/fellowship/pediatric-gastroenterology`
- `/match-prep/fellowship/sleep-medicine`
- `/match-prep/fellowship/hospice-palliative`
- `/match-prep/fellowship/addiction-medicine`

### Build order (when the time comes)
1. fellowship landing page
2. internal medicine fellowship overview
3. cardiology
4. gastroenterology
5. hematology / oncology
6. pulmonary / critical care
7. rheumatology / endocrinology / nephrology / infectious disease
8. pediatrics subspecialties
9. multidisciplinary fellowships later

> **Do not build these in Phase 0 or Phase 1.** Fellowship build is inserted into the SEO phase, approximately Months 4–8, after cleanup / trust / conversion foundations are stable.

---

## 9. Fellowship data sourcing standard

Before launching fellowship pages, a sourcing standard must be in place.

### Rules
- Use NRMP Medicine and Pediatric Specialties Match reports for aggregate match data.
- Use NRMP Charting Outcomes / official reports for applicant / outcome analysis where available.
- Use AAMC / ERAS public materials for application process and program participation.
- Use FREIDA, ACGME, ABIM / ABMS boards, and individual program websites for program-level structure.
- Use individual fellowship program pages for visa sponsorship, eligibility, requirements, deadlines, and coordinator details.
- **Do not** copy NRMP tables verbatim.
- **Do not** reproduce copyrighted datasets at scale without permission.
- **Cite and link** official sources.
- **Paraphrase and analyze** instead of copying.
- For visa sponsorship patterns, build first-party data through program surveys, user reports, and verified source checks.
- Show "last verified" and source links for any program-level claim.

### Future doc
A dedicated `docs/sourcing/FELLOWSHIP_SOURCING_STANDARD.md` will be written when fellowship work begins. It is intentionally **not created now** — it would be a planning artifact for work outside the active phase.

---

## 10. Fellowship monetization timing

Fellowship monetization should be **built into page design from day 1 of fellowship page launch**, but **not activated in Phase 0**.

When fellowship pages launch, include placeholders / architecture for:
- attorney sponsorship slots
- recruiter directory placement
- contract review affiliate slots
- board prep / service affiliate slots
- attending transition CTA
- J1 / H1B guide CTAs

### Reason
Fellowship-stage users are closer to purchase decisions than USCE users. Their time-to-monetization is shorter.

But the pages must **not look paywalled or sales-heavy**. Core content remains free.

---

## 11. Competitor positioning

### Categories

**1. Paid USCE marketplaces** (e.g. AMOpportunities)
- Strength: supply relationships and paid clinical rotations
- Weakness: not neutral / free, not full lifecycle

**2. Residency list / filtering tools** (e.g. Match A Resident)
- Strength: IMG-friendly residency program targeting
- Weakness: not USCE-first, not full visa / career lifecycle

**3. Broad residency / fellowship databases** (e.g. FREIDA, official sources)
- Strength: broad official program database
- Weakness: not workflow-specific, not IMG / visa pathway-specific, not USCE / source-verification marketplace

**4. IMG blogs / coaches**
- Strength: audience / trust in communities
- Weakness: unstructured, fragmented, less verified, not durable data moat

**5. Recruiter / attorney websites**
- Strength: deep domain expertise for jobs / immigration
- Weakness: narrow business interest, not trainee lifecycle platform

### USCEHub advantage
- free core
- verified USCE listings
- source / last-verified data
- IMG depth
- U.S. IMG inclusion
- fellowship + career pathway expansion
- visa / career transition data
- first-party corrections
- match outcome reporting
- institution-verified profiles
- long-term email / audience relationship

---

## 12. Revenue model — 20-year view

The first 1–2 years may earn little or nothing. **That is acceptable.**

### Primary asset goals
- clean, trusted site
- best free USCE database
- best IMG pathway resource
- fellowship resource layer
- visa / career pathway resource
- SEO compounding
- email list
- first-party data
- institution relationships
- attorney / recruiter relationships
- data moat

### Long-term monetization
- featured institution listings
- attorney sponsorships
- recruiter directory placement
- contract review affiliates
- board prep affiliates
- USMLE / ERAS / resource affiliates
- premium newsletter (later)
- digital products (later)
- disability insurance (later)
- physician mortgage (later)
- life insurance (later)
- locums / moonlighting (later)
- physician financial / legal marketplace (later)

**Rule.** Do **not** chase home / auto insurance or generic low-fit affiliate pages. Monetization must match the user lifecycle.

---

## 13. Execution order

Lock execution order. Each phase only begins when the previous is complete.

### Phase 0 — current
- codebase audit
- preservation rules
- protect `/career`
- preserve jobs / careers WIP
- cleanup PR1
- **no new features**
- **no fellowship build**
- **no nav redesign**

### Phase 1
- trust and integrity
- count consistency
- controlled-live disclaimer
- source links
- "last verified"
- safer CTA labels
- report broken link
- methodology strengthening

### Phase 2
- UI rebuild on clean components
- clean listing cards
- clean detail pages
- better browse / search
- mobile polish
- professional, trusted design
- no clutter

### Phase 3
**Phase 3 begins with the data quality and verification engine. Conversion architecture follows once verification fields, admin review, and analytics primitives exist.** See [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) for the execution-ready 6-PR sequence (analytics → schema → cron → admin queue → real verification UI → conversion hooks).

Conversion architecture (deferred, not abandoned, ships as PR 3.6 onward):
- lead magnets
- saved programs
- compare programs
- email capture
- analytics events
- **no hard-gating**

### Phase 4
- institution outreach
- free / featured / premium tiers
- observership host recruitment
- attorney / recruiter relationship building
- **keep database free**

### Phase 5
- SEO engine
- programmatic USCE pages
- state / specialty pages
- visa / career pages
- **insert fellowship pages here, Months 4–8**

### Phase 6
- distribution
- SEO
- WhatsApp / Telegram IMG groups
- Facebook IMG groups
- Reddit with channel-specific framing
- YouTube
- X
- partnerships
- **paid ads only after tracking / conversion baseline**

### Phase 7
- Career Path build-out
- J1 / H1B guides
- waiver jobs
- recruiter directory
- attorney directory
- contract / attending transition
- **preserve existing /career work throughout**

### Phase 8
- monetization layering
- fellowship-stage monetization from page launch
- attorney / recruiter / contract review first
- physician financial products later

### Phase 9
- data moat
- first-party corrections
- match outcome reports
- fellowship outcome reports
- institution verification
- job / visa pathway data

### Phase 10
- 20-year compounding
- **do not abandon because the first 1–2 years are low revenue**
- build the trusted infrastructure layer

---

## 14. What not to do

Explicitly documented:

- Do not disable the whole domain.
- Do not hard-gate listings or articles.
- Do not delete `/career`.
- Do not split to another domain.
- Do not build a separate USAMG site.
- Do not over-genericize away from IMG value.
- Do not market as "biggest IMG site" in broad channels.
- Do not engage in IMG-vs-AMG debates.
- Do not start fellowship build during Phase 0 or Phase 1.
- Do not copy official datasets verbatim.
- Do not chase random affiliate topics.
- Do not let any agent randomly refactor or delete protected work.
- Do not implement the four-lane nav redesign before cleanup and trust components are stable.

---

## Cross-references

- [RULES.md](RULES.md) — preservation rules, hard protection list, git safety. **Higher authority than this document.**
- [CLEANUP_PLAN.md](CLEANUP_PLAN.md) — staged PR sequence for Phase 0.
- [TECH_DEBT_REGISTER.md](TECH_DEBT_REGISTER.md) — current debt with severity ranking.
- [CODEBASE_AUDIT.md](CODEBASE_AUDIT.md) — stack, scripts, baseline results.
- [DATA_FLOW_MAP.md](DATA_FLOW_MAP.md) — where listings, jobs, counts, and CTAs live today.
- [ROUTE_MAP.md](ROUTE_MAP.md) — full route inventory.
