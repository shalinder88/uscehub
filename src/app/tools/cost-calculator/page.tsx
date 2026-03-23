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
  return (
    <div className="bg-white">
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
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-slate-900">Cost Calculator</h1>
          <p className="mt-1 text-sm text-slate-500">
            Estimate the total cost of your clinical experience in the United
            States
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <CostCalculator compact />

        <div className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Tips to Reduce Costs
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              Look for programs that offer housing assistance or stipends
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              Consider cities with lower cost of living like Cleveland, Pittsburgh, or Detroit
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              Share accommodation with other IMGs doing rotations in the same city
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              Apply for free programs first — many hospital-based observerships have no fee
            </li>
            <li className="flex gap-2">
              <span className="mt-0.5 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" />
              Use public transportation and cook your own meals to save on daily expenses
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
