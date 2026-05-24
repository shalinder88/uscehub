# P101 — Bot-Block Retry Note

## What bot-block means

When a packet writer tries `WebFetch` against an official institution domain and the server returns HTTP 403 (Forbidden), HTTP 429 (Too Many Requests), or a CAPTCHA challenge page, that is **bot-block**. It is not the same as `SOURCE_DEAD`. The page exists; the automated request was refused.

Discovered first time in P101-1 Michigan Medicine (`medschool.umich.edu` and `medicine.umich.edu` both 403'd WebFetch).

## How to classify

If WebFetch returns clear evidence of a bot-block:

- `finalClassification: "BOT_BLOCKED_MANUAL_RETRY"`
- `finalTier: "TIER_C_NEEDS_REVIEW"`
- `searchProcess.stopCondition: "BOT_BLOCKED_RETRY_MANUAL"`
- Add a row to `p101_manual_retry_log.csv` with `retry_reason: "BOT_BLOCKED_HTTP_403"` (or 429 as appropriate)

Do NOT fabricate a verbatim quote from search engine snippets. Do NOT classify as `CURRENT_USCE_CONFIRMED` / `INTERNATIONAL_STUDENT_CONFIRMED` / `IMG_GRAD_OBSERVERSHIP_CONFIRMED` / `VSLO_US_MD_DO_ONLY` without a verbatim quote retrieved from the source page itself.

## When to retry with the helper

Use `scripts/p101-fetch-html.ts <url>` if:
- WebFetch returned 403 on a likely-relevant page, AND
- the page is clearly the institution's own canonical domain (not a third-party agency).

The helper uses a more realistic User-Agent string with curl. This sometimes succeeds against minimally protective WAFs that block default `WebFetch` UA but allow a normal-looking browser request.

If the helper succeeds → copy the verbatim quote into the packet from the cleaned text file at `tmp-html-cache/<sha1>.txt`. The packet's `sourceUrl` is still the original URL.

If the helper also fails → keep the institution classified `BOT_BLOCKED_MANUAL_RETRY` and queue for manual operator retry (a real browser session by the user).

## When to stop and not bypass

The helper does **not** and **must not** attempt:
- CAPTCHA solving (manual or automated)
- Login / authentication / 2FA
- Paywall bypass
- Proxy / Tor / IP rotation
- Headless browser stealth modes
- Parallel domain hammering
- Persistent storage of credentials

These bypass attempts are out of scope. If the institution's site is behind a CAPTCHA / login / paywall, that institution gets `BOT_BLOCKED_MANUAL_RETRY` until a human operator visits in their own browser and pastes the relevant text.

## Why no bypass is allowed

1. Some institutions have terms of service that prohibit automated access. Bypass would violate the TOS that USCEHub is trying to *respect* as an "official-source discovery engine".

2. CAPTCHA / login / paywall systems exist for a reason (rate-limit protection, scraper deterrence, paywall revenue). Working around them risks getting USCEHub's IP banned or legally exposed.

3. The whole moat of this project is **trust transparency**. We can't claim "source-verified" if the verification path is "we bypassed their bot defense to scrape it". The discipline of `BOT_BLOCKED_MANUAL_RETRY` is part of what makes the rest of the dataset defensible.

## Cache directory

The helper writes to `tmp-html-cache/` (sibling of `tmp-pdf-cache/`). Both are operator-local and should not be committed. (Validator will not flag them; gitignore will be added in a future authorized sprint.)

## Failure-mode classification table

| WebFetch result | Helper retry result | Classify as |
|---|---|---|
| 200 OK, clean HTML | n/a | classify per content |
| 403 | helper 200 OK | classify per helper content, sourceUrl = original |
| 403 | helper 403 | `BOT_BLOCKED_MANUAL_RETRY` |
| 429 | helper 200 | classify per helper content |
| 429 | helper 429 | `BOT_BLOCKED_MANUAL_RETRY`, retry_priority: LOW (rate-limit, not blocking) |
| Connection refused / timeout | helper same | `SOURCE_DEAD` |
| Returns CAPTCHA HTML | helper same | `BOT_BLOCKED_MANUAL_RETRY` |
| 404 on canonical page | helper 404 | search for alternate URL; if none, `NO_PUBLIC_USCE_LANE_FOUND` |
