"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ImgFaqSchema } from "./img-faq-schema";
import {
  BarChart3,
  Stethoscope,
  Building2,
  GraduationCap,
  CalendarDays,
  BookOpen,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  CheckCircle,
  Shield,
  Globe,
  ArrowRight,
  Info,
  Star,
} from "lucide-react";

import {
  NRMP_HEADLINE_STATS,
  NRMP_TRENDS,
  SPECIALTY_DATA,
  STEP2_CK_AVERAGES,
  INTERVIEW_DATA,
  YOG_DATA,
  ECFMG_REQUIREMENTS,
  ECFMG_PATHWAYS,
  ECFMG_DEADLINES,
  SOAP_DATA,
  MATCH_PROCESS_STEPS,
  MATCH_ALGORITHM_KEY_FACTS,
  SIGNALING_DATA,
  IMG_FRIENDLY_PROGRAMS,
  STATE_IMG_DATA,
  APPLICATION_TIMELINE,
  COMMON_MISTAKES,
  VISA_INFO,
  KEY_RESOURCES,
  COMMUNITY_INSIGHTS,
  type SpecialtyLevel,
} from "@/lib/img-data";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function levelColor(level: SpecialtyLevel) {
  const map: Record<SpecialtyLevel, string> = {
    accessible: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
    moderate: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
    competitive: "bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-400",
    "very-competitive": "bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-400",
    "extremely-competitive": "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300",
  };
  return map[level];
}

function levelLabel(level: SpecialtyLevel) {
  const map: Record<SpecialtyLevel, string> = {
    accessible: "Accessible",
    moderate: "Moderate",
    competitive: "Competitive",
    "very-competitive": "Very Competitive",
    "extremely-competitive": "Extremely Competitive",
  };
  return map[level];
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === "growing") return <TrendingUp className="h-3.5 w-3.5 text-emerald-600" />;
  if (trend === "declining") return <TrendingDown className="h-3.5 w-3.5 text-red-600" />;
  return <Minus className="h-3.5 w-3.5 text-slate-400" />;
}

function StatCard({ label, value, detail, color }: { label: string; value: string; detail: string; color: string }) {
  const borderColors: Record<string, string> = {
    blue: "border-blue-200 dark:border-blue-800",
    emerald: "border-emerald-200 dark:border-emerald-800",
    amber: "border-amber-200 dark:border-amber-800",
    red: "border-red-200 dark:border-red-800",
    violet: "border-violet-200 dark:border-violet-800",
  };
  const textColors: Record<string, string> = {
    blue: "text-blue-700 dark:text-blue-400",
    emerald: "text-emerald-700 dark:text-emerald-400",
    amber: "text-amber-700 dark:text-amber-400",
    red: "text-red-700 dark:text-red-400",
    violet: "text-violet-700 dark:text-violet-400",
  };
  return (
    <div className={`rounded-xl border-2 ${borderColors[color] || ""} p-4 text-center`}>
      <p className={`text-2xl font-bold ${textColors[color] || ""}`}>{value}</p>
      <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">{label}</p>
      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{detail}</p>
    </div>
  );
}

