import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of service for USCEHub. Review the rules and guidelines for using our clinical observership and externship opportunities platform for IMGs.",
  alternates: {
    canonical: "https://uscehub.com/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Last updated: March 23, 2026 — Effective immediately upon access
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
          {/* 1. Acceptance */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              1. Acceptance of Terms
            </h2>
            <p>
              By accessing, browsing, or using USCEHub.com (&ldquo;USCEHub,&rdquo;
              &ldquo;the Platform,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
              &ldquo;our&rdquo;), you acknowledge that you have read, understood,
              and agree to be bound by these Terms of Service (&ldquo;Terms&rdquo;),
              our Privacy Policy, and all applicable laws and regulations. If you
              do not agree to all of these Terms, you are prohibited from using
              or accessing this Platform and must discontinue use immediately.
            </p>
            <p className="mt-2">
              We reserve the right to modify, amend, or update these Terms at any
              time without prior notice. Your continued use of the Platform after
              any such changes constitutes your acceptance of the new Terms. It is
              your responsibility to review these Terms periodically.
            </p>
          </section>

          {/* 2. Nature of the Platform */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              2. Nature of the Platform — Directory Only
            </h2>
            <p>
              USCEHub is an <strong>informational directory and aggregator</strong> of
              publicly available clinical observership, externship, and research
              opportunities. USCEHub does NOT:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>Operate as a medical staffing agency, placement service, or employment agency</li>
              <li>Guarantee placement, acceptance, or enrollment in any listed program</li>
              <li>Verify, endorse, accredit, or certify any listed institution, physician, or program</li>
              <li>Act as an agent, representative, or intermediary for any institution or applicant</li>
              <li>Provide medical advice, career counseling, legal advice, immigration advice, or any professional guidance</li>
              <li>Guarantee the accuracy, completeness, timeliness, or reliability of any listing, data, or information on the Platform</li>
              <li>Supervise, manage, or oversee any clinical rotation, observership, or educational experience</li>
            </ul>
            <p className="mt-2">
              All interactions, applications, agreements, payments, and arrangements
              between users and listed institutions are solely between those parties.
              USCEHub has no involvement in, responsibility for, or liability arising
              from such interactions.
            </p>
          </section>

          {/* 3. No Medical or Professional Advice */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              3. No Medical, Legal, or Professional Advice
            </h2>
            <p>
              Nothing on this Platform constitutes medical advice, legal advice,
              immigration advice, career counseling, or any form of professional
              guidance. All content — including but not limited to program listings,
              resource guides, blog posts, cost calculators, match statistics, ECFMG
              pathway information, and community discussions — is provided for
              <strong> general informational purposes only</strong>.
            </p>
            <p className="mt-2">
              No doctor-patient relationship, attorney-client relationship, or any
              professional-client relationship is created by your use of this Platform.
              You should consult qualified professionals (physicians, attorneys,
              immigration specialists) for advice specific to your situation.
            </p>
            <p className="mt-2">
              Medical education requirements, licensing standards, visa regulations,
              and program requirements change frequently. USCEHub makes no
              representation that any information is current, accurate, or applicable
              to your specific circumstances.
            </p>
          </section>

          {/* 4. No Guarantee of Accuracy */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              4. No Guarantee of Accuracy
            </h2>
            <p>
              While we strive to provide accurate and up-to-date information, USCEHub
              makes <strong>no warranties or representations</strong> regarding the
              accuracy, completeness, reliability, suitability, or availability of any
              information on the Platform. This includes but is not limited to:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>Program availability, costs, durations, application deadlines, or requirements</li>
              <li>Visa sponsorship information or immigration eligibility</li>
              <li>ECFMG certification pathways or requirements</li>
              <li>NRMP Match statistics, residency program data, or acceptance rates</li>
              <li>Hospital or institution accreditation status</li>
              <li>User-submitted reviews, ratings, or community content</li>
              <li>Links to third-party websites or external resources</li>
              <li>Cost estimates, calculators, or financial projections</li>
            </ul>
            <p className="mt-2">
              Programs listed may have changed, closed, suspended operations, or
              modified their requirements without our knowledge. You must independently
              verify all information directly with the relevant institution before
              making any decisions or commitments.
            </p>
          </section>

          {/* 5. Assumption of Risk */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              5. Assumption of Risk
            </h2>
            <p>
              By using this Platform, you expressly acknowledge and assume all risks
              associated with:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1">
              <li>Applying to or participating in any listed program</li>
              <li>Any financial payments, deposits, or fees paid to any institution or individual</li>
              <li>Travel, housing, relocation, or any associated costs</li>
              <li>Clinical experiences, patient interactions, or medical procedures observed or participated in during any program</li>
              <li>Injury, illness, or harm (physical, emotional, financial, or otherwise) arising from any program or interaction facilitated through information on this Platform</li>
              <li>Loss of time, money, or opportunity based on information obtained from this Platform</li>
              <li>Decisions about medical education, career paths, residency applications, or immigration based on information from this Platform</li>
            </ul>
            <p className="mt-2">
              You acknowledge that clinical environments involve inherent risks
              including but not limited to exposure to infectious diseases, hazardous
              materials, and medical emergencies. USCEHub bears absolutely no
              responsibility for any events occurring during any clinical experience.
            </p>
          </section>

          {/* 6. Account Registration */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              6. Account Registration
            </h2>
            <p>
              To access certain features, you must create an account. You agree
              to provide accurate, current, and complete information during
              registration and to update this information to keep it accurate.
              You are solely responsible for safeguarding your password and for all
              activities that occur under your account. You must immediately
              notify us of any unauthorized use. We are not liable for any loss
              arising from unauthorized use of your account.
            </p>
          </section>

          {/* 7. User Conduct */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              7. User Conduct
            </h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Post false, misleading, or fraudulent listings, reviews, or content</li>
              <li>Impersonate any person, institution, or organization</li>
              <li>Use the Platform for any unlawful purpose or in violation of any applicable regulations</li>
              <li>Harass, abuse, threaten, defame, or intimidate other users</li>
              <li>Attempt to interfere with the proper operation of the Platform</li>
              <li>Scrape, crawl, or use automated means to access the Platform without written permission</li>
              <li>Upload malicious code, viruses, or harmful content</li>
              <li>Attempt to gain unauthorized access to any portion of the Platform</li>
              <li>Use the Platform to solicit users for fraudulent schemes or scams</li>
              <li>Misrepresent your identity, qualifications, or affiliations</li>
            </ul>
          </section>

          {/* 8. Listing Guidelines */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              8. Listing Guidelines
            </h2>
            <p>
              Institutions and individuals posting listings must provide
              accurate and truthful information about their programs. USCEHub
              does not independently verify the accuracy of listings and is not
              responsible for inaccurate or misleading listing content. Listings
              that are found to be fraudulent or in violation of our guidelines
              will be removed, and the responsible account may be suspended or
              terminated without notice or refund.
            </p>
          </section>

          {/* 9. Reviews and User Content */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              9. Reviews and User Content
            </h2>
            <p>
              By submitting reviews, comments, or other content, you grant
              USCEHub a non-exclusive, royalty-free, perpetual, irrevocable,
              worldwide license to use, reproduce, modify, distribute, and display
              such content on the Platform and in promotional materials. Reviews
              must be based on genuine experiences. We reserve the right to remove
              any content at our sole discretion without notice. We are not
              responsible for user-generated content and do not verify its accuracy.
            </p>
          </section>

          {/* 10. Intellectual Property & Data Protection */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              10. Intellectual Property &amp; Data Protection
            </h2>
            <p className="mb-2">
              The USCEHub database — including program listings, verification
              data, community reviews, statistical analyses, curated guides,
              compiled datasets, and all structured data — represents significant
              investment and is protected as a compilation under United States
              copyright law (17 U.S.C. § 103).
            </p>
            <p className="mb-2">You expressly agree that you will NOT:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Use automated tools, scripts, bots, scrapers, crawlers, or any automated means to access, collect, copy, or download data from USCEHub</li>
              <li>Systematically copy, reproduce, or redistribute any portion of the USCEHub database, whether manually or through automated means</li>
              <li>Create a competing product, service, or directory using data obtained from USCEHub</li>
              <li>Sell, license, sublicense, or commercially exploit any data collected from USCEHub</li>
              <li>Use data mining, data harvesting, data extraction, or any similar methods</li>
              <li>Circumvent or attempt to circumvent any rate limiting, access controls, or technical measures designed to prevent unauthorized data collection</li>
              <li>Frame, mirror, or reproduce any portion of the Platform on any other server or website</li>
            </ul>
            <p className="mt-2">
              Violation of this section may result in immediate account
              termination, IP blocking, and legal action including claims
              for statutory and actual damages, injunctive relief, and recovery
              of attorneys&apos; fees and costs.
            </p>
          </section>

          {/* 11. Third-Party Links */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              11. Third-Party Links and Resources
            </h2>
            <p>
              The Platform may contain links to third-party websites, institutions,
              or resources. These links are provided for convenience only. USCEHub
              does not control, endorse, sponsor, or assume any responsibility for
              the content, privacy policies, practices, or availability of any
              third-party website. Your use of third-party websites is at your own
              risk and subject to the terms and conditions of those websites.
            </p>
          </section>

          {/* 12. Disclaimer of Warranties */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              12. DISCLAIMER OF WARRANTIES
            </h2>
            <p className="uppercase font-medium">
              THE PLATFORM AND ALL CONTENT, MATERIALS, INFORMATION, SERVICES, AND
              PRODUCTS AVAILABLE THROUGH THE PLATFORM ARE PROVIDED ON AN &ldquo;AS
              IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; BASIS WITHOUT WARRANTIES OF
              ANY KIND, EITHER EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED
              BY APPLICABLE LAW, USCEHUB DISCLAIMS ALL WARRANTIES, EXPRESS OR
              IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
              MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE,
              NON-INFRINGEMENT, AND ACCURACY.
            </p>
            <p className="mt-2 uppercase font-medium">
              WE DO NOT WARRANT THAT THE PLATFORM WILL BE UNINTERRUPTED,
              ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
              WE DO NOT WARRANT THAT ANY INFORMATION PROVIDED THROUGH THE PLATFORM
              IS ACCURATE, RELIABLE, COMPLETE, OR CURRENT. WE MAKE NO WARRANTY
              REGARDING THE QUALITY, LEGITIMACY, SAFETY, OR LEGALITY OF ANY LISTED
              PROGRAM, INSTITUTION, OR OPPORTUNITY.
            </p>
          </section>

          {/* 13. Limitation of Liability */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              13. LIMITATION OF LIABILITY
            </h2>
            <p className="uppercase font-medium">
              TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL
              USCEHUB, ITS OWNERS, OPERATORS, AFFILIATES, EMPLOYEES, AGENTS,
              PARTNERS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL,
              SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, INCLUDING
              BUT NOT LIMITED TO DAMAGES FOR LOSS OF PROFITS, GOODWILL, USE, DATA,
              OPPORTUNITY, OR OTHER INTANGIBLE LOSSES, ARISING OUT OF OR IN
              CONNECTION WITH:
            </p>
            <ul className="ml-4 mt-2 list-disc space-y-1 uppercase font-medium">
              <li>YOUR USE OF OR INABILITY TO USE THE PLATFORM</li>
              <li>ANY INFORMATION, CONTENT, OR LISTINGS OBTAINED FROM THE PLATFORM</li>
              <li>ANY INTERACTIONS, APPLICATIONS, OR ARRANGEMENTS WITH LISTED INSTITUTIONS OR OTHER USERS</li>
              <li>UNAUTHORIZED ACCESS TO OR ALTERATION OF YOUR DATA OR TRANSMISSIONS</li>
              <li>ANY INJURY, ILLNESS, DEATH, PROPERTY DAMAGE, OR FINANCIAL LOSS ARISING FROM ANY CLINICAL EXPERIENCE OR PROGRAM</li>
              <li>ANY ERRORS, INACCURACIES, OR OMISSIONS IN ANY CONTENT</li>
              <li>ANY DECISIONS MADE BASED ON INFORMATION FROM THE PLATFORM</li>
              <li>FRAUD, MISREPRESENTATION, OR MISCONDUCT BY ANY INSTITUTION, USER, OR THIRD PARTY</li>
            </ul>
            <p className="mt-2 uppercase font-medium">
              IN NO EVENT SHALL USCEHUB&apos;S TOTAL AGGREGATE LIABILITY TO YOU FOR
              ALL CLAIMS ARISING OUT OF OR RELATED TO THE PLATFORM EXCEED THE
              AMOUNT YOU PAID TO USCEHUB IN THE TWELVE (12) MONTHS PRECEDING THE
              CLAIM, OR TEN DOLLARS ($10.00), WHICHEVER IS GREATER.
            </p>
            <p className="mt-2">
              Some jurisdictions do not allow the exclusion or limitation of certain
              damages. In such jurisdictions, our liability shall be limited to the
              fullest extent permitted by law.
            </p>
          </section>

          {/* 14. Indemnification */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              14. Indemnification
            </h2>
            <p>
              You agree to defend, indemnify, and hold harmless USCEHub, its owners,
              operators, affiliates, officers, directors, employees, agents, and
              licensors from and against any and all claims, damages, obligations,
              losses, liabilities, costs, and expenses (including but not limited
              to attorneys&apos; fees and costs) arising from: (a) your use of the
              Platform; (b) your violation of these Terms; (c) your violation of
              any applicable law or regulation; (d) your violation of any rights
              of a third party; (e) any content you submit or post on the Platform;
              (f) any interaction between you and any institution, program, or user
              found through the Platform; or (g) any claim that your use of the
              Platform caused damage to a third party.
            </p>
          </section>

          {/* 15. Dispute Resolution & Arbitration */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              15. Dispute Resolution &amp; Binding Arbitration
            </h2>
            <p className="mb-2 font-medium">
              PLEASE READ THIS SECTION CAREFULLY — IT AFFECTS YOUR LEGAL RIGHTS,
              INCLUDING YOUR RIGHT TO FILE A LAWSUIT IN COURT.
            </p>
            <p className="mb-2">
              Any dispute, controversy, or claim arising out of or relating to these
              Terms, or the breach, termination, or invalidity thereof, shall be
              settled by binding arbitration administered by the American Arbitration
              Association (&ldquo;AAA&rdquo;) under its Commercial Arbitration Rules.
              The arbitration shall take place in the United States, and the
              arbitrator&apos;s decision shall be final and binding. Judgment on the
              award may be entered in any court having jurisdiction.
            </p>
            <p className="mb-2 font-medium">
              CLASS ACTION WAIVER: YOU AGREE THAT ANY DISPUTE RESOLUTION
              PROCEEDINGS WILL BE CONDUCTED ONLY ON AN INDIVIDUAL BASIS AND NOT IN
              A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION. YOU WAIVE ANY RIGHT
              TO PARTICIPATE IN A CLASS ACTION LAWSUIT OR CLASS-WIDE ARBITRATION
              AGAINST USCEHUB.
            </p>
            <p>
              JURY TRIAL WAIVER: TO THE EXTENT PERMITTED BY LAW, YOU WAIVE ANY
              RIGHT TO A JURY TRIAL IN ANY PROCEEDING ARISING OUT OF OR RELATED TO
              THESE TERMS.
            </p>
          </section>

          {/* 16. Governing Law */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              16. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the
              laws of the United States and the State in which USCEHub operates,
              without regard to conflict of law principles.
            </p>
          </section>

          {/* 17. Severability */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              17. Severability
            </h2>
            <p>
              If any provision of these Terms is found to be unenforceable or invalid,
              that provision shall be limited or eliminated to the minimum extent
              necessary so that these Terms shall otherwise remain in full force and
              effect and enforceable.
            </p>
          </section>

          {/* 18. Entire Agreement */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              18. Entire Agreement
            </h2>
            <p>
              These Terms, together with the Privacy Policy, constitute the entire
              agreement between you and USCEHub regarding your use of the Platform
              and supersede all prior agreements, understandings, and communications,
              whether written or oral.
            </p>
          </section>

          {/* 19. Termination */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              19. Termination
            </h2>
            <p>
              We may suspend or terminate your account and access to the Platform at
              any time, with or without cause, with or without notice. Upon
              termination, your right to use the Platform ceases immediately.
              Provisions that by their nature should survive termination will survive,
              including but not limited to intellectual property provisions, warranty
              disclaimers, limitations of liability, indemnification, and dispute
              resolution.
            </p>
          </section>

          {/* 20. Contact */}
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-white">
              20. Contact
            </h2>
            <p>
              For questions about these Terms of Service, please contact us at{" "}
              <a href="mailto:support@uscehub.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                support@uscehub.com
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
