import type { Metadata } from "next";
import { CostCalculator } from "@/components/tools/cost-calculator";

export const metadata: Metadata = {
  title: "Cost Calculator — USCEHub",
  description:
    "Estimate the total cost of your observership, externship, or research experience in the US including housing, food, and transportation.",
};

export default function CostCalculatorPage() {
  return (
    <div className="bg-white">
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
