# Post-incident prevention checklist

## Immediate (this sprint)
- [x] `scripts/validate-no-secrets.ts` added and passing (1114 files, 0 findings).
- [x] Mount Sinai Wayback HTML redacted in working tree.
- [x] Incident folder created with redacted findings + manifest + history options.
- [ ] User rotates the exposed Google API key in Google Cloud Console.
- [ ] User confirms rotation in chat.
- [ ] Sanitized commit pushed (only after both above).
- [ ] GitHub secret-scanning alert marked resolved.

## Standing rules going forward (process gap fixes)

### Rule 1 — Always scan raw HTML captures before staging
Whenever a sprint introduces new files under `docs/**/screenshots/`, `docs/**/html-snapshots/`, or any folder containing third-party captured HTML, run `npx tsx scripts/validate-no-secrets.ts` BEFORE the first `git add`. Do not stage HTML captures that fail the validator without first redacting.

### Rule 2 — Wayback fallback captures are HIGHER risk than direct captures
Wayback HTML preserves the original page's `<script>`, `<iframe>`, `<link>`, and inline event handlers verbatim — including any embedded Google Maps / reCAPTCHA / Stripe / Mapbox / etc. credential. Before staging any Wayback HTML, check for credentials. Consider stripping `<script>` and `<iframe>` tags from Wayback captures as a defense-in-depth measure, since the page text is the evidence we care about, not the embeds.

### Rule 3 — Never broad `git add .`
Always stage by named path. The bridge-validator-required HTML evidence path makes broad `git add .` especially dangerous because raw third-party HTML lands in the same staging window as our own code.

### Rule 4 — No `--no-verify`
Never bypass pre-commit hooks. If a hook fails on a credential pattern, the right fix is redaction, not bypass.

### Rule 5 — Pre-commit hook (recommended, not yet wired)
Wire `scripts/validate-no-secrets.ts` into Husky / pre-commit. Suggested config:

```
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"
npx tsx scripts/validate-no-secrets.ts
```

This stops a future leak at commit time, not at GitHub scan time.

### Rule 6 — GitHub push protection
Enable "Push protection" on the GitHub repo (Settings → Code security → Secret scanning → Push protection). This blocks the push at GitHub's edge if a known secret pattern is in the diff. Free for public repos.

### Rule 7 — Google API key restrictions
For any USCEHub-owned Google API keys (none currently committed), always:
- Restrict by API (only Maps JavaScript / Geocoding / etc. as needed)
- Restrict by HTTP referrer to `*.uscehub.com` and `*.vercel.app`
- Set quotas
- Rotate on a schedule

### Rule 8 — Document third-party credentials in captures
If a captured HTML must retain a third-party `<script>` for evidence reasons, document the credential type in the manifest and confirm the credential is HTTP-referrer-restricted (or otherwise limited) before staging — and even then, redact the actual key value before commit.

## Process: how to handle a future secret-scanning alert

1. Stop all product work.
2. Freeze state (branch, HEAD, prod main).
3. Search current tree + history with redacted output only — never paste the secret.
4. Identify offending files.
5. Sanitize current tree.
6. Run `validate-no-secrets.ts`.
7. Decide history strategy (record in incident folder).
8. Create incident folder + report.
9. **Pause for user to rotate the key.**
10. Stage scoped commit (no broad `git add .`, no `--no-verify`).
11. Push only after explicit user "push" authorization.
12. Mark GitHub alert resolved.
13. Resume product work.
