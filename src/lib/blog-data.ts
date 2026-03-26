// ---------------------------------------------------------------------------
// Blog post data for USCEHub
// Posts target high-traffic IMG search queries for organic SEO growth.
// Each post should be 800-1500 words of genuine, helpful content.
// No filler, no fluff — real information IMGs actually need.
// ---------------------------------------------------------------------------

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  content: string;
  category: "usce" | "residency" | "career" | "immigration" | "guides";
  tags: string[];
  publishedAt: string;
  updatedAt: string;
  author: string;
  readTime: string;
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "observership-vs-externship-difference",
    title: "Observership vs Externship: What's the Real Difference for IMGs?",
    description:
      "A clear breakdown of observerships vs externships — cost, hands-on access, LOR quality, and which one actually helps your residency application.",
    category: "usce",
    tags: ["observership", "externship", "USCE", "IMG", "residency application"],
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    author: "USCEHub Team",
    readTime: "6 min",
    content: `## The Short Version

Here's the difference in one line: in an observership, you watch. In an externship, you do.

That sounds simple, but it changes everything — the quality of your letters, what you actually learn, how much it costs, and honestly, how residency programs see your application.

Let me break down what each one really looks like.

## Observerships — What They Actually Are

You show up. You follow an attending around. You watch them see patients, do procedures, make decisions. You sit in on conferences. You're polite, you ask good questions, you try to be helpful without getting in the way.

But here's the thing — you don't touch patients. You don't write notes. You don't present on rounds. You're basically a very well-dressed shadow.

What you walk away with:
- A letter of recommendation (though the quality really depends — more on that below)
- A feel for how US hospitals actually run day-to-day
- Exposure to EMR systems like Epic and Cerner, which are their own beast
- Practice hearing and using American clinical language
- A line on your CV that says "US Clinical Experience"

What you don't walk away with:
- Any real clinical skills practice
- A chance to show your preceptor what you can actually do
- A strong letter, unless your attending really goes out of their way to get to know you

**Typical cost:** $0-2,500 per month depending on institution. Academic centers tend to charge more. Some community hospitals offer free observerships.

**Duration:** 2-12 weeks. Most are 4 weeks.

**Visa:** Most observerships accept B1/B2 visitors. Some require a specific observership visa letter.

## Externships — A Completely Different Experience

An externship (some places call it a clinical rotation or elective) puts you in the game. You're functioning like a sub-intern. You see patients, write notes, present on rounds, do procedures under supervision, and actually participate in clinical decisions.

This is where it gets real. An attending watches you manage a patient with acute heart failure, and then writes your letter based on what they saw you do — not just that you seemed like a nice person who showed up on time.

What you walk away with:
- A letter that talks about your clinical skills, not just your punctuality
- Actual hands-on practice in a US hospital
- Proof to residency programs that you can do this job
- Sometimes the closest thing to an audition rotation
- Real relationships with attendings who remember your work

The catch:
- They're not free — most cost $500-4,000 per month
- Many require ECFMG certification before you can start
- Competitive ones actually screen applicants, so getting in isn't guaranteed

**Typical cost:** $500-4,000 per month. Hospital-based externships at academic centers can run $2,000-4,000/month.

**Duration:** 4-12 weeks. Some programs offer 2-week rotations.

**Visa:** Externships with patient contact often require J-1 or H-1B status, or sometimes specific training visa arrangements. B1/B2 is generally NOT sufficient for hands-on clinical work.

## Which One Should You Do?

**If you're early in your journey** (haven't passed all Steps, don't have ECFMG certification yet):
→ Start with an **observership**. It gets you familiar with the US system, helps you network, and gives you a CV line while you complete your exams.

**If you're application-ready** (Steps passed, ECFMG certified or nearly):
→ An **externship** is significantly more valuable. The LOR from an externship where a physician watched you work with patients is categorically stronger than one from an observership where you stood in the corner.

**If budget is a concern:**
→ Observerships are cheaper and more accessible. Many are free. An externship is a bigger investment but has a higher return on application strength.

## The Part That Actually Matters: Your Letter

This is where the rubber meets the road. Program directors read hundreds of letters. They can smell the difference between these two in about 3 seconds:

**Observership letter:** "Dr. X observed our service for 4 weeks. They were punctual, professional, and showed interest in patient care. They asked thoughtful questions during rounds."

**Externship letter:** "Dr. X managed a panel of 6-8 patients independently on our IM service. They identified a subtle EKG finding that changed management in a case of new-onset heart block, presented clearly on rounds, and received excellent feedback from nursing. I'd rank them in the top 20% of trainees at their level."

One of these letters gets you interviews. The other one gets skimmed and forgotten. You can guess which is which.

## The Honest Bottom Line

- **Observerships are not useless.** They serve a purpose, especially early in your journey.
- **Externships are more valuable** for your residency application, but harder to get and more expensive.
- **The best strategy is both:** do an observership first to get oriented, then do an externship when you're clinically ready.
- **Neither replaces strong Step scores.** A great externship LOR with a 200 Step 1 won't get you interviews. But a strong externship LOR with competitive scores significantly strengthens your application.

## Where to Find Opportunities

Browse verified observerships and externships on [USCEHub](/browse) — we list 207+ programs across 37 states with direct links, costs, visa requirements, and verification status.`,
  },
  {
    slug: "how-to-get-usce-as-img",
    title: "How to Get US Clinical Experience (USCE) as an IMG: Complete 2026 Guide",
    description:
      "Step-by-step guide for International Medical Graduates to get US clinical experience — types of USCE, where to find programs, costs, visa requirements, and application strategies.",
    category: "usce",
    tags: ["USCE", "IMG", "clinical experience", "observership", "externship", "guide"],
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    author: "USCEHub Team",
    readTime: "8 min",
    content: `## Why USCE Matters

US Clinical Experience (USCE) is one of the most important components of an IMG residency application. Program directors use it as a proxy for several things:
- Can this person function in a US clinical environment?
- Do they understand how US healthcare works?
- Can they communicate effectively with US-trained teams?
- Do they have letters from US physicians who observed them directly?

The 2024 NRMP Program Director Survey showed that **USCE is among the top 5 factors** PDs consider when screening IMG applications.

## Types of USCE

### 1. Observerships
You watch. No patient contact. Cost: $0-2,500/month. Visa: B1/B2 usually sufficient.

### 2. Externships / Clinical Rotations
You participate in patient care. Cost: $500-4,000/month. Visa: usually requires more than B1/B2.

### 3. Research Positions
You work in a US research lab or clinical research team. Can lead to publications and sometimes clinical exposure. Cost: often unpaid or stipend-based.

### 4. Hands-On Clinical Electives
Offered by some medical schools to visiting international students. Most structured, most expensive, but most valuable for hands-on experience.

## Step-by-Step: Getting USCE

### Step 1: Pass Your Exams First (If Possible)
ECFMG certification (or pathway completion) opens more doors. Many externship programs require it. Observerships are more flexible — some accept applicants still completing exams.

### Step 2: Decide What Type You Need
- Early in journey → observership
- Application-ready → externship
- Research-focused → research position
- See our detailed comparison: [Observership vs Externship](/blog/observership-vs-externship-difference)

### Step 3: Search for Programs
- **USCEHub** — [browse 207+ verified programs](/browse) with filters by state, specialty, cost, and visa requirements
- Hospital GME websites — search "[Hospital Name] observership program"
- Medical school international electives offices
- Professional connections — IMGs who have done rotations can recommend preceptors

### Step 4: Prepare Your Application
Most programs ask for:
- CV (US format — 1-2 pages, not a full academic CV)
- Personal statement or cover letter
- USMLE/COMLEX score reports
- Medical school diploma and transcripts
- ECFMG certification (if available)
- Proof of malpractice insurance (some programs require it; others provide it)
- Immunization records
- Valid visa documentation

### Step 5: Apply Early and Broadly
- Apply 3-6 months before your desired start date
- Apply to 10-20 programs minimum
- Personalize each application — generic letters are obvious
- Follow up 2 weeks after applying if you haven't heard back

### Step 6: Maximize Your Time
Once accepted:
- Be early, stay late, be helpful
- Ask to present patients on rounds
- Request feedback actively
- Build relationships with attendings who will write your LORs
- Ask for your LOR before leaving, not months later

## Cost Breakdown

| Item | Range |
|------|-------|
| Observership fee | $0 - $2,500/month |
| Externship fee | $500 - $4,000/month |
| Malpractice insurance | $200 - $500 |
| Housing | $800 - $2,000/month |
| Food & transport | $500 - $1,000/month |
| Visa costs | $160 - $500 |
| **Total for 1-month observership** | **$1,500 - $5,000** |
| **Total for 1-month externship** | **$2,000 - $7,500** |

## How Many Months of USCE Do You Need?

There's no official requirement, but:
- **Minimum viable:** 1-2 months of any USCE is better than zero
- **Competitive for IM/FM:** 3-6 months total
- **Competitive for competitive specialties:** 6-12 months, with research

More is not always better. Quality matters more than quantity. One month of a strong externship with a great LOR beats 6 months of passive observing.

## Common Mistakes

1. **Doing USCE too early** — before Steps are done, limiting what you can do
2. **Choosing the wrong specialty** — doing an observership in surgery when applying to IM
3. **Not asking for LORs while you're there** — waiting 3 months and the attending barely remembers you
4. **Picking a program only because it's cheap** — free isn't always the best value if the clinical exposure is minimal
5. **Not doing any USCE at all** — some IMGs skip it thinking strong scores are enough. They're not.

## Find Your Program

Search [USCEHub's database](/browse) — 207+ verified programs across 37 states, filtered by specialty, cost, state, and visa requirements. Every listing includes a direct link to the program's official page.`,
  },
  {
    slug: "j1-waiver-guide-for-physicians",
    title: "J-1 Waiver for Physicians: Complete Conrad 30 Guide (2026)",
    description:
      "Everything IMG physicians need to know about J-1 visa waivers — Conrad 30 program, alternative pathways (HHS, ARC, DRA, SCRC, VA), state-by-state strategy, timeline, and 2026 legislative updates.",
    category: "immigration",
    tags: ["J-1 waiver", "Conrad 30", "immigration", "physician", "H-1B", "visa"],
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    author: "USCEHub Team",
    readTime: "10 min",
    content: `## What Is the J-1 Waiver?

Most International Medical Graduates (IMGs) enter US residency on a J-1 exchange visitor visa. This visa comes with a **two-year home residency requirement** — meaning after training, you're supposed to return to your home country for two years before you can apply for certain US immigration benefits (H-1B, green card, etc.).

A **J-1 waiver** lets you skip that two-year requirement. Instead of going home, you commit to working in an underserved area for 3 years. After completing your service, you can transition to a green card.

## The Conrad 30 Program

The most common waiver pathway. Key facts:

- **Each state gets 30 slots** per federal fiscal year (October 1 - September 30)
- **Up to 10 flex slots** can be used outside designated shortage areas (but TX, AZ, IN do NOT offer flex)
- **3-year full-time commitment** (minimum 40 hours/week) at the sponsoring facility
- **Must work in a HPSA, MUA, or serve a MUP** (with flex exceptions)
- **You work in H-1B status** after waiver approval
- **Non-compete clauses are prohibited** in federal shortage-area waiver contracts

### 2026 Critical Update: Sunset Risk

The Conrad 30 authorization faces a potential sunset. USCIS has stated that physicians who acquired J-1 status **on or after October 1, 2025** may not be eligible for Conrad 30 waivers unless Congress extends the provision. The Conrad State 30 and Physician Access Reauthorization Act (H.R. 1585 / S. 709) was introduced in February 2025 and would:
- Extend the program for 3 years
- Increase slots from 30 to **35 per state**
- Add automatic escalation if 90% used nationally
- Create **slot recapture** when physicians leave a state
- Add a 6-month status extension for denied applicants

As of March 2026, the bill is in Senate Judiciary Committee. Source: Congress.gov.

## States That Fill All 30 Slots (FY 2024)

Per 3RNET data, **19 states** filled all 30 slots in FY 2024:
Arizona, Arkansas, Connecticut, Georgia, Indiana, Kansas, Kentucky, Louisiana, Maine, Massachusetts, Michigan, Minnesota, Missouri, New Mexico, New York, Ohio, Oregon, Pennsylvania, South Carolina.

**Kentucky, Michigan, and New York** have filled every single slot every year for 20+ years.

**Total Conrad 30 placements nationally in FY 2024: 1,010 physicians.**

## Alternative Waiver Pathways

Conrad 30 is not the only option. These alternatives have **unlimited slots**:

### HHS Clinical Care Waiver (Supplement B)
- **Unlimited slots** per year
- Limited to: Family Medicine, General Internal Medicine, General Pediatrics, OB/GYN, General Psychiatry
- Requires HPSA score of **7 or higher**
- Processing time: **over 12 months** at HHS alone
- No application fee
- [Official page](https://www.hhs.gov/about/agencies/oga/about-oga/what-we-do/visitor-exchange-program/supplementary-b-clinical-care.html)

### Appalachian Regional Commission (ARC)
- **Unlimited slots**, no application fee
- Covers Appalachian communities across 13 states (NY to MS)
- Must be in an Appalachian HPSA
- Accepts primary care, psychiatry, AND subspecialists
- Employer must demonstrate 6 months failed US recruitment
- [Official page](https://www.arc.gov/j-1-visa-waivers/)

### Delta Regional Authority (DRA)
- **Unlimited slots**, rolling applications
- Covers 252 counties across 8 states: AL, AR, IL, KY, LA, MS, MO, TN
- Accepts primary care and specialists with proof of need
- [Official page](https://dra.gov)

### Southeast Crescent Regional Commission (SCRC)
- **Unlimited slots**, launched 2022
- Covers 428 counties across 7 states: AL, FL, GA, MS, NC, SC, VA
- **$3,000 application processing fee**
- Accepts primary care, psychiatry, and subspecialists
- [Official page](https://scrc.gov)

### VA (Department of Veterans Affairs)
- Not subject to same shortage-area rules
- Physician services justified on VA-specific factors
- Contact VA directly for current openings

## Timeline: Application to Approval

| Stage | Duration |
|-------|----------|
| Employer search & contract negotiation | 3-6 months |
| State-level review (varies by state) | 2-10 weeks |
| DOS Waiver Review Division | 8-12 weeks |
| USCIS H-1B adjudication | 1-3 months |
| **Total estimated** | **6-18 months** |

Start planning **12-18 months** before your J-1 waiver deadline.

## Strategy Tips

1. **Apply to multiple states** — don't put all your eggs in one basket
2. **Apply on October 1** — competitive states fill within days
3. **Have a backup pathway** — if Conrad fails, HHS or ARC may work
4. **Higher HPSA score = better chances** — aim for HPSA score 14+ in competitive states
5. **Negotiate your contract carefully** — no non-competes allowed in federal waiver contracts
6. **Budget for legal fees** — $3,000-15,000 for immigration attorney
7. **Don't rely on verbal promises** — get everything in writing

## State-by-State Intelligence

We maintain verified Conrad 30 guides for all 50 states with slot data, processing times, specialty needs, and strategic tips.

[Browse all 50 state guides →](/career/waiver)

*Data sourced from state DOH websites, 3RNET, USCIS, HRSA, and congressional records. Last verified March 2026.*`,
  },
  {
    slug: "img-friendly-residency-programs-2026",
    title: "IMG-Friendly Residency Programs: What It Actually Means (2026)",
    description:
      "What makes a residency program 'IMG-friendly' — real criteria, how to identify them, match data by program type, and why the label is both useful and misleading.",
    category: "residency",
    tags: ["IMG-friendly", "residency", "match", "NRMP", "program selection"],
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    author: "USCEHub Team",
    readTime: "7 min",
    content: `## What "IMG-Friendly" Actually Means

A program is called "IMG-friendly" when it has a track record of accepting and matching International Medical Graduates. There is no official designation. No program calls itself "IMG-friendly" on their website. It's a community-derived label based on:

1. **Historical match data** — programs that consistently match IMGs
2. **Current resident roster** — if 30-50%+ of current residents are IMGs
3. **Visa sponsorship** — programs that sponsor J-1 or H-1B visas
4. **Community hospital vs academic** — community programs match more IMGs proportionally
5. **Geographic location** — underserved areas have higher IMG representation

## The 2026 Match Numbers for IMGs

From the NRMP 2026 Main Residency Match:
- **US citizen IMGs matched at 67.8%** (up 0.8 points from 2025)
- **Non-US citizen IMGs matched at ~60%** overall
- **IMGs represent ~25% of all licensed US physicians** (AMA 2024)

### Where IMGs Match (By Specialty)

IMGs concentrate in certain specialties. This isn't random — it reflects where programs accept IMGs and where visa sponsorship is available:

**High IMG concentration:**
- Internal Medicine — the #1 IMG specialty by volume
- Family Medicine
- Pediatrics
- Psychiatry
- Neurology
- Pathology

**Moderate IMG concentration:**
- General Surgery (community programs)
- Emergency Medicine (some community programs)
- PM&R
- Anesthesiology (increasing)

**Low IMG concentration:**
- Dermatology, Orthopedics, ENT, Ophthalmology, Plastic Surgery, Urology, Radiation Oncology — these are competitive for everyone, and most programs in these specialties do not sponsor visas

## How to Actually Identify IMG-Friendly Programs

### 1. Check FREIDA (AMA Residency & Fellowship Database)
FREIDA lists whether programs accept IMGs and whether they sponsor visas. Filter by "accepts IMGs" and "J-1 visa sponsorship."

### 2. Look at Current Resident Rosters
Many program websites list their current residents with photos and bios. If you see names from your part of the world and medical schools you recognize, that's a signal.

### 3. Check Match Data
Programs with lower USMLE score cutoffs and higher IMG acceptance rates are often community-based programs in underserved areas.

### 4. Ask Current IMGs
Reddit (r/IMGreddit), WhatsApp groups, and Facebook IMG communities have real-time intelligence on which programs are welcoming.

### 5. Check the Program Director
If the PD is an IMG themselves, the program is statistically more likely to be IMG-friendly. This isn't guaranteed, but it's a signal.

## Why the "IMG-Friendly" Label Is Misleading

The label can be misleading because:

1. **It changes year to year.** A program that matched 5 IMGs last year might match zero this year due to a new PD, changing visa policies, or application volume changes.

2. **"IMG-friendly" doesn't mean "easy to match."** A program that accepts IMGs may still receive 3,000+ applications for 8 spots. The acceptance rate can be lower than Harvard's.

3. **Community programs aren't lesser.** Many IMGs feel stigma about matching at community programs. This is misguided. Community programs often provide better hands-on training, earlier autonomy, and stronger clinical skills than academic programs where residents are supervised more tightly.

4. **The visa question matters more than the label.** A program can be "IMG-friendly" in attitude but not sponsor J-1 or H-1B visas. Without visa sponsorship, friendliness is irrelevant.

## What Actually Matters More Than the Label

1. **Your Step/COMLEX scores** — the single most important screening factor
2. **US Clinical Experience** — programs want to see you can function here
3. **Strong LORs from US physicians** — ideally from the same specialty
4. **Research** — especially for competitive specialties and academic programs
5. **Connections** — knowing someone at a program dramatically increases interview chances
6. **Application strategy** — applying to 200+ programs is normal for IMGs in competitive specialties

## Bottom Line

"IMG-friendly" is a useful starting filter but not a strategy. Your strategy should be:
1. Get the highest Step scores you can
2. Get meaningful USCE with strong LORs
3. Apply broadly (100-300 programs for competitive specialties)
4. Target programs where your profile matches (score range, experience level)
5. Network aggressively through conferences, USCE rotations, and alumni connections

*Data sourced from NRMP 2026 Main Residency Match, AMA 2024 Physician Workforce Data. Browse USCE opportunities on [USCEHub](/browse).*`,
  },
  {
    slug: "eras-application-timeline-2027",
    title: "ERAS 2027 Application Timeline for IMGs: Key Dates and Strategy",
    description:
      "Complete ERAS 2027 timeline with key dates, what to prepare when, and IMG-specific strategies for the residency application cycle.",
    category: "residency",
    tags: ["ERAS", "timeline", "residency application", "IMG", "2027", "match"],
    publishedAt: "2026-03-25",
    updatedAt: "2026-03-25",
    author: "USCEHub Team",
    readTime: "7 min",
    content: `## ERAS 2027 Timeline Overview

The ERAS (Electronic Residency Application Service) 2027 cycle is for applicants seeking residency positions starting July 2027. Here are the key dates and what IMGs need to prepare at each stage.

## Key Dates (Expected — Confirm with AAMC)

| Date | Event |
|------|-------|
| **May 2026** | ERAS 2027 MyERAS opens for registration |
| **June 2026** | Token generation begins — your medical school assigns ERAS tokens |
| **July 2026** | Begin uploading documents: CV, personal statement, photo, LORs |
| **September 6, 2026** | Applications transmitted to programs (Day 1) |
| **September-November 2026** | Interview invitations sent, interviews conducted |
| **October 2026** | Programs begin reviewing applications |
| **November-January 2027** | Peak interview season |
| **January 2027** | Supplemental ERAS opens (second look for unfilled programs) |
| **February 2027** | Rank Order List (ROL) deadline |
| **March 2027** | Match Week — results announced |
| **March 2027** | SOAP (Supplemental Offer and Acceptance Program) for unmatched |
| **July 2027** | Residency begins |

## What IMGs Should Be Doing NOW (March 2026)

If you're applying in September 2026, you have **6 months**. Here's your checklist:

### Already Done (Should Be)
- [ ] USMLE Step 1 passed
- [ ] USMLE Step 2 CK passed (score in hand)
- [ ] ECFMG pathway completed or nearly complete
- [ ] OET passed (if using OET pathway)

### Do Now (March-May 2026)
- [ ] **USCE:** If you haven't done any, start NOW. Even 1 month of observership before applications open helps.
- [ ] **LOR writers identified:** You need 3-4 letters. At least 1-2 from US physicians in your target specialty.
- [ ] **Personal statement draft started:** Don't wait until August. Start now, revise 5+ times.
- [ ] **CV in US format:** 1-2 pages. Education, USCE, research, publications, volunteer work. No photo.
- [ ] **ECFMG certification confirmed:** Verify your certification status on the ECFMG website.
- [ ] **Research where to apply:** Build your program list. 50-300 programs depending on competitiveness.

### June-August 2026
- [ ] **MyERAS token obtained** from your medical school
- [ ] **Documents uploaded:** personal statement finalized, photo taken (professional, plain background), MSPE/Dean's letter requested
- [ ] **LOR writers sent ERAS letter request** through the system
- [ ] **Program list finalized:** know exactly which programs you're applying to on Day 1
- [ ] **Application fees budgeted:** ERAS fees add up quickly. Budget $1,000-3,000+ for application fees alone.

### September 2026 (Critical)
- [ ] **Apply on September 6** — Day 1. Do not wait. Programs start reviewing immediately.
- [ ] **Apply broadly:** IMGs should apply to 100-300 programs for most specialties
- [ ] **Monitor email constantly** for interview invitations — respond within hours

### October-January 2027
- [ ] **Interview preparation:** practice with mock interviews
- [ ] **Thank-you emails** after every interview (brief, professional)
- [ ] **Track your interviews** in a spreadsheet: date, program, impressions, rank considerations

### February 2027
- [ ] **Submit your Rank Order List** before the deadline (typically 3rd Wednesday of February)
- [ ] **Rank by fit, not prestige:** rank programs where you'd actually be happy training

## IMG-Specific ERAS Strategy

### Program Signaling
ERAS has implemented **program signaling** for residency applications. You get a limited number of signals (varies by specialty) to indicate genuine interest. Use them strategically:
- Signal programs where you have a real connection (did USCE there, know faculty)
- Signal programs in your preferred geographic area
- Don't waste signals on programs you'd never attend

### The Numbers Game
For competitive specialties (IM at academic centers, Neurology, Psychiatry), IMGs often apply to 150-300 programs. This isn't excessive — it's realistic given the interview rate for IMGs.

For less competitive specialties (FM, Pathology), 50-150 may be sufficient.

### SOAP Preparation
About 7-10% of all applicants go unmatched. For IMGs, the rate is higher. Prepare for SOAP:
- Have your SOAP application materials ready before Match Week
- Know which programs typically have unfilled positions
- Be ready to act within hours — SOAP moves extremely fast

## Cost of Applying

| Item | Estimated Cost |
|------|---------------|
| ERAS application fees (100 programs) | $1,500-2,500 |
| USMLE transcript fees | $80-160 |
| Interview travel (if in-person) | $500-5,000+ |
| Interview attire | $200-500 |
| ECFMG certification fees | $900-1,500 |
| USCE costs (accumulated) | $2,000-10,000 |
| **Total estimated** | **$5,000-20,000+** |

This is real money. Budget carefully and apply strategically.

## ERAS Countdown

We maintain a live ERAS countdown timer on our homepage. [Check it now →](/)

*Timeline based on AAMC published ERAS schedules. Specific 2027 dates will be confirmed by AAMC in spring 2026. Data verified March 2026.*`,
  },
];

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}

export function getAllBlogSlugs(): { slug: string }[] {
  return BLOG_POSTS.map((p) => ({ slug: p.slug }));
}
