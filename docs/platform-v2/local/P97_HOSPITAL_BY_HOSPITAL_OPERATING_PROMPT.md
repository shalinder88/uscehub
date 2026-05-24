# P97 Hospital-by-Hospital Operating Prompt

**This is the only prompt to use for P97 discovery work going forward.**

The agent never declares completion in prose. The validator decides
completion. The agent quotes the validator output.

## Operating loop

```
For each STATE in priority order:
  Replace any __seed__ county placeholder with the real county list.
  For each COUNTY (alphabetical):
    For each INSTITUTION in the county institution inventory:
      Open the official homepage.
      Open Education / Medical Education / Clinical Education hubs.
      Open GME page (or document gmeAbsentReason).
      Open UME / Medical Student page (or document umeAbsentReason).
      Open visiting-student / elective / observership / clerkship pages.
      Open department pages and residency program medical-student pages
        for any teaching hospital with named ACGME residencies.
      Try institution internal site search (or document internalSearchAbsentReason).
      Try site:<domain> search for the required core terms.
      Log every lead in the appropriate CSV
        (candidate / rejected / duplicate / not-found / blocked).
      Write the institution packet at
        docs/platform-v2/local/p97-institution-packets/<STATE>/<COUNTY>/<institution-slug>.json.
      Run validator on the county.
      If validator fails: fix the packet. Do not move to the next institution.
      If validator passes for that institution: continue to the next institution.
    After every institution in the county has a packet, run:
      npx tsx scripts/p97-validate-discovery.ts --county "<STATE>:<COUNTY>"
    If county validates: county becomes VALIDATED_COMPLETE.
    If county fails: mark PARTIAL_NEEDS_RESUME with nextRequiredAction.
  After every county in the state validates, run:
      npx tsx scripts/p97-validate-discovery.ts --state <STATE>
  If state validates: state becomes VALIDATED_COMPLETE.
  Write state report.
  Update national rollup.
  Commit.
```

## Per-hospital format the agent must use

When working on a single hospital, the agent uses this exact narration
template (so the user can audit each step):

```
STATE: <full name>
STATE_ABBR: <2 letters>
COUNTY: <county>
INSTITUTION: <name as in CSV>
INSTITUTION INDEX IN COUNTY: <number>
START STATUS: NOT_STARTED | IN_PROGRESS | PARTIAL_NEEDS_RESUME

Pages opened:
1. <url>
2. <url>
3. <url>
... (every URL explicitly)

Search terms tried:
1. <term>
2. <term>
3. <term>
... (every term explicitly)

Education tree checked:
GME: <url or "absent: <reason>">
UME: <url or "absent: <reason>">
Medical students: <url or "absent: <reason>">
Visiting students: <url or "absent: <reason>">
Observership: <url or "absent: <reason>">
Electives: <url or "absent: <reason>">
Residency program pages: <list or "absent: <reason>">
Department pages: <list or "absent: <reason>">
International office: <url or "absent: <reason>">

Candidate found: <list of candidate URLs or "none">
Rejected/non-target: <list or "none">
Duplicate: <list or "none">
Blocked: <list or "none">
Not found: <yes/no — if yes, reason>

Packet written: <path>
Validator result: <PASS / FAIL with errors copy-pasted>
Next institution: <name or "all institutions in county done; running county validator">
```

## Hard rules

- One county at a time.
- One institution at a time.
- Create packet before moving on.
- Validator after every institution.
- Validator after every county.
- Validator after every state.
- No county becomes `VALIDATED_COMPLETE` without validator PASS.
- No state becomes `VALIDATED_COMPLETE` without validator PASS.
- If context runs out mid-county, mark `PARTIAL_NEEDS_RESUME` with the
  exact next institution slug in `nextRequiredAction`.
- The final session report must include validator output verbatim.

## Forbidden words

The agent may not write the following in any P97 deliverable unless
quoting validator output:

- "complete"
- "done"
- "finished"
- "all hospitals searched"
- "all counties searched"
- "state completed"
- "100%"

The validator's exact label `VALIDATED_COMPLETE` is the only way to
indicate completion, and only after running the validator.

## Forbidden shortcuts

- Bulk-classifying multi-county sub-locations as "umbrella sub-locations"
  without writing each sub-location's own packet.
- One web search per institution.
- Flagship-only state coverage.
- Marking a county COMPLETE based on prose narrative or CSV row alone.
- Skipping a hospital in the county institution inventory.

## Resume contract

Every commit message must answer four questions:

1. Which state/county/institution did this commit address?
2. What is the validator output (`--county` or `--state`)?
3. What is the next institution slug to work on?
4. Are all hard rules confirmed (no push, no DB mutation, etc.)?

If the validator fails after a commit, the next commit must fix the
failure before any new institution is added.

## Where the validator lives

```
scripts/p97-validate-discovery.ts
```

CLI:

```bash
cd /Users/shelly/usmle-platform
npx tsx scripts/p97-validate-discovery.ts --status
npx tsx scripts/p97-validate-discovery.ts --county "ME:Cumberland"
npx tsx scripts/p97-validate-discovery.ts --state ME
npx tsx scripts/p97-validate-discovery.ts --all
```

Output:
- Console exit code: 0 = pass, 1 = fail
- `docs/platform-v2/local/P97_DISCOVERY_VALIDATION_REPORT.md` (human)
- `docs/platform-v2/local/p97_validation_results.json` (machine)
