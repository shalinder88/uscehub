import Link from "next/link";
import { CostCalculator } from "@/components/tools/cost-calculator";

export function CostCalculatorSection() {
  return (
    <section className="bg-slate-50 dark:bg-slate-900 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Plan Your Budget
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Estimate the total cost of your clinical experience in the US
            </p>
          </div>
          <Link
            href="/tools/cost-calculator"
            className="hidden text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white sm:block"
          >
            Full calculator &rarr;
          </Link>
        </div>

        <CostCalculator />

        <div className="mt-4 text-center sm:hidden">
          <Link
            href="/tools/cost-calculator"
            className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            View full calculator with tips &rarr;
          </Link>
        </div>
      </div>
    </section>
  );
}