// ─── TAB: Overview ───────────────────────────────────────────────────────────

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Headline Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {NRMP_HEADLINE_STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Specialty Match Rates Table */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          2025 Match by Specialty — IMG Fill Rates
        </h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-600 dark:text-slate-300">Specialty</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Positions</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">IMGs Matched</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">IMG %</th>
                <th className="px-3 py-2.5 text-right text-xs font-semibold text-slate-600 dark:text-slate-300">Unfilled</th>
                <th className="px-3 py-2.5 text-center text-xs font-semibold text-slate-600 dark:text-slate-300">Level</th>
              </tr>
            </thead>
            <tbody>
              {SPECIALTY_DATA.slice(0, 10).map((s, i) => (
                <tr key={s.name} className={i % 2 === 0 ? "bg-white dark:bg-slate-900" : "bg-slate-50/50 dark:bg-slate-800/30"}>
                  <td className="px-4 py-2.5 text-sm font-medium text-slate-900 dark:text-white">{s.name}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{s.positions2025.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{s.imgMatched.toLocaleString()}</td>
                  <td className="px-3 py-2.5 text-right font-semibold text-slate-900 dark:text-white">{s.imgFillRate}%</td>
                  <td className="px-3 py-2.5 text-right text-slate-600 dark:text-slate-300">{s.unfilled}</td>
                  <td className="px-3 py-2.5 text-center">
                    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium ${levelColor(s.level)}`}>
                      {levelLabel(s.level)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5-Year Trend */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          IMG Match Trends (2021-2025)
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {NRMP_TRENDS.map((t) => (
            <div key={t.year} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400">{t.year}</p>
              <p className="mt-1 text-lg font-bold text-slate-900 dark:text-white">{t.matchRate}%</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {t.imgMatched.toLocaleString()} / {t.imgApplicants.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Step 2 CK */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          Step 2 CK Scores — Matched Applicants (2024)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {STEP2_CK_AVERAGES.map((s) => (
            <div key={s.type} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{s.matched}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{s.type}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3">
          <p className="flex items-start gap-2 text-xs text-blue-800 dark:text-blue-300">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>Aim for 5-15 points above your specialty average. Passing score raised to 218 in July 2025.</span>
          </p>
        </div>
      </div>

      {/* Interview Data */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          Interview Invitations — What to Expect
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INTERVIEW_DATA.map((d) => (
            <div key={d.group} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 text-center">
              <p className="text-xl font-bold text-slate-900 dark:text-white">{d.invitations}</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{d.group}</p>
            </div>
          ))}
        </div>
      </div>

      {/* YOG Impact */}
      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">
          Year of Graduation Impact
        </h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {YOG_DATA.map((y) => {
            const colors: Record<string, string> = {
              best: "border-emerald-300 dark:border-emerald-700",
              good: "border-emerald-200 dark:border-emerald-800",
              moderate: "border-amber-200 dark:border-amber-800",
              challenging: "border-orange-200 dark:border-orange-800",
              difficult: "border-red-200 dark:border-red-800",
              "very-difficult": "border-red-300 dark:border-red-700",
            };
            return (
              <div key={y.range} className={`rounded-lg border-2 ${colors[y.level] || ""} p-3 text-center`}>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{y.matchRate}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{y.range}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: Specialties ────────────────────────────────────────────────────────

function SpecialtiesTab() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        14 specialties ranked by IMG accessibility. Data from NRMP 2025 Match and Charting Outcomes 2024.
      </p>
      {SPECIALTY_DATA.map((s) => (
        <div key={s.name} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{s.name}</h3>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${levelColor(s.level)}`}>
              {levelLabel(s.level)}
            </span>
            <TrendIcon trend={s.trend} />
          </div>
          <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">{s.notes}</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
            <span><strong className="text-slate-900 dark:text-white">{s.positions2025.toLocaleString()}</strong> positions</span>
            <span><strong className="text-slate-900 dark:text-white">{s.imgMatched.toLocaleString()}</strong> IMGs matched</span>
            <span><strong className="text-slate-900 dark:text-white">{s.imgFillRate}%</strong> IMG fill rate</span>
            <span>Step 2 CK: <strong className="text-slate-900 dark:text-white">{s.step2Target}</strong></span>
            <span>{s.unfilled > 0 ? `${s.unfilled} unfilled` : "No unfilled spots"}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TAB: Programs ───────────────────────────────────────────────────────────

function ProgramsTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Top IMG-Friendly Programs</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {IMG_FRIENDLY_PROGRAMS.map((p) => (
            <div key={p.name} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{p.name}</h4>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{p.location}</p>
                </div>
                <Badge variant="success" className="text-xs shrink-0">{p.imgPercent} IMG</Badge>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {p.specialties.map((s) => (
                  <span key={s} className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-600 dark:text-slate-300">{s}</span>
                ))}
              </div>
              <ul className="mt-3 space-y-1">
                {p.highlights.map((h) => (
                  <li key={h} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
                    <CheckCircle className="h-3 w-3 shrink-0 text-emerald-500" />
                    {h}
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">PGY-1 salary: {p.salary}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Top States for IMG Residency</h3>
        <div className="space-y-2">
          {STATE_IMG_DATA.map((s) => (
            <Link key={s.state} href={`/observerships/${s.state.toLowerCase().replace(/\s+/g, "-")}`}
              className={`block rounded-lg border p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 ${s.highlight ? "border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20" : "border-slate-200 dark:border-slate-700"}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">{s.abbr}</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{s.state}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.note}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-xs">{s.programs} programs</Badge>
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <Link href="/observerships"><Button variant="outline" size="sm">View All States <ArrowRight className="ml-1 h-3.5 w-3.5" /></Button></Link>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: ECFMG & Exams ─────────────────────────────────────────────────────

function EcfmgTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">ECFMG Certification Requirements</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">USMLE Step 1</h4>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{ECFMG_REQUIREMENTS.step1.status} — Passing score: {ECFMG_REQUIREMENTS.step1.passingScore}</p>
            <p className="mt-1 text-xs text-slate-500">{ECFMG_REQUIREMENTS.step1.note}</p>
          </div>
          <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">USMLE Step 2 CK</h4>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{ECFMG_REQUIREMENTS.step2ck.status} — Passing score: {ECFMG_REQUIREMENTS.step2ck.passingScore}</p>
            <p className="mt-1 text-xs font-semibold text-blue-700 dark:text-blue-400">{ECFMG_REQUIREMENTS.step2ck.note}</p>
          </div>
          <div className="rounded-xl border-2 border-amber-200 dark:border-amber-800 p-5">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-amber-600" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">OET Medicine</h4>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{ECFMG_REQUIREMENTS.oet.note}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(ECFMG_REQUIREMENTS.oet.scores).map(([key, val]) => (
                <span key={key} className="rounded bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">{key}: {val}</span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">7-Year Rule</h4>
            </div>
            <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{ECFMG_REQUIREMENTS.sevenYearRule}</p>
          </div>
        </div>
        <div className="mt-4 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
          <p className="flex items-start gap-2 text-xs text-red-800 dark:text-red-300">
            <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span><strong>New:</strong> {ECFMG_REQUIREMENTS.canadianChange}</span>
          </p>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">ECFMG Pathways (2025-2026)</h3>
        <div className="space-y-2">
          {ECFMG_PATHWAYS.map((p) => (
            <div key={p.number} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-700 text-xs font-bold text-white">{p.number}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{p.name}</h4>
                    <span className="rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">{p.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{p.details}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 p-5">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Key Deadlines</h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">2026 Pathways Application Deadline</span>
            <span className="font-bold text-slate-900 dark:text-white">{ECFMG_DEADLINES.pathways2026Deadline}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">OET Last Test for 2026 Match</span>
            <span className="font-bold text-slate-900 dark:text-white">{ECFMG_DEADLINES.oetLastTest}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-600 dark:text-slate-400">Match Day 2026</span>
            <span className="font-bold text-slate-900 dark:text-white">{ECFMG_DEADLINES.matchDay2026}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── TAB: Application ────────────────────────────────────────────────────────

function ApplicationTab() {
  return (
    <div className="space-y-10">
      {/* ── How the Match Works ── */}
      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">How the Residency Match Works</h3>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
          The NRMP Match uses a Nobel Prize-winning algorithm to pair applicants with residency programs.
          Here&apos;s the step-by-step process every IMG needs to understand.
        </p>

        {/* Visual step flow */}
        <div className="relative space-y-0">
          {MATCH_PROCESS_STEPS.map((s, i) => (
            <div key={s.step} className="relative flex gap-4 pb-6">
              {/* Connecting line */}
              {i < MATCH_PROCESS_STEPS.length - 1 && (
                <div className="absolute left-5 top-12 h-[calc(100%-2rem)] w-0.5 bg-slate-200 dark:bg-slate-700" />
              )}
              {/* Step circle */}
              <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-700 text-sm font-bold text-white">
                {s.step}
              </div>
              <div className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{s.title}</h4>
                  <span className="shrink-0 rounded-full bg-blue-50 dark:bg-blue-950/30 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                    {s.timing}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{s.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Key facts about the algorithm */}
        <div className="mt-4 rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Key Facts About the Algorithm</h4>
          <ul className="mt-3 space-y-2">
            {MATCH_ALGORITHM_KEY_FACTS.map((fact) => (
              <li key={fact} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-300">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                {fact}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Signaling ── */}
      <div>
        <h3 className="mb-2 text-lg font-bold text-slate-900 dark:text-white">Signaling — How to Get More Interviews</h3>
        <p className="mb-5 text-sm text-slate-600 dark:text-slate-400">
          {SIGNALING_DATA.overview}
        </p>

        <div className="space-y-4">
          {SIGNALING_DATA.types.map((signal) => (
            <div key={signal.name} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{signal.name}</h4>
                <span className="shrink-0 rounded-full bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                  {signal.count}
                </span>
              </div>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{signal.description}</p>
              <div className="mt-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 px-3 py-2">
                <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Impact: {signal.impact}</p>
              </div>
              <ul className="mt-3 space-y-1.5">
                {signal.tips.map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
                    <CheckCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* IMG-specific signaling advice */}
        <div className="mt-4 rounded-xl border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20 p-5">
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">Signaling Tips Specifically for IMGs</h4>
          <ul className="mt-3 space-y-2">
            {SIGNALING_DATA.imgSpecificAdvice.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
                <Star className="mt-0.5 h-4 w-4 shrink-0" />
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Application Timeline ── */}
      <div>
        <h3 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Application Timeline (2025-2026 Cycle)</h3>
        <div className="space-y-3">
          {APPLICATION_TIMELINE.map((phase, i) => (
            <div key={phase.phase} className="flex gap-4 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 dark:bg-slate-700 text-sm font-bold text-white">{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{phase.phase}</h4>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-500 dark:text-slate-400">{phase.months}</span>
                </div>
                <ul className="mt-2 space-y-1">
                  {phase.tasks.map((t) => (
                    <li key={t} className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400">
                      <CheckCircle className="h-3.5 w-3.5 shrink-0 text-slate-400" />{t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SOAP ── */}
      <div>
        <h3 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">SOAP — If You Don&apos;t Match</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          {SOAP_DATA.stats.map((s) => (
            <div key={s.label} className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-center">
              <p className="text-base font-bold text-slate-900 dark:text-white">{s.value}</p>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20 p-4">
          <p className="mb-2 text-xs font-semibold text-red-800 dark:text-red-300">SOAP Survival Tips</p>
          <ul className="space-y-1.5">
            {SOAP_DATA.tips.map((t) => (
              <li key={t} className="flex items-start gap-1.5 text-xs text-red-700 dark:text-red-400">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />{t}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">10 Common Mistakes IMGs Make</h3>
        <div className="space-y-2">
          {COMMON_MISTAKES.map((m) => (
            <div key={m.mistake} className="rounded-lg border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs font-semibold text-red-700 dark:text-red-400">{m.mistake}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{m.fix}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-bold text-slate-900 dark:text-white">Visa Guide</h3>
        <div className="space-y-3">
          {VISA_INFO.map((v) => (
            <div key={v.type} className="rounded-xl border border-slate-200 dark:border-slate-700 p-5">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">{v.type}</h4>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{v.description}</p>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">Pros</p>
                  <ul className="mt-1 space-y-1">
                    {v.pros.map((p) => (
                      <li key={p} className="flex items-start gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <CheckCircle className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" />{p}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-red-600">Cons</p>
                  <ul className="mt-1 space-y-1">
                    {v.cons.map((c) => (
                      <li key={c} className="flex items-start gap-1 text-xs text-slate-600 dark:text-slate-400">
                        <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-400" />{c}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── TAB: Resources ──────────────────────────────────────────────────────────

function ResourcesTab() {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Essential Resources</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {KEY_RESOURCES.map((r) => (
            <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 p-4 transition-colors hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-950/20">
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 group-hover:text-blue-600" />
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600">{r.name}</p>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{r.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-base font-bold text-slate-900 dark:text-white">Community Insights</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {COMMUNITY_INSIGHTS.map((c) => (
            <div key={c.insight} className="rounded-xl border border-slate-200 dark:border-slate-700 p-4">
              <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">{c.insight}</p>
              <p className="mt-2 text-xs text-slate-400">Source: {c.source}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border-2 border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/20 p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">How FREIDA + USCEHub Work Together</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-700 dark:text-blue-300">1</div>
            <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Research on FREIDA</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use FREIDA to filter 13,000+ programs by IMG%, visa, specialty</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-700 dark:text-blue-300">2</div>
            <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Get Experience on USCEHub</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Find observerships and externships to build your US clinical experience</p>
          </div>
          <div className="text-center">
            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 text-sm font-bold text-blue-700 dark:text-blue-300">3</div>
            <p className="mt-2 text-xs font-semibold text-slate-900 dark:text-white">Apply &amp; Match</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use ERAS to apply, match into your target residency program</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <a href="https://freida.ama-assn.org/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="lg">Visit FREIDA <ExternalLink className="ml-1 h-4 w-4" /></Button>
        </a>
        <Link href="/browse">
          <Button size="lg">Browse Opportunities <ArrowRight className="ml-1 h-4 w-4" /></Button>
        </Link>
      </div>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

const TAB_LIST = [
  { value: "overview", label: "Overview", icon: BarChart3 },
  { value: "specialties", label: "Specialties", icon: Stethoscope },
  { value: "programs", label: "Programs", icon: Building2 },
  { value: "ecfmg", label: "ECFMG & Exams", icon: GraduationCap },
  { value: "application", label: "Application", icon: CalendarDays },
  { value: "resources", label: "Resources", icon: BookOpen },
];

export function FreidaContent() {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Badge variant="default" className="mb-4 bg-blue-600 text-white">
              2025 Data — NRMP, ECFMG, FREIDA
            </Badge>
            <h1 className="text-3xl font-bold sm:text-4xl">
              IMG Resources &amp; Residency Intelligence
            </h1>
            <p className="mt-4 text-base text-slate-400">
              Everything International Medical Graduates need to know — match
              statistics, specialty data, ECFMG requirements, and program
              insights. Updated with 2025 NRMP Match results.
            </p>
          </div>
        </div>
      </div>

      {/* Source Attribution Banner */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8">
          <p className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
            <span>Last updated: March 2025</span>
            <span>•</span>
            <a href="https://www.nrmp.org/match-data/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">NRMP 2025</a>
            <span>•</span>
            <a href="https://www.ecfmg.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">ECFMG</a>
            <span>•</span>
            <a href="https://freida.ama-assn.org/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">AMA FREIDA</a>
            <span>•</span>
            <a href="https://www.nrmp.org/match-data/2024/08/charting-outcomes-usmle-step-2-ck-exam-baseline/" target="_blank" rel="noopener noreferrer" className="underline hover:text-slate-700 dark:hover:text-slate-300">Charting Outcomes 2024</a>
          </p>
        </div>
      </div>

      {/* Tabbed Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Tabs defaultValue="overview">
          <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
            <TabsList className="w-max sm:w-full dark:bg-slate-800">
              {TAB_LIST.map((tab) => {
                const Icon = tab.icon;
                return (
                  <TabsTrigger key={tab.value} value={tab.value} className="dark:text-slate-300 dark:data-[state=active]:bg-slate-700 dark:data-[state=active]:text-white">
                    <Icon className="mr-1.5 h-3.5 w-3.5" />
                    {tab.label}
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <TabsContent value="overview"><OverviewTab /></TabsContent>
          <TabsContent value="specialties"><SpecialtiesTab /></TabsContent>
          <TabsContent value="programs"><ProgramsTab /></TabsContent>
          <TabsContent value="ecfmg"><EcfmgTab /></TabsContent>
          <TabsContent value="application"><ApplicationTab /></TabsContent>
          <TabsContent value="resources"><ResourcesTab /></TabsContent>
        </Tabs>
      </div>

      {/* AEO FAQ Section */}
      <div className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="mb-6 text-center text-xl font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions
          </h2>
          <ImgFaqSchema />
        </div>
      </div>

      {/* Disclaimer */}
      <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
        <p className="text-center text-xs leading-relaxed text-slate-400">
          Data sourced from NRMP 2025 Main Residency Match Results, ECFMG.org,
          AMA FREIDA, and NRMP Charting Outcomes 2024. USCEHub is not affiliated
          with NRMP, ECFMG, AMA, ERAS, or AAMC. All trademarks belong to their
          respective owners. Statistics are for informational purposes only and
          do not constitute medical or legal advice. Individual results may vary.
        </p>
      </div>
    </div>
  );
}
