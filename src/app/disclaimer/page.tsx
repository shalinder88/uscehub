import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Disclaimer",
  description:
    "Legal disclaimer for USCEHub. Read about our limitations of liability, accuracy of listings, and relationship with medical institutions and regulatory bodies.",
  alternates: {
    canonical: "https://uscehub.com/disclaimer",
  },
};

export default function DisclaimerPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Disclaimer</h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: March 2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              General Disclaimer
            </h2>
            <p>
              USCEHub is an educational and informational platform
              designed to connect International Medical Graduates (IMGs) with
              clinical experience opportunities in the United States. We are not
              affiliated with, endorsed by, or officially connected to the
              National Resident Matching Program (NRMP), the Educational
              Commission for Foreign Medical Graduates (ECFMG), the Electronic
              Residency Application Service (ERAS), or the Association of
              American Medical Colleges (AAMC). All trademarks, service marks,
              and trade names referenced on this platform belong to their
              respective owners.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Listing Accuracy
            </h2>
            <p>
              Listings on USCEHub are submitted by third-party
              institutions, organizations, and individuals. While we make
              reasonable efforts to review and verify listing information, we do
              not guarantee the accuracy, completeness, timeliness, or validity
              of any listing, including but not limited to program details,
              costs, duration, eligibility requirements, or outcomes. Users are
              strongly advised to independently verify all information before
              making decisions or payments.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              No Professional Advice
            </h2>
            <p>
              The information provided on this platform does not constitute
              medical, legal, immigration, financial, or professional advice.
              Users should consult with qualified professionals regarding their
              specific circumstances, including visa requirements, licensing
              regulations, and career planning decisions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Financial Transactions
            </h2>
            <p>
              USCEHub does not process payments between applicants and
              institutions. Any financial transactions related to program fees,
              deposits, or other costs are conducted directly between the
              applicant and the institution. We strongly recommend verifying the
              legitimacy of any institution before making payments. We are not
              responsible for any financial loss resulting from interactions
              initiated through this platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              User-Generated Content
            </h2>
            <p>
              Reviews, comments, and other user-generated content on this
              platform represent the personal opinions of individual users and
              do not reflect the views of USCEHub. While we moderate
              content for compliance with our guidelines, we do not guarantee the
              accuracy or reliability of user-generated content.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Limitation of Liability
            </h2>
            <p>
              To the fullest extent permitted by law, USCEHub, its
              operators, affiliates, and contributors shall not be liable for any
              direct, indirect, incidental, consequential, or punitive damages
              arising from the use of or inability to use this platform, reliance
              on information provided herein, or interactions with third parties
              encountered through this platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              External Links
            </h2>
            <p>
              This platform may contain links to external websites and resources.
              These links are provided for convenience and informational purposes
              only. We do not endorse, control, or assume responsibility for the
              content, privacy policies, or practices of any third-party
              websites.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Observership Swap Board
            </h2>
            <p>
              USCEHub facilitates introductions between users seeking to swap
              or transfer observership spots. The transfer or swap of any observership
              position must be approved by the respective institution(s). USCEHub does
              not guarantee that institutions will approve transfers. Users are solely
              responsible for communicating with institutions and verifying that swaps
              are permitted.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Physician & Clinic Listings
            </h2>
            <p>
              Individual physicians and clinics may list observership opportunities on
              this platform. USCEHub does not verify the clinical credentials, malpractice
              coverage, or institutional standing of individual physician posters beyond
              basic NPI verification. Observers are responsible for verifying the legitimacy
              of any private practice opportunity, confirming appropriate insurance coverage,
              and ensuring compliance with applicable state regulations.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Insurance & Visa
            </h2>
            <p>
              USCEHub does not provide malpractice insurance, health insurance,
              or visa sponsorship. Observers are responsible for obtaining appropriate
              insurance coverage as required by the hosting institution. Most observership
              programs require observers to carry health insurance valid in the United
              States. Some programs require malpractice insurance even for observers.
              Observers on B1/B2 visitor visas may observe only — no patient contact,
              no clinical duties, no compensation.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              User-Submitted Program Information
            </h2>
            <p>
              Users may submit program information and tips through the community features.
              All user submissions are reviewed by our admin team before publication, but
              USCEHub does not guarantee the accuracy or currency of user-submitted
              information. Always verify details directly with the institution.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Changes to This Disclaimer
            </h2>
            <p>
              We reserve the right to modify this disclaimer at any time without
              prior notice. Changes are effective immediately upon posting.
              Continued use of the platform after changes constitutes acceptance
              of the updated disclaimer.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
