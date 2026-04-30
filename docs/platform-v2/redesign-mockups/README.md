# USCEHub Homepage Redesign — Mockup Gallery

Local-only research mockups. **No production deploy. No SEO impact. No build step required.**

These are static HTML files you can open directly in any browser. Each mockup is a self-contained homepage variant exploring a different design hybrid.

## How to view

### Option 1 — Open one at a time in your browser

```bash
cd /Users/shelly/usmle-platform/docs/platform-v2/redesign-mockups
open index.html
```

The `index.html` gallery links to all 22 mockups in a comparison grid. Click any thumbnail to open the full variant.

### Option 2 — One-line local server (better cross-browser, no `file://` security warnings)

```bash
cd /Users/shelly/usmle-platform/docs/platform-v2/redesign-mockups
python3 -m http.server 8765
# then open http://localhost:8765 in any browser
```

Local-only, no Vercel build, no production cost.

### Option 3 — Open one specific mockup directly

```bash
open /Users/shelly/usmle-platform/docs/platform-v2/redesign-mockups/01-mayo-stripe-recommended.html
open /Users/shelly/usmle-platform/docs/platform-v2/redesign-mockups/05-stripe-press-editorial.html
# etc.
```

## What's in each mockup

Every mockup uses **identical content** (same headline, same listing examples, same trust strip text) so you compare **design**, not copy. The differences are:

- Typography stack (serif vs sans vs mono accents)
- Color palette + accent strategy
- Spacing density
- Hero layout (centered / left / split / photo-bottom)
- Trust strip treatment
- Listing card pattern
- Section rhythm

## File index (22 mockups)

| # | File | Direction | What's distinctive |
|---|---|---|---|
| 00 | `00-baseline-uscehub-current.html` | Current state | Approximate re-creation of live uscehub.com homepage for direct comparison |
| **01** | **`01-mayo-stripe-recommended.html`** | **★ Recommended hybrid** | Mayo serif gravitas + Stripe restraint + GOV.UK accessibility + Sasanova verified-numbers |
| 02 | `02-linear-edge.html` | Linear precision | Mono ID ribbons, tight density, sharp typography (light theme) |
| 03 | `03-govuk-clean.html` | GOV.UK extreme minimal | Pure white, search-led hero, intermediate reading level |
| 04 | `04-sasanova-numbers.html` | Sasanova verified-numbers | Numeric specificity above the fold, comparison-table feel |
| 05 | `05-stripe-press-editorial.html` | Stripe Press editorial | Serif body, inventory-list rows, library aesthetic |
| 06 | `06-airbnb-photo.html` | Airbnb photo-driven | Photo-dominant cards, calm-curated palette, mobile-phone-screen-first |
| 07 | `07-zocdoc-clinical.html` | Zocdoc medical directory | Three-signal cards, sub-rating chips, clinical white |
| 08 | `08-vercel-tech.html` | Vercel tech precision | Dark/light dual mode, borderless cards, monochrome |
| 09 | `09-notion-bento.html` | Notion bento layout | Modular bento cards, stacked credibility, neutral palette |
| 10 | `10-nyt-cooking-recipe.html` | NYT Cooking | Recipe-card pattern adapted, photo+short-title-meta |
| 11 | `11-apple-developer.html` | Apple developer | Spec-sheet card, dense grid, institutional-tech |
| 12 | `12-tailscale-product.html` | Tailscale product | Bright white, sage accent, product-screenshot hero |
| 13 | `13-plausible-privacy.html` | Plausible privacy-first | Mono accents, anti-tracking ethos, minimal card |
| 14 | `14-mayo-warm.html` | Mayo warm institutional | Cream + navy, serif headlines, warmest direction |
| 15 | `15-govuk-mayo-hybrid.html` | GOV.UK + Mayo | Accessibility floor + institutional voice |
| 16 | `16-airbnb-zocdoc.html` | Airbnb + Zocdoc | Photo card + medical trust signals |
| 17 | `17-linear-mayo-hybrid.html` | Linear + Mayo | Mono ID precision + serif gravitas |
| 18 | `18-sasanova-zocdoc.html` | Sasanova + Zocdoc | Numeric proof + medical card |
| 19 | `19-editorial-utility.html` | Stripe Press + GOV.UK | Literary serif + accessibility-first hierarchy |
| 20 | `20-stripe-govuk.html` | Stripe + GOV.UK | Restraint + accessibility floor |
| 21 | `21-hybrid-everything.html` | Maximalist hybrid | Full typography system, layered visuals (sanity-check overload) |

## How to evaluate

**Spend 30 seconds on each one.** First gut reaction matters more than analysis. After you've flipped through all 22, narrow to the top 3 you'd actually want to ship.

Suggested evaluation lens (in order of weight):

1. **Trustworthy first impression for a high-stakes IMG** — does it feel like a place to make $5,000 decisions?
2. **Mobile readable** — open dev tools, narrow to 375px, see if it still works
3. **Speed feel** — is anything ornamental? Anything that feels slow even visually?
4. **Information density** — too sparse (low-data feel) or too dense (overwhelming)?
5. **Trust signaling without overclaim** — does it convey "we verify" without saying things we can't back up?
6. **Accessibility** — readable for non-native English? Color contrast OK? Tap targets clear on mobile?

## Constraints reflected in every mockup

These rules already shipped in PR #42 / #44 / #47 audits, and every mockup respects them:

- ✗ No fake testimonials, fake reviews, fake "X people viewing now"
- ✗ No `AggregateRating` JSON-LD claims (the underlying CTA cleanup from PR #47)
- ✗ No "best match", "verified review", "Top-rated programs are featured"
- ✗ No specific named insurance carriers, no financial advice framing
- ✗ No `FinanceApplication` JSON-LD on cost-calc references
- ✓ "Source on file" / "Recently verified" / "Needs recheck" trust language only when status supports it
- ✓ Reviews are visually separated from source-link verification

## What's deliberately NOT in any mockup

- Pathway selector (closed in PR #49 — multi-pathway exposure paused per direction lock)
- Residency/Fellowship / Practice/Career exposure
- Anything that touches `/career` routes
- Schema/migration changes
- New routes
- SEO impl changes (sitemap, robots, canonical, JSON-LD other than what's already on production)

## After you pick

When you've narrowed to 1–2 directions, the next step is a small `build/p1-2a-hero-refresh` PR (~80–120 LOC) that brings the chosen hero treatment into the real `src/components/home/hero.tsx`. From there, the redesign sequence (P1-2a → P1-2f) ships in small reversible PRs, each gated by your 2-consecutive-approvals rule.
