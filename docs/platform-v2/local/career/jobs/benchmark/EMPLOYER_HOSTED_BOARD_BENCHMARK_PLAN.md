# VJ — Employer-Hosted Board Benchmark (PLAN + TEMPLATE ONLY)

Status: PLAN + TEMPLATE ONLY. No resolver code. No automated capture. No
`source-registry.ts` changes. No DB / schema / seed. No public jobs.
No push / deploy / PR.
Date: 2026-05-30
Refines: `VJ_EMPLOYER_HOSTED_BOARD_RESOLVER_PLAN.md` §7 and
`VJ_SEARCH_DISCOVERY_R2_SPEC.md` §5. Both describe a manual reachability
benchmark; this document is the concrete instrument and the go/no-go gate.
Supersedes the flat "100" with a staged **20 → review → 100**.
Template file: `employer_hosted_board_benchmark_template.csv` (header row only).

## 0. The one question this measures

Not "can we scrape the boards?" — we never will. The question is:

> **Of N visible PracticeLink / PracticeMatch visa-tagged physician jobs, how many
> can we independently resolve to a clean employer-origin evidence page that would
> pass our publish gate?**

The answer is the real coverage number behind the employer-hosted resolver. If it
is high, the resolver is worth building. If it is low, the honest move is to spend
the effort on USAJobs / state / FQHC / source partnerships instead.

This benchmark **measures**; it does not **ingest**. Nothing here publishes. A
"publishable" verdict in the tally means *a clean employer-origin quote exists and
would pass the gate* — the actual extraction happens later, in a real engine run
against the employer-origin page, only if the resolver is approved and built.

## 1. Hard rules (binding)

- **No automated crawling of PracticeLink / PracticeMatch.** Human eyes in a normal
  browser only. PracticeMatch's terms prohibit data-capturing methods including
  data mining and screen scraping.
- **No scraping board result pages.** The board URL is recorded as a *manual
  reference* a person looked at — never a crawl target.
- **No copying job descriptions.** The tally records *facts about reachability*
  (employer, specialty, state, yes/no flags, public URLs), never the posting body.
  Even the visa-quote column is **yes/no + source URL**, not copied quote text.
- **No publishing from board snippets.** Only an employer-origin page can become
  evidence, and only via the unchanged quote-offset gate.
- **No resolver code yet.** This is a measurement turn, not a build.
- **No `source-registry.ts` changes.** That file is executable source config that
  `enabledSources()` turns into live fetches; unproven widget/board pages must
  never land there. Confirmed employer surfaces graduate to the registry later,
  by hand, as their own approved step.
- No DB / schema / seed; no public jobs; no `--promote`; no push / deploy / PR.

## 2. Method (staged 20 → 100)

1. **Target the sample.** In a browser, find physician postings on the board that
   **show a visa signal** ("J-1", "H-1B", "visa sponsorship", "Conrad 30",
   "IMG/international medical graduates welcome"). The denominator is *visa-tagged
   physician postings*, because that is the supply we care about.
2. **Pilot 20 first.** Tally 20 such postings (one row each, §3). Stop there and
   review — if the method fails early there is no point doing 100.
3. **Review the pilot** against the go/no-go gate (§5).
4. **Expand to 100** only if the pilot is not a clear failure (clean rate ≥ 20%).
5. **Decide** (§5): build the resolver, expand the sample, or pivot away.

For each posting the human does a *manual* resolution attempt: search the
employer's own name + careers, open the employer's primary-domain careers page,
and check whether the same job (and its visa language) appears in **employer-origin
bytes** — not inside a board iframe / board-fed widget. Record the verdict. No
tooling beyond a browser and this spreadsheet.

## 3. Tally columns

One row per sampled posting. Columns (exact CSV header order):

| column | meaning | allowed values / format |
|---|---|---|
| `benchmark_id` | stable row id | e.g. `EHB-001` |
| `board_name` | which board was viewed | `PracticeLink` / `PracticeMatch` |
| `board_url_manual_reference` | the board page a human looked at | URL (reference only, not a crawl target) |
| `employer_name` | hiring institution | text |
| `facility_name` | specific site, if distinct | text or blank |
| `specialty` | physician specialty | text |
| `state` | posting state | 2-letter, e.g. `WV` |
| `job_title_seen` | title as displayed | text (title only, not body) |
| `visa_signal_seen_on_board` | visa language visible on board? | `yes` / `no` |
| `official_employer_domain` | employer primary registrable domain | e.g. `example-health.org` or blank |
| `official_careers_url` | employer's own careers page | URL or blank |
| `employer_hosted_job_url` | employer-origin URL for this job, if any | URL or blank |
| `content_host_class` | where the job *bytes* are served from | enum (§4a) |
| `exact_visa_quote_on_employer_origin` | does a compliant quote exist on employer-origin bytes? | `yes` / `no` |
| `quote_source_url` | employer-origin URL that holds the quote | URL or blank (must be employer-origin) |
| `publishability_bucket` | measurement verdict | enum (§4b) |
| `rejection_or_hold_reason` | why not publishable, if so | short text |
| `notes` | anything else | short text |

