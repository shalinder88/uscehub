# VJ — Employer-Hosted Board Resolver: Implementation Decision (PLAN ONLY)

Status: PLAN ONLY. No resolver code, no new ATS connectors, no broad search.
Date: 2026-05-30
Extends: `VJ_SEARCH_DISCOVERY_R2_SPEC.md` §4 (employer-hosted board resolver) and
§5 (manual benchmark). All R2 core principles and hard rules carry over unchanged.
Lineage: written after `VJ: add bounded Workday connector` proved the engine but
returned a clean **negative-yield** (33 physician postings, all `NO_VISA_MENTION`).
The conclusion was that the next gain is not more ATS tenants — it is reaching the
visa-dense supply that *flows through* PracticeLink/PracticeMatch, but reaching it
**only at the employer surface**, never at the board.

## 0. Purpose & scope

Goal: find employer-owned career pages that **embed or mirror**
PracticeLink/PracticeMatch jobs, so visa-dense postings become reachable
employer-direct — without ever crawling the boards.

This document is a decision plan. It does not:
- implement the resolver,
- add ATS connectors,
- run broad/generic web search,
- add any source-registry entries.

It defines *how the resolver would work if built*, with the specificity guards
spelled out first, so the build (a later, separately approved step) cannot drift.

## 1. The central design tension — page host ≠ content host

This is the whole reason the plan exists before the code.

"Employer-hosted board job" is seductive but ambiguous. A hospital careers page
at `careers.example-health.org` may say **"Powered by PracticeLink"** — yet the
*visible job text* is usually delivered one of three ways:

- **(A) iframe embed.** The employer page contains an `<iframe>` whose `src` is a
  board host. The wrapper page is the employer's; the **job DOM is board-served.**
  Fetching the iframe `src` = fetching the board = DENY.
- **(B) JS hydration from a board feed.** The employer page ships a script that
  calls a board JSON/XML feed and injects cards into the DOM at runtime. A plain
  (non-JS) fetch of the employer URL returns **no job text at all** — only a
  script tag. The job bytes live at a board-hosted feed endpoint.
- **(C) employer-direct, board is only a mirror.** The employer actually runs its
  own ATS (Workday/Greenhouse/iCIMS/…) or server-renders postings on its own
  domain; the board merely syndicates copies. A canonical **employer-origin**
  posting URL exists independently of the board.

Only **(C)** — and the rare true server-rendered (A/B) variant where the job text
is actually present in employer-origin bytes — is clean. Treating every "Powered
by PracticeLink" widget as employer-direct would silently re-introduce board
scraping behind an employer URL. So the binding rule is:

> **The page being employer-owned is necessary but not sufficient. Evidence may
> only come from bytes served by an ALLOW-class origin (employer primary domain or
> a verified employer ATS tenant). If the exact visa quote exists only inside
> board-origin bytes — an iframe, a feed response, JS-hydrated content — it is not
> employer evidence and cannot be published.**

Practical consequence: the resolver **never executes board-origin JavaScript** to
hydrate content (that is just fetching the board feed by another name), and the
quote-offset gate runs against a **plain fetch of an ALLOW-class URL**. This makes
the conservative behavior automatic — JS/iframe widgets that hydrate from the
board naturally yield empty employer-origin bytes and fall to "unresolved hold"
(§5) unless a real employer-origin posting (C) can be found.

## 2. Finding employer-hosted board pages (item 1)

Three discovery routes, in priority order. None requires crawling a board; the
primary route needs no search API at all.

1. **Curated employer registry (primary, no search dependency).** Seed from
   employers we already trust by hand — the existing source-registry plus
   shortage-area FQHCs / rural systems / Conrad-30 states. For each employer, do
   a single plain fetch of its **own** careers page and detect a board-widget
   *signature* (below). We read the employer page (ALLOW) to find the signature;
   we never fetch the board it points to.
2. **Manual benchmark seeding (§7).** A human reading board postings records which
   employers resolve to a reachable employer-origin surface and adds those
   employers to the registry. Human-eyes only; no automated capture.
