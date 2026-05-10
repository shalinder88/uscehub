# History cleanup — three options

The redacted commit will fix the working tree but a normal forward commit does **not** remove the secret from git history at `8509729b94c1cba9a7dc6efb47a1785cfca3d134`. GitHub secret scanning scans branch history. The commit is currently on:

- `local/p97-discovery-integrity-guardrails` (local)
- `origin/local/p97-discovery-integrity-guardrails` (pushed, public)

Production `main` (`739ab1e2…`) does NOT contain the commit.

## Strategy 1 — Rotate key + sanitize current tree + accept residual history (RECOMMENDED)

**Steps:**
1. User rotates/deletes the Google API key in Google Cloud Console (manual).
2. We commit the working-tree redaction + secret validator (already prepared in this sprint).
3. User authorizes a normal `git push` of the sanitized commit.
4. User marks the GitHub secret-scanning alert as **resolved → revoked** (the GitHub UI lets you mark this even if the secret remains in history; the alert closes once the credential is dead).

**Pros:**
- Lowest-risk operation. No history rewrite.
- Preview branch keeps a stable commit graph that other people may have referenced.
- Production `main` is untouched and stays untouched.

**Cons:**
- The (now-dead) key value still exists in `8509729` blobs. Cosmetic only — the credential is revoked.

**This is the recommended path.** The leaked key is a third-party Mount Sinai HTTP-referrer-restricted key, not a USCEHub credential. Once revoked it is harmless. Force-pushing a public preview branch is a higher-risk operation than the residual-history cosmetic problem it solves.

---

## Strategy 2 — Force-push sanitized branch history

**Steps:**
1. User confirms key rotation.
2. We use `git filter-repo` (or `git rebase --root` + manual edit) to rewrite commit `8509729` so the Mount Sinai HTML in that commit is the redacted version.
3. New commit chain replaces the old one.
4. We `git push --force-with-lease origin local/p97-discovery-integrity-guardrails`.
5. User marks the GitHub alert resolved.

**Pros:**
- Removes the secret from branch history entirely.
- Cleanest end state.

**Cons:**
- Destructive. Anyone with the old SHA loses the link.
- Requires explicit user-typed authorization per standing rules ("Push" means the user types it).
- `git filter-repo` is an external tool; not currently installed. Alternative: `git rebase --root` + manual file edit + force-push.
- Risk of accidentally rewriting `main` if commands are mistyped — must use branch-scoped commands only.

**Authorization gate:** I will not execute Strategy 2 without an explicit instruction from the user that names the branch and uses the word "push" / "force-push".

---

## Strategy 3 — Delete the affected branch entirely

**Steps:**
1. User confirms key rotation.
2. We create a new branch off the last clean commit (`128c2a2 P97: curate promotion batch three candidates`) and replay the sanitized evidence-hardening work as one new commit.
3. We push the new branch.
4. We delete the remote `local/p97-discovery-integrity-guardrails` branch.
5. User marks the GitHub alert resolved.

**Pros:**
- Removes the secret from the visible branch graph without rewriting an existing branch.
- Slightly safer than Strategy 2 because we never use `--force` on the old branch — we just delete it.

**Cons:**
- The bad commit still exists in the repo's reflog / object store on GitHub for some time.
- Anyone with the old branch name loses it.
- More work (replay all 60+ commits cleanly, or accept that the new branch starts from `128c2a2`).

---

## Recommendation

**Strategy 1.** Once the key is rotated by the user, the residual history is cosmetic. Production main is uninvolved. We add the secret validator going forward to prevent recurrence. If the user later wants Strategy 2, it can be done as a dedicated, named sprint with explicit force-push authorization.

## Authorization required from user before any push

A push of any kind from this incident response requires the user to:

1. Confirm the Google API key has been revoked or rotated.
2. Type the word "push" in chat (per standing global rule).

Without both, the work stays local.
