# P0 Security Incident — Google API Key in Mount Sinai Wayback HTML

**Incident ID:** `P0-SECRETS-INCIDENT-GOOGLE-API-KEY-MOUNTSINAI-WAYBACK-HTML`
**Detected:** 2026-05-09 (GitHub secret scanning email)
**Repository:** `shalinder88/uscehub` (public)
**Branch:** `local/p97-discovery-integrity-guardrails` (pushed)
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Severity:** P0 (public repo + live secret-scanning alert)
**Status at this report:** TREE SANITIZED · LOCAL ONLY · PUSH HELD pending key rotation

---

## 1. What was leaked

| Field | Value |
|-------|-------|
| Secret type | Google Maps JavaScript API key |
| Secret value in this report | `[REDACTED_GOOGLE_API_KEY]` (never printed) |
| Owner of key | Mount Sinai Health System (third-party — NOT a USCEHub-owned key) |
| How it got in | Wayback Machine snapshot of a `mountsinai.org` page included Mount Sinai's Google Maps embed in `<script>` and `<iframe>` tags; we captured the Wayback HTML verbatim as evidence |
| Embedded restrictions (per Google standard practice) | HTTP-referrer-restricted to `*.mountsinai.org` (cannot be used from arbitrary origins to drive Mount Sinai's quota) — but the key value itself is still a credential and GitHub's scanner correctly flags any redistribution |

## 2. Where the secret appeared

**Working tree (BEFORE redaction):**

| File | Line | Context |
|------|------|---------|
| `docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/html-snapshots/mount-sinai-wayback.html` | 104 | `<script src=…googleapis…js?key=[REDACTED_GOOGLE_API_KEY]>` |
| same file | 1326 | `<iframe src=…maps/embed/v1/place?…&key=[REDACTED_GOOGLE_API_KEY]>` |

**Git history (all branches):**

Single introducing commit: `8509729b94c1cba9a7dc6efb47a1785cfca3d134` — `P97: harden promotion batch three evidence`. Present on `local/p97-discovery-integrity-guardrails` (local + origin). Production `main` does NOT contain it.

**Other secret patterns scanned and CLEAN:**
- AWS access key id (`AKIA…`)
- GitHub PAT/OAuth/server tokens (`ghp_/gho_/ghs_/github_pat_`)
- Stripe secrets (`sk_live_/sk_test_`)
- Slack tokens (`xox[abp]-`)
- PEM private key headers

## 3. Actions taken (working tree)

1. Frozen state captured: branch / HEAD / origin/main / commit existence.
2. Searched current working tree and full git history with redaction filter (no secret value ever printed to terminal or files).
3. Identified affected file (`mount-sinai-wayback.html`) and confirmed no other repo file contains a Google API key, AWS key, GitHub token, Stripe key, Slack token, or PEM private key.
4. Redacted both occurrences in `mount-sinai-wayback.html`:
   - Line 104: `key=[REDACTED_GOOGLE_API_KEY]` (replaced inside `<script src>` URL)
   - Line 1326: `key=[REDACTED_GOOGLE_API_KEY]` (replaced inside `<iframe src>` URL)
   - Both replacements made in place, no `.bak` retained.
5. Added `scripts/validate-no-secrets.ts` — deterministic Node/tsx scanner that walks the tree (excluding `.git`, `node_modules`, `.next`, build dirs, large/binary file types, and itself) against 10 credential patterns. Output is path + line + pattern label only. Exits 1 on any finding.
6. Re-ran the validator: **scanned 1114 files, 0 findings, exit 0.**

## 4. Actions NOT taken (pending user authorization)

- **No `git push`** — held until user confirms the Google API key has been revoked or rotated in Google Cloud Console.
- **No history rewrite** — see `history_cleanup_options.md`. Force-pushing a sanitized branch would also require explicit user authorization.
- **No GitHub alert dismissal** — the alert should be marked resolved only after key rotation.
- **No deploy / merge / PR / runtime change / UI change.**
- **No mutation of unrelated dirty files** in the working tree (NPPES files, redesign mockups, etc. remain untracked).

## 5. Why the leak happened (root cause)

The Wayback fallback pattern (introduced for sites with bot-defense blocks) captures full HTML verbatim, including third-party `<script>` and `<iframe>` embeds with their original query-string credentials. The evidence-hardening sprint that wrote `mount-sinai-wayback.html` did not pre-scan the captured HTML for credential patterns before staging.

This is a process gap, not a code bug. The fix is the new pre-commit-grade validator (`validate-no-secrets.ts`) plus a documented checklist for raw HTML captures.

## 6. Files in this incident folder

| File | Purpose |
|------|---------|
| `INCIDENT_REPORT_REDACTED.md` | This report |
| `redacted_secret_findings.csv` | Per-finding row, no secret values |
| `sanitized_files_manifest.csv` | Per-file before/after status |
| `history_cleanup_options.md` | Three strategies for handling the leaked commit in pushed history |
| `post_incident_prevention_checklist.md` | Prevention checklist + recommended pre-commit guard |

## 7. Validators

| Validator | Result |
|-----------|--------|
| `scripts/validate-no-secrets.ts` | PASS (1114 files, 0 findings) |
| Other baseline validators | Run in Phase I — see report Section 9 |

## 8. Next required steps

1. **User: rotate or delete the exposed Google API key in Google Cloud Console.** Restrict the replacement key by API + HTTP-referrer + IP/app as appropriate. Check usage/quota/billing for suspicious activity. (Note: the key is Mount Sinai's, not ours — so this is technically Mount Sinai's responsibility, but we should still notify them and decide whether to keep the captured HTML at all. See `history_cleanup_options.md`.)
2. **User confirms revocation.**
3. **Decide history strategy** (see `history_cleanup_options.md`). Recommended: Strategy 1 (rotate + sanitize current tree + accept residual history) unless user wants a force-push history rewrite.
4. **Push sanitized commit.**
5. **Mark GitHub secret-scanning alert resolved.**
6. **Resume product work** (Promotion Batch 3 staged-runtime sprint) only after the above.
