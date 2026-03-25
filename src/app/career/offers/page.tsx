"use client";

import { useState, useMemo } from "react";
import {
  GitCompare,
  Plus,
  Trash2,
  AlertTriangle,
  Shield,
  DollarSign,
  Clock,
  MapPin,
} from "lucide-react";

interface JobOffer {
  id: number;
  jobTitle: string;
  employer: string;
  state: string;
  baseSalary: string;
  rvuTarget: string;
  signingBonus: string;
  loanRepayment: string;
  cmeAllowance: string;
  ptoDays: string;
  callFrequency: string;
  nonCompeteMiles: string;
  nonCompeteYears: string;
  malpractice: string;
  visaSupport: string;
  greenCardTimeline: string;
}

const emptyOffer = (): JobOffer => ({
  id: Date.now(),
  jobTitle: "",
  employer: "",
  state: "",
  baseSalary: "",
  rvuTarget: "",
  signingBonus: "",
  loanRepayment: "",
  cmeAllowance: "",
  ptoDays: "",
  callFrequency: "",
  nonCompeteMiles: "",
  nonCompeteYears: "",
  malpractice: "occurrence",
  visaSupport: "",
  greenCardTimeline: "",
});

function parseNum(val: string): number {
  const n = parseFloat(val.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? 0 : n;
}

function formatCurrency(amount: number): string {
  if (amount === 0) return "$0";
  return "$" + amount.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function RedFlag({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-1.5 mt-1">
      <AlertTriangle className="h-3 w-3 text-danger shrink-0 mt-0.5" />
      <span className="text-[10px] text-danger">{text}</span>
    </div>
  );
}

export default function OffersPage() {
  const [offers, setOffers] = useState<JobOffer[]>([emptyOffer()]);

  function addOffer() {
    if (offers.length >= 4) return;
    setOffers([...offers, emptyOffer()]);
  }

  function removeOffer(id: number) {
    if (offers.length <= 1) return;
    setOffers(offers.filter((o) => o.id !== id));
  }

  function updateOffer(id: number, field: keyof JobOffer, value: string) {
    setOffers(
      offers.map((o) => (o.id === id ? { ...o, [field]: value } : o))
    );
  }

  const calculations = useMemo(() => {
    return offers.map((offer) => {
      const base = parseNum(offer.baseSalary);
      const signing = parseNum(offer.signingBonus);
      const loan = parseNum(offer.loanRepayment);
      const cme = parseNum(offer.cmeAllowance);
      const totalYear1 = base + signing + loan + cme;
      const effectiveHourly = base > 0 ? base / 2080 : 0;
      const nonCompMiles = parseNum(offer.nonCompeteMiles);
      const nonCompYears = parseNum(offer.nonCompeteYears);

      const flags: string[] = [];
      if (nonCompMiles > 25) flags.push("Non-compete exceeds 25 miles");
      if (nonCompYears > 2) flags.push("Non-compete exceeds 2 years");
      if (offer.malpractice === "claims-made")
        flags.push("Claims-made malpractice — ask about tail coverage");
      if (offer.visaSupport === "none" || offer.visaSupport === "")
        flags.push("No visa/green card support indicated");
      if (base > 0 && base < 180000) flags.push("Salary may be below market");

      return { totalYear1, effectiveHourly, flags };
    });
  }, [offers]);

  const inputClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const selectClass =
    "w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent";
  const labelClass = "block text-xs font-medium text-muted mb-1";

  return (
    <>
      <head>
        <title>Offer Comparison Tool — USCEHub</title>
        <meta
          name="description"
          content="Compare up to 4 physician job offers side by side. Analyze salary, benefits, non-compete clauses, visa support, and red flags."
        />
        <link
          rel="canonical"
          href="https://uscehub.com/career/offers"
        />
      </head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Offer Comparison Tool
          </h1>
          <p className="text-muted max-w-2xl">
            Compare up to 4 job offers side by side. Input contract details to
            see total compensation, effective hourly rate, and potential red
            flags.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              <strong className="text-foreground">Important:</strong> This tool
              provides informational comparison only. It is NOT legal advice.
              Consult a qualified attorney before signing any employment
              contract.
            </p>
          </div>
        </div>

        {/* Add Offer Button */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-muted">
            {offers.length} of 4 offers
          </span>
          {offers.length < 4 && (
            <button
              onClick={addOffer}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Offer
            </button>
          )}
        </div>

        {/* Offers Grid */}
        <div
          className={`grid gap-6 mb-12 ${
            offers.length === 1
              ? "grid-cols-1 max-w-xl"
              : offers.length === 2
              ? "grid-cols-1 md:grid-cols-2"
              : offers.length === 3
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              : "grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          }`}
        >
          {offers.map((offer, index) => {
            const calc = calculations[index];
            return (
              <div
                key={offer.id}
                className="rounded-xl border border-border bg-surface p-5"
              >
                {/* Offer Header */}
                <div className="flex items-center justify-between mb-5">
                  <span className="rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent">
                    Offer {index + 1}
                  </span>
                  {offers.length > 1 && (
                    <button
                      onClick={() => removeOffer(offer.id)}
                      className="rounded-lg p-1.5 text-muted hover:text-danger hover:bg-danger/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {/* Basic Info */}
                <div className="space-y-3 mb-5">
                  <div>
                    <label className={labelClass}>Job Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Family Medicine"
                      value={offer.jobTitle}
                      onChange={(e) =>
                        updateOffer(offer.id, "jobTitle", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Employer</label>
                    <input
                      type="text"
                      placeholder="Hospital / Clinic name"
                      value={offer.employer}
                      onChange={(e) =>
                        updateOffer(offer.id, "employer", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>State</label>
                    <input
                      type="text"
                      placeholder="e.g. TX"
                      value={offer.state}
                      onChange={(e) =>
                        updateOffer(offer.id, "state", e.target.value)
                      }
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Compensation */}
                <div className="border-t border-border pt-4 mb-5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Compensation
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Base Salary ($)</label>
                      <input
                        type="text"
                        placeholder="250000"
                        value={offer.baseSalary}
                        onChange={(e) =>
                          updateOffer(offer.id, "baseSalary", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>RVU Target</label>
                      <input
                        type="text"
                        placeholder="e.g. 5000"
                        value={offer.rvuTarget}
                        onChange={(e) =>
                          updateOffer(offer.id, "rvuTarget", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Signing Bonus ($)</label>
                      <input
                        type="text"
                        placeholder="25000"
                        value={offer.signingBonus}
                        onChange={(e) =>
                          updateOffer(offer.id, "signingBonus", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>
                        Loan Repayment ($)
                      </label>
                      <input
                        type="text"
                        placeholder="50000"
                        value={offer.loanRepayment}
                        onChange={(e) =>
                          updateOffer(
                            offer.id,
                            "loanRepayment",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>CME Allowance ($)</label>
                      <input
                        type="text"
                        placeholder="3000"
                        value={offer.cmeAllowance}
                        onChange={(e) =>
                          updateOffer(offer.id, "cmeAllowance", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Work Terms */}
                <div className="border-t border-border pt-4 mb-5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Work Terms
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>PTO Days</label>
                      <input
                        type="text"
                        placeholder="25"
                        value={offer.ptoDays}
                        onChange={(e) =>
                          updateOffer(offer.id, "ptoDays", e.target.value)
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Call Frequency</label>
                      <input
                        type="text"
                        placeholder="e.g. 1:4 weekends"
                        value={offer.callFrequency}
                        onChange={(e) =>
                          updateOffer(
                            offer.id,
                            "callFrequency",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Restrictive Covenants */}
                <div className="border-t border-border pt-4 mb-5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Non-Compete
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Distance (miles)</label>
                      <input
                        type="text"
                        placeholder="20"
                        value={offer.nonCompeteMiles}
                        onChange={(e) =>
                          updateOffer(
                            offer.id,
                            "nonCompeteMiles",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Duration (years)</label>
                      <input
                        type="text"
                        placeholder="2"
                        value={offer.nonCompeteYears}
                        onChange={(e) =>
                          updateOffer(
                            offer.id,
                            "nonCompeteYears",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Insurance & Immigration */}
                <div className="border-t border-border pt-4 mb-5">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Malpractice & Immigration
                  </h4>
                  <div className="space-y-3">
                    <div>
                      <label className={labelClass}>Malpractice Type</label>
                      <select
                        value={offer.malpractice}
                        onChange={(e) =>
                          updateOffer(offer.id, "malpractice", e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="occurrence">Occurrence</option>
                        <option value="claims-made">Claims-Made</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Visa Support</label>
                      <select
                        value={offer.visaSupport}
                        onChange={(e) =>
                          updateOffer(offer.id, "visaSupport", e.target.value)
                        }
                        className={selectClass}
                      >
                        <option value="">Select...</option>
                        <option value="J-1">J-1 Waiver</option>
                        <option value="H-1B">H-1B</option>
                        <option value="green-card">Green Card</option>
                        <option value="none">None</option>
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Green Card Timeline
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 2-3 years"
                        value={offer.greenCardTimeline}
                        onChange={(e) =>
                          updateOffer(
                            offer.id,
                            "greenCardTimeline",
                            e.target.value
                          )
                        }
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                {/* Calculated Results */}
                <div className="border-t border-border pt-4">
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-3">
                    Summary
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        Total Year 1 Comp
                      </span>
                      <span className="text-sm font-bold text-success">
                        {formatCurrency(calc.totalYear1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted">
                        Effective Hourly
                      </span>
                      <span className="text-sm font-bold text-foreground">
                        {calc.effectiveHourly > 0
                          ? `$${calc.effectiveHourly.toFixed(2)}/hr`
                          : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Red Flags */}
                  {calc.flags.length > 0 && (
                    <div className="mt-3 rounded-lg bg-danger/5 border border-danger/20 p-3">
                      <div className="text-[10px] font-semibold text-danger uppercase tracking-wider mb-1.5">
                        Red Flags
                      </div>
                      {calc.flags.map((flag, i) => (
                        <RedFlag key={i} text={flag} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
