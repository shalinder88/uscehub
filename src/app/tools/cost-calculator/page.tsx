import type { Metadata } from "next";
import { CostCalculator } from "@/components/tools/cost-calculator";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

export const metadata: Metadata = {
  title: "Cost Calculator — Estimate Your Observership Costs",
  description:
    "Estimate the total cost of your observership, externship, or research experience in the US including program fees, housing, food, transportation, and visa costs.",
  alternates: {
    canonical: "https://uscehub.com/tools/cost-calculator",
  },
  openGraph: {
    title: "Cost Calculator — Estimate Your Observership Costs",
    description:
      "Calculate the total cost of your US clinical experience including housing, food, transportation, and visa fees.",
    url: "https://uscehub.com/tools/cost-calculator",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Observership Cost Calculator — USCEHub",
  description:
    "Estimate the total cost of your observership, externship, or research experience in the United States including program fees, housing, food, transportation, and visa costs.",
  url: "https://uscehub.com/tools/cost-calculator",
  applicationCategory: "FinanceApplication",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function CostCalculatorPage() {
  const SERIF =
    "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";
  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Tools", url: "https://uscehub.com/tools/cost-calculator" },
          { name: "Cost Calculator", url: "https://uscehub.com/tools/cost-calculator" },
        ]}
      />
      <div className="border-b border-[#dfd5b8] dark:border-[#34373f]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
            — Estimator —
          </p>
          <h1
            className="font-serif text-3xl font-normal text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]"
            style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
          >
            Cost <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">estimator</em>
          </h1>
          <p
            className="mt-1 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]"
            style={{ fontFamily: SERIF }}
          >
            A rough estimate, not exact financial advice. Always confirm fees with the institution.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <CostCalculator compact />

        <div className="mt-10 rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
          <p className="mb-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
            — Practical notes —
          </p>
          <h2
            className="font-serif text-lg font-medium text-[#0d1418] dark:text-[#f7f5ec]"
            style={{ fontFamily: SERIF }}
          >
            Ways to keep costs down
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-[#4a5057] dark:text-[#bfc1c9]">
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#a87b2e] dark:bg-[#d8a978]" />
              Look for programs that offer housing assistance or stipends.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#a87b2e] dark:bg-[#d8a978]" />
              Consider cities with lower cost of living like Cleveland, Pittsburgh, or Detroit.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#a87b2e] dark:bg-[#d8a978]" />
              Share accommodation with other applicants doing rotations in the same city.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#a87b2e] dark:bg-[#d8a978]" />
              Apply to free programs first &mdash; many hospital-based observerships have no fee.
            </li>
            <li className="flex gap-2">
              <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[#a87b2e] dark:bg-[#d8a978]" />
              Use public transportation and cook your own meals to reduce daily expenses.
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
