# Branch history remediation plan

**Incident:** P0 Google API key (Mount Sinai's, third-party) in remote branch history
**Sprint ID:** `P0-SECRETS-INCIDENT-BRANCH-HISTORY-REMEDIATION-PLAN`
**Drafted:** 2026-05-10
**Status:** PLAN ONLY — no destructive commands executed

---

## 1. Premise

Because the leaked credential is Mount Sinai's own Google Maps key (third-party, HTTP-referrer-restricted), USCEHub cannot rotate or revoke it directly. GitHub's own remediation guidance is that a leaked secret must be considered compromised even after a forward-redaction commit; secret scanning continues to see history. We therefore cannot rely on Strategy A ("redact in working tree, push, mark resolved").

Production `main` is unaffected (`739ab1e232ecc52db1f10c8619bbdc1d409a190f`). The contamination is contained to one feature branch, both locally and on origin. That makes a remote-branch history rewrite low-risk relative to the alternative of leaving a known-leaked key in published history.

## 2. State at the time of this plan

| Item | Value |
|------|-------|
| Repo | `/Users/shelly/usmle-platform` |
| Current branch | `local/p97-discovery-integrity-guardrails` |
| Current HEAD | `3382d4db3127aceff5a410cd96d81ae00bfb46f2` (security: redact leaked Google API key artifact) |
| Production `main` | `739ab1e232ecc52db1f10c8619bbdc1d409a190f` UNCHANGED |
| Working-tree validator | `validate-no-secrets.ts` PASS — 1119 files, 0 findings |
| Untracked unrelated files | NPPES files, redesign-mockups, frozen-internal-copy READMEs — must remain untouched |
| Unstaged unrelated dirty files | `.claude/launch.json`, `src/data/usce/public-listings.generated.{json,ts}` — must remain untouched |

## 3. Safe base commit

| Field | Value |
|-------|-------|
| SHA | `128c2a2e06e1be7861969f22d606cb9ef67cde94` |
| Short | `128c2a2` |
| Subject | `P97: curate promotion batch three candidates` |
| Status | Secret-clean (verified by full-pattern grep over commit content) |
| Commits between `origin/main..128c2a2` | 64, all secret-clean |

## 4. Contaminated commits (after safe base)

| SHA | Subject | Why contaminated | What it must contain after replay |
|-----|---------|------------------|-----------------------------------|
| `8509729b…` | P97: harden promotion batch three evidence | `mount-sinai-wayback.html` lines 104 + 1326 contain Google API key | Same 51 files, but `mount-sinai-wayback.html` already has `[REDACTED_GOOGLE_API_KEY]` markers (no AIza ever in the blob) |
| `3382d4db…` | security: redact leaked Google API key artifact | The diff itself shows the deleted AIza line (so any commit that *removes* the secret still surfaces it in `git show`) | Replayed as: add `scripts/validate-no-secrets.ts`, the security-incident folder docs, and the appended incident note in the evidence-hardening report. No diff-to-mount-sinai-wayback.html, since the file at the previous commit already has the redaction baked in. |

## 5. Strategy comparison

### Strategy A — Forward push only (NOT RECOMMENDED)
Push `3382d4d` as a normal commit. The historical blob at `8509729b…` still holds the secret.

- **Pro:** lowest mechanical risk.
- **Con:** GitHub secret scanning continues to see the secret in history; the credential cannot be rotated by us (third-party); the alert remains real.
- **Verdict:** rejected — the third-party-key constraint kills this option.

### Strategy B — Force-push rewritten feature branch (PRESERVES BRANCH NAME)
Rewrite `local/p97-discovery-integrity-guardrails` so `8509729b…` is replaced with a sanitized commit that never contained the secret. `git push --force-with-lease origin local/p97-discovery-integrity-guardrails`.

- **Pro:** branch keeps its name. No downstream branch-rename coordination.
- **Con:** force-push is destructive. Anyone holding the old SHA loses the link. Requires explicit user-typed authorization ("force-push").
- **Tooling:** can be done with `git rebase --root` + manual file edits, or with cherry-pick of `8509729` from a sanitized tree state. `git filter-repo` is cleaner but not currently installed.

### Strategy C — Clean replacement branch + delete compromised remote branch (RECOMMENDED)
Create `local/p97-discovery-integrity-guardrails-clean` from safe base `128c2a2`, replay sanitized work as new commits, push the new branch. After user confirms the new branch is clean, delete the compromised remote branch.

- **Pro:** never uses `--force` on the original branch. Fresh, named, linear history. Safer for production main (we never `--force` anywhere near it). Clear audit trail in the incident folder.
- **Con:** branch rename requires updating any references (Vercel preview URLs, internal links). Old SHAs are unreachable from named refs but may remain in GitHub's reflog/object store for a window.
- **Verdict:** RECOMMENDED. Matches user's stated preference.

## 6. Strategy C — proposed command sequence (NOT EXECUTED)

These commands are written here for review only. None will run without explicit user authorization.

### C-1. Safety tag (local-only, harmless)

```sh
cd /Users/shelly/usmle-platform
git tag security/contaminated-before-cleanup-2026-05-10 3382d4d
```

### C-2. Stash unrelated dirty files (preserve them, don't carry them onto the clean branch)

```sh
git stash push --keep-index --include-untracked \
  -m "pre-cleanup parking — unrelated to incident" \
  -- .claude/launch.json src/data/usce/public-listings.generated.json src/data/usce/public-listings.generated.ts
```

Note: untracked NPPES / redesign-mockups files are not in the index and will follow the working tree across `git switch`; they remain untouched.

### C-3. Branch from safe base

```sh
git switch -c local/p97-discovery-integrity-guardrails-clean 128c2a2
```

### C-4. Replay 8509729 as a sanitized commit

Approach: copy every file added by `8509729b…` from the *current sanitized HEAD* (`3382d4d`) into the new branch. This guarantees `mount-sinai-wayback.html` is the redacted version, not the original.

```sh
# List files added/modified by 8509729 (51 paths)
git diff --name-only 128c2a2..8509729 > /tmp/p97_evidence_hardening_paths.txt

# Restore each from 3382d4d (sanitized tree)
xargs -a /tmp/p97_evidence_hardening_paths.txt -I{} git checkout 3382d4d -- {}

# Verify the offending file is redacted
grep -c '\[REDACTED_GOOGLE_API_KEY\]' \
  docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/html-snapshots/mount-sinai-wayback.html
# expected: 2

grep -c 'AIza' \
  docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/html-snapshots/mount-sinai-wayback.html
# expected: 0
```

Restore `P97_PROMOTION_BATCH_3_EVIDENCE_HARDENING_1_REPORT.md` to its **original 8509729 form** (without the post-commit incident note appended in 3382d4d) — that note belongs to the second commit, not this one:

```sh
git checkout 8509729 -- \
  docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/P97_PROMOTION_BATCH_3_EVIDENCE_HARDENING_1_REPORT.md
```

Stage and commit:

```sh
git add docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/
git commit -m "P97: harden promotion batch three evidence

Sanitized replay of 8509729b94c1cba9a7dc6efb47a1785cfca3d134:
mount-sinai-wayback.html ships with [REDACTED_GOOGLE_API_KEY] in
place of the third-party Mount Sinai Google Maps embed key from
the very first commit. All other files are byte-identical to the
original commit.

This commit replaces the contaminated history of the original
preview branch. See docs/platform-v2/local/security-incidents/
2026-05-google-api-key-mountsinai-wayback/ for incident detail.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

Run validators:

```sh
npx tsx scripts/validate-no-secrets.ts || true   # script does not exist yet at this point
npx tsx scripts/validate-p99-p97-bridge-input.ts \
  docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/promotion_batch_3_evidence_hardening_1_bridge_input_VALIDATED_CANDIDATE.csv
```

### C-5. Replay 3382d4d as the security-guard commit

```sh
# Restore the validator and incident docs from sanitized HEAD
git checkout 3382d4d -- \
  scripts/validate-no-secrets.ts \
  docs/platform-v2/local/security-incidents/2026-05-google-api-key-mountsinai-wayback/

# Append the post-commit incident note onto the evidence-hardening report
git checkout 3382d4d -- \
  docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/P97_PROMOTION_BATCH_3_EVIDENCE_HARDENING_1_REPORT.md
```

Verify:

```sh
npx tsx scripts/validate-no-secrets.ts
# expected: scanned N files, 0 findings, exit 0
```

Stage and commit:

```sh
git add scripts/validate-no-secrets.ts \
        docs/platform-v2/local/security-incidents/2026-05-google-api-key-mountsinai-wayback/ \
        docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/P97_PROMOTION_BATCH_3_EVIDENCE_HARDENING_1_REPORT.md

git commit -m "security: add secret scan guard and incident report

Replay of 3382d4db on a clean base. Adds scripts/validate-no-secrets.ts
and the security incident folder. Because this branch was created
from the safe base 128c2a2 and replayed mount-sinai-wayback.html
in its sanitized form, no commit on this branch ever held the
secret in any blob.

Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>"
```

### C-6. Append branch_history_remediation_plan to incident folder (this file)

This file must be present on the clean branch. It can land in the same security commit as C-5 (preferred) or a small follow-up commit.

### C-7. Final verification

```sh
git log --oneline 128c2a2..HEAD                                 # 2 commits expected
git log --all --pretty=format:'%H' | while read sha; do
  git show --format='' "$sha" 2>/dev/null | grep -q 'AIza' && \
    echo "DIRTY: $sha"
done                                                            # contaminated branch still listed (until deleted)
git show --format='' HEAD~1 | grep -c 'AIza'                    # expected 0
git show --format='' HEAD   | grep -c 'AIza'                    # expected 0
npx tsx scripts/validate-no-secrets.ts                          # PASS
npx tsc --noEmit                                                # PASS
```

### C-8. Push clean branch (REQUIRES EXPLICIT USER "PUSH" AUTHORIZATION)

```sh
git push -u origin local/p97-discovery-integrity-guardrails-clean
```

After push, user verifies on github.com that the new branch is secret-clean.

### C-9. Delete compromised remote branch (REQUIRES EXPLICIT USER "DELETE BRANCH" AUTHORIZATION)

```sh
git push origin --delete local/p97-discovery-integrity-guardrails
git branch -D local/p97-discovery-integrity-guardrails   # local cleanup, optional
```

Note: even after remote branch deletion, the contaminated commits remain reachable via reflog/object store on GitHub for some time. To accelerate purge, the user can additionally:

- Open a GitHub support request to expire the cached objects.
- Run `git gc --prune=now` on a fresh clone (does not affect the remote).

### C-10. Restore unrelated dirty files

```sh
git switch local/p97-discovery-integrity-guardrails-clean   # already there
git stash pop                                               # restore .claude/launch.json + public-listings dirty diffs
```

These remain unstaged and out of scope.

### C-11. Mark GitHub secret-scanning alert resolved

User action only — done in the GitHub UI, on github.com, after the compromised branch is deleted and the alert no longer references a live commit.

## 7. Authorization gates

| Gate | Required user input |
|------|---------------------|
| C-8 push of clean branch | User types "push" |
| C-9 delete of compromised remote branch | User types "delete branch" or equivalent explicit instruction |
| Strategy B switch (if user prefers force-push instead of new branch) | User types "force-push" with explicit branch name |

Until those inputs arrive, no remote operation will be executed.

## 8. Rollback

If anything goes wrong during local replay, the safety tag from C-1 (`security/contaminated-before-cleanup-2026-05-10`) lets us reset back to `3382d4d`:

```sh
git switch local/p97-discovery-integrity-guardrails
git reset --hard security/contaminated-before-cleanup-2026-05-10
```

Production main is never touched in any of these flows.

## 9. Why not Strategy B (force-push the same branch name)

Strategy B is operationally equivalent in safety once the secret is rewritten out of the tree, and it preserves the branch name. The only reason to prefer Strategy C is the explicit "we never `--force` on a public branch" discipline, which:

- removes a human-error surface (mis-typing `--force-with-lease` to a wrong branch),
- gives the user a brief window to compare old-branch vs new-branch on GitHub before deletion,
- documents the rewrite as two visible operations (push new, delete old) instead of one in-place rewrite.

If the user instead prefers Strategy B, the steps are mechanically the same as C-1 through C-5 except step C-3 becomes a `git checkout --orphan` or interactive rebase replacing `8509729b…` and `3382d4db…`, followed by `git push --force-with-lease origin local/p97-discovery-integrity-guardrails`. No deletion needed.
