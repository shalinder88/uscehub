# VJ — HRSA Health Workforce Connector: Access Evaluation

Status: READ-ONLY EVALUATION (no connector code written)
Date: 2026-05-30
Scope: determine whether physician job/opportunity records can be pulled from the
HRSA Health Workforce Connector (`connector.hrsa.gov`) programmatically without
login, scraping abuse, or brittle browser hacks.

## Verdict

**Do not build an HRSA Connector connector now.** The vacancy data is public and
is exactly our lane (HPSA-scored NHSC / Nurse Corps opportunities, with a
discipline/specialty taxonomy), **but the only machine path to it is an
undocumented, CSRF-protected internal POST API.** Reaching it requires replaying
a same-origin XSRF token (cookie → header) and reverse-engineering an internal
Java request model. That circumvents an intentional access control on a federal
site and is brittle by construction — it fails the "no brittle browser hacks"
bar. Go government-first via **USAJobs** (sanctioned API) instead, and only
revisit HRSA if a sanctioned bulk/export feed turns up.

This maps to the operator's decision tree as: structured JSON exists, but it is
**not cleanly/safely usable → recommend Workday/USAJobs path, not an HRSA parser.**

## What the site is

`connector.hrsa.gov` is an Angular single-page app titled "Health Workforce
Connector." Its own description frames it as positions in shortage areas (HPSA),
critical-shortage facilities, and underserved communities, tied to the National
Health Service Corps and Nurse Corps. Keywords include rural, frontier, community
health center, FQHC. This is the highest-value underserved/J-1-waiver lane we
have found — which is exactly why the access constraints below matter.

## Access findings (technical)

| Question | Finding |
|---|---|
| Public search URL | Root 302 → `/connector/` (Angular SPA). Client-rendered; no server-side HTML job listing to read. |
| Data format | JSON only, via an internal REST API. Backend is Spring Boot (error bodies carry `timestamp/path/status/errorId`). |
| API base | `window.__env.cpAppUrl = "https://connector.hrsa.gov/cp-api"` (from `environment.js`). |
| Read endpoint | `POST /cp-api/opportunities`. `GET` → **405 METHOD_NOT_ALLOWED** ("method 'GET' is not supported"), so the endpoint is real but **POST-only**. No clean GET read-path exists. |
| Auth wall | None for this data — no login required (the CSRF check fires before any auth check). Data is public. |
| CSRF gate | `POST` without a token → **403 "An expected CSRF token cannot be found."** Standard Spring `XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header. Loading the SPA mints the `XSRF-TOKEN` cookie; replaying it as the header passes the gate (confirmed). |
| Request model | 500 error leaked `gov.hrsa.nextgen.cp.api.model.search.OpportunitySearchRequest`, with required fields incl. `maxMctaHpsaScore` (HPSA-score filter) and `disciplineSpecialtyIdList` (specialty filter). So HPSA-score + physician/specialty filtering exist — but the body must be reverse-engineered field by field. |
| Reference taxonomy | `field-of-practice-discipline-specialty-types` (discipline/specialty lookup) referenced in the bundle. |
| Export | An `/opportunities/export` endpoint exists, but it is the same access class (POST/CSRF, app-internal), not a sanctioned bulk feed. |
| Pagination | Page/size carried in the POST request body (inferred from the model + SPA usage). |
| Secure endpoints | `secure/opportunities`, `/extranet/site/secure/opportunities/manage` — applicant/employer-authenticated; out of scope. |
| robots.txt | None at root (request returns the API's JSON 404). Absence of robots is not consent to bypass CSRF. |
| Provenance | Government (Tier-1 quality), but the interface is an **internal NextGen system API** (`gov.hrsa.nextgen.cp.api`), undocumented and unversioned for third parties. |

## Why this is not safe to automate

1. **Circumvention.** The CSRF control is a deliberate same-origin restriction.
   Scripting around it (cookie→header replay) circumvents an access control on a
   `.gov` site — a politeness/ToS risk we should not take on our own initiative.
2. **Brittleness.** There is no public contract. The request model
   (`OpportunitySearchRequest`) is internal and can change without notice; our
   connector would break silently and require constant reverse-engineering.
3. **No sanctioned surface.** Unlike USAJobs (documented API + issued key) or
   Greenhouse (documented public board API), HRSA Connector exposes no developer
   API, no terms permitting automated access, and no stable export.

By the operator's own bar — "without login, scraping abuse, or brittle browser
hacks" — this fails on hacks/brittleness even though it passes on "no login."

## Recommendation

1. **USAJobs first (sanctioned, clean).** Covers VA + IHS — the largest federal
   physician sponsors in shortage areas. Connector is already built and gated;
   set `USAJOBS_API_KEY` + `USAJOBS_USER_AGENT` to run it.
2. **Look for a sanctioned HRSA feed before reconsidering Connector.** Check
   `data.hrsa.gov` / HRSA open-data for an NHSC-vacancy dataset or documented API.
   If one exists, it is Tier-1 and safe; if not, classify HRSA Connector as
   **Tier-3 browse-only** (reference for humans, never crawled) — same posture as
   the commercial boards, here for circumvention/brittleness reasons.
3. **Reach the same employers the clean way.** The FQHCs/CAHs/rural systems that
   post on HRSA Connector are largely reachable employer-direct (e.g., AltaMed,
   Sanford, WVU on Workday). The unique signal lost by not scraping Connector is
   partly recoverable through USAJobs + employer-direct ATS.

## Next step

- Operator: obtain the USAJobs API key and export the two env vars, then run the
  USAJobs connector (Path A).
- If HRSA coverage is still wanted afterward, spend one read-only turn checking
  `data.hrsa.gov` for a sanctioned NHSC-vacancy dataset/API. Build nothing
  against `cp-api` either way.

## Hard rules honored this phase

No connector code written. No push/deploy/PR. No DB/schema/seed. No cron. No
public route. No `--promote`. No bulk extraction from `cp-api` (probing was
limited to access characterization, not record harvesting). No run artifacts.
