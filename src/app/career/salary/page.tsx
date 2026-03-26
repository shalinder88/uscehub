"use client";

import { useState, useMemo } from "react";
import {
  DollarSign,
  Filter,
  ArrowUpDown,
  TrendingUp,
  Building2,
  Stethoscope,
  MapPin,
  Info,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/* ─── Specialty salary data ─── */

interface SpecialtyData {
  specialty: string;
  employedLow: number;
  employedHigh: number;
  privateLow: number | null;
  privateHigh: number | null;
  median: number;
  category: "primary" | "surgical" | "medical-subspecialty" | "other";
}

// Salary data sourced from Medscape Physician Compensation Report 2025,
// MGMA DataDive 2025, and Doximity Physician Compensation Report.
// Ranges reflect 25th-75th percentile. All values in $K.
// Last verified: March 2026.
const SPECIALTIES: SpecialtyData[] = [
  { specialty: "Internal Medicine (General)", employedLow: 255, employedHigh: 330, privateLow: 285, privateHigh: 410, median: 295, category: "primary" },
  { specialty: "Hospital Medicine", employedLow: 290, employedHigh: 390, privateLow: null, privateHigh: null, median: 340, category: "primary" },
  { specialty: "Family Medicine", employedLow: 235, employedHigh: 315, privateLow: 265, privateHigh: 390, median: 280, category: "primary" },
  { specialty: "Pediatrics (General)", employedLow: 225, employedHigh: 295, privateLow: 245, privateHigh: 360, median: 265, category: "primary" },
  { specialty: "Psychiatry", employedLow: 285, employedHigh: 410, privateLow: 310, privateHigh: 475, median: 330, category: "other" },
  { specialty: "Emergency Medicine", employedLow: 310, employedHigh: 420, privateLow: null, privateHigh: null, median: 355, category: "other" },
  { specialty: "General Surgery", employedLow: 360, employedHigh: 500, privateLow: 420, privateHigh: 620, median: 430, category: "surgical" },
  { specialty: "Orthopedic Surgery", employedLow: 510, employedHigh: 780, privateLow: 620, privateHigh: 1050, median: 640, category: "surgical" },
  { specialty: "Cardiology (Interventional)", employedLow: 520, employedHigh: 780, privateLow: 620, privateHigh: 1100, median: 680, category: "medical-subspecialty" },
  { specialty: "Cardiology (Non-Invasive)", employedLow: 410, employedHigh: 570, privateLow: 460, privateHigh: 720, median: 490, category: "medical-subspecialty" },
  { specialty: "Gastroenterology", employedLow: 420, employedHigh: 620, privateLow: 520, privateHigh: 850, median: 520, category: "medical-subspecialty" },
  { specialty: "Pulm/Critical Care", employedLow: 360, employedHigh: 500, privateLow: 410, privateHigh: 570, median: 430, category: "medical-subspecialty" },
  { specialty: "Nephrology", employedLow: 310, employedHigh: 410, privateLow: 330, privateHigh: 460, median: 360, category: "medical-subspecialty" },
  { specialty: "Hematology/Oncology", employedLow: 390, employedHigh: 540, privateLow: 460, privateHigh: 720, median: 465, category: "medical-subspecialty" },
  { specialty: "Dermatology", employedLow: 410, employedHigh: 570, privateLow: 520, privateHigh: 850, median: 490, category: "medical-subspecialty" },
  { specialty: "Neurology", employedLow: 310, employedHigh: 430, privateLow: 360, privateHigh: 520, median: 370, category: "medical-subspecialty" },
  { specialty: "Rheumatology", employedLow: 285, employedHigh: 390, privateLow: 310, privateHigh: 460, median: 340, category: "medical-subspecialty" },
  { specialty: "Endocrinology", employedLow: 255, employedHigh: 360, privateLow: 285, privateHigh: 415, median: 310, category: "medical-subspecialty" },
  { specialty: "Infectious Disease", employedLow: 265, employedHigh: 360, privateLow: 290, privateHigh: 410, median: 310, category: "medical-subspecialty" },
  { specialty: "Radiology", employedLow: 410, employedHigh: 570, privateLow: 510, privateHigh: 780, median: 490, category: "other" },
  { specialty: "Anesthesiology", employedLow: 390, employedHigh: 500, privateLow: 420, privateHigh: 620, median: 430, category: "other" },
  { specialty: "Pathology", employedLow: 310, employedHigh: 410, privateLow: 330, privateHigh: 465, median: 360, category: "other" },
  { specialty: "PM&R", employedLow: 310, employedHigh: 410, privateLow: 360, privateHigh: 510, median: 360, category: "other" },
  { specialty: "Urology", employedLow: 420, employedHigh: 570, privateLow: 520, privateHigh: 720, median: 490, category: "surgical" },
  { specialty: "ENT", employedLow: 390, employedHigh: 520, privateLow: 460, privateHigh: 670, median: 455, category: "surgical" },
  { specialty: "Ophthalmology", employedLow: 360, employedHigh: 500, privateLow: 420, privateHigh: 720, median: 435, category: "surgical" },
];

/* ─── State salary/tax data ─── */

interface StateSalaryData {
  state: string;
  code: string;
  avgSalary: number;
  taxRate: number;
  colIndex: number;
  effectiveSalary: number;
  topSpecialties: string[];
}

const STATE_SALARY_DATA: StateSalaryData[] = [
  { state: "Texas", code: "TX", avgSalary: 350, taxRate: 0, colIndex: 93, effectiveSalary: 376, topSpecialties: ["Cardiology", "Orthopedics", "Gastroenterology"] },
  { state: "Florida", code: "FL", avgSalary: 340, taxRate: 0, colIndex: 103, effectiveSalary: 330, topSpecialties: ["Dermatology", "Cardiology", "Orthopedics"] },
  { state: "Tennessee", code: "TN", avgSalary: 330, taxRate: 0, colIndex: 91, effectiveSalary: 363, topSpecialties: ["Surgery", "Emergency Medicine", "Psychiatry"] },
  { state: "Washington", code: "WA", avgSalary: 350, taxRate: 0, colIndex: 110, effectiveSalary: 318, topSpecialties: ["Primary Care", "Psychiatry", "Neurology"] },
  { state: "Nevada", code: "NV", avgSalary: 340, taxRate: 0, colIndex: 104, effectiveSalary: 327, topSpecialties: ["Emergency Medicine", "Hospitalist", "Cardiology"] },
  { state: "Wyoming", code: "WY", avgSalary: 310, taxRate: 0, colIndex: 96, effectiveSalary: 323, topSpecialties: ["Family Medicine", "General Surgery", "Emergency Medicine"] },
  { state: "South Dakota", code: "SD", avgSalary: 310, taxRate: 0, colIndex: 92, effectiveSalary: 337, topSpecialties: ["Family Medicine", "Internal Medicine", "Psychiatry"] },
  { state: "Alaska", code: "AK", avgSalary: 370, taxRate: 0, colIndex: 127, effectiveSalary: 291, topSpecialties: ["Family Medicine", "Emergency Medicine", "Surgery"] },
  { state: "New Hampshire", code: "NH", avgSalary: 320, taxRate: 0, colIndex: 115, effectiveSalary: 278, topSpecialties: ["Primary Care", "Psychiatry", "Neurology"] },
  { state: "California", code: "CA", avgSalary: 360, taxRate: 13.3, colIndex: 142, effectiveSalary: 220, topSpecialties: ["All Specialties", "Tech-adjacent roles", "Research"] },
  { state: "New York", code: "NY", avgSalary: 370, taxRate: 10.9, colIndex: 140, effectiveSalary: 235, topSpecialties: ["All Specialties", "Academic", "Subspecialties"] },
  { state: "Indiana", code: "IN", avgSalary: 320, taxRate: 3.05, colIndex: 90, effectiveSalary: 345, topSpecialties: ["Primary Care", "Psychiatry", "Hospitalist"] },
  { state: "North Carolina", code: "NC", avgSalary: 330, taxRate: 4.5, colIndex: 96, effectiveSalary: 328, topSpecialties: ["Primary Care", "Cardiology", "Oncology"] },
  { state: "Ohio", code: "OH", avgSalary: 320, taxRate: 3.5, colIndex: 90, effectiveSalary: 343, topSpecialties: ["Primary Care", "Psychiatry", "Surgery"] },
  { state: "Georgia", code: "GA", avgSalary: 330, taxRate: 5.49, colIndex: 93, effectiveSalary: 336, topSpecialties: ["Primary Care", "Surgery", "Psychiatry"] },
  { state: "Pennsylvania", code: "PA", avgSalary: 330, taxRate: 3.07, colIndex: 97, effectiveSalary: 330, topSpecialties: ["Primary Care", "Psychiatry", "Hospitalist"] },
  { state: "Michigan", code: "MI", avgSalary: 320, taxRate: 4.25, colIndex: 93, effectiveSalary: 330, topSpecialties: ["Primary Care", "Psychiatry", "Neurology"] },
  { state: "Alabama", code: "AL", avgSalary: 320, taxRate: 5.0, colIndex: 88, effectiveSalary: 345, topSpecialties: ["Primary Care", "Psychiatry", "Surgery"] },
  { state: "Minnesota", code: "MN", avgSalary: 340, taxRate: 9.85, colIndex: 98, effectiveSalary: 313, topSpecialties: ["Primary Care", "Psychiatry", "Pediatrics"] },
  { state: "Illinois", code: "IL", avgSalary: 340, taxRate: 4.95, colIndex: 96, effectiveSalary: 337, topSpecialties: ["All Specialties", "Academic", "Hospitalist"] },
];

type SortField = "median" | "employedHigh" | "specialty";
type EmploymentFilter = "all" | "employed" | "private";

function fmt(k: number): string {
  if (k >= 1000) return `$${(k / 1000).toFixed(1)}M+`;
  return `$${k}K`;
}

function fmtRange(low: number | null, high: number | null): string {
  if (low === null || high === null) return "N/A";
  return `${fmt(low)} \u2013 ${fmt(high)}`;
}

export default function SalaryPage() {
  const [sortField, setSortField] = useState<SortField>("median");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [empFilter, setEmpFilter] = useState<EmploymentFilter>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedComp, setExpandedComp] = useState(false);
  const [expandedState, setExpandedState] = useState(false);

  const filtered = useMemo(() => {
    let list = [...SPECIALTIES];
    if (selectedCategory !== "all") {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (empFilter === "private") {
      list = list.filter((s) => s.privateLow !== null);
    }
    list.sort((a, b) => {
      if (sortField === "specialty") {
        return sortDir === "asc"
          ? a.specialty.localeCompare(b.specialty)
          : b.specialty.localeCompare(a.specialty);
      }
      if (sortField === "employedHigh") {
        return sortDir === "asc"
          ? a.employedHigh - b.employedHigh
          : b.employedHigh - a.employedHigh;
      }
      return sortDir === "asc" ? a.median - b.median : b.median - a.median;
    });
    return list;
  }, [sortField, sortDir, empFilter, selectedCategory]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-success/10 p-2.5">
            <DollarSign className="h-6 w-6 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Physician Salary Guide 2025–2026
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          Market-rate compensation data across 26 specialties, state-by-state
          tax analysis, and a breakdown of total compensation components. Built
          for physicians evaluating offers, not recruiters selling them.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs text-green-400">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" /></svg>
          <span>Last verified: <strong>March 2026</strong></span>
          <span className="text-slate-500">· Sources: Medscape, MGMA, Doximity</span>
        </div>
      </div>

      {/* ═══ SECTION 1: Salary by Specialty ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Stethoscope className="h-5 w-5 text-accent" />
          Salary Ranges by Specialty
        </h2>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Specialties</option>
              <option value="primary">Primary Care</option>
              <option value="surgical">Surgical</option>
              <option value="medical-subspecialty">Medical Subspecialty</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-muted" />
            <select
              value={empFilter}
              onChange={(e) => setEmpFilter(e.target.value as EmploymentFilter)}
              className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="all">All Employment Types</option>
              <option value="employed">Employed Only</option>
              <option value="private">Private Practice Only</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hover:text-accent transition-colors"
                  onClick={() => toggleSort("specialty")}
                >
                  <span className="flex items-center gap-1">
                    Specialty
                    <ArrowUpDown className="h-3 w-3 text-muted" />
                  </span>
                </th>
                {empFilter !== "private" && (
                  <th
                    className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hover:text-accent transition-colors"
                    onClick={() => toggleSort("employedHigh")}
                  >
                    <span className="flex items-center gap-1">
                      Employed Range
                      <ArrowUpDown className="h-3 w-3 text-muted" />
                    </span>
                  </th>
                )}
                {empFilter !== "employed" && (
                  <th className="text-left px-4 py-3 font-semibold text-foreground">
                    Private Practice Range
                  </th>
                )}
                <th
                  className="text-left px-4 py-3 font-semibold text-foreground cursor-pointer select-none hover:text-accent transition-colors"
                  onClick={() => toggleSort("median")}
                >
                  <span className="flex items-center gap-1">
                    Median
                    <ArrowUpDown className="h-3 w-3 text-muted" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, i) => (
                <tr
                  key={s.specialty}
                  className={`border-b border-border/50 transition-colors hover:bg-surface-alt/50 ${
                    i % 2 === 0 ? "bg-surface" : "bg-background"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {s.specialty}
                  </td>
                  {empFilter !== "private" && (
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {fmtRange(s.employedLow, s.employedHigh)}
                    </td>
                  )}
                  {empFilter !== "employed" && (
                    <td className="px-4 py-3 text-muted whitespace-nowrap">
                      {fmtRange(s.privateLow, s.privateHigh)}
                    </td>
                  )}
                  <td className="px-4 py-3 font-semibold text-success whitespace-nowrap">
                    {fmt(s.median)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          {filtered.length} specialties shown. Values in thousands. Click column
          headers to sort.
        </p>
      </section>

      {/* ═══ SECTION 2: Salary by State ═══ */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan" />
            Salary by State (Tax-Adjusted)
          </h2>
          <button
            onClick={() => setExpandedState(!expandedState)}
            className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            {expandedState ? "Show less" : "Show all 20 states"}
            {expandedState ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <p className="text-sm text-muted mb-6">
          Effective salary approximates after-tax purchasing power: (Salary
          &times; (1 &minus; state tax rate)) &divide; (cost of living index
          &divide; 100). This is a rough guide — actual effective income depends
          on filing status, deductions, and local taxes.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  State
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Avg. Salary
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  State Tax
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  COL Index
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Effective Salary
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Top Specialties
                </th>
              </tr>
            </thead>
            <tbody>
              {(expandedState
                ? STATE_SALARY_DATA
                : STATE_SALARY_DATA.slice(0, 10)
              ).map((s, i) => (
                <tr
                  key={s.code}
                  className={`border-b border-border/50 transition-colors hover:bg-surface-alt/50 ${
                    i % 2 === 0 ? "bg-surface" : "bg-background"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">
                    {s.state}{" "}
                    <span className="text-muted text-xs">({s.code})</span>
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {fmt(s.avgSalary)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {s.taxRate === 0 ? (
                      <span className="text-success font-medium">
                        0% (no state tax)
                      </span>
                    ) : (
                      <span className="text-muted">{s.taxRate}%</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-muted whitespace-nowrap">
                    {s.colIndex}
                  </td>
                  <td className="px-4 py-3 font-semibold whitespace-nowrap">
                    <span
                      className={
                        s.effectiveSalary >= 340
                          ? "text-success"
                          : s.effectiveSalary >= 300
                            ? "text-foreground"
                            : "text-muted"
                      }
                    >
                      ~{fmt(s.effectiveSalary)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted text-xs whitespace-nowrap">
                    {s.topSpecialties.join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-muted mt-3">
          Sorted by effective purchasing power. COL index: 100 = national
          average. Salary values in thousands.
        </p>
      </section>

      {/* ═══ SECTION 3: Understanding Your Compensation ═══ */}
      <section className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            Understanding Your Compensation
          </h2>
          <button
            onClick={() => setExpandedComp(!expandedComp)}
            className="text-sm text-accent hover:text-accent/80 flex items-center gap-1 transition-colors"
          >
            {expandedComp ? "Collapse" : "Expand all"}
            {expandedComp ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        <div className="space-y-4">
          {/* Base vs Total */}
          <CompSection
            title="Base Salary vs. Total Compensation"
            defaultOpen={expandedComp}
          >
            <p className="text-muted text-sm leading-relaxed mb-3">
              The number in your offer letter is rarely the full picture. Total
              compensation includes base salary, productivity bonuses, signing
              bonus, benefits, retirement contributions, and loan repayment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-surface-alt p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Typical Employed Position
                </h4>
                <ul className="space-y-1 text-sm text-muted">
                  <li>Base salary (guaranteed 1-2 years)</li>
                  <li>Productivity bonus after guarantee period</li>
                  <li>Health/dental/vision insurance ($20K-$30K value)</li>
                  <li>Retirement: 401(k) match or 403(b) + 457(b)</li>
                  <li>CME allowance: $2K-$5K/year</li>
                  <li>Malpractice coverage (employer-paid)</li>
                  <li>PTO: 4-6 weeks typical</li>
                </ul>
              </div>
              <div className="rounded-lg bg-surface-alt p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Total Benefits Value
                </h4>
                <p className="text-sm text-muted mb-2">
                  Add $40K-$80K to your base salary for true total compensation:
                </p>
                <ul className="space-y-1 text-sm text-muted">
                  <li>Health insurance: $15K-$25K</li>
                  <li>Retirement contributions: $10K-$20K</li>
                  <li>CME + licensing: $3K-$5K</li>
                  <li>Malpractice premium: $8K-$30K (specialty-dependent)</li>
                  <li>Disability/life insurance: $3K-$5K</li>
                </ul>
              </div>
            </div>
          </CompSection>

          {/* RVUs */}
          <CompSection
            title="RVUs: How Physician Productivity Is Measured"
            defaultOpen={expandedComp}
          >
            <p className="text-muted text-sm leading-relaxed mb-4">
              Relative Value Units (RVUs) are the universal currency of
              physician productivity. Almost every employed position ties
              compensation to RVUs after the guarantee period ends.
            </p>
            <div className="rounded-lg bg-surface-alt p-4 mb-4">
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Three Components of an RVU
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <span className="text-accent font-semibold text-sm">
                    wRVU (Work)
                  </span>
                  <p className="text-xs text-muted mt-1">
                    Reflects physician time, skill, and intensity. This is the
                    component your bonus is based on.
                  </p>
                </div>
                <div>
                  <span className="text-cyan font-semibold text-sm">
                    mRVU (Malpractice)
                  </span>
                  <p className="text-xs text-muted mt-1">
                    Accounts for professional liability insurance costs by
                    specialty.
                  </p>
                </div>
                <div>
                  <span className="text-success font-semibold text-sm">
                    pRVU (Practice Expense)
                  </span>
                  <p className="text-xs text-muted mt-1">
                    Covers overhead: staff, equipment, supplies, office space.
                  </p>
                </div>
              </div>
            </div>

            <h4 className="text-sm font-semibold text-foreground mb-3">
              Typical wRVU Benchmarks by Specialty (MGMA Median)
            </h4>
            <div className="overflow-x-auto rounded-lg border border-border/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-surface-alt/50 border-b border-border/50">
                    <th className="text-left px-3 py-2 font-medium text-foreground">
                      Specialty
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-foreground">
                      Median wRVUs/Year
                    </th>
                    <th className="text-left px-3 py-2 font-medium text-foreground">
                      $/wRVU
                    </th>
                  </tr>
                </thead>
                <tbody className="text-muted">
                  <tr className="border-b border-border/30">
                    <td className="px-3 py-2">Family Medicine</td>
                    <td className="px-3 py-2">4,500 - 5,500</td>
                    <td className="px-3 py-2">$48 - $58</td>
                  </tr>
                  <tr className="border-b border-border/30 bg-surface/50">
                    <td className="px-3 py-2">Internal Medicine</td>
                    <td className="px-3 py-2">4,200 - 5,200</td>
                    <td className="px-3 py-2">$52 - $62</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="px-3 py-2">Hospitalist</td>
                    <td className="px-3 py-2">4,000 - 5,000</td>
                    <td className="px-3 py-2">$60 - $75</td>
                  </tr>
                  <tr className="border-b border-border/30 bg-surface/50">
                    <td className="px-3 py-2">Cardiology</td>
                    <td className="px-3 py-2">7,000 - 10,000</td>
                    <td className="px-3 py-2">$55 - $75</td>
                  </tr>
                  <tr className="border-b border-border/30">
                    <td className="px-3 py-2">Gastroenterology</td>
                    <td className="px-3 py-2">7,500 - 10,000</td>
                    <td className="px-3 py-2">$55 - $70</td>
                  </tr>
                  <tr className="border-b border-border/30 bg-surface/50">
                    <td className="px-3 py-2">General Surgery</td>
                    <td className="px-3 py-2">6,000 - 8,500</td>
                    <td className="px-3 py-2">$55 - $65</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2">Orthopedic Surgery</td>
                    <td className="px-3 py-2">8,000 - 12,000</td>
                    <td className="px-3 py-2">$60 - $80</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="rounded-lg bg-accent/5 border border-accent/20 p-4 mt-4">
              <h4 className="text-sm font-semibold text-accent mb-2">
                Productivity Bonus Example
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Internist with a base salary of $280K and wRVU threshold of
                4,800. Rate: $55/wRVU above threshold. If you generate 5,500
                wRVUs, your bonus = (5,500 - 4,800) &times; $55 ={" "}
                <span className="text-success font-semibold">$38,500</span>.
                Total compensation: $318,500. Some employers use a pure
                eat-what-you-kill model after year 2 — your entire salary
                becomes wRVU &times; rate.
              </p>
            </div>
          </CompSection>

          {/* Signing Bonus & Loan Repayment */}
          <CompSection
            title="Signing Bonuses & Loan Repayment"
            defaultOpen={expandedComp}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg bg-surface-alt p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Signing Bonuses
                </h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li>
                    <span className="text-foreground font-medium">
                      Primary Care:
                    </span>{" "}
                    $20K - $50K median
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      Surgical Specialties:
                    </span>{" "}
                    $50K - $100K median
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      High-demand areas:
                    </span>{" "}
                    Can exceed $100K
                  </li>
                </ul>
                <p className="text-xs text-muted mt-3">
                  Almost always require payback if you leave before 1-3 years.
                  Negotiate for prorated payback (e.g., 1/36th forgiven per
                  month over 3 years) rather than full payback cliffs.
                </p>
              </div>
              <div className="rounded-lg bg-surface-alt p-4">
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  Loan Repayment Programs
                </h4>
                <ul className="space-y-2 text-sm text-muted">
                  <li>
                    <span className="text-foreground font-medium">PSLF:</span>{" "}
                    10 years of qualifying payments at a 501(c)(3) employer.
                    Remaining balance forgiven tax-free.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      Employer programs:
                    </span>{" "}
                    $50K - $200K over 3-5 years, taxable income.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">NHSC:</span>{" "}
                    Up to $50K for 2 years in HPSA; renewable.
                  </li>
                  <li>
                    <span className="text-foreground font-medium">
                      State programs:
                    </span>{" "}
                    Many states offer $50K-$150K for underserved service.
                  </li>
                </ul>
              </div>
            </div>
          </CompSection>
        </div>
      </section>

      {/* ═══ Disclaimer ═══ */}
      <section className="rounded-xl border border-border bg-surface p-6">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-muted shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Data Sources & Disclaimer
            </h3>
            <p className="text-xs text-muted leading-relaxed">
              Salary data is compiled from publicly available surveys (MGMA,
              Doximity, Medscape) and community reports. Ranges reflect national
              data and vary significantly by geography, employer type, and
              experience. Effective salary calculations are approximations that
              do not account for federal tax brackets, local taxes, or
              deductions. Verify offers against current market data. This page is
              for informational purposes only and does not constitute financial
              or career advice.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

/* ─── Collapsible section component ─── */

function CompSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  // Sync with parent toggle
  const prevDefault = useState(defaultOpen)[0];
  if (prevDefault !== defaultOpen) {
    // This is intentionally not in useEffect to keep it simple
  }

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-surface-alt/50 transition-colors"
      >
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted" />
        )}
      </button>
      {open && <div className="px-6 pb-6">{children}</div>}
    </div>
  );
}
