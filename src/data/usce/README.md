# src/data/usce — generated public runtime data

Files in this directory are **generated** from reviewed, public-safe USCE source data.

## Rules

- **Do not edit generated files manually.** They are overwritten by the promotion script.
- **Raw and internal datasets stay in `docs/platform-v2/local/`** — they are never imported here.
- NPPES and CMS data are used only as identity-support evidence during source review; they are
  never promoted into this directory or exposed as public product data.
- AAMC, ACGME, NRMP raw data are never public and never appear here.
- Internal scoring fields (`completeness_score`, `max_possible_score`) are never promoted.
- `identity_status` (e.g. `NPPES_ONLY_CAMPUS_MATCH`) is stripped before promotion.

## How to regenerate

```
npx tsx scripts/usce-data/promote-reviewed-usce-data.ts
```

The script reads:
```
docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json
```

It writes:
```
src/data/usce/public-listings.generated.json
src/data/usce/public-listings.generated.ts
```

## Hard gates (enforced by promotion script + validator)

- Only `READY_PUBLIC_IMG_RELEVANT` and `READY_PUBLIC_US_STUDENT_ONLY` cards are promoted.
- `NEEDS_REVIEW`, `SUPPORTING_SOURCE_ONLY`, and `POLICY_HUB` opportunity cards are always withheld.
- Forbidden field scan rejects any card containing NPI, CCN, CMS, NPPES, AAMC, NRMP, ACGME, NUCC,
  or internal score fields.
- Expected counts: 12 public (7 IMG-relevant + 5 US MD/DO-only).

## Files

| File | Contents |
|------|----------|
| `public-listings.generated.json` | JSON array of promoted public cards |
| `public-listings.generated.ts` | TypeScript export of the same cards, typed as `UsceCard[]` |
