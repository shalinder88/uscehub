# P97 Institution Packets

One packet per institution. No packet = the institution was not searched.

## Path

```
docs/platform-v2/local/p97-institution-packets/<STATE_ABBR>/<COUNTY>/<institution-slug>.json
```

`<institution-slug>` is lowercase kebab-case of the institution name with
parent-system disambiguation when needed:

```
maine-medical-center-mainehealth.json
dartmouth-hitchcock-medical-center.json
yale-school-of-medicine.json
hospital-of-the-university-of-pennsylvania.json
```

## Rules

- **No packet = not searched.** A county cannot reach
  `VALIDATED_COMPLETE` until every institution named in the county's
  institution inventory has a packet.
- **Packet incomplete = county cannot complete.** Every required field
  in `TEMPLATE.json` must be filled.
- **Empty array / empty string is acceptable** when explicitly meaningful
  (e.g. a non-teaching hospital with no GME page → `gmePagesOpened: []`
  AND `gmeAbsentReason: "Hospital has no GME / not a teaching hospital;
  no GME page exists on the official site."`).
- **Forbidden words in `evidenceSummary`** unless paired with
  `umbrellaEvidenceUrl` AND `subLocationApplicabilityChecked = true`:
  - "umbrella sub-location"
  - "rolls up"
  - "parent covers"
  - "system-wide assumed"

## Health-system umbrella handling

When a sub-location's visiting MS path goes through a parent-system
program (e.g. an UMass Health Network community hospital → UMass Chan
central program), the sub-location packet must:

1. Set `parentSystemIfAny` to the parent system name.
2. Set `umbrellaEvidenceUrl` to a parent-system page that explicitly
   lists the sub-location as a participating site, OR set it to the
   sub-location's own page that links / redirects to the parent program.
3. Set `subLocationApplicabilityChecked = true`.
4. State in `evidenceSummary` which umbrella program applies and the
   evidence path.
5. **Still record** which sub-location pages were searched independently
   (homepage, careers, GME, internal search) — at minimum to confirm the
   sub-location does not have its own visiting MS / observership program
   beyond the umbrella.

## No-opportunity handling

If an institution has no candidate USCE program after a thorough search:

1. `searchStatus = SEARCHED_NONE_FOUND`.
2. `notFoundLogged = true`.
3. The corresponding row in `p97_not_found_after_search.csv` records:
   institution, official website, institution type, search terms tried,
   pages opened, reason, searched-at timestamp.
4. `noOpportunityReason` field in the packet states the reason in plain
   English.
5. `evidenceSummary` confirms the search depth.

## Blocked / login-required handling

If the institution's official site requires login, hits a CAPTCHA wall,
or otherwise blocks search:

1. `searchStatus = BLOCKED`.
2. `blockedLogged = true`.
3. The corresponding row in `p97_blocked_or_login_required.csv` records
   institution, URL, blocker type, search term, recommended next step.
4. The county's `validationStatus` may still reach
   `VALIDATED_COMPLETE` if all other institutions are validated, but
   this institution is flagged in the validator output as needing user
   review.

## How parent academic medical centers are handled

A flagship academic medical center gets its own packet with full search
depth (e.g. `maine-medical-center-mainehealth.json`). This packet may
list the parent program as the canonical visiting MS path. Sub-location
hospitals (community hospitals in other counties) get their own packets
that reference the flagship via `umbrellaEvidenceUrl`.

## Validator workflow

```bash
cd /Users/shelly/usmle-platform
# Validate one county
npx tsx scripts/p97-validate-discovery.ts --county "ME:Cumberland"
# Validate one state
npx tsx scripts/p97-validate-discovery.ts --state ME
# Validate everything
npx tsx scripts/p97-validate-discovery.ts --all
# Status summary
npx tsx scripts/p97-validate-discovery.ts --status
```

The validator writes:
- `docs/platform-v2/local/P97_DISCOVERY_VALIDATION_REPORT.md`
  (human-readable)
- `docs/platform-v2/local/p97_validation_results.json`
  (machine-readable, used by other tools)

A county or state is `VALIDATED_COMPLETE` only when the validator
returns PASS and the agent quotes that label.

## Self-audit reminder

Every packet ends with `reviewerSelfAudit`, a one-line attestation that
the agent confirms each required field was honestly captured. If the
self-audit cannot honestly say "all required fields captured," the
packet is not done.
