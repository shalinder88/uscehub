"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  POLICY_ALERTS,
  getAlertsByDate,
  type PolicyAlert,
} from "@/lib/policy-alerts-data";
import {
  Bell,
  AlertTriangle,
  ExternalLink,
  ArrowLeft,
  Filter,
  Clock,
  Globe,
  FileText,
  Building2,
  MapPin,
  Shield,
} from "lucide-react";

const IMPACT_STYLES = {
  critical: {
    border: "border-red-500/30",
    bg: "bg-red-500/5",
    badge: "bg-red-500/10 text-red-400",
    label: "CRITICAL",
  },
  high: {
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    badge: "bg-orange-500/10 text-orange-400",
    label: "HIGH",
  },
  medium: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    badge: "bg-yellow-500/10 text-yellow-400",
    label: "MEDIUM",
  },
  low: {
    border: "border-slate-500/30",
    bg: "bg-slate-500/5",
    badge: "bg-slate-500/10 text-slate-400",
    label: "LOW",
  },
};

const CATEGORY_ICONS: Record<string, typeof Globe> = {
  h1b: Globe,
  conrad: MapPin,
  greencard: Shield,
  uscis: Building2,
  legislative: FileText,
  state: MapPin,
};

const CATEGORY_LABELS: Record<string, string> = {
  h1b: "H-1B",
  conrad: "Conrad 30",
  greencard: "Green Card",
  uscis: "USCIS",
  legislative: "Legislative",
  state: "State",
};

export default function PolicyAlertsPage() {
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterImpact, setFilterImpact] = useState<string>("all");

  const filtered = useMemo(() => {
    let alerts = getAlertsByDate();
    if (filterCategory !== "all") {
      alerts = alerts.filter((a) => a.category === filterCategory);
    }
    if (filterImpact !== "all") {
      alerts = alerts.filter((a) => a.impact === filterImpact);
    }
    return alerts;
  }, [filterCategory, filterImpact]);

  const categories = [...new Set(POLICY_ALERTS.map((a) => a.category))];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/career"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Career Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-danger/10 p-2.5">
            <Bell className="h-6 w-6 text-danger" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Policy Alerts
            </h1>
            <p className="text-xs text-muted mt-1">
              Immigration policy changes that affect physicians · Updated weekly
            </p>
          </div>
        </div>
        <p className="text-muted max-w-2xl text-sm">
          Curated feed of H-1B, Conrad 30, green card, and USCIS changes
          specifically relevant to physician immigration. Every alert
          links to the official source.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-1 text-xs text-muted mr-2">
          <Filter className="h-3 w-3" />
          Filter:
        </div>
        <button
          onClick={() => setFilterCategory("all")}
          className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            filterCategory === "all"
              ? "bg-accent text-white"
              : "bg-surface border border-border text-muted hover:text-foreground"
          }`}
        >
          All ({POLICY_ALERTS.length})
        </button>
        {categories.map((cat) => {
          const count = POLICY_ALERTS.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterCategory === cat
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              {CATEGORY_LABELS[cat]} ({count})
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        <div className="flex items-center gap-1 text-xs text-muted mr-2">
          <AlertTriangle className="h-3 w-3" />
          Impact:
        </div>
        {(["all", "critical", "high", "medium", "low"] as const).map((imp) => {
          const count =
            imp === "all"
              ? POLICY_ALERTS.length
              : POLICY_ALERTS.filter((a) => a.impact === imp).length;
          return (
            <button
              key={imp}
              onClick={() => setFilterImpact(imp)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                filterImpact === imp
                  ? "bg-accent text-white"
                  : "bg-surface border border-border text-muted hover:text-foreground"
              }`}
            >
              {imp === "all" ? "All" : imp.charAt(0).toUpperCase() + imp.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="space-y-4">
        {filtered.map((alert) => {
          const style = IMPACT_STYLES[alert.impact];
          const Icon = CATEGORY_ICONS[alert.category] || Globe;

          return (
            <div
              key={alert.id}
              className={`rounded-xl border ${style.border} ${style.bg} p-5`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}
                  >
                    {style.label}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-surface px-2 py-0.5 text-[10px] text-muted">
                    <Icon className="h-2.5 w-2.5" />
                    {CATEGORY_LABELS[alert.category]}
                  </span>
                </div>
                <span className="text-[10px] text-muted flex items-center gap-1 shrink-0">
                  <Clock className="h-2.5 w-2.5" />
                  {new Date(alert.date + "T00:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>

              <h3 className="text-sm font-bold text-foreground mb-2">
                {alert.title}
              </h3>

              <p className="text-xs text-muted leading-relaxed mb-3">
                {alert.summary}
              </p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {alert.affectsWho.map((who) => (
                    <span
                      key={who}
                      className="inline-flex rounded bg-surface px-1.5 py-0.5 text-[9px] text-muted"
                    >
                      {who}
                    </span>
                  ))}
                </div>
                <a
                  href={alert.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-accent hover:underline shrink-0 ml-2"
                >
                  {alert.sourceName}
                  <ExternalLink className="h-2.5 w-2.5" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted">
          <Bell className="h-8 w-8 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No alerts match your filters.</p>
        </div>
      )}

      {/* Source note */}
      <p className="mt-8 text-xs text-muted">
        Alerts curated from official government sources (USCIS, DOS, CMS,
        Congress.gov), immigration law firm analyses, and physician advocacy
        organizations (AMA, AILA). Every alert links to its source. This feed
        is updated weekly. Not legal advice — consult your immigration attorney
        for guidance specific to your situation.
      </p>
    </div>
  );
}
