"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowDown,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  FileText,
  Globe,
  Shield,
  Flag,
  Mountain,
  TreePine,
  Sun,
  Info,
} from "lucide-react";

interface ProcessStep {
  agency: string;
  action: string;
  form?: string;
  duration: string;
  details: string;
}

interface PathwayProcess {
  id: string;
  name: string;
  icon: typeof Globe;
  color: string;
  totalTimeline: string;
  steps: ProcessStep[];
}

const PATHWAYS: PathwayProcess[] = [
  {
    id: "conrad",
    name: "Conrad State 30",
    icon: Building2,
    color: "bg-accent",
    totalTimeline: "6-18 months total",
    steps: [
      {
        agency: "You + Employer",
        action: "Secure employment, sign waiver-compliant contract",
        duration: "3-6 months",
        details: "Find HPSA-designated employer, negotiate contract (no non-compete, 40 hrs/week, 3-year commitment), obtain state medical license. Hire immigration attorney specializing in physician immigration.",
      },
      {
        agency: "Physician/Attorney",
        action: "File DS-3035 online with DOS to get case number",
        form: "DS-3035 (online at j1visawaiverrecommendation.state.gov) + $120 fee",
        duration: "Immediate — case number issued right away",
        details: "This is filed FIRST. You need the DOS case number before submitting to your state. Complete online, mail $120 fee + copies of ALL DS-2019 forms ever issued to you. Case number is assigned immediately upon filing.",
      },
      {
        agency: "Employer + Attorney",
        action: "Prepare state application package",
        form: "State-specific application forms (varies by state)",
        duration: "2-4 weeks",
        details: "Employer prepares: Letter of Need, evidence of failed US recruitment (6+ months), community support letters, HPSA documentation. You provide: J-1 docs, diplomas, license, CV.",
      },
      {
        agency: "State Health Department",
        action: "State reviews and recommends (or denies)",
        duration: "2-10 weeks (varies by state)",
        details: "State DOH evaluates application. If approved, state forwards a recommendation letter to the DOS Waiver Review Division. Fast states (WY, WV): 2-3 weeks. Slow states (CA, NY): 8-12+ weeks.",
      },
      {
        agency: "DOS Waiver Review Division",
        action: "Federal review of waiver recommendation",
        form: "DS-3035 (filed by applicant/attorney with DOS)",
        duration: "8-12 weeks",
        details: "Department of State reviews the state's recommendation and your DS-3035 application. If favorable, DOS sends a 'No Objection' recommendation to USCIS. Cannot be expedited. $120 DOS fee.",
      },
      {
        agency: "USCIS",
        action: "USCIS issues waiver approval (I-797)",
        form: "I-797 Waiver Approval Notice",
        duration: "~1 month after DOS recommendation",
        details: "USCIS receives DOS favorable recommendation and issues I-797 Waiver Approval Notice. Note: I-612 form is NOT required for Conrad 30 — USCIS initiates this internally. The I-797 includes an addendum specifying your waiver terms.",
      },
      {
        agency: "Employer",
        action: "File H-1B petition (I-129)",
        form: "I-129 (cap-exempt — no lottery needed for Conrad physicians)",
        duration: "15 days (premium $2,965) or 3-6 months (regular)",
        details: "Employer files I-129 H-1B petition with USCIS immediately after waiver approval. Conrad waiver physicians are H-1B cap-exempt — no lottery required, can file year-round. STRONGLY use premium processing ($2,965) for 15-day guarantee. Regular processing: 3-6 months. DO NOT travel outside US while change of status is pending.",
      },
      {
        agency: "USCIS → You",
        action: "Receive H-1B I-797A Approval Notice",
        form: "I-797A + new I-94",
        duration: "Upon approval",
        details: "I-797A is your proof of H-1B status. Your new I-94 authorizes work for the sponsoring employer. If you need to travel abroad later, you'll need a visa stamp at a US consulate before reentry.",
      },
      {
        agency: "You",
        action: "Begin 3-year waiver service within 90 days",
        duration: "3 years",
        details: "Full-time (40+ hrs/week) at the designated HPSA facility for exactly 3 years. File your I-140 green card petition during this period (ideally year 1-2).",
      },
    ],
  },
  {
    id: "arc",
    name: "Appalachian Regional Commission (ARC)",
    icon: Mountain,
    color: "bg-green-600",
    totalTimeline: "6-12 months total",
    steps: [
      {
        agency: "You + Employer",
        action: "Secure employment in ARC-eligible Appalachian county",
        duration: "3-6 months",
        details: "Position must be in an Appalachian HPSA in one of 13 states (AL, GA, KY, MD, MS, NY, NC, OH, PA, SC, TN, VA, WV). All of WV qualifies. Employer must document 6 months of failed US recruitment.",
      },
      {
        agency: "Physician/Attorney",
        action: "File DS-3035 online with DOS (same as Conrad)",
        form: "DS-3035 + $120 fee",
        duration: "Immediate case number",
        details: "File DS-3035 at j1visawaiverrecommendation.state.gov BEFORE submitting to state coordinator. You need the DOS case number for your ARC application package.",
      },
      {
        agency: "State J-1 Coordinator → Governor",
        action: "State reviews, governor issues written recommendation to ARC",
        duration: "2-6 weeks (varies by state)",
        details: "Contact your state's ARC J-1 coordinator (list at arc.gov/j-1-visa-waivers-state-contacts/). State evaluates, then governor or ARC State Alternate issues written recommendation to ARC Federal Co-Chair. $250K liquidated damages clause required in contract.",
      },
      {
        agency: "ARC (Federal)",
        action: "ARC reviews and issues recommendation to DOS",
        form: "ARC J-1 waiver application package",
        duration: "4-8 weeks",
        details: "ARC reviews the governor's recommendation and your full application. If approved, ARC sends a favorable recommendation directly to the DOS Waiver Review Division. No application fee. Contact: fobrien@arc.gov.",
      },
      {
        agency: "DOS Waiver Review Division",
        action: "Federal review — same as Conrad 30",
        form: "DS-3035",
        duration: "8-12 weeks",
        details: "Same DOS review process as Conrad 30. DOS evaluates ARC's recommendation. If favorable, forwards to USCIS. $120 DOS fee. Cannot be expedited.",
      },
      {
        agency: "USCIS",
        action: "Waiver approval + H-1B petition",
        form: "I-129 (H-1B petition)",
        duration: "15 days (premium) or 3-6 months",
        details: "Same USCIS process as Conrad 30. Employer files I-129 H-1B petition (I-612 is NOT required — USCIS handles waiver internally). Premium processing ($2,965) strongly recommended.",
      },
      {
        agency: "USCIS → You",
        action: "I-797 approval → begin 3-year service",
        form: "I-797",
        duration: "Within 90 days of approval",
        details: "Same as Conrad 30 — begin full-time work within 90 days. 3-year commitment at the designated facility.",
      },
    ],
  },
  {
    id: "hhs",
    name: "HHS Clinical Care Waiver (Supplement B)",
    icon: Shield,
    color: "bg-cyan-600",
    totalTimeline: "6-9 months total (HHS level: 6-8 weeks)",
    steps: [
      {
        agency: "You + Employer",
        action: "Secure primary care/psychiatry position at HPSA 7+ facility",
        duration: "3-6 months",
        details: "Limited to: Family Medicine, General Internal Medicine, General Pediatrics, OB/GYN, General Psychiatry. Facility must have Primary Care HPSA or Mental Health HPSA score of 7+. Sites 'Proposed for Withdrawal' on HRSA website are NOT eligible.",
      },
      {
        agency: "Employer + Attorney",
        action: "Prepare HHS application package",
        duration: "2-4 weeks",
        details: "Employer prepares: Letter of Need on letterhead, evidence of treating all patients regardless of ability to pay, Medicare/Medicaid acceptance, 3 community support letters with contact info, state health dept acknowledgment letter, evidence of failed US recruitment.",
      },
      {
        agency: "HHS (Executive Secretary, HRSA)",
        action: "HHS reviews and issues recommendation to DOS",
        form: "HHS Supplement B application",
        duration: "6-8 weeks",
        details: "Submit to: HHS Exchange Visitor Program, HRSA Bureau of Health Workforce, 5600 Fishers Lane, Rockville, MD 20857. ~110 cases reviewed per year. No application fee. No expedited processing available.",
      },
      {
        agency: "DOS Waiver Review Division",
        action: "Federal review — same process",
        form: "DS-3035",
        duration: "8-12 weeks",
        details: "Same DOS review. $120 fee.",
      },
      {
        agency: "USCIS",
        action: "Waiver approval + H-1B petition",
        form: "I-129 (H-1B petition)",
        duration: "15 days (premium) or 3-6 months",
        details: "Same USCIS process. Premium processing recommended.",
      },
      {
        agency: "You",
        action: "I-797 → begin 3-year service",
        form: "I-797",
        duration: "Within 90 days",
        details: "Begin full-time work. File I-140 for green card during service.",
      },
    ],
  },
  {
    id: "dra",
    name: "Delta Regional Authority (DRA)",
    icon: TreePine,
    color: "bg-amber-600",
    totalTimeline: "6-12 months total",
    steps: [
      {
        agency: "You + Employer",
        action: "Secure position in DRA-eligible county",
        duration: "3-6 months",
        details: "Must be in one of 240 counties across 8 states (AL, AR, IL, KY, LA, MS, MO, TN). Position must be in HPSA, MHPSA, MUA, or MUP. Employer conducts 60 days of good faith recruitment. No restrictive covenant allowed.",
      },
      {
        agency: "DRA (Federal)",
        action: "DRA reviews application",
        form: "DRA Delta Doctors application + notarized affidavit",
        duration: "Varies (rolling applications)",
        details: "Submit to DRA directly. Primary care prioritized; specialists need additional documentation (CMO letter + 2 primary care support letters). No application fee (eliminated Oct 2022). Contact: cwade@dra.gov, (662) 302-7339.",
      },
      {
        agency: "DOS Waiver Review Division",
        action: "DOS reviews DRA recommendation",
        form: "DS-3035",
        duration: "8-12 weeks",
        details: "Same DOS process. $120 fee.",
      },
      {
        agency: "USCIS",
        action: "Waiver + H-1B",
        form: "I-129 (H-1B petition)",
        duration: "15 days premium",
        details: "Same USCIS process.",
      },
      {
        agency: "You",
        action: "I-797 → begin 3-year service",
        duration: "Within 90 days",
        details: "Same 3-year commitment.",
      },
    ],
  },
  {
    id: "scrc",
    name: "Southeast Crescent Regional Commission (SCRC)",
    icon: Sun,
    color: "bg-orange-600",
    totalTimeline: "4-9 months total (~60-day SCRC review)",
    steps: [
      {
        agency: "You + Employer",
        action: "Secure position in SCRC-eligible county",
        duration: "3-6 months",
        details: "Must be in one of 428 counties across 7 states (AL, FL — entire state, GA — 122 counties, MS, NC — 69 counties, SC, VA). Patient-to-physician ratio minimum 2,000:1.",
      },
      {
        agency: "SCRC (Federal)",
        action: "SCRC reviews application",
        form: "SCRC application package (mail to Columbia, SC)",
        duration: "~60 days",
        details: "Submit to: SCRC, 1901 Assembly Street, Columbia, SC 29201. Email: j1visa@scrc.gov. Requires 3 support letters (2 from US citizen/PR physicians). $3,000 non-refundable fee (check/money order payable to Southeast Regional Commission).",
      },
      {
        agency: "DOS Waiver Review Division",
        action: "DOS reviews SCRC recommendation",
        form: "DS-3035",
        duration: "8-12 weeks",
        details: "Same DOS process. $120 fee.",
      },
      {
        agency: "USCIS",
        action: "Waiver + H-1B",
        form: "I-129 (H-1B petition)",
        duration: "15 days premium",
        details: "Same process.",
      },
      {
        agency: "You",
        action: "I-797 → begin 3-year service",
        duration: "Within 90 days",
        details: "Same 3-year commitment.",
      },
    ],
  },
  {
    id: "va",
    name: "Department of Veterans Affairs (VA)",
    icon: Flag,
    color: "bg-slate-600",
    totalTimeline: "6-8 months total",
    steps: [
      {
        agency: "You + VA Facility",
        action: "Secure position at a VA Medical Center",
        duration: "2-4 months",
        details: "The VA itself is the employer. No HPSA requirement. Any specialty. Full-time clinical, research, or teaching position. VA facility director prepares a letter detailing the position and unsuccessful US recruitment.",
      },
      {
        agency: "Local VA → VISN → VA Central (DC)",
        action: "Internal VA review chain",
        duration: "3-5 weeks (local) → 2-4 weeks (VISN) → 4-5 weeks (central)",
        details: "Application goes through: Local VA facility director → VISN (Veterans Integrated Service Network) director → VA Health Revenue Center in Washington DC. VA will HALT the process if a US physician becomes available. VA will NOT pay attorney fees.",
      },
      {
        agency: "DOS Waiver Review Division",
        action: "DOS reviews VA recommendation",
        form: "DS-3035",
        duration: "8-12 weeks",
        details: "Same DOS process after VA central office forwards recommendation.",
      },
      {
        agency: "USCIS",
        action: "Waiver + H-1B",
        form: "I-129 (H-1B petition)",
        duration: "15 days premium (note: VA is NOT H-1B cap-exempt)",
        details: "Important: VA is currently NOT H-1B cap-exempt (pending legislation). This means the H-1B petition must go through the lottery unless the physician is already in H-1B status. Premium processing available.",
      },
      {
        agency: "You",
        action: "Begin employment within 90 days",
        duration: "3-year commitment",
        details: "Federal employment with VA benefits (PSLF-eligible retirement, federal health insurance).",
      },
    ],
  },
];

