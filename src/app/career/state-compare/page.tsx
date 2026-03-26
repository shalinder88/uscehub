"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowUpDown,
  DollarSign,
  MapPin,
  TrendingUp,
  Home,
  CheckCircle2,
  Info,
} from "lucide-react";

interface StateFinancial {
  state: string;
  code: string;
  incomeTax: string;
  taxRate: number; // effective top rate as decimal
  colIndex: number; // 100 = national average
  avgPhysicianSalary: number; // in $K
  takeHome: number; // calculated: salary * (1 - tax) / (COL/100)
  noIncomeTax: boolean;
  conradFills: boolean;
  altPathways: string[];
}

const STATES: StateFinancial[] = [
  { state: "Texas", code: "TX", incomeTax: "None", taxRate: 0, colIndex: 93, avgPhysicianSalary: 350, takeHome: 376, noIncomeTax: true, conradFills: true, altPathways: ["HHS"] },
  { state: "Florida", code: "FL", incomeTax: "None", taxRate: 0, colIndex: 103, avgPhysicianSalary: 340, takeHome: 330, noIncomeTax: true, conradFills: false, altPathways: ["SCRC", "HHS"] },
  { state: "Tennessee", code: "TN", incomeTax: "None (earned)", taxRate: 0, colIndex: 91, avgPhysicianSalary: 330, takeHome: 363, noIncomeTax: true, conradFills: false, altPathways: ["ARC", "DRA"] },
  { state: "Washington", code: "WA", incomeTax: "None", taxRate: 0, colIndex: 110, avgPhysicianSalary: 350, takeHome: 318, noIncomeTax: true, conradFills: false, altPathways: [] },
  { state: "Nevada", code: "NV", incomeTax: "None", taxRate: 0, colIndex: 104, avgPhysicianSalary: 340, takeHome: 327, noIncomeTax: true, conradFills: false, altPathways: [] },
  { state: "Wyoming", code: "WY", incomeTax: "None", taxRate: 0, colIndex: 96, avgPhysicianSalary: 310, takeHome: 323, noIncomeTax: true, conradFills: false, altPathways: [] },
  { state: "South Dakota", code: "SD", incomeTax: "None", taxRate: 0, colIndex: 92, avgPhysicianSalary: 310, takeHome: 337, noIncomeTax: true, conradFills: false, altPathways: [] },
  { state: "Alaska", code: "AK", incomeTax: "None", taxRate: 0, colIndex: 127, avgPhysicianSalary: 370, takeHome: 291, noIncomeTax: true, conradFills: false, altPathways: [] },
  { state: "New Hampshire", code: "NH", incomeTax: "5% (div/int only)", taxRate: 0, colIndex: 115, avgPhysicianSalary: 320, takeHome: 278, noIncomeTax: true, conradFills: false, altPathways: [] },
  { state: "Ohio", code: "OH", incomeTax: "0-3.75%", taxRate: 0.035, colIndex: 90, avgPhysicianSalary: 320, takeHome: 343, noIncomeTax: false, conradFills: true, altPathways: ["ARC", "HHS"] },
  { state: "Indiana", code: "IN", incomeTax: "3.05% flat", taxRate: 0.0305, colIndex: 90, avgPhysicianSalary: 320, takeHome: 345, noIncomeTax: false, conradFills: true, altPathways: [] },
  { state: "Michigan", code: "MI", incomeTax: "4.25% flat", taxRate: 0.0425, colIndex: 93, avgPhysicianSalary: 320, takeHome: 330, noIncomeTax: false, conradFills: true, altPathways: ["HHS"] },
  { state: "Pennsylvania", code: "PA", incomeTax: "3.07% flat", taxRate: 0.0307, colIndex: 97, avgPhysicianSalary: 330, takeHome: 330, noIncomeTax: false, conradFills: true, altPathways: ["ARC", "HHS"] },
  { state: "North Carolina", code: "NC", incomeTax: "4.5% flat", taxRate: 0.045, colIndex: 96, avgPhysicianSalary: 330, takeHome: 328, noIncomeTax: false, conradFills: false, altPathways: ["ARC", "SCRC"] },
  { state: "Georgia", code: "GA", incomeTax: "1-5.49%", taxRate: 0.0549, colIndex: 93, avgPhysicianSalary: 330, takeHome: 336, noIncomeTax: false, conradFills: true, altPathways: ["ARC", "SCRC"] },
  { state: "West Virginia", code: "WV", incomeTax: "3-6.5%", taxRate: 0.055, colIndex: 84, avgPhysicianSalary: 300, takeHome: 338, noIncomeTax: false, conradFills: false, altPathways: ["ARC"] },
  { state: "Kentucky", code: "KY", incomeTax: "4.5% flat", taxRate: 0.045, colIndex: 90, avgPhysicianSalary: 310, takeHome: 329, noIncomeTax: false, conradFills: true, altPathways: ["ARC", "DRA"] },
  { state: "Illinois", code: "IL", incomeTax: "4.95% flat", taxRate: 0.0495, colIndex: 96, avgPhysicianSalary: 340, takeHome: 337, noIncomeTax: false, conradFills: false, altPathways: ["DRA", "HHS"] },
  { state: "California", code: "CA", incomeTax: "1-13.3%", taxRate: 0.093, colIndex: 142, avgPhysicianSalary: 360, takeHome: 230, noIncomeTax: false, conradFills: true, altPathways: ["HHS"] },
  { state: "New York", code: "NY", incomeTax: "4-10.9%", taxRate: 0.085, colIndex: 140, avgPhysicianSalary: 370, takeHome: 242, noIncomeTax: false, conradFills: true, altPathways: ["ARC", "HHS"] },
  { state: "Massachusetts", code: "MA", incomeTax: "5% + 4% surtax", taxRate: 0.05, colIndex: 135, avgPhysicianSalary: 350, takeHome: 246, noIncomeTax: false, conradFills: true, altPathways: ["HHS"] },
  { state: "New Jersey", code: "NJ", incomeTax: "1.4-10.75%", taxRate: 0.065, colIndex: 120, avgPhysicianSalary: 340, takeHome: 265, noIncomeTax: false, conradFills: false, altPathways: ["HHS"] },
  { state: "Mississippi", code: "MS", incomeTax: "0-5%", taxRate: 0.04, colIndex: 84, avgPhysicianSalary: 300, takeHome: 343, noIncomeTax: false, conradFills: false, altPathways: ["DRA", "SCRC", "ARC"] },
  { state: "Alabama", code: "AL", incomeTax: "2-5%", taxRate: 0.04, colIndex: 88, avgPhysicianSalary: 320, takeHome: 350, noIncomeTax: false, conradFills: false, altPathways: ["DRA", "SCRC"] },
  { state: "North Dakota", code: "ND", incomeTax: "0-1.95%", taxRate: 0.015, colIndex: 92, avgPhysicianSalary: 310, takeHome: 332, noIncomeTax: false, conradFills: false, altPathways: [] },
];

