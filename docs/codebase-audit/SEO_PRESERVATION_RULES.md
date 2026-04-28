# SEO Preservation Rules

USCEHub's existing SEO asset must be protected during cleanup, redesign, and feature work.

## Core rule

Do not sacrifice indexability while improving trust.

USCEHub stays live. Public content remains crawlable. Trust fixes happen through better labels, source links, verification dates, methodology, and reporting tools — not through shutdown, hard gates, or route removal.

## Protected public surfaces

These must remain live and crawlable unless explicitly approved:

- homepage
- browse/listing pages
- listing detail pages
- observership/state/specialty pages
- blog
- IMG resources
- tools
- methodology
- for institutions
- `/career` and future Career Path pages
- future Match Prep and fellowship pages once launched

## Forbidden without explicit approval

- deleting public routes
- renaming public routes
- changing slugs
- adding login walls to public content
- adding noindex
- blocking public pages in robots.txt
- removing sitemap entries for live pages
- removing canonical tags
- removing metadata
- removing JSON-LD
- deleting internal links
- splitting to a new domain
- taking the full domain offline

## If a URL must change

Required:

1. document old URL
2. document new URL
3. add 301 redirect
4. update sitemap
5. update internal links
6. update canonical URL
7. verify build
8. verify no orphaned links

## Controlled live mode

Allowed:

- change "Apply Now" to "View Official Source"
- add listing-page disclaimer
- add last verified date
- add source link
- add report broken link
- mark listing as reverifying
- hide only specific proven-bad listings

Not allowed:

- disable whole site
- hard-gate listings
- deindex directory
- remove large route groups because some links need verification

## SEO change log

Any PR that changes routes, metadata, sitemap, robots, canonical URLs, internal link structure, or page indexability must add a section to its final report:

```
SEO impact:
- URLs changed:
- redirects added:
- sitemap changed:
- robots changed:
- canonical changed:
- metadata changed:
- JSON-LD changed:
- pages noindexed:
- internal links changed:
- risk level:
```

## Cross-references

- [RULES.md](RULES.md) — overall preservation, deletion, git safety, and `/career` hard protection list. **Higher authority than this document if there is a conflict.**
- [USCEHUB_MASTER_BLUEPRINT.md](USCEHUB_MASTER_BLUEPRINT.md) — strategic product direction (audience, channel framing, four-lane future architecture).
- [CLEANUP_PLAN.md](CLEANUP_PLAN.md) — staged Phase 0 cleanup PR sequence.
