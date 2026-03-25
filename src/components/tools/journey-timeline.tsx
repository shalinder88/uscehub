import Link from "next/link";
import {
  GraduationCap,
  BookOpen,
  ClipboardCheck,
  Award,
  Stethoscope,
  FlaskConical,
  FileText,
  Send,
  Users,
  Trophy,
} from "lucide-react";

const STEPS = [
  {
    icon: GraduationCap,
    title: "Graduate Medical School",
    timeframe: "Varies",
    tip: "Ensure your medical school is listed in the World Directory of Medical Schools (WDOMS).",
    link: null,
  },
  {
    icon: BookOpen,
    title: "USMLE Step 1",
    timeframe: "3-6 months preparation",
    tip: "Now pass/fail. Focus on a strong pass and build good study habits for Step 2 CK.",
    link: null,
  },
  {
    icon: ClipboardCheck,
    title: "USMLE Step 2 CK",
    timeframe: "3-6 months preparation",
    tip: "Aim for 240+ to be competitive. This score is now the primary screening metric for residency programs.",
    link: null,
  },
  {
    icon: Award,
    title: "ECFMG Certification",
    timeframe: "2-4 months processing",
    tip: "Apply through ECFMG's pathway. You need this before starting most clinical experiences and residency.",
    link: null,
  },
  {
    icon: Stethoscope,
    title: "US Clinical Experience",
    timeframe: "1-6 months",
    tip: "Complete observerships or externships to get US clinical exposure, letters of recommendation, and networking opportunities.",
    link: "/browse",
    linkLabel: "Browse opportunities",
  },
  {
    icon: FlaskConical,
    title: "Research (Optional but Recommended)",
    timeframe: "3-12+ months",
    tip: "Research publications strengthen your CV significantly. Look for clinical research or case reports with US-based faculty.",
    link: "/browse?type=RESEARCH",
    linkLabel: "Find research positions",
  },
  {
    icon: FileText,
    title: "Build CV & Get LORs",
    timeframe: "Ongoing",
    tip: "Get 3-4 strong letters of recommendation from US physicians. Tailor your CV to the ERAS format.",
    link: null,
  },
  {
    icon: Send,
    title: "ERAS Application",
    timeframe: "September",
    tip: "Submit your application through ERAS. Apply broadly — most IMGs apply to 100+ programs. Personal statement matters.",
    link: null,
  },
  {
    icon: Users,
    title: "Interview Season",
    timeframe: "October - January",
    tip: "Prepare for both virtual and in-person interviews. Practice common questions and have your rank list strategy ready.",
    link: null,
  },
  {
    icon: Trophy,
    title: "Match Day",
    timeframe: "March",
    tip: "Results are released in March. If you don't match, SOAP (Supplemental Offer and Acceptance Program) is your backup plan.",
    link: null,
  },
];

export function JourneyTimeline() {
  return (
    <section className="bg-white dark:bg-slate-900 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">
            IMG Journey to Residency
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
            Your step-by-step roadmap from medical school to the Match
          </p>
        </div>

        <div className="mx-auto max-w-3xl">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-5 top-0 hidden h-full w-0.5 bg-slate-200 sm:block" />

            <div className="space-y-0">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isLast = index === STEPS.length - 1;

                return (
                  <div key={step.title} className="relative flex gap-4 pb-8 last:pb-0">
                    {/* Icon circle */}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm">
                      <Icon className="h-4 w-4 text-slate-700 dark:text-slate-300 dark:text-slate-300" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm transition-colors hover:border-slate-300">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
                              {index + 1}
                            </span>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">
                              {step.title}
                            </h3>
                          </div>
                          <p className="mt-1 text-xs font-medium text-slate-400">
                            {step.timeframe}
                          </p>
                        </div>

                        {step.link && (
                          <Link
                            href={step.link}
                            className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-200"
                          >
                            {step.linkLabel} &rarr;
                          </Link>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400 dark:text-slate-400">
                        {step.tip}
                      </p>
                    </div>

                    {/* Connector line on mobile */}
                    {!isLast && (
                      <div className="absolute bottom-0 left-5 h-8 w-0.5 bg-slate-200 sm:hidden" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