3. **Site-scoped search (only if/when a key is explicitly chosen — R2 §7).**
   `site:{employerDomain}` queries that return **employer-domain URLs only** (§3).
   Leads only; the fetched employer page is the evidence. This route stays dormant
   until the operator picks a provider; the plan does not depend on it.

**Board-widget signatures (detected on the employer page, ALLOW-class bytes):**
- visible text "Powered by PracticeLink" / "Powered by PracticeMatch";
- an `<iframe>`/`<script>`/feed URL whose host is a known board domain or board
  CDN/widget subdomain;
- a board "client id" / employer-feed parameter in an embedded URL.

A signature tells us *this employer syndicates through a board* — it is a routing
hint to attempt resolution to an employer-origin posting (§5 type B), **not**
permission to fetch the board.

## 3. Safe query templates (item 2)

Templates are **leads only**; the fetched employer source is the evidence. Every
template is either descriptive or scoped to an employer/allowed domain. None is
ever scoped to a board host.

```
site:{employerDomain} careers physician ("J-1" OR "H-1B" OR "visa sponsorship")
site:{employerDomain} "powered by practicelink"
site:{employerDomain} "powered by practicematch"
"{employer}" careers physician visa sponsorship
site:.gov "conrad 30" physician {state}
```

Guards:
- A template must include a **physician term** + (**visa term** OR a
  **board-widget signature** target). 
- **Forbidden, rejected pre-issue:** `site:practicelink.com`, `site:practicematch.com`,
  `site:doccafe.com`, any bare board/aggregator host, any board search/result URL.
- Any candidate URL a template yields is run through the host-based allow/deny
  check (§4) **before** any fetch; a DENY host is dropped as `SOURCE_NOT_ALLOWED`.
- Until a search key is chosen, these are illustrative; route 1/2 (§2) is the
  active discovery path.

## 4. Employer-owned host vs board host (item 3)

Host resolution runs **first**, before any fetch, and is byte-origin aware.

1. **Normalize to registrable domain (eTLD+1).** Compare against:
   - the **deny set** — board/aggregator hosts and their known widget/feed/CDN
     subdomains (PracticeLink, PracticeMatch, DocCafe, HealtheCareers, CompHealth,
     Doximity, Indeed, LinkedIn, …; R2 §3). On the deny set ⇒ **board host** ⇒
     never fetched.
   - the **employer-owned set** — the employer's verified primary domain, or a
     verified employer ATS tenant whose brand resolves to the employer **and** is
     linked from that employer's own Careers page (the R2 ALLOW class).
2. **Verify employer ownership by hand, not from a board profile.** A domain
   string scraped from a board listing is untrusted. Employer-domain ownership is
   confirmed at registry-entry time (brand/primary-domain match), the same manual
   bar as every existing Tier-1 source.
3. **Content-origin check (the §1 rule, enforced).** Even on an employer-owned
   page, the job evidence must appear in **plain-fetch bytes of that ALLOW-class
   URL**. Litmus: GET the employer URL with a plain client — do the exact job
   title and the visa sentence appear in the returned bytes? 
   - Yes ⇒ employer-origin content (eligible).
   - Only an empty `<iframe>` / script tag / board-feed call ⇒ content is
     board-hosted ⇒ not eligible as-is (route to resolution or hold, §5).

Page host and content host are evaluated separately; **both** must be ALLOW-class
for the bytes to become evidence.

## 5. Source-type classification (item 4)

Every candidate is labeled with exactly one type. Only the first two can ever
reach `classify()` and the quote-gate; the third is structurally incapable of it.

