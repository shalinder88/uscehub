import type { Metadata } from "next";
import { CostCalculator } from "@/components/tools/cost-calculator";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

// PR 0g-fix:
//   - "visa costs" dropped from descriptions (audit H1) — the calculator
//     does NOT include visa, exam, ECFMG, ERAS/NRMP, airfare, malpractice,
//     or background-check fees. Honest scope is housing/food/transport/
//     insurance + a manual program-fee field.
//   - `WebApplication` JSON-LD with `applicationCategory: "FinanceApplication"`
//     removed entirely (audit H2). Schema.org reserves that category for
//     financial-transaction tools (banking, tax filing, loan applications);
//     a static client-side estimator overclaims under it. BreadcrumbSchema
//     preserved. Re-introduce only if/when a real finance product ships
//     with appropriate disclosure. Same authorized SEO-impl exception
//     class as PR #42 (`AggregateRating`) and PR #44 (`DiscussionForumPosting`).
export const metadata: Metadata = {
  title: "Cost Calculator — Estimate Your Observership Trip Costs",
  description:
    "Estimate the trip-side cost of your observership, externship, or research experience in the US — program fee plus housing, food, transport, and an insurance range. Visa, exam, ECFMG, ERAS/NRMP, airfare, malpractice, and background-check fees are not included.",
  alternates: {
    canonical: "https://uscehub.com/tools/cost-calculator",
  },
  openGraph: {
    title: "Cost Calculator — Estimate Your Observership Trip Costs",
    description:
      "Estimator for housing, food, transport, insurance, and program fee. Other IMG-cycle fees are not included.",
    url: "https://uscehub.com/tools/cost-calculator",
  },
};

export default function CostCalculatorPage() {
  return (
    <div className="bg-white">
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
