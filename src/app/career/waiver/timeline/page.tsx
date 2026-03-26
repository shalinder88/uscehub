"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";

interface TimelineStep {
  label: string;
  description: string;
  monthsBefore: number;
  critical: boolean;
}

const TIMELINE_STEPS: TimelineStep[] = [
  {
    label: "Start employer search",
    description:
      "Begin searching for waiver-eligible positions. Contact recruiters, search PracticeLink/MDOpts, network with physicians who have completed waivers.",
    monthsBefore: 18,
    critical: true,
  },
  {
    label: "Identify target states and pathways",
    description:
      "Research which states have remaining Conrad slots, which alternative pathways (HHS, ARC, DRA, SCRC) cover your area. Have 2-3 backup states ready.",
    monthsBefore: 15,
    critical: false,
  },
  {
    label: "Begin state medical license application",
    description:
      "Most states require a full unrestricted license before waiver filing. License processing takes 2-6 months. Start NOW.",
    monthsBefore: 14,
    critical: true,
  },
  {
    label: "Negotiate and sign employment contract",
    description:
      "Ensure contract includes: HPSA site specification, no non-compete clause, 3-year commitment, malpractice coverage, salary details. Have an immigration attorney review it.",
    monthsBefore: 12,
    critical: true,
  },
  {
    label: "Hire immigration attorney",
    description:
      "Budget $5,000-15,000. Attorney should specialize in physician immigration (J-1 waivers, H-1B, green cards). Get referrals from physicians who have been through the process.",
    monthsBefore: 12,
    critical: true,
  },
  {
    label: "Prepare waiver application package",
    description:
      "Employer prepares: Letter of Need, recruitment evidence, community support letters. You provide: J-1 documentation, diplomas, licenses, board certifications.",
    monthsBefore: 10,
    critical: false,
  },
  {
    label: "Submit to state (if Conrad 30)",
    description:
      "For Conrad 30: submit to state DOH. Many competitive states fill all 30 slots within days of the October 1 fiscal year start. Submit on October 1 if possible.",
    monthsBefore: 9,
    critical: true,
  },
  {
    label: "State review period",
    description:
      "State health department reviews application. Processing time varies: 2-10 weeks depending on state. Fast states (WY, WV): 45-60 days. Slow states (CA, NY): 90-180 days.",
    monthsBefore: 7,
    critical: false,
  },
  {
    label: "State forwards to DOS (Department of State)",
    description:
      "If state approves, they forward recommendation to the DOS Waiver Review Division.",
    monthsBefore: 6,
    critical: false,
  },
  {
    label: "DOS review period",
    description:
      "DOS Waiver Review Division processes the recommendation. Typical timeline: 8-12 weeks. No way to expedite.",
    monthsBefore: 5,
    critical: false,
  },
  {
    label: "DOS issues favorable recommendation",
    description:
      "DOS sends favorable recommendation to USCIS. Your attorney files H-1B petition simultaneously or immediately after.",
    monthsBefore: 3,
    critical: false,
  },
  {
    label: "USCIS H-1B adjudication",
    description:
      "USCIS reviews and approves the H-1B petition. Premium processing available ($2,965 fee for 15-day processing). Strongly recommended — don't wait for regular processing.",
    monthsBefore: 2,
    critical: true,
  },
  {
    label: "Begin employment within 90 days",
    description:
      "You must begin your 3-year waiver service within 90 days of H-1B approval. Plan your move, housing, and start date accordingly.",
    monthsBefore: 0,
    critical: true,
  },
];

function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function monthsDiff(a: Date, b: Date): number {
  return (
    (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth())
  );
}

