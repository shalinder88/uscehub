# Quote verify report — p102-pc-7-uab

- total claims:       68
- failures:           0
- OK: 65
- NOT_STATED_FIELD_OK: 2
- VISIBILITY_DRIFT_MODEL_STRICTER: 1


## Informational: model-stricter visibility drift

1 claim(s) where the model recorded a visibility equal-or-stricter than the deterministic re-classifier would emit. This is not a public-safety failure — the model used additional context (e.g. campus-level scope mismatch on a parent-system page) to hide the claim.

- c_uab_intl_med_ed_outbound_uab_students → recorded "HIDDEN_REJECTED" is equal-or-stricter than re-classifier "PUBLIC_SAFE_USCE" (model used additional context to hide; not a public-safety risk)