type SortField = "takeHome" | "avgPhysicianSalary" | "taxRate" | "colIndex" | "state";

export default function StateComparePage() {
  const [sortField, setSortField] = useState<SortField>("takeHome");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [showNoTax, setShowNoTax] = useState(false);
  const [showSlots, setShowSlots] = useState(false);

  const sorted = useMemo(() => {
    let list = [...STATES];
    if (showNoTax) list = list.filter((s) => s.noIncomeTax);
    if (showSlots) list = list.filter((s) => !s.conradFills);

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "state") return a.state.localeCompare(b.state) * dir;
      return ((a[sortField] as number) - (b[sortField] as number)) * dir;
    });
    return list;
  }, [sortField, sortDir, showNoTax, showSlots]);

  function toggleSort(field: SortField) {
    if (sortField === field) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-success/10 p-2.5">
            <DollarSign className="h-6 w-6 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            State Financial Comparison
          </h1>
        </div>
        <p className="text-muted max-w-2xl">
          Compare states by what actually matters: take-home pay after taxes
          and cost of living. A $350K salary in California is worth less than
          $310K in Texas after you factor in 13.3% state tax and 42% higher
          cost of living.
        </p>
      </div>

      {/* Info Box */}
      <div className="rounded-xl border border-border bg-surface-alt p-4 mb-6 flex gap-3">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          <strong className="text-foreground">How we calculate &quot;Effective Take-Home&quot;:</strong>{" "}
          Average physician salary × (1 - effective state tax rate) ÷ (COL index / 100).
          This gives you the purchasing-power-adjusted income — what your salary
          actually buys in each state. COL index: 100 = national average.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button
          onClick={() => setShowNoTax(!showNoTax)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            showNoTax ? "bg-success text-white" : "bg-surface border border-border text-muted"
          }`}
        >
          {showNoTax ? "✓ " : ""}No Income Tax States ({STATES.filter(s => s.noIncomeTax).length})
        </button>
        <button
          onClick={() => setShowSlots(!showSlots)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
            showSlots ? "bg-accent text-white" : "bg-surface border border-border text-muted"
          }`}
        >
          {showSlots ? "✓ " : ""}Conrad Slots Available ({STATES.filter(s => !s.conradFills).length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort("state")} className="flex items-center gap-1 font-semibold text-foreground hover:text-accent">
                  State <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort("avgPhysicianSalary")} className="flex items-center gap-1 font-semibold text-foreground hover:text-accent">
                  Avg Salary <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort("taxRate")} className="flex items-center gap-1 font-semibold text-foreground hover:text-accent">
                  State Tax <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort("colIndex")} className="flex items-center gap-1 font-semibold text-foreground hover:text-accent">
                  COL Index <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button onClick={() => toggleSort("takeHome")} className="flex items-center gap-1 font-semibold text-foreground hover:text-accent">
                  Effective Take-Home <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Conrad</th>
              <th className="px-4 py-3 text-left font-semibold text-foreground">Alt. Paths</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((s, i) => (
              <tr key={s.code} className="border-b border-border/50 hover:bg-surface/50">
                <td className="px-4 py-3">
                  <Link href={`/career/waiver/${s.state.toLowerCase().replace(/\s+/g, "-")}`} className="flex items-center gap-2 hover:text-accent">
                    <span className="font-mono text-xs text-muted w-6">{s.code}</span>
                    <span className="font-medium text-foreground">{s.state}</span>
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono text-muted">${s.avgPhysicianSalary}K</td>
                <td className="px-4 py-3">
                  <span className={`text-xs ${s.noIncomeTax ? "text-success font-bold" : "text-muted"}`}>
                    {s.incomeTax}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-mono ${s.colIndex > 110 ? "text-danger" : s.colIndex > 100 ? "text-warning" : "text-success"}`}>
                    {s.colIndex}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`font-mono font-bold ${i < 5 ? "text-success" : i < 15 ? "text-foreground" : "text-muted"}`}>
                    ${s.takeHome}K
                  </span>
                </td>
                <td className="px-4 py-3">
                  {s.conradFills ? (
                    <span className="text-[10px] text-danger">Fills All</span>
                  ) : (
                    <span className="text-[10px] text-success">Available</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {s.altPathways.length > 0 ? s.altPathways.map(p => (
                      <span key={p} className="text-[10px] bg-accent/10 text-accent rounded px-1">{p}</span>
                    )) : <span className="text-[10px] text-muted">—</span>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-muted">
        Salary data from Medscape/MGMA 2025. COL from Bureau of Economic Analysis Regional
        Price Parities. Tax rates reflect top marginal state income tax. Take-home is simplified
        (does not include federal tax, FICA, deductions, or local taxes). For full financial
        planning, consult a financial advisor.
      </p>

      {/* Cross-link */}
      <div className="mt-8 rounded-xl border border-border bg-surface p-5">
        <p className="text-sm text-muted">
          Want to compare 2-3 states side by side?{" "}
          <Link href="/career/compare-states" className="text-accent hover:underline font-medium">
            Use our State Comparison Tool →
          </Link>
        </p>
      </div>
    </div>
  );
}
