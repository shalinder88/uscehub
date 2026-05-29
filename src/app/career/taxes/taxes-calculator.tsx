"use client";

import { useState, useMemo } from "react";
import { DollarSign, AlertTriangle } from "lucide-react";

const STATES_TAX: Record<string, number> = {
  AK: 0, FL: 0, NV: 0, NH: 0, SD: 0, TN: 0, TX: 0, WA: 0, WY: 0,
  AL: 5.0, AZ: 2.5, AR: 4.4, CA: 9.3, CO: 4.4, CT: 6.99, DE: 6.6,
  GA: 5.49, HI: 11.0, ID: 5.8, IL: 4.95, IN: 3.05, IA: 6.0, KS: 5.7,
  KY: 4.5, LA: 4.25, ME: 7.15, MD: 5.75, MA: 9.0, MI: 4.25, MN: 9.85,
  MS: 5.0, MO: 4.95, MT: 6.75, NE: 6.84, NJ: 8.97, NM: 5.9, NY: 10.9,
  NC: 4.5, ND: 2.5, OH: 3.75, OK: 4.75, OR: 9.9, PA: 3.07, RI: 5.99,
  SC: 6.5, UT: 4.65, VT: 8.75, VA: 5.75, WV: 6.5, WI: 7.65,
};

const STATE_NAMES: Record<string, string> = {
  AK:"Alaska",AL:"Alabama",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",
  IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",
  MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",
  NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",
  ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",
  RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",
  UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",
  WI:"Wisconsin",WY:"Wyoming",
};

const SORTED_STATES = Object.keys(STATE_NAMES).sort((a, b) => STATE_NAMES[a].localeCompare(STATE_NAMES[b]));

function federalTax(income: number): number {
  const brackets = [
    [11925, 0.10],
    [48475, 0.12],
    [103350, 0.22],
    [197300, 0.24],
    [250525, 0.32],
    [626350, 0.35],
    [Infinity, 0.37],
  ];
  let tax = 0;
  let prev = 0;
  for (const [limit, rate] of brackets) {
    const cap = Math.min(income, limit as number);
    if (cap <= prev) break;
    tax += (cap - prev) * (rate as number);
    prev = cap;
    if (income <= cap) break;
  }
  return tax;
}

function ficaW2(income: number): number {
  const ssCap = 176100;
  const ss = Math.min(income, ssCap) * 0.062;
  const medicare = income * 0.0145 + Math.max(0, income - 200000) * 0.009;
  return ss + medicare;
}

function selfEmploymentTax(income: number): number {
  const ssCap = 176100;
  const ss = Math.min(income, ssCap) * 0.124;
  const medicare = income * 0.029 + Math.max(0, income - 200000) * 0.009;
  return ss + medicare;
}

export function TaxCalculator() {
  const [salary, setSalary] = useState("300000");
  const [state, setState] = useState("TX");
  const [type, setType] = useState<"w2" | "1099">("w2");

  const result = useMemo(() => {
    const gross = Math.max(0, parseInt(salary.replace(/\D/g, "") || "0", 10));
    if (gross === 0) return null;

    const stateTaxRate = (STATES_TAX[state] ?? 5.0) / 100;

    if (type === "w2") {
      const fica = ficaW2(gross);
      const fed = federalTax(gross);
      const stateTax = gross * stateTaxRate;
      const net = gross - fed - stateTax - fica;
      return {
        gross,
        federal: fed,
        state: stateTax,
        fica,
        seDeduction: 0,
        net,
        effectiveRate: ((fed + stateTax + fica) / gross) * 100,
      };
    } else {
      const se = selfEmploymentTax(gross);
      const seDeduction = se / 2;
      const taxableIncome = gross - seDeduction;
      const fed = federalTax(taxableIncome);
      const stateTax = gross * stateTaxRate;
      const net = gross - fed - stateTax - se;
      return {
        gross,
        federal: fed,
        state: stateTax,
        fica: se,
        seDeduction,
        net,
        effectiveRate: ((fed + stateTax + se) / gross) * 100,
      };
    }
  }, [salary, state, type]);

  const fmt = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <DollarSign className="h-5 w-5 text-success" />
        Take-Home Pay Estimator
      </h2>
      <p className="text-xs text-muted mb-5">
        Rough estimate only — uses 2025 federal brackets, single filer, standard deduction.
        No QBI, no itemized deductions, no AMT. Not tax advice.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            Annual Salary
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted text-sm">$</span>
            <input
              type="text"
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value.replace(/\D/g, ""))}
              className="w-full rounded-lg border border-border bg-surface-alt pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
              placeholder="300000"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            State
          </label>
          <select
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            {SORTED_STATES.map((s) => (
              <option key={s} value={s}>{STATE_NAMES[s]}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            Employment Type
          </label>
          <div className="flex gap-2">
            {(["w2", "1099"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-colors ${
                  type === t
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-alt text-muted hover:border-accent/50"
                }`}
              >
                {t === "w2" ? "W-2 Employee" : "1099 / IC"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Gross Income", value: fmt(result.gross), color: "text-foreground" },
              { label: `Federal Tax`, value: fmt(result.federal), color: "text-danger" },
              { label: `${STATE_NAMES[state]} Tax`, value: fmt(result.state), color: "text-warning" },
              {
                label: type === "w2" ? "FICA (employee)" : "Self-Employment Tax",
                value: fmt(result.fica),
                color: "text-muted",
              },
            ].map((item) => (
              <div key={item.label} className="rounded-lg bg-surface-alt p-3 text-center">
                <div className={`text-base font-bold font-mono ${item.color}`}>{item.value}</div>
                <div className="text-[10px] text-muted mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold font-mono text-success">{fmt(result.net)}</div>
              <div className="text-xs text-muted">Estimated net take-home</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-foreground">{result.effectiveRate.toFixed(1)}%</div>
              <div className="text-[10px] text-muted">effective tax rate</div>
            </div>
          </div>

          {type === "1099" && (
            <div className="rounded-lg bg-surface-alt border border-border p-3 text-xs text-muted">
              <strong className="text-foreground">1099 notes:</strong> Self-employment tax is 15.3% on
              first $176,100 + 2.9% above that. Half is deductible above-the-line (applied here).
              1099 physicians can contribute up to ~$70K/yr pretax to a solo 401(k) —
              not reflected above. Real 1099 take-home is often <em>better</em> than W-2 once
              retirement and business deductions are factored in.
            </div>
          )}
        </div>
      )}

      <div className="mt-4 flex items-start gap-2 text-[10px] text-muted">
        <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
        <span>
          This is a rough illustrative estimate using 2025 single-filer federal brackets and
          simplified state tax rates. It does not account for married filing jointly, itemized
          deductions, retirement contributions, AMT, NIIT, or city taxes.
          Consult a CPA for actual tax planning.
        </span>
      </div>
    </div>
  );
}