export default function WaiverProcessPage() {
  const [selectedPathway, setSelectedPathway] = useState("conrad");
  const pathway = PATHWAYS.find((p) => p.id === selectedPathway)!;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <Link
        href="/career/waiver/pathways"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Pathway Comparison
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Waiver Process Step-by-Step
        </h1>
        <p className="text-muted max-w-2xl">
          Select your waiver pathway below to see the exact sequence of
          agencies, forms, and approvals. Know exactly where your application
          is at every stage.
        </p>
      </div>

      {/* Pathway Selector */}
      <div className="flex flex-wrap gap-2 mb-8">
        {PATHWAYS.map((p) => {
          const Icon = p.icon;
          return (
            <button
              key={p.id}
              onClick={() => setSelectedPathway(p.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                selectedPathway === p.id
                  ? "bg-accent text-white shadow-sm"
                  : "bg-surface border border-border text-muted hover:text-foreground hover:border-accent/30"
              }`}
            >
              <Icon className="h-4 w-4" />
              {p.name}
            </button>
          );
        })}
      </div>

      {/* Selected Pathway Info */}
      <div className="rounded-xl border border-border bg-surface p-5 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`rounded-lg ${pathway.color} p-2.5`}>
            <pathway.icon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">{pathway.name}</h2>
            <p className="text-xs text-muted">{pathway.steps.length} steps</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-bold text-accent">{pathway.totalTimeline}</div>
          <div className="text-[10px] text-muted">estimated total</div>
        </div>
      </div>

      {/* Process Steps */}
      <div className="space-y-1">
        {pathway.steps.map((step, i) => (
          <div key={i} className="relative">
            {/* Connector line */}
            {i < pathway.steps.length - 1 && (
              <div className="absolute left-5 top-16 bottom-0 w-0.5 bg-border z-0" />
            )}

            <div className="relative z-10 flex gap-4">
              {/* Step number */}
              <div className={`flex h-10 w-10 items-center justify-center rounded-full shrink-0 ${pathway.color} text-white text-sm font-bold`}>
                {i + 1}
              </div>

              {/* Step content */}
              <div className="flex-1 rounded-xl border border-border bg-surface p-5 mb-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="text-xs font-medium text-accent mb-1">
                      {step.agency}
                    </div>
                    <h3 className="text-sm font-bold text-foreground">
                      {step.action}
                    </h3>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-warning bg-warning/10 rounded-full px-2.5 py-1 shrink-0">
                    <Clock className="h-3 w-3" />
                    {step.duration}
                  </div>
                </div>

                {step.form && (
                  <div className="flex items-center gap-1.5 text-xs text-muted mb-2">
                    <FileText className="h-3 w-3" />
                    Form: <span className="font-mono text-foreground">{step.form}</span>
                  </div>
                )}

                <p className="text-xs text-muted leading-relaxed">
                  {step.details}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Common to all pathways */}
      <div className="mt-8 rounded-xl border border-border bg-surface-alt p-5">
        <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
          <Info className="h-4 w-4 text-accent" />
          Common to All Pathways
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
          <div>
            <strong className="text-foreground">DOS review (all pathways):</strong> 8-12 weeks. Cannot be expedited. $120 fee for DS-3035.
          </div>
          <div>
            <strong className="text-foreground">USCIS (all pathways):</strong> After waiver approval, employer files I-129 H-1B petition. I-612 is NOT required for Conrad 30 (USCIS handles internally). Premium processing $2,965 for 15-day guarantee.
          </div>
          <div>
            <strong className="text-foreground">Service commitment:</strong> 3 years full-time (40+ hrs/week) at designated facility. Begin within 90 days of H-1B approval.
          </div>
          <div>
            <strong className="text-foreground">Green card:</strong> File I-140 during waiver service (year 1-2 recommended). Don&apos;t wait until 3 years are done.
          </div>
        </div>
      </div>

      {/* Related */}
      <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/waiver/pathways" className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors group">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-accent">Compare Pathways</h3>
          <p className="text-xs text-muted mt-1">Pros, cons, and eligibility side by side</p>
        </Link>
        <Link href="/career/waiver/timeline" className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors group">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-accent">Timeline Calculator</h3>
          <p className="text-xs text-muted mt-1">Personalized dates based on your J-1 end</p>
        </Link>
        <Link href="/career/contract" className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors group">
          <h3 className="text-sm font-semibold text-foreground group-hover:text-accent">Contract Checklist</h3>
          <p className="text-xs text-muted mt-1">Must-have clauses before signing</p>
        </Link>
      </div>
    </div>
  );
}
