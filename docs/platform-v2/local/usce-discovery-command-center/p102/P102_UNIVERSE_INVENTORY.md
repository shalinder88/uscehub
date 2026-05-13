# P102 Universe Inventory

_Generated: 2026-05-13T12:40:39.482Z. Pure data transform from P101 packets + P102 runs. No network._

## National baseline (reference; not authoritative)

| Category | Approximate count |
|---|---:|
| Acute-care hospitals (AHA 2024) | 5180 |
| Teaching hospitals (ACGME) | 1100 |
| Academic medical centers (AAMC) | 180 |
| Children's hospitals | 220 |
| **Total estimated USCE-relevant** | **6000** |

## Current coverage

| Metric | Value | % of estimated USCE-relevant |
|---|---:|---:|
| Institutions tracked (P101 ∪ P102) | 56 | 0.93% |
| With P101 enhanced packets | 55 | 0.92% |
| With P102 A0+ runs | 4 | 0.07% |
| With ≥1 quote-verified claim | 3 | 0.05% |
| With ≥1 PUBLIC_SAFE_USCE | 0 | 0.00% |

Total claims emitted: 65
Total PUBLIC_SAFE_USCE claims: 0

## Coverage by state

| State | Institutions tracked |
|---|---:|
| AL | 1 |
| AR | 1 |
| CA | 8 |
| CT | 3 |
| DC | 3 |
| FL | 6 |
| GA | 1 |
| IL | 3 |
| IN | 2 |
| MA | 5 |
| MI | 4 |
| MO | 1 |
| NY | 9 |
| PA | 4 |
| TN | 1 |
| TX | 3 |
| WA | 1 |

## Coverage by parent system

| Parent system | Institutions tracked |
|---|---:|
| (standalone) | 54 |
| Hartford HealthCare | 1 |
| AdventHealth | 1 |

## Gap analysis

- Untouched institutions (estimate): 5944 (~99% of the universe)
- Institutions still needing a PUBLIC_SAFE_USCE outcome: 6000

**To close the gap:** P102-0D model reader is the blocker. Once online, the runner scales to one-institution-per-batch with sub-hour wall time per institution.
