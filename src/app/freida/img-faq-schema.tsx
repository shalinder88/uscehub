/**
 * AEO (Answer Engine Optimization) FAQ Component
 * Renders Q&As on-page AND embeds FAQPage JSON-LD schema
 * Targets: Google AI Overviews, Perplexity, ChatGPT Search, Bing Copilot
 */

const IMG_FAQS = [
  {
    question: "What is the IMG match rate for 2025?",
    answer:
      "The overall IMG match rate for the 2025 NRMP Main Residency Match was approximately 60.8%. US citizen IMGs matched at 67.8%, while non-US citizen IMGs matched at 58.0%. A total of 9,761 IMGs filled first-year residency positions out of 16,052 active applicants. Source: NRMP 2025 Main Residency Match Results.",
  },
  {
    question: "What Step 2 CK score do IMGs need to match?",
    answer:
      "For the 2024 match cycle, the average Step 2 CK score for matched non-US citizen IMGs was 245, and for matched US citizen IMGs was 236. The passing score was raised to 218 in July 2025. IMGs should aim for scores 5-15 points above their target specialty's average. For Internal Medicine, target 238-248; for competitive specialties like Surgery, target 245-255. Source: NRMP Charting Outcomes 2024.",
  },
  {
    question: "Which specialties are most IMG-friendly in 2025?",
    answer:
      "The most IMG-friendly specialties based on 2025 NRMP data are: Internal Medicine (44.6% of positions filled by IMGs, 4,718 matched), Pathology (36.3% IMG fill rate), Family Medicine (31.3% IMG fill rate with 805 unfilled spots), Neurology (29.1% IMG fill rate), and Pediatrics (28.1% IMG fill rate). Dermatology, Orthopedics, and Plastic Surgery remain virtually closed to IMGs. Source: NRMP 2025.",
  },
  {
    question: "What is ECFMG certification and how do I get it?",
    answer:
      "ECFMG (Educational Commission for Foreign Medical Graduates) certification is required for all IMGs to enter US residency training. Requirements include: passing USMLE Step 1 (pass/fail), passing USMLE Step 2 CK (score of 218+ as of July 2025), passing OET Medicine (required for all IMGs regardless of native language), and completing one of six ECFMG Pathways. All exams must be completed within a 7-year window. Source: ECFMG.org.",
  },
  {
    question: "How many observerships should an IMG do?",
    answer:
      "IMGs should aim for 2-3 clinical observerships or externships totaling 3-6 months of US clinical experience. This provides: US-based letters of recommendation (critical for applications), understanding of the US healthcare system, clinical exposure in your target specialty, and networking opportunities with program directors. Programs with hands-on externship experience are valued more than observation-only programs.",
  },
  {
    question: "What is SOAP and how does it work for IMGs?",
    answer:
      "SOAP (Supplemental Offer and Acceptance Program) is the process for unmatched applicants to apply to unfilled residency positions after the main match. Approximately 2,500 positions go unfilled each year. The IMG SOAP success rate is 15-20%. SOAP runs over 2 days in March with 4 rounds, and response times are 2-6 hours per round. Family Medicine, Internal Medicine preliminary, and Transitional Year have the most SOAP positions. Source: NRMP.",
  },
  {
    question: "Do I need OET for ECFMG certification?",
    answer:
      "Yes, OET (Occupational English Test) Medicine is now required for ALL international medical graduates seeking ECFMG certification, regardless of native language or country of medical school. Minimum passing scores are: Listening 350 (Grade B), Reading 350 (Grade B), Speaking 350 (Grade B), and Writing 300 (Grade C+). All four sub-tests must be passed in a single sitting. Source: ECFMG.org.",
  },
  {
    question: "What visa do IMG residents need in the US?",
    answer:
      "The most common visa for IMG residents is the J-1 Exchange Visitor Visa, sponsored by ECFMG. It has a 2-year home country requirement after training (waivable through Conrad 30 or other programs). The H-1B visa is an alternative but fewer programs sponsor it. In 2025, IMGs requiring visa sponsorship matched at 54.4%, compared to 67.9% for IMGs not requiring a visa. Source: NRMP 2025.",
  },
  {
    question: "What is the best state for IMG residency?",
    answer:
      "New York is the most IMG-friendly state with 40+ IMG-welcoming programs, primarily through the NYC Health + Hospitals system. Other top states include Michigan (20+ programs, Wayne State/DMC), Illinois (15+ programs, Cook County), Ohio (12+ programs, Cleveland Clinic community), Pennsylvania (12+ programs, Temple, Einstein), and New Jersey (10+ programs). Midwest and Southern states often offer lower cost of living with strong training.",
  },
  {
    question: "How does year of graduation affect IMG match chances?",
    answer:
      "Year of graduation (YOG) significantly impacts IMG match rates. Current year graduates have a 70-75% match rate, 1-2 years out: 65-70%, 3-5 years: 50-55%, 5-7 years: 35-40%, 7-10 years: 20-25%, and 10+ years: 10-15%. To offset graduation gaps, pursue research fellowships, additional certifications, or recent clinical experience. Many programs use YOG as a screening filter.",
  },
  {
    question: "What is FREIDA and how do IMGs use it?",
    answer:
      "FREIDA (Fellowship and Residency Electronic Interactive Database) is the AMA's comprehensive database of 13,000+ ACGME-accredited residency and fellowship programs. IMGs can filter by: visa sponsorship type (J-1, H-1B), percentage of IMG residents, program size, salary, location, and specialty. Basic search is free; premium features cost $20/year with AMA membership. FREIDA is essential for identifying IMG-friendly programs. Source: AMA.",
  },
  {
    question: "How many residency programs are in the United States?",
    answer:
      "There are over 13,000 ACGME-accredited residency and fellowship programs in the United States, offering approximately 46,000+ first-year positions. The 2025 NRMP Match offered 43,237 total positions (40,041 PGY-1), the most in NRMP's 73-year history. Internal Medicine has the most positions (10,941), followed by Family Medicine (5,357) and Pediatrics (3,135). Source: AMA FREIDA, NRMP 2025.",
  },
  {
    question: "What are ECFMG pathways and which should I choose?",
    answer:
      "ECFMG offers 6 certification pathways to satisfy clinical skills requirements. Pathway 1 (clinical skills assessment by accrediting authority) is the most common and permanent. Pathways 2-5 involve attestation from medical schools or based on professional experience. Pathway 6 uses Mini-CEX evaluations. The 2026 Pathways deadline is January 31, 2026. Most IMGs use Pathway 1 or Pathway 6. Source: ECFMG.org.",
  },
  {
    question: "How many IMGs matched in the 2025 residency match?",
    answer:
      "In the 2025 NRMP Main Residency Match, 9,761 international medical graduates filled first-year residency positions. This came from 20,030 IMG registrants and 16,052 active applicants (those who submitted rank lists). IMG participation grew 57.6% over five years, with non-US IMG applicants alone surging 14.4% in 2025. The 2025 Match was the largest in NRMP's 73-year history. Source: NRMP 2025.",
  },
  {
    question: "How much does it cost to apply for US residency as an IMG?",
    answer:
      "The total cost for an IMG to apply for US residency ranges from $15,000-$25,000+. Major expenses include: USMLE Step 1 ($1,000+), Step 2 CK ($1,000+), OET ($587), ECFMG certification ($935+), ERAS application fees ($1,500-3,000+ for 150-200 programs), observership fees ($0-3,000), travel for interviews ($3,000-8,000), and living expenses during clinical rotations ($3,000-10,000). Use the USCEHub Cost Calculator to estimate your specific costs.",
  },
];

export function ImgFaqSchema() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: IMG_FAQS.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Visible FAQ section for AEO */}
      <div className="space-y-4">
        {IMG_FAQS.map((item) => (
          <div
            key={item.question}
            className="rounded-xl border border-slate-200 dark:border-slate-700 p-5"
          >
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {item.question}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