export default function WaiverTimelinePage() {
  const [j1EndDate, setJ1EndDate] = useState("");

  const timeline = useMemo(() => {
    if (!j1EndDate) return null;

    const endDate = new Date(j1EndDate + "T00:00:00");
    if (isNaN(endDate.getTime())) return null;

    const today = new Date();
    const monthsRemaining = monthsDiff(today, endDate);

    const steps = TIMELINE_STEPS.map((step) => {
      const targetDate = addMonths(endDate, -step.monthsBefore);
      const isPast = targetDate < today;
      const isOverdue = isPast && step.critical;
      return { ...step, targetDate, isPast, isOverdue };
    });

    return { endDate, monthsRemaining, steps };
  }, [j1EndDate]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <Link
        href="/career/waiver"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to State Intelligence
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Calendar className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            J-1 Waiver Timeline Calculator
          </h1>
        </div>
        <p className="text-muted max-w-2xl">
          Enter your J-1 visa end date and we&apos;ll generate a personalized
          timeline showing exactly when each step of the waiver process needs
          to happen. Critical deadlines are highlighted.
        </p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-border bg-surface p-6 mb-8">
        <label
          htmlFor="j1-end"
          className="block text-sm font-semibold text-foreground mb-2"
        >
          When does your J-1 status end?
        </label>
        <div className="flex items-center gap-4">
          <input
            id="j1-end"
            type="date"
            value={j1EndDate}
            onChange={(e) => setJ1EndDate(e.target.value)}
            className="rounded-lg border border-border bg-surface-alt px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
          />
          {timeline && (
            <div className="text-sm">
              <span className="text-muted">Time remaining: </span>
              <span
                className={`font-bold ${
                  timeline.monthsRemaining < 12
                    ? "text-danger"
                    : timeline.monthsRemaining < 18
                    ? "text-warning"
                    : "text-success"
                }`}
              >
                {timeline.monthsRemaining} months
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-muted mt-2">
          This is the date your J-1 training program ends (or your authorized
          stay expires). Check your DS-2019 form for the program end date.
        </p>
      </div>

      {/* Urgency Alert */}
      {timeline && timeline.monthsRemaining < 12 && (
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 mb-8 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div className="text-sm text-muted">
            <strong className="text-danger">
              {timeline.monthsRemaining < 6
                ? "CRITICAL: "
                : "Warning: "}
            </strong>
            {timeline.monthsRemaining < 6
              ? "You have less than 6 months remaining. Some steps may already be overdue. Contact an immigration attorney immediately. Consider alternative pathways (HHS, ARC, DRA, SCRC) with faster processing."
              : "You have less than 12 months remaining. Begin the process urgently. The typical waiver process takes 6-18 months from start to employment."}
          </div>
        </div>
      )}

      {/* Timeline */}
      {timeline ? (
        <div className="space-y-1">
          {timeline.steps.map((step, i) => (
            <div
              key={i}
              className={`relative flex gap-4 pl-4 ${
                i < timeline.steps.length - 1 ? "pb-6" : ""
              }`}
            >
              {/* Vertical line */}
              {i < timeline.steps.length - 1 && (
                <div className="absolute left-[1.35rem] top-8 bottom-0 w-0.5 bg-border" />
              )}

              {/* Dot */}
              <div
                className={`relative z-10 mt-1 flex h-6 w-6 items-center justify-center rounded-full shrink-0 ${
                  step.isOverdue
                    ? "bg-danger text-white"
                    : step.isPast
                    ? "bg-success/20 text-success"
                    : step.critical
                    ? "bg-warning/20 text-warning"
                    : "bg-surface-alt text-muted"
                }`}
              >
                {step.isOverdue ? (
                  <AlertTriangle className="h-3 w-3" />
                ) : step.isPast ? (
                  <CheckCircle2 className="h-3 w-3" />
                ) : (
                  <Clock className="h-3 w-3" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3
                      className={`text-sm font-semibold ${
                        step.isOverdue
                          ? "text-danger"
                          : step.isPast
                          ? "text-muted line-through"
                          : "text-foreground"
                      }`}
                    >
                      {step.label}
                      {step.critical && !step.isPast && (
                        <span className="ml-2 text-[10px] font-medium text-warning bg-warning/10 rounded px-1.5 py-0.5">
                          CRITICAL
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-muted mt-0.5 max-w-lg">
                      {step.description}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-mono ${
                        step.isOverdue
                          ? "text-danger font-bold"
                          : step.isPast
                          ? "text-muted"
                          : "text-foreground"
                      }`}
                    >
                      {formatDate(step.targetDate)}
                    </div>
                    <div className="text-[10px] text-muted">
                      {step.monthsBefore > 0
                        ? `${step.monthsBefore} months before end`
                        : "J-1 end date"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-surface-alt p-8 text-center">
          <Calendar className="h-10 w-10 text-muted mx-auto mb-3" />
          <p className="text-sm text-muted">
            Enter your J-1 end date above to generate your personalized waiver
            timeline.
          </p>
        </div>
      )}

      {/* Info box */}
      <div className="mt-8 rounded-xl border border-border bg-surface-alt p-5 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted space-y-1">
          <p>
            <strong className="text-foreground">Important:</strong> This
            timeline is a general guide. Actual processing times vary by state
            and pathway. Some states process in 45 days (WY, WV), others take
            180+ days (CA, NY).
          </p>
          <p>
            If your timeline is tight, consider{" "}
            <Link href="/career/waiver/pathways" className="text-accent hover:underline">
              alternative pathways
            </Link>{" "}
            with faster processing or states that{" "}
            <Link href="/career/waiver/tracker" className="text-accent hover:underline">
              still have remaining slots
            </Link>.
          </p>
        </div>
      </div>
    </div>
  );
}
