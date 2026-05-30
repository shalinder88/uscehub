# VJ — Search-Discovery + Verification Engine: R2 Spec

Status: SPEC ONLY (no connector code until a search-API key is provisioned and
the build is explicitly approved)
Date: 2026-05-30
Author context: written after the bounded Workday connector (commit
`VJ: add bounded Workday connector`) proved ATS mechanics but produced a clean
**negative-yield** result — Sanford + AltaMed returned 33 physician postings,
all `NO_VISA_MENTION`. Greenhouse (Phase 1b/1c) was the same. The lesson drives
this spec.

## 0. Thesis

The engine is good at **not lying**. It has not yet **found the jobs**. That is
acceptable: Phase 1 was engine validation, not inventory production. But it
means the next gain is **not "more ATS tenants."** Employer ATS free-text rarely
contains explicit visa language; even when a structured `Visas Accepted` field
exists, the honest value is often `N/A`.

Visa language lives where shortage-area employers *advertise* J-1/H-1B intent.
You reach that by **searching for the language and then verifying it at the
source** — not by crawling any one board. R2 adds a **Search-Discovery +
Verification** layer on top of the existing deterministic engine.

The hard risk: search-discovery can **destroy specificity** if mishandled — a
snippet looks like evidence, search returns aggregator URLs, query templates
over-match. Every design choice below exists to preserve the high-specificity
publish bar. This is why it is spec'd before it is coded.

## 1. Core principles (binding)

1. **Search as lead only.** A search API returns *candidate URLs*, nothing more.
   A search result is never a job, never evidence, never publishable.
2. **Source page as the only evidence.** We fetch the actual employer/government
   page and run it through the existing deterministic engine
   (`clean` → `extractPhraseHits` → `classify`). Only the fetched source can
   produce a phrase hit.
3. **No publish from snippets.** Search snippets, meta descriptions, and
   aggregator previews are discarded after they yield a URL. They never reach
   `classify` and never appear as a quote.
4. **Quote-offset validator is the publish gate.** Unchanged: every published
   claim's evidence quote must verbatim-match a char-offset slice of the fetched
   source text (`validateQuote`). A snippet that cannot be re-found in the
   fetched source fails the gate.
5. **Official / employer source resolution.** A candidate URL is only fetched if
   it resolves to an allowed source class (§3). Provenance is established before
   fetch, not after.
6. **Employer-hosted board resolver, not board scraping.** We reach the supply
   that *flows through* PracticeLink/PracticeMatch by resolving the employer's
   **own** careers surface — never by crawling the aggregator (§4).
7. **No autonomous agents. No regex in the intelligence layer.** Same doctrine
   as Phase 1. Deterministic code owns I/O and the publish gate.

## 2. Pipeline

```
query templates ──▶ search API ──▶ candidate URLs (LEADS, not evidence)
                                        │
                            source-allow policy (§3)  ── deny ▶ Tier-3 refusal log
                                        │ allow
                                        ▼
                        source-fetcher (robots/ToS-respecting)
                                        │
                          existing engine: clean → extractPhraseHits → classify
                                        │
                          quote-offset validator (verbatim re-find at source)
                                        │
                    PUBLISH / HOLD_REVIEW / VISA_SIGNAL_ONLY / REJECT  (run dir only)
```

Nothing in this pipeline changes the engine's statuses, reject reasons, or the
`--promote` safety. The new surface is purely *upstream* (lead generation +
source resolution) and the *fetch* step; everything downstream is reused.

## 3. Source allow / deny policy (the specificity guard)

**ALLOW (fetch + classify):**
- Employer-owned domains (the hiring system's primary domain).
- Employer-owned ATS tenants that resolve to the employer's brand and are linked
  from that employer's primary-domain "Careers" page (Workday/Greenhouse/Lever/
  SmartRecruiters/Ashby tenants — Tier-1 provenance, `needsVerification:true`).
- Government: USAJobs, `.gov` workforce / state rural-recruitment pages, state
  Conrad-30 program pages.

**DENY (never fetch, never crawl, never publish — Tier-3 refusals):**
- PracticeLink, PracticeMatch, DocCafe, HealtheCareers, CompHealth, Doximity,
  MDsearch and other physician aggregators.
- Indeed, LinkedIn, Glassdoor, ZipRecruiter, Monster, CareerBuilder, Google Jobs.
- These remain explicit refusals in the registry, same as today.

**Special case — 3RNET:** nonprofit, mission-aligned rural board, but still an
aggregation surface. Prefer following its **outbound employer-direct links** to
the hiring employer's own ATS. Review its ToS before any programmatic access.
Manual benchmark only for now (§5).

A candidate URL whose host is on the deny list is logged as `SOURCE_NOT_ALLOWED`
and dropped *before* any fetch. The deny check is host-based and runs first.

## 4. Employer-hosted board resolver

Many hospitals embed a PracticeLink/PracticeMatch **widget** on their *own*
careers page ("Powered by PracticeLink"), or run their own Workday/Greenhouse
tenant. The resolver reaches that supply legitimately:

```
employer name / domain
   ▶ find the employer's primary-domain "Careers" page
   ▶ detect: (a) an embedded job widget, or (b) an employer-owned ATS tenant
   ▶ resolve to the employer-direct posting URL
   ▶ fetch employer-direct (ALLOW class), classify, quote-gate
```

