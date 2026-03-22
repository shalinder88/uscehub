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
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">
            Terms of Service
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: March 2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Acceptance of Terms
            </h2>
            <p>
              By accessing or using USCEHub, you agree to be bound by
              these Terms of Service. If you do not agree to these terms, you
              must not use the platform. We reserve the right to modify these
              terms at any time, and your continued use constitutes acceptance
              of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Account Registration
            </h2>
            <p>
              To access certain features, you must create an account. You agree
              to provide accurate, current, and complete information during
              registration and to update this information to keep it accurate.
              You are responsible for safeguarding your password and for all
              activities that occur under your account. You must immediately
              notify us of any unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              User Conduct
            </h2>
            <p className="mb-2">You agree not to:</p>
            <ul className="ml-4 list-disc space-y-1">
              <li>Post false, misleading, or fraudulent listings or reviews</li>
              <li>Impersonate any person or institution</li>
              <li>
                Use the platform for any unlawful purpose or in violation of
                any applicable regulations
              </li>
              <li>
                Harass, abuse, or threaten other users of the platform
              </li>
              <li>
                Attempt to interfere with the proper operation of the platform
              </li>
              <li>
                Scrape, crawl, or use automated means to access the platform
                without our written permission
              </li>
              <li>
                Upload malicious code, viruses, or any other harmful content
              </li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Listing Guidelines
            </h2>
            <p>
              Institutions and individuals posting listings must provide
              accurate and truthful information about their programs. Listings
              that are found to be fraudulent, misleading, or in violation of
              our guidelines will be removed, and the responsible account may
              be suspended or terminated. All listings are subject to review
              and approval by our moderation team.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Reviews and User Content
            </h2>
            <p>
              By submitting reviews, comments, or other content, you grant
              USCEHub a non-exclusive, royalty-free, perpetual,
              irrevocable license to use, reproduce, modify, and display such
              content on the platform. Reviews must be based on genuine
              experiences and must not contain defamatory, abusive, or
              misleading content. We reserve the right to remove content that
              violates our guidelines.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Intellectual Property
            </h2>
            <p>
              The platform, including its design, code, logos, and original
              content, is the intellectual property of USCEHub. You may
              not reproduce, distribute, modify, or create derivative works
              without our express written permission. Listing content belongs
              to the respective posting institutions.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Limitation of Liability
            </h2>
            <p>
              USCEHub is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo;
              basis without warranties of any kind. We do not guarantee the
              quality, legitimacy, or outcomes of any listed program. To the
              fullest extent permitted by law, we shall not be liable for any
              damages arising from your use of the platform, reliance on
              information provided herein, or interactions with third parties.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Termination
            </h2>
            <p>
              We may suspend or terminate your account at any time, with or
              without cause, with or without notice. Upon termination, your
              right to use the platform ceases immediately. Provisions that by
              their nature should survive termination will survive, including
              intellectual property provisions, limitations of liability, and
              dispute resolution.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Dispute Resolution
            </h2>
            <p>
              Any disputes arising from or related to these Terms or your use
              of the platform shall be resolved through binding arbitration in
              accordance with applicable rules. You agree to resolve disputes
              individually and waive any right to participate in class action
              proceedings.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Contact
            </h2>
            <p>
              For questions about these Terms of Service, please contact us at
              legal@usobserverships.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
