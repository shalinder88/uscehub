"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  GraduationCap,
  Stethoscope,
  FileSignature,
  Globe,
  Flag,
  Building2,
  Shield,
  Home,
  Info,
} from "lucide-react";

interface JourneyStage {
  id: string;
  title: string;
  visaStatus: string;
  duration: string;
  description: string;
  icon: typeof GraduationCap;
  color: string;
  actions: string[];
  links?: { label: string; href: string }[];
}

const JOURNEY_STAGES: JourneyStage[] = [
  {
    id: "residency",
    title: "Residency Training",
    visaStatus: "J-1 Exchange Visitor",
    duration: "3-7 years",
    description: "You entered the US on a J-1 visa sponsored by ECFMG for residency training. Your DS-2019 specifies your program end date.",
    icon: GraduationCap,
    color: "bg-blue-500",
    actions: [
      "Maintain J-1 status — don't violate terms",
      "Start thinking about waiver strategy in PGY-2 or PGY-3",
      "Research which states/pathways fit your specialty",
      "Build relationships for future employment",
    ],
  },
  {
    id: "waiver-search",
    title: "Waiver Job Search",
    visaStatus: "J-1 (during training) or J-1 grace period",
    duration: "6-18 months before J-1 ends",
    description: "Begin searching for waiver-eligible positions. You need to secure an employer, sign a contract, and file the waiver application before your J-1 status expires.",
    icon: Stethoscope,
    color: "bg-purple-500",
    actions: [
      "Search PracticeLink, MDOpts, 3RNET for J-1 positions",
      "Identify target states and backup states",
      "Research alternative pathways (HHS, ARC, DRA, SCRC)",
      "Apply for state medical license (takes 2-6 months)",
      "Hire an immigration attorney",
    ],
    links: [
      { label: "Job Sources", href: "/career/jobs" },
      { label: "State Intelligence", href: "/career/waiver" },
      { label: "Timeline Calculator", href: "/career/waiver/timeline" },
    ],
  },
  {
    id: "waiver-filing",
    title: "Waiver Application Filed",
    visaStatus: "J-1 → pending waiver",
    duration: "2-6 months (state + DOS processing)",
    description: "Your employer and attorney file the waiver application through the state (Conrad 30) or federal agency (HHS, ARC, etc.). The state reviews, then forwards to DOS.",
    icon: FileSignature,
    color: "bg-orange-500",
    actions: [
      "State reviews application (2-10 weeks)",
      "State forwards recommendation to DOS",
      "DOS Waiver Review Division processes (8-12 weeks)",
      "No expedited processing available at DOS",
    ],
    links: [
      { label: "Contract Checklist", href: "/career/contract" },
      { label: "Waiver Pathways", href: "/career/waiver/pathways" },
    ],
  },
  {
    id: "h1b-filing",
    title: "H-1B Petition Filed",
    visaStatus: "J-1 → H-1B (change of status)",
    duration: "15 days (premium) or 3-6 months (regular)",
    description: "After DOS issues a favorable waiver recommendation, your employer files an H-1B petition with USCIS. Premium processing ($2,965) gives 15-day adjudication — strongly recommended.",
    icon: Globe,
    color: "bg-cyan-500",
    actions: [
      "Employer files I-129 H-1B petition",
      "Use premium processing ($2,965) — don't wait 6 months",
      "USCIS adjudicates and approves",
      "Receive I-797 approval notice",
    ],
    links: [
      { label: "H-1B Guide", href: "/career/h1b" },
    ],
  },
  {
    id: "waiver-service",
    title: "3-Year Waiver Service",
    visaStatus: "H-1B (employer-sponsored)",
    duration: "3 years (mandatory)",
    description: "You work full-time (40+ hours/week) at the designated HPSA/MUA facility for exactly 3 years. This is the core of the waiver commitment. You cannot leave or change employers without jeopardizing your status.",
    icon: Building2,
    color: "bg-green-500",
    actions: [
      "Work full-time at designated facility for 3 years",
      "FILE YOUR I-140 (green card petition) EARLY — don't wait",
      "Maintain H-1B status — don't violate terms",
      "Build your practice and patient panel",
      "Network for post-waiver opportunities",
    ],
    links: [
      { label: "Green Card Pathways", href: "/career/greencard" },
      { label: "Salary Benchmarks", href: "/career/salary" },
    ],
  },
  {
    id: "green-card",
    title: "Green Card Process",
    visaStatus: "H-1B → pending I-485 → Green Card",
    duration: "1-12+ years (depends on country of birth)",
    description: "File I-140 (EB-2 NIW or EB-1) as early as possible during your waiver service. When your priority date becomes current, file I-485 for adjustment of status.",
    icon: Flag,
    color: "bg-yellow-500",
    actions: [
      "File I-140 during year 1-2 of waiver service",
      "EB-2 NIW: self-petition based on national interest",
      "EB-1: if you have significant academic achievements",
      "Wait for priority date to become current (Visa Bulletin)",
      "File I-485 when eligible",
      "Receive EAD (work authorization) and AP (travel) while pending",
    ],
    links: [
      { label: "Green Card Pathways", href: "/career/greencard" },
    ],
  },
  {
    id: "free-agent",
    title: "Post-Waiver Freedom",
    visaStatus: "Green Card holder or H-1B (transferable)",
    duration: "Rest of career",
    description: "After completing your 3-year waiver and obtaining a green card (or while I-485 is pending with EAD), you are free to practice anywhere, change employers, and pursue any opportunity.",
    icon: Home,
    color: "bg-emerald-500",
    actions: [
      "Free to change employers (H-1B portability or EAD)",
      "Can pursue fellowship, academic positions, private practice",
      "No geographic or employer restrictions",
      "Apply for citizenship after 5 years of green card (3 if married to US citizen)",
    ],
    links: [
      { label: "Offer Comparison", href: "/career/offers" },
      { label: "Interview Prep", href: "/career/interview" },
    ],
  },
];

