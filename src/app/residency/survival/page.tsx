import type { Metadata } from "next";
import {
  Stethoscope,
  Smartphone,
  Timer,
  AlertTriangle,
  Crown,
  Presentation,
  Compass,
  Briefcase,
  FileSignature,
  CalendarCheck,
  Heart,
  Scale,
  DollarSign,
} from "lucide-react";
import { SURVIVAL_TIPS } from "@/lib/residency-data";

export const metadata: Metadata = {
  title: "Residency Survival Guide",
  description:
    "Year-by-year residency survival guide — intern year tips, PGY-2 leadership, PGY-3 job search, board prep timeline, burnout prevention, and financial basics.",
  alternates: {
    canonical: "https://uscehub.com/residency/survival",
  },
  openGraph: {
    title: "Residency Survival Guide — USCEHub",
    description:
      "Year-by-year survival tips for PGY-1 through PGY-3+ with wellness and financial guidance.",
    url: "https://uscehub.com/residency/survival",
  },
};

// Map tip headings to icons for visual variety
const ICON_MAP: Record<string, typeof Stethoscope> = {
  "What to Expect": Stethoscope,
  "Essential Apps & Tools": Smartphone,
  "Time Management": Timer,
  "Common Pitfalls": AlertTriangle,
  "Leadership Transition": Crown,
  "Teaching Juniors": Presentation,
  "Fellowship Planning": Compass,
  "Job Search Preparation": Briefcase,
  "Contract Basics": FileSignature,
  "Board Preparation Timeline": CalendarCheck,
  "Burnout Prevention": Heart,
  "Work-Life Balance": Scale,
  "Financial Basics": DollarSign,
};

const PGY_COLORS: Record<string, { accent: string; bg: string }> = {
  "PGY-1": { accent: "text-accent", bg: "bg-accent/10" },
  "PGY-2": { accent: "text-cyan", bg: "bg-cyan/10" },
  "PGY-3+": { accent: "text-success", bg: "bg-success/10" },
  General: { accent: "text-warning", bg: "bg-warning/10" },
};

export default function SurvivalPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            Residency Survival Guide
          </h1>
          <p className="mt-2 text-lg text-muted max-w-3xl">
            Practical advice organized by training year — from surviving intern
            year to negotiating your first attending contract.
          </p>
        </div>

        {/* PGY Sections */}
        {SURVIVAL_TIPS.map((section) => {
          const colors = PGY_COLORS[section.pgyYear] ?? PGY_COLORS["General"];
          return (
            <section key={section.id} className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <span
                  className={`inline-flex rounded-full px-4 py-1.5 text-sm font-bold ${colors.bg} ${colors.accent}`}
                >
                  {section.pgyYear}
                </span>
                <h2 className="text-xl font-bold text-foreground">
                  {section.title}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {section.tips.map((tip) => {
                  const Icon = ICON_MAP[tip.heading] ?? Stethoscope;
                  return (
                    <div
                      key={tip.heading}
                      className="rounded-xl border border-border bg-surface p-6 hover-glow"
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`inline-flex items-center justify-center rounded-lg ${colors.bg} p-2`}
                        >
                          <Icon className={`h-4 w-4 ${colors.accent}`} />
                        </div>
                        <h3 className="text-base font-semibold text-foreground">
                          {tip.heading}
                        </h3>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">
                        {tip.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