The distinction is the whole point: **an employer-hosted widget on the
employer's domain is employer-direct (OK); the aggregator's own board is never
fetched.** We never capture the aggregator's index, search results, or board
pages — only the employer surface they syndicate from.

## 5. Manual PracticeLink / PracticeMatch benchmark (measurement, not ingestion)

To size the opportunity — "how much physician/visa supply flowing through these
boards is reachable employer-direct?" — do a **manual, human-eyes** benchmark:
sample N postings by hand, record for each whether it resolves to an
employer-hosted widget or an employer ATS we can legitimately reach.

- **No automated capture.** PracticeMatch's terms prohibit data-capturing
  methods including data mining and screen scraping. This benchmark is a human
  reading a handful of pages and tallying reachability — not a crawler.
- Output: a coverage estimate + a short list of confirmed employer-direct
  surfaces to add to the registry (each verified by hand).

## 6. Query templates (leads only; illustrative)

Templates target visa-dense language and bias toward allowed source classes.
They produce **candidate URLs**; the fetched source is the evidence.

```
"J-1 visa waiver" physician {specialty} {state}
"H-1B sponsorship" hospitalist {state}
"Conrad 30" physician opening {state}
("J-1" OR "H-1B") sponsorship physician site:{employerDomain}
{employer} careers physician visa
"international medical graduates" welcome physician {specialty}
```

Guards: templates require a physician term + a visa term; results are still
title-gated (`isPhysician`) and polarity-checked after fetch, so an over-broad
template costs a wasted fetch, never a false publish.

## 7. Blocking decision — search-API key

Search-discovery needs a sanctioned search API. Operator must pick and provision
one (env-var gated, exactly like `USAJOBS_API_KEY`):

| Option | Model | Notes |
|---|---|---|
| Google Programmable Search (CSE) | ~100 queries/day free, then paid | Scoped engines; clean JSON; `site:` support. |
| Bing Web Search API (Azure) | Paid | Broad coverage; Azure key. |
| SerpAPI | Paid wrapper | Easiest integration; cost per query. |

Until a key is provisioned, this layer is **spec-only**. No search calls, no
fetcher, no code.

## 8. Build order (when approved + keyed)

- **Phase A — this spec.** Architecture + policy + templates + key decision. No code.
- **Phase B — operator.** Pick + provision the search-API key (env var). Decide
  query budget.
- **Phase C — build (gated).** search adapter (URLs only) → host-based
  source-allow policy → robots/ToS-respecting source-fetcher → reuse the
  deterministic engine + quote-offset gate → employer-hosted board resolver →
  fixtures + connector self-check. Defensive, env-gated, run-dir only, no
  `--promote`.
- **Phase D — manual benchmark.** PracticeLink/PracticeMatch reachability tally
  (human, ToS-checked).

## 9. Adjacent deferred work — structured Workday visa-field parsing

Independent of search-discovery, and already justified by this run: some Workday
tenants expose a structured visa field in the posting body (Sanford showed
`Visas Accepted: N/A`). A later, separate pass could parse:

```
Visas Accepted · Visa sponsorship · Work authorization · Sponsorship · Immigration assistance
```

into:

```
structuredVisaField = N/A | none | yes | J1 | H1B | unknown
```

Rule: `N/A` / "not available" / "none" ⇒ `SPONSORSHIP_DENIED` or
`NO_VISA_SIGNAL` — **never a publish signal**. A positive value still passes
through the same quote-offset gate. This belongs *after* the connector commit
(done), as its own small change — not bundled into search-discovery.

## 10. Where visa language actually appears (targeting)

Target (visa language is present here):
```
USAJobs VA / IHS
3RNET / partner / manual benchmark (employer-direct outbound only)
employer-hosted PracticeLink / PracticeMatch widgets (employer domain)
state workforce / rural-recruitment pages
search-discovery candidate URLs (verified at source)
specific hospital pages with explicit "J-1 / H-1B welcome"
```

Do NOT keep mining (low visa-language density):
```
random Greenhouse boards
random Workday tenants
generic digital-health employers
```

## 11. Hard rules (binding for this phase)

- Spec only. **No connector code** until a search-API key exists and the build
  is explicitly approved.
- No push, no deploy, no PR. No DB / schema / seed. No cron, no public route.
- No `--promote`; the committed app surface stays the honest empty state.
- **No commercial-board scraping** (PracticeLink, PracticeMatch, DocCafe,
  HealtheCareers, LinkedIn, Indeed, …). No board capture, ever.
- **Never publish from a snippet.** Source-fetch + quote-offset gate are the
  only path to PUBLISH.
- Respect robots.txt and ToS on every fetch. Do not bypass bot protection
  (WVU stays disabled). Do not build the HRSA `cp-api` connector.
- No autonomous agents. No regex in the intelligence layer.

## 12. Open questions for operator

1. Provision a search-API key (which provider in §7), or defer search-discovery
   and instead prioritize the USAJobs key (still the cleanest live source)?
2. Approve the structured Workday visa-field pass (§9) as a small standalone
   change, independent of search-discovery?
3. OK to spend one manual (human, ToS-checked) turn benchmarking
   PracticeLink/PracticeMatch employer-direct reachability (§5) before any
   Phase-C build?
