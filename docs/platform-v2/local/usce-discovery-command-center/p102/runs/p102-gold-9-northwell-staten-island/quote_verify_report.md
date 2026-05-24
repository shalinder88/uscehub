# Quote verify report — p102-gold-9-northwell-staten-island

- total claims:       95
- failures:           0
- OK: 93
- VISIBILITY_DRIFT_MODEL_STRICTER: 2


## Informational: model-stricter visibility drift

2 claim(s) where the model recorded a visibility equal-or-stricter than the deterministic re-classifier would emit. This is not a public-safety failure — the model used additional context (e.g. campus-level scope mismatch on a parent-system page) to hide the claim.

- c_42_a2_001 → recorded "HIDDEN_REJECTED" is equal-or-stricter than re-classifier "PUBLIC_SAFE_USCE" (model used additional context to hide; not a public-safety risk)
- a2_c1 → recorded "HIDDEN_REJECTED" is equal-or-stricter than re-classifier "PUBLIC_SAFE_USCE" (model used additional context to hide; not a public-safety risk)