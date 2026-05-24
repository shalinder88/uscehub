# Micro-Pilot Browser QA 1 — Console Check

**Date:** 2026-05-08
**Browser:** Playwright Chromium 1.59.1 (Chrome for Testing 147.0.7727.15) headless
**Viewports:** 1440×900 (desktop) + 390×844 (mobile, `isMobile: true`, `deviceScaleFactor: 2`)
**Capture method:** `page.on('console')` + `page.on('pageerror')` listeners attached before `page.goto`

## Summary

| Category | Count |
|----------|-------|
| Console entries (any type) | 7–9 across runs |
| Errors (`type === 'error'` or `pageerror`) | **0** |
| Warnings | 0 |
| Hydration mismatch warnings | 0 |
| Network failures (page itself) | 0 |
| Failed resource fetches | 0 |

## Entries observed

The 7–9 console entries on each load are standard Next.js dev-mode log messages:
- `[Fast Refresh]` initialization message
- React DevTools availability notice
- Tailwind dev mode info
- Next.js navigation info

None of these are errors, warnings, or hydration mismatches.

## What this means for release

- No client-side runtime errors on the pilot route.
- No hydration mismatches between server-rendered HTML and client-rendered output (rules out SSR/CSR drift).
- No failed network requests during page load.

This satisfies the noindex release checklist's "no console errors" requirement.

## Caveat

This was a Playwright headless capture. A subsequent manual interactive QA (real user with real Chrome) is recommended at the release-audit stage to confirm the same on a real browser, but the Playwright capture is a strong static-analysis signal.

## Reproduction

```bash
cd /Users/shelly/usmle-platform
npm run dev          # in one terminal
# in another:
node /tmp/qa_capture.tmp.mjs   # uses Playwright headless against http://localhost:3000/clerkships/pilot
```

The `qa_capture.tmp.mjs` script was used in this sprint and then deleted (it was a temp helper). To reproduce, recreate it from this minimal template:

```js
import { chromium } from 'playwright';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const messages = [];
page.on('console', msg => messages.push({ type: msg.type(), text: msg.text() }));
page.on('pageerror', err => messages.push({ type: 'pageerror', text: err.message }));
await page.goto('http://localhost:3000/clerkships/pilot', { waitUntil: 'networkidle' });
console.log(JSON.stringify(messages, null, 2));
await browser.close();
```
