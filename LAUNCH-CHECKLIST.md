# USCEHub Phase 2/3 Launch Checklist

## P0 — Do These FIRST on Launch Day

1. **Remove `robots: noindex` from career layout**
   - File: `src/app/career/layout.tsx` lines 36-39
   - Remove the entire `robots: { index: false, follow: false }` block
   - This currently blocks ALL 32 career pages from Google

2. **Remove `robots: noindex` from residency layout**
   - File: `src/app/residency/layout.tsx` lines 17-20
   - Remove the entire `robots: { index: false, follow: false }` block
   - This currently blocks ALL 13 residency pages from Google

3. **Submit updated sitemap to Google Search Console**
   - Go to https://search.google.com/search-console
   - Submit https://uscehub.com/sitemap.xml
   - Request indexing for key pages: /career, /career/waiver, /career/visa-bulletin

## P1 — Do These Same Day

4. Add OpenGraph tags to 9 pages missing them (attorneys, contract, employers, greencard, h1b, h4-spouse, jobs, licensing, post-match)

5. Verify all 500+ sitemap URLs resolve correctly

## P2 — Do Within First Week

6. Add JSON-LD structured data to 29 pages missing it
7. Add VerifiedBadge to 11 pages missing verification timestamps
8. Cross-link state-compare and compare-states tools
9. Build content for top 5 gaps: OPT guide, burnout during waiver, employer breach guide

## Notes
- Phase 1 (USCE) is live and unaffected
- Phase 2/3 are currently hidden from search engines via noindex
- The noindex is INTENTIONAL until launch day