- **`EMPLOYER_HOSTED_BOARD_JOB`** — employer-owned page **whose job text is present
  in ALLOW-class bytes** (server-rendered into the employer document, or the
  employer's own ATS). The widget is real but the content is employer-origin.
  → enters the unchanged engine (`clean → extractPhraseHits → classify`) +
  quote-offset gate. Provenance Tier-1, `needsVerification: true`.
- **`BOARD_LEAD_RESOLVED_TO_EMPLOYER_SOURCE`** — discovery began from a board lead
  (widget signature, employer profile, or benchmark row) and was resolved to a
  **separate canonical employer-direct URL** on an ALLOW-class origin (employer
  ATS or own-domain posting). We fetch **that** URL, never the board.
  → enters the engine via the resolved employer URL. This is pattern (C) and the
  highest-value, cleanest path.
- **`BOARD_LEAD_UNRESOLVED_HOLD`** — a board lead with **no** ALLOW-class byte
  source: iframe-only, feed-only, JS-hydrated-from-board, or employer domain
  unverifiable. → **HOLD** as a discovery lead. Never fetched for evidence, never
  published. Logged for benchmark/registry triage. This is the honest "a job
  exists but we cannot reach it cleanly" bucket — the analogue of the Workday
  negative-yield: we would rather hold than lower the bar.

Mapping to existing engine dispositions is unchanged: types 1–2 flow into
PUBLISH / HOLD_REVIEW / VISA_SIGNAL_ONLY / REJECT exactly as today; type 3 never
reaches `classify()`.

## 6. Rejecting recruiter-only / board-only pages (item 5)

- **Board-only / aggregator pages** (board index, search results, board job
  detail) ⇒ host-based `SOURCE_NOT_ALLOWED`, dropped pre-fetch. A board page is
  never an evidence source — only a benchmark/discovery lead.
- **Recruiter / locum-staffing postings**, even on an allowed host, where the
  hiring entity is a third-party agency advertising "on behalf of a client"
  without an identifiable employer ⇒ existing `RECRUITER_ONLY` reject. Staffing
  brand names (CompHealth, Weatherby, Merritt Hawkins, locum agencies, …) are a
  recruiter signal; the employer must resolve to a real hiring institution.
- **Unverifiable employer** ⇒ `BOARD_LEAD_UNRESOLVED_HOLD` (§5), not a publish.

These reuse the engine's current reasons (`SOURCE_NOT_ALLOWED`, `RECRUITER_ONLY`)
— the resolver adds routing, not new publish paths.

## 7. Benchmarking 100 visible board jobs without scraping (item 6)

This sizes the opportunity ("how much visa-dense board supply is reachable
employer-direct?"). It is **measurement, not ingestion**, and strictly human-eyes
— PracticeMatch's terms prohibit data-capturing methods including data mining and
screen scraping, so there is **no automated capture, no crawler, no bulk export,
no stored screenshots-as-data.**

Method:
1. A human opens the board in a normal browser and looks at **100 physician
   postings**, biased toward visa-relevant cuts (J-1/H-1B/Conrad-30 specialties,
   shortage states). 100 is a sizing choice; the methodology is the point.
2. For each, the human records a small **tally row of facts** — *not* the job
   description: employer name, specialty, state, and a reachability verdict ∈
   { employer ATS reachable · employer-hosted widget with employer-origin content ·
   employer page exists but content board-hosted · no employer page found }, plus
   the canonical employer URL if found.
3. Output:
   - a **coverage estimate** — "X of 100 resolve to an ALLOW-class employer
     source";
   - a **seed list** of confirmed employer-direct surfaces, each verified by hand,
     proposed for the registry (separate, approved step).

The tally captures reachability facts (counts, employer names, public URLs) — the
same things a job-seeker reads — never copied descriptions. Resolved employer
sources then flow through the normal engine like any other registry source; the
benchmark itself publishes nothing.

## 8. Preserving specificity (item 7)

The publish bar is unchanged; board discovery is upstream lead-generation only.

- **Quote-offset gate (the gate).** Every published claim's visa quote must
  verbatim-match a char-offset slice of bytes fetched from an **ALLOW-class
  origin**. A board snippet/feed/iframe quote that cannot be re-found in
  employer-origin bytes **fails**.
- **No publish from snippets/feeds/iframes.** Board feed text, widget DOM, and
  search snippets are leads — discarded after they yield a URL. They never reach
  `classify()` and never become a quote.
- **Host-first deny.** `SOURCE_NOT_ALLOWED` runs before any fetch; board hosts are
  never fetched.
- **No new publish paths.** The three source types add routing only. Only
  ALLOW-origin content passing the unchanged gate can PUBLISH;
  `BOARD_LEAD_UNRESOLVED_HOLD` cannot reach `classify()` by construction.
- **Title + polarity unchanged.** `isPhysician` + affirmative-and-not-denied still
  required post-fetch.
- **No board-JS execution.** Hydrating content by running board-origin scripts is
  out of bounds (it is fetching the board feed).
- **Structured visa field caution (R2 §9).** "Visas Accepted: N/A" / "none" is
  never a publish signal.
- **Negative yield is acceptable.** If resolving 100 board jobs yields few or zero
  employer-origin visa quotes, that is an honest measurement — the same posture as
  the Workday result. The plan must never lower the bar to manufacture inventory.

## 9. Pipeline sketch (when built; gated)

```
employer registry / benchmark seed / site-scoped lead
        │
   host allow/deny (§4)  ── board host ▶ SOURCE_NOT_ALLOWED (no fetch)
        │ employer-owned host
        ▼
   plain fetch of employer URL  (no board-JS execution)
        │
   content-origin check (§1, §4): is the visa sentence in ALLOW-class bytes?
        │                                   │ no
        │ yes                               ▼
        │                      attempt resolve → canonical employer-direct URL
        │                                   │ found            │ not found
        │                                   ▼                  ▼
        │            BOARD_LEAD_RESOLVED_TO_EMPLOYER_SOURCE   BOARD_LEAD_UNRESOLVED_HOLD
        ▼                                   │                   (hold; never classify)
 EMPLOYER_HOSTED_BOARD_JOB ◀───────────────┘
        │
   existing engine: clean → extractPhraseHits → classify
        │
   quote-offset validator (verbatim re-find at ALLOW-class source)
        │
 PUBLISH / HOLD_REVIEW / VISA_SIGNAL_ONLY / REJECT   (run dir only)
```

Nothing downstream of the engine changes: same statuses, same reject reasons, same
`--promote` safety (the committed app surface stays the honest empty state).

## 10. Non-goals / hard rules (binding for this plan)

- **Plan only.** No resolver code; no new ATS connectors; no broad/generic search.
- **Do not crawl PracticeLink/PracticeMatch result pages.** No board capture, ever.
- **Do not copy board descriptions.** Board text is a lead, discarded after it
  yields a URL.
- **Do not publish from snippets.** Source-fetch of ALLOW-class bytes + quote-gate
  is the only path to PUBLISH.
- **Only employer-owned pages can become source evidence** — and only their
  ALLOW-class bytes (§1).
- **Exact visa quote + char-offset validation still required.**
- **Board pages are only benchmark/discovery leads.**
- **No generic full-web search as the core.** Site-scoped leads only, and only if
  a key is explicitly chosen.
- **No SerpAPI / Google CSE dependency** until the operator explicitly picks a
  provider (R2 §7).
- Respect robots.txt and ToS on every fetch; do not bypass bot protection
  (WVU stays disabled); no autonomous agents; no regex in the intelligence layer.
- No push, no deploy, no PR; no DB / schema / seed; no `--promote`.

## 11. Open questions for operator

1. Approve sizing the manual benchmark (§7) at 100 board postings, human-eyes,
   ToS-checked — as the first concrete step (before any resolver build)?
2. When a search key is eventually chosen (R2 §7), restrict it to site-scoped
   employer/allowed-domain queries only (§3) — confirm no board-host queries ever?
3. Should resolved employer-direct surfaces from the benchmark be added to the
   existing `source-registry.ts` as ordinary Tier-1 entries (`needsVerification:
   true`), or tracked in a separate employer-hosted registry first?