export default function VisaJourneyPage() {
  const [activeStage, setActiveStage] = useState<string>("residency");
  const active = JOURNEY_STAGES.find((s) => s.id === activeStage)!;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Physician Visa Journey
        </h1>
        <p className="text-muted max-w-2xl text-base">
          The complete immigration pathway from J-1 residency through green
          card — every visa status, every step, every decision point. Click
          each stage for details.
        </p>
      </div>

      {/* Visual Journey Flow */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Stage Selector (left/top) */}
        <div className="lg:w-80 shrink-0">
          <div className="space-y-2">
            {JOURNEY_STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isActive = stage.id === activeStage;
              return (
                <div key={stage.id}>
                  <button
                    onClick={() => setActiveStage(stage.id)}
                    className={`w-full text-left rounded-xl border p-4 transition-all ${
                      isActive
                        ? "border-accent bg-accent/5 shadow-sm"
                        : "border-border bg-surface hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`rounded-lg ${stage.color} p-2`}>
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-foreground truncate">
                          {stage.title}
                        </div>
                        <div className="text-[10px] text-muted truncate">
                          {stage.visaStatus}
                        </div>
                      </div>
                      <span className="text-[10px] text-muted shrink-0">
                        {stage.duration}
                      </span>
                    </div>
                  </button>
                  {i < JOURNEY_STAGES.length - 1 && (
                    <div className="flex justify-center py-1">
                      <ArrowDown className="h-3 w-3 text-muted" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Stage Detail (right/bottom) */}
        <div className="flex-1">
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 sticky top-20">
            <div className="flex items-center gap-3 mb-4">
              <div className={`rounded-lg ${active.color} p-3`}>
                <active.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {active.title}
                </h2>
                <div className="flex items-center gap-3 text-xs text-muted mt-1">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    {active.visaStatus}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {active.duration}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-sm text-muted mb-6 leading-relaxed">
              {active.description}
            </p>

            <h3 className="text-sm font-semibold text-foreground mb-3">
              What to Do at This Stage
            </h3>
            <div className="space-y-2 mb-6">
              {active.actions.map((action, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                  <span className="text-sm text-muted">{action}</span>
                </div>
              ))}
            </div>

            {active.links && active.links.length > 0 && (
              <div className="pt-4 border-t border-border">
                <h3 className="text-xs font-semibold text-foreground mb-2">
                  Related Tools
                </h3>
                <div className="flex flex-wrap gap-2">
                  {active.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="inline-flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/5 transition-colors"
                    >
                      {link.label}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mt-8 rounded-lg bg-surface-alt p-4 flex gap-3">
        <Info className="h-4 w-4 text-muted shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          This is a general overview of the physician immigration journey.
          Individual timelines vary based on specialty, country of birth,
          state, and specific circumstances. Always consult an immigration
          attorney for advice specific to your situation.
        </p>
      </div>
    </div>
  );
}
