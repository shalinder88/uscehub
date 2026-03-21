import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — USCEHub",
  description: "Privacy policy for the USCEHub platform.",
};

export default function PrivacyPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">
            Last updated: March 2026
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="space-y-8 text-sm leading-relaxed text-slate-600">
          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Introduction
            </h2>
            <p>
              USCEHub (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or &ldquo;us&rdquo;) respects your privacy
              and is committed to protecting your personal information. This
              Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you visit our platform.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Information We Collect
            </h2>
            <p className="mb-2">
              We collect information you provide directly to us, including:
            </p>
            <ul className="ml-4 list-disc space-y-1">
              <li>
                Account information (name, email address, password)
              </li>
              <li>
                Profile information (medical school, graduation year, USMLE
                scores, ECFMG status, visa status)
              </li>
              <li>
                Application data (messages, documents submitted to institutions)
              </li>
              <li>
                Reviews and feedback you submit about programs
              </li>
              <li>
                Communications you send to us (support requests, contact form
                submissions)
              </li>
            </ul>
            <p className="mt-3">
              We also automatically collect certain information when you use our
              platform, including browser type, IP address, pages viewed, and
              access times through standard server logs and analytics tools.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              How We Use Your Information
            </h2>
            <ul className="ml-4 list-disc space-y-1">
              <li>To create and manage your account</li>
              <li>To facilitate applications to listed programs</li>
              <li>To display your reviews and profile information as appropriate</li>
              <li>To communicate with you about your account and applications</li>
              <li>To improve our platform and user experience</li>
              <li>To enforce our terms of service and protect against fraud</li>
              <li>To comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Information Sharing
            </h2>
            <p>
              We do not sell your personal information. We may share your
              information with institutions to which you apply, with your
              consent, or as required by law. When you submit an application to a
              program, your profile information and application materials are
              shared with the listing institution.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Data Security
            </h2>
            <p>
              We implement reasonable security measures to protect your personal
              information against unauthorized access, alteration, disclosure, or
              destruction. However, no method of transmission over the internet or
              electronic storage is completely secure, and we cannot guarantee
              absolute security.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Cookies
            </h2>
            <p>
              We use cookies and similar technologies to maintain your session,
              remember your preferences, and improve your experience. You can
              control cookie settings through your browser, but disabling cookies
              may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Your Rights
            </h2>
            <p>
              You have the right to access, update, or delete your personal
              information. You can manage most of your information through your
              account settings. For data deletion requests or questions about
              your data, please contact us at privacy@usobserverships.com.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy periodically. We will notify you
              of material changes by posting a notice on our platform. Your
              continued use of the platform after changes are posted constitutes
              your acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold text-slate-900">
              Contact Us
            </h2>
            <p>
              If you have questions about this Privacy Policy, please contact us
              at privacy@usobserverships.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
