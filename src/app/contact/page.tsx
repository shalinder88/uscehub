import type { Metadata } from "next";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";
import { Mail, MapPin, Clock } from "lucide-react";
import { resolveContactContext } from "@/lib/usce-contact-context";
import { ContactReportForm } from "./ContactReportForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with the USCEHub team. Questions about observership listings, partnerships, or platform features? We are here to help International Medical Graduates.",
  alternates: {
    canonical: "https://uscehub.com/contact",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Contact USCEHub",
  url: "https://uscehub.com/contact",
  mainEntity: {
    "@type": "Organization",
    name: "USCEHub",
    url: "https://uscehub.com",
    contactPoint: {
      "@type": "ContactPoint",
      email: "support@uscehub.com",
      contactType: "customer support",
      availableLanguage: "English",
    },
  },
};

interface ContactPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;
  const context = resolveContactContext(params);

  return (
    <div className="bg-[var(--bg)] dark:bg-slate-950">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Contact Us", url: "https://uscehub.com/contact" },
        ]}
      />
      <div className="border-b border-[var(--line)]" style={{ background: "var(--bg-alt)" }}>
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Contact Us</h1>
          <p className="mt-2 text-base text-slate-500 dark:text-slate-400">
            Have a question or need help? We are here for you.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Send us a message
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Fill out the form below and we will get back to you within 48 hours.
            </p>

            <ContactReportForm context={context} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Other ways to reach us
            </h2>
            <div className="mt-6 space-y-6">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Mail className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Email</p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    support@uscehub.com
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Response Time
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    Within 48 business hours
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
                  <MapPin className="h-5 w-5 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Location
                  </p>
                  <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                    United States (Remote Team)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
