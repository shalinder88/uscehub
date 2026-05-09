# Batch 3 — Evidence Action Queue Reconciliation

**Date:** 2026-05-09
**Sprint:** P99-P97-BATCH-3-EVIDENCE-LANDING-AND-QUEUE-RECONCILIATION-1
**Question answered:** Where does the canonical `p99_p97_first_pilot_evidence_action_queue_1.csv` live?

---

## 1. Search results

### Mac-local repo (`/Users/shelly/usmle-platform`)
- **Result:** `p99_p97_first_pilot_evidence_action_queue_1.csv` is **NOT present**.
- Searched: `find docs -type f` filtered for `evidence_action_queue|action_queue|curator_review|first_pilot_(selected|candidate|human|evidence)` → **0 matches**.
- Other expected matrix CSVs also absent on Mac-local (`p99_p97_first_pilot_selected_rows.csv`, `p99_p97_first_pilot_candidate_pool.csv`, `p99_p97_first_pilot_mini_curator_reaudit_*_matrix.csv`).

### T7 active lane (`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02`)
- **Result:** `p99_p97_first_pilot_evidence_action_queue_1.csv` **EXISTS**.
- Path: `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02/docs/platform-v2/local/usce-completeness/p99_p97_first_pilot_evidence_action_queue_1.csv`
- Size: 13 lines (header + 12 rows for `pilot-001`..`pilot-012`).
- Sibling files also present: `p99_p97_first_pilot_selected_rows.csv`, `p99_p97_first_pilot_candidate_pool.csv`, `p99_p97_first_pilot_human_curator_review_1_matrix.csv`, `p99_p97_first_pilot_mini_curator_reaudit_4_matrix.csv`, `p99_p97_first_pilot_mini_curator_reaudit_5_matrix.csv`, `p99_p97_first_pilot_human_curator_approved_bridge_input_DRAFT.csv`.
- Sibling sprint dir: `first-pilot-evidence-landing-sprint-2/` (so this is a recurring sprint pattern from the T7 lane that wasn't transplanted to Mac-local).

## 2. Canonical row IDs from T7 queue (Batch 3 rows)

| pilot_selection_id | candidate_rank | institution | T7 source URL | T7 curator status |
|--------------------|----------------|-------------|---------------|--------------------|
| `pilot-009` | 173 | Manatee Memorial Hospital, FL | `https://manateememorial.com/graduate-medical-education/` | `NEEDS_SOURCE_CAPTURE_BATCH_3` |
| `pilot-010` | 109 | University Hospital San Antonio, TX | `https://uthscsa.edu/medicine/education/ume/student-affairs/student-electives` | `NEEDS_SOURCE_CAPTURE_BATCH_3` |
| `pilot-011` | 153 | UPMC Western Psychiatric, PA | `https://www.medstudentaffairs.pitt.edu/visiting-students` | `NEEDS_SOURCE_CAPTURE_BATCH_3` |
| `pilot-012` | 185 | Lincoln Medical and Mental Health Center, NY | `https://www.lincolnemergencymedicine.com/medical-students` | `NEEDS_SOURCE_CAPTURE_BATCH_3` |

**Important divergences from this sprint's Batch 3 capture:**

1. **UH San Antonio** — T7 queue specifies `uthscsa.edu/medicine/...student-electives` (UT Health med school). Batch 3 captured `universityhealth.com/healthcare-professionals/student-placement/affiliation-agreements` (the affiliated hospital). Both are relevant but for different angles. **NOT a Batch 3-evidence-landing scope row** (out of scope this sprint).

2. **Lincoln** — T7 queue specifies the EM-residency-department source (`lincolnemergencymedicine.com`). Batch 3 captured the system-level MOSAIC source. **Both should be preserved as complementary evidence** — this sprint landed both.

3. **UPMC** — T7 queue specifies the Pitt SOM Office of Student Affairs parent visiting-students page. Batch 3 captured the parent + the international subpage. **All three pages preserved as complementary evidence** in this sprint.

## 3. Recommendation for canonical source of truth

**Do NOT copy the T7 queue file into Mac-local in this sprint.** Reasons:

1. T7 lane is a parallel branch with its own commit history; blindly importing CSVs without the matching matrices and sprint dirs would leave Mac-local with orphan files referencing matrices that don't exist locally.
2. Mac-local is on `local/p97-discovery-integrity-guardrails` which descends from a separate ancestry; the canonical pilot runtime here is the 5-card noindex micro-pilot.
3. The user's standing rule is to keep T7 as cold storage / never source-of-truth.

**Preferred path:** the curator's next re-audit sprint (`P99-P97-FIRST-PILOT-MINI-CURATOR-REAUDIT-6`) should:
- Read the T7 queue file as advisory input,
- Produce a Mac-local matrix file scoped to the ready rows (`pilot-011`, `pilot-012`),
- NOT mutate runtime, NOT promote to bridge input.

**This sprint's contribution to queue reconciliation:** captures canonical `pilot_selection_id` values (`pilot-011`, `pilot-012`) in our manifest + matrix CSVs so the curator can join against either lane's queue without translation.

## 4. Single-source-of-truth recommendation (deferred)

A future ops-cleanup sprint should decide:
- **Option A:** transplant `p99_p97_first_pilot_evidence_action_queue_1.csv` (and the related matrix CSVs) into Mac-local under `docs/platform-v2/local/usce-completeness/`, with appropriate provenance notes.
- **Option B:** leave T7 as canonical for these matrix files and treat Mac-local sprint dirs as delta-only artifacts.
- **Option C:** rebuild a fresh queue from current evidence, retiring the T7 lineage.

Out of scope here. **No copying performed in this sprint.**

## 5. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No T7 file copied into Mac-local | CONFIRMED — read-only inspection only |
| No queue file mutated (Mac-local or T7) | CONFIRMED |
| No bridge input changes | CONFIRMED |
| No runtime / route / UI changes | CONFIRMED |
| No production touch | CONFIRMED |
