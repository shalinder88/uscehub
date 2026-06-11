# Promise Audit — Verdict (supersedes the inflated claims)

Date: 2026-06-10. Trigger: operator challenge ("seems overconfident") + operator's first-hand account as
a J-1 physician job seeker. The fan-out audit workflow died mid-run (session restart); this verdict is
built from (a) the operator's lived experience — treated as primary evidence, (b) findings verified by
actually running the engine, (c) targeted checks done directly this session.

## Operator's lived experience (primary evidence, 2026-06-10)

- 3RNET exists but had few useful jobs; the same jobs were visible elsewhere. (Corrects the "885 pages"
  excitement — page count ≠ unique, useful, current physician inventory.)
- One dedicated niche site existed (j1waiverpositions.com / "j1waiverjobs") — **now a dead/parked domain**
  (verified this session: 302 → ww1.* parking, connection refused).
- PracticeLink/PracticeMatch HAD jobs but the visa information was often **incorrect or confusing**.
  DocCafe "horrible — all J-1s know it."
- The market still runs on **word of mouth**.
- **The hire that actually happened:** a recruiter called; the hospital's job was NOT on the big sites —
  but the hospital DID post the job on its own website and DID carry an H-1B notice in its ads.

That last point is the single most important data point in the project: the real job was findable
employer-direct, with a visa signal, and invisible on the boards. It validates the architecture and
kills the "be a bigger board" framing.

## Scorecard on the six claims

| # | Claim as made | Verdict | Corrected, defensible version |
|---|---|---|---|
| C1 | "We can hold MORE J-1/H-1B physician jobs than PracticeLink/PracticeMatch" | **WRONG as stated** | They have inventory; their **visa truth** is wrong/confusing (operator-confirmed). We win on *correct, evidence-cited visa truth*, not listing count. Indeed shows ~226 "J1 waiver physician" results; ZipRecruiter ~89 — the visa-tagged universe is small everywhere. |
| C2 | "Rural/community/FQHC post physicians on their own ATS; scales to thousands" | **PARTLY SOLID / size overconfident** | Verified for LARGE systems (Sanford ~457 physician-family reqs, Ochsner ~409, AltaMed 27). The long tail of small Conrad-30 employers hires via recruiters and often has no reachable ATS. Realistic employer-direct openings inventory: **hundreds to low-thousands**, not "tens of thousands." |
| C3 | "That segment IS the J-1 sweet spot, so we reach the right jobs" | **MIXED** | Large rural/community systems: yes. The classic small-practice Conrad-30 segment: largely recruiter-hidden — reachable as **employers** (DOL history, LCA notices), not as posted jobs. |
| C4 | "SPONSOR_LEAD (DOL history) is a useful honest signal" | **SOLID with mandatory caveat** | UAMS (a real DOL sponsor) posts "Sponsorship Available: No" on faculty reqs — employer-level history ≠ role-level promise. Always render the caveat. Upgrade path: **public LCA-notice pages** give role/department-level, dated, employer-hosted sponsorship activity. |
| C5 | "We can OWN this niche more completely than incumbents" | **OVERCONFIDENT → achievable only as the TRUTH layer** | The niche is genuinely underserved (word of mouth, dead niche sites, wrong board data). Ownable as "the place that tells you WHO actually sponsors, with evidence" — not as "the most listings." |
| C6 | "81 VA eligibility signals are useful inventory" | **WEAK** | Statutory boilerplate on ~every VA 0602 posting. Context/eligibility tier only; never a headline number. |

## The new, verified signal: public LCA-notice pages

20 CFR 655.734 requires posting notice of every LCA filing; electronic posting on the employer's own
website is an allowed route, and major sponsors run PUBLIC pages (verified live this session: KU Medical
Center "LCA Postings" — physician rows dated 04/15/2026; Penn ISSS LCA notifications; UMich "DOL Notice
of Filing"; Vanderbilt HR LCA page). Properties:

- **Legally mandated** → structural, not voluntary, coverage of every H-1B filing.
- **Employer-hosted** → fully inside the no-scraping constraint.
- **Fresh** → posted at/within 30 days of filing (vs quarterly+lag DOL disclosure).
- **Role-level** → job title, wage, worksite — answers "WHICH roles/departments sponsor here."

Honest caveats: notices are usually for an already-identified beneficiary (sponsorship ACTIVITY, not an
open vacancy); required visibility window is only ~10 business days (pages are snapshots, not archives);
electronic posting is optional (physical posting also complies), so coverage across employers is partial.

## The corrected product thesis (one sentence)

**Answer the IMG's actual question — "who will actually sponsor me, near where, in my specialty, with
proof" — by fusing DOL sponsor history + live LCA-notice activity + employer-direct openings at proven
sponsors, every claim evidence-cited; jobs listings are a feature, the sponsor-truth layer is the product.**

## What survives as next builds

1. **LCA-notice radar** (new lane): registry of public LCA/H-1B-notice pages at top physician sponsors;
   poll; extract physician rows (title/wage/worksite/date) → freshest role-level sponsor activity.
2. **Scale employer-direct monitoring** across the large rural/community sponsor class (Sanford/Ochsner
   tier) using the facet-based connector.
3. **Sponsor-truth surface**: per-employer page — DOL history + recent LCA notices + current physician
   openings + the honest caveats. This is the word-of-mouth killer.
4. Drop "more jobs than the boards" from all copy; the scoreboard is verified sponsor-truth coverage.