Discipline: `quote_source_url` must be an **employer-origin** URL — never a board
URL. If the only place the visa quote exists is board-origin bytes,
`exact_visa_quote_on_employer_origin = no` (a board quote is not employer evidence).

## 4. Enumerations

### 4a. `content_host_class` (maps to resolver plan §1 patterns)

| value | meaning | resolver-plan pattern |
|---|---|---|
| `EMPLOYER_ORIGIN` | job text present in employer-origin bytes (plain fetch) | (C) / true server-render — clean |
| `BOARD_ORIGIN_IFRAME` | job text served inside a board `<iframe>` | (A) — board-served |
| `BOARD_ORIGIN_JS` | job text hydrated at runtime from a board feed/script | (B) — board-served |
| `UNKNOWN` | could not determine | — |

Only `EMPLOYER_ORIGIN` content can be evidence. `BOARD_ORIGIN_*` is the board by
another name — hold, never fetched for evidence, never published.

### 4b. `publishability_bucket` — and how it maps to production doctrine

The benchmark uses 6 buckets (finer than production, because a measurement
instrument resolves higher than the classifier it feeds). The mapping keeps the
vocabularies from drifting:

| benchmark bucket | resolver-plan type (§5) | engine disposition | publish candidate? |
|---|---|---|---|
| `EMPLOYER_ORIGIN_BYTES_PUBLISHABLE` | `EMPLOYER_HOSTED_BOARD_JOB` (type 1) | enters engine → quote-gate | **yes** |
| `RESOLVED_TO_CANONICAL_EMPLOYER_JOB` | `BOARD_LEAD_RESOLVED_TO_EMPLOYER_SOURCE` (type 2) | enters engine via resolved URL → quote-gate | **yes** |
| `BOARD_WIDGET_ONLY_HOLD` | `BOARD_LEAD_UNRESOLVED_HOLD` (type 3) | never reaches `classify()` | no (hold) |
| `BOARD_ONLY_HOLD` | `BOARD_LEAD_UNRESOLVED_HOLD` (type 3) / `SOURCE_NOT_ALLOWED` | never fetched | no (hold) |
| `RECRUITER_ONLY_REJECT` | — | existing `RECRUITER_ONLY` reject | no |
| `STALE_OR_NOT_FOUND` | — | existing `STALE` / no employer page found | no |

Only the first two are future publish candidates. `BOARD_WIDGET_ONLY_HOLD` is the
"Powered by PracticeLink" trap made explicit: the wrapper page is the employer's,
but the bytes are board-served, so it holds — it does **not** publish.

## 5. Go/no-go gate

Define the **clean-resolution rate**:

```
clean = rows where publishability_bucket ∈
        { EMPLOYER_ORIGIN_BYTES_PUBLISHABLE, RESOLVED_TO_CANONICAL_EMPLOYER_JOB }
rate  = clean / (sampled visa-tagged physician postings)
```

Decision:

| pilot/expanded rate | decision |
|---|---|
| **≥ 40–50%** | resolver is worth building — proceed to the build as a separately approved step |
| **20–40%** | inconclusive — expand the sample (20 → 100) before deciding; do not auto-build |
| **< 20%** | stop — shift effort to USAJobs / state / FQHC / source partnerships |

The pilot (20) gates the expansion: < 20% clean at 20 rows is a clear failure and
ends the lane without doing 100.

## 6. Illustrative row (synthetic — NOT data, NOT in the CSV)

This shows the intended shape only. The values are invented placeholders; the CSV
template ships with the header row and **no** data rows.

```
benchmark_id: EHB-001
board_name: PracticeLink
board_url_manual_reference: <board listing a human opened>
employer_name: Example Rural Health System
facility_name: Example Critical Access Hospital
specialty: Family Medicine
state: WV
job_title_seen: Family Medicine Physician
visa_signal_seen_on_board: yes
official_employer_domain: example-health.org
official_careers_url: https://careers.example-health.org
employer_hosted_job_url: https://careers.example-health.org/job/family-medicine
content_host_class: BOARD_ORIGIN_JS
exact_visa_quote_on_employer_origin: no
quote_source_url:
publishability_bucket: BOARD_WIDGET_ONLY_HOLD
rejection_or_hold_reason: employer page embeds a board-fed widget; job bytes hydrate from board origin, not employer origin
notes: employer also runs a Workday tenant — check whether the same req resolves there (would become RESOLVED_TO_CANONICAL_EMPLOYER_JOB)
```

## 7. What this benchmark is NOT

- Not authorization to crawl, mine, or screen-scrape any board.
- Not ingestion — no row here publishes; it records reachability facts.
- Not a registry change — confirmed employer surfaces are added to
  `source-registry.ts` later, by hand, as their own approved step.
- Not a resolver build — code starts only if the gate (§5) says so.

## 8. Output of the benchmark

- The filled `employer_hosted_board_benchmark_template.csv` (pilot 20, then 100 if
  warranted).
- A one-line coverage result: clean-resolution rate + the §5 decision.
- A short hand-verified seed list of employer-origin surfaces worth promoting to
  the registry — only if the resolver is approved.
