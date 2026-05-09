# Curator PNG Policy Decision — Mini Re-audit 6

**Date:** 2026-05-09
**Sprint:** P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6
**Question:** What level of evidence triple is required at each promotion gate?

---

## 1. Evidence-triple definition (USCEHub policy)

For curator-grade evidence, a **Tier-A evidence triple** is:

1. Live source URL (HTTP-200 verified at capture time).
2. Persistent textual snapshot in repo (HTML or quoted text).
3. Wayback archive URL (HTTP-200 verified).
4. Verbatim source quote ≤280 chars per claim, embedded in a manifest CSV.

A **Tier-A+ evidence triple** adds:

5. Persistent PNG screenshot in repo, named to match the row, showing the page title and the relevant text in-frame.

## 2. Decision per gate

### Gate 1 — DRAFT bridge input (curator approval to draft)
**PNG required: NO.** Tier-A evidence is sufficient.

Rationale: The DRAFT artifact is an internal curator-approved candidate set. It is not runtime, not public, not indexed, not listed. The textual claims are fully supported by Tier-A evidence. PNGs add visual rendering but do not change what claims the source supports. Requiring PNG at this gate would block the DRAFT on a tooling limitation (Chrome MCP runtime cannot persist PNG to repo) rather than on a source-quality issue.

Both `pilot-011` and `pilot-012` enter the DRAFT under this gate today.

### Gate 2 — Bridge-input validation
**PNG required: NO.** Tier-A evidence is sufficient.

Rationale: Bridge-input validation is a schema/safety check on the DRAFT (banned phrases, internal-field leakage, audience consistency, evidence-triple completeness check at the **Tier-A** level). It does not produce runtime data; it gates whether the DRAFT can advance to runtime preparation.

### Gate 3 — Runtime preparation / generation
**PNG required: YES (or explicit documented curator waiver).**

Rationale: Runtime data feeds the rendered card on `/clerkships/pilot`. Public copy is one click away from being shown to a real applicant (even behind noindex preview gates). At this gate, USCEHub's standing reproducibility-and-trust policy applies: a future reviewer or auditor must be able to inspect the source as it appeared at curation time. Tier-A+ provides a visually verifiable receipt that protects against:
- Source-page rewrites that change the textual claims while the URL stays the same (Wayback covers this for HTTP-fetchable text but does not preserve dynamic-rendered visuals).
- JS-only or accordion-collapsed sections (e.g. MOSAIC eligibility was hidden behind an expand button — only an in-frame screenshot of the expanded state proves the curator saw the eligibility text).
- Off-screen disclaimers that the textual fetch may have missed.

If a row has Tier-A but not Tier-A+, the curator may sign an explicit waiver in this same file naming the row, the source URL, the Wayback timestamp, and a one-sentence rationale. The waiver becomes the auditable artifact.

### Gate 4 — Production deploy
**PNG required: YES (or explicit documented production-tier waiver).**

Rationale: Same as Gate 3, plus production exposure. A production waiver requires double sign-off (curator + product owner) and is more restrictive than a runtime waiver.

## 3. Manual PNG capture procedure (when required)

Public sources, no login, no contact form, no payment. Conservative steps:

1. Open the source URL in any logged-out Chrome / Firefox / Safari.
2. Decline cookie/consent banners (privacy-preserving default).
3. Expand any collapsed eligibility / fees / application sections (e.g. accordions on MOSAIC).
4. macOS native full-page capture: `Cmd+Shift+5` → "Capture Selected Window" or use the browser's devtools full-page screenshot:
   - Chrome devtools → Cmd-Shift-P → "Capture full size screenshot".
   - Firefox: right-click → "Take Screenshot" → "Save full page".
5. Save under `docs/platform-v2/local/usce-completeness/<sprint>/screenshots/` with the row-canonical name from the manifest.
6. Record the actual file path + size in the manifest.
7. Re-run the runtime validator. PNG-presence is not enforced by current validators but should be added to a future validator pass.

## 4. Today's decision

| Row | Today's gate | Curator status | PNG decision today | Future PNG required at |
|-----|---------------|----------------|--------------------|--------------------------|
| `pilot-011` UPMC Western Psychiatric | Gate 1 (DRAFT) | `APPROVED_WITH_PUBLIC_COPY_CARVEOUT` | **WAIVED FOR DRAFT** — Tier-A sufficient | Gate 3 (runtime preparation) — must be captured manually OR explicitly waived |
| `pilot-012` Lincoln Medical | Gate 1 (DRAFT) | `APPROVED_WITH_PUBLIC_COPY_CARVEOUT` | **WAIVED FOR DRAFT** — Tier-A sufficient | Gate 3 (runtime preparation) — must be captured manually OR explicitly waived |

## 5. Operational consequence

- **Next step that does NOT need PNG:** `P99-P97-BRIDGE-INPUT-VALIDATION-BATCH-2` (validate the DRAFT against bridge schema + banned-phrase + audience-consistency + evidence-triple-Tier-A checks).
- **Next step that DOES need PNG (or waiver):** `P99-P97-MANUAL-PNG-LANDING-1` followed by runtime preparation. Either order is acceptable; the user/curator may choose to do PNG-landing first or bridge-input validation first.

## 6. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No row promoted to runtime today | CONFIRMED |
| No row marked PUBLIC_NOW | CONFIRMED |
| No row marked IMPORT_READY | CONFIRMED |
| No PNG fabricated | CONFIRMED |
| No Wayback URL fabricated | CONFIRMED |
| Tier-A evidence verified | CONFIRMED |
| DRAFT artifact is internal-only | CONFIRMED |
| Production untouched | CONFIRMED |
