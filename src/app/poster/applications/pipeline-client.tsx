"use client";

import { useMemo, useState } from "react";
import { Search, X, Download, StickyNote, GraduationCap, MapPin, Plane } from "lucide-react";

export interface PipelineNote {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
}

export interface PipelineApplication {
  id: string;
  status: string;
  message: string | null;
  createdAt: string;
  applicantName: string;
  applicantEmail: string;
  school: string | null;
  country: string | null;
  graduationYear: string | null;
  step1: string | null;
  step2: string | null;
  visaStatus: string | null;
  ecfmgStatus: string | null;
  listingId: string;
  listingTitle: string;
  notes: PipelineNote[];
}

const COLUMNS: { key: string; label: string; tone: string }[] = [
  { key: "SUBMITTED", label: "New", tone: "var(--teal)" },
  { key: "UNDER_REVIEW", label: "In review", tone: "#b45309" },
  { key: "ACCEPTED", label: "Accepted", tone: "#15803d" },
  { key: "COMPLETED", label: "Completed", tone: "var(--teal-deep)" },
  { key: "REJECTED", label: "Declined", tone: "#b91c1c" },
  { key: "WITHDRAWN", label: "Withdrawn", tone: "var(--text-muted)" },
];

const MOVE_TARGETS = ["SUBMITTED", "UNDER_REVIEW", "ACCEPTED", "COMPLETED", "REJECTED"];

function needsVisa(v: string | null) {
  return !!v && /needs|j-1|j1|h-1|h1|require/i.test(v);
}

function csvEscape(v: string | null) {
  const s = (v ?? "").replace(/"/g, '""');
  return `"${s}"`;
}

export function ApplicationsPipeline({
  applications: initial,
  listings,
  canManage,
}: {
  applications: PipelineApplication[];
  listings: { id: string; title: string }[];
  canManage: boolean;
}) {
  const [apps, setApps] = useState(initial);
  const [query, setQuery] = useState("");
  const [listingFilter, setListingFilter] = useState("");
  const [visaOnly, setVisaOnly] = useState(false);
  const [minStep2, setMinStep2] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const [busy, setBusy] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = parseInt(minStep2, 10);
    return apps.filter((a) => {
      if (listingFilter && a.listingId !== listingFilter) return false;
      if (visaOnly && !needsVisa(a.visaStatus)) return false;
      if (!Number.isNaN(min) && (parseInt(a.step2 ?? "0", 10) || 0) < min) return false;
      if (q) {
        const hay = `${a.applicantName} ${a.school ?? ""} ${a.country ?? ""} ${a.listingTitle}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [apps, query, listingFilter, visaOnly, minStep2]);

  const selected = apps.find((a) => a.id === selectedId) ?? null;

  async function moveStatus(id: string, status: string) {
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setApps((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      }
    } finally {
      setBusy(false);
    }
  }

  async function addNote(id: string) {
    const body = noteDraft.trim();
    if (!body) return;
    setBusy(true);
    try {
      const res = await fetch(`/api/applications/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      if (res.ok) {
        const note = await res.json();
        setApps((prev) =>
          prev.map((a) =>
            a.id === id ? { ...a, notes: [...a.notes, note] } : a,
          ),
        );
        setNoteDraft("");
      }
    } finally {
      setBusy(false);
    }
  }

  function exportCsv() {
    const header = ["Name", "Email", "Listing", "Status", "Country", "School", "Grad year", "Step 1", "Step 2", "Visa", "ECFMG", "Applied"];
    const lines = filtered.map((a) =>
      [a.applicantName, a.applicantEmail, a.listingTitle, a.status, a.country, a.school, a.graduationYear, a.step1, a.step2, a.visaStatus, a.ecfmgStatus, a.createdAt.slice(0, 10)]
        .map(csvEscape)
        .join(","),
    );
    const csv = [header.map(csvEscape).join(","), ...lines].join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "applicants.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const inputStyle = {
    background: "var(--paper)",
    border: "1px solid var(--line)",
    color: "var(--ink)",
  } as const;

  return (
    <div>
      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[180px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--text-muted)" }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, school, country…"
            className="w-full rounded-lg py-2 pl-9 pr-3 text-sm outline-none"
            style={inputStyle}
          />
        </div>
        <select value={listingFilter} onChange={(e) => setListingFilter(e.target.value)} className="rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}>
          <option value="">All listings</option>
          {listings.map((l) => (
            <option key={l.id} value={l.id}>{l.title}</option>
          ))}
        </select>
        <input
          value={minStep2}
          onChange={(e) => setMinStep2(e.target.value.replace(/\D/g, ""))}
          placeholder="Min Step 2"
          inputMode="numeric"
          className="w-28 rounded-lg px-3 py-2 text-sm outline-none"
          style={inputStyle}
        />
        <button
          onClick={() => setVisaOnly((v) => !v)}
          className="rounded-lg px-3 py-2 text-sm font-medium"
          style={{
            border: "1px solid var(--line)",
            background: visaOnly ? "var(--teal-soft)" : "var(--paper)",
            color: visaOnly ? "var(--teal-deep)" : "var(--ink-soft)",
          }}
        >
          Needs visa
        </button>
        <button onClick={exportCsv} className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-white" style={{ background: "var(--teal)" }}>
          <Download className="h-4 w-4" /> Export ({filtered.length})
        </button>
      </div>

      {/* Kanban */}
      <div className="flex gap-4 overflow-x-auto pb-2">
        {COLUMNS.map((col) => {
          const items = filtered.filter((a) => a.status === col.key);
          if (col.key === "WITHDRAWN" && items.length === 0) return null;
          return (
            <div key={col.key} className="w-64 shrink-0">
              <div className="mb-2 flex items-center gap-2 px-1">
                <span className="h-2 w-2 rounded-full" style={{ background: col.tone }} />
                <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{col.label}</span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setSelectedId(a.id)}
                    className="w-full rounded-xl p-3 text-left transition-shadow hover:shadow-sm"
                    style={{ background: "var(--paper)", border: "1px solid var(--line)" }}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{a.applicantName}</span>
                      {a.notes.length > 0 && (
                        <span className="flex items-center gap-0.5 text-xs" style={{ color: "var(--text-muted)" }}>
                          <StickyNote className="h-3 w-3" />{a.notes.length}
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs" style={{ color: "var(--ink-soft)" }}>{a.listingTitle}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {a.step2 && <span className="rounded px-1.5 py-0.5" style={{ background: "var(--bg-band)" }}>Step 2: {a.step2}</span>}
                      {a.country && <span className="rounded px-1.5 py-0.5" style={{ background: "var(--bg-band)" }}>{a.country}</span>}
                      {needsVisa(a.visaStatus) && <span className="rounded px-1.5 py-0.5" style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}>visa</span>}
                    </div>
                  </button>
                ))}
                {items.length === 0 && (
                  <p className="rounded-xl px-3 py-4 text-center text-xs" style={{ color: "var(--text-muted)", border: "1px dashed var(--line)" }}>—</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end" onClick={() => setSelectedId(null)}>
          <div className="absolute inset-0 bg-black/30" />
          <aside
            className="relative h-full w-full max-w-md overflow-y-auto p-6"
            style={{ background: "var(--bg)", borderLeft: "1px solid var(--line)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl" style={{ fontFamily: "var(--font-serif)", color: "var(--ink)" }}>{selected.applicantName}</h2>
                <a href={`mailto:${selected.applicantEmail}`} className="text-sm" style={{ color: "var(--teal)" }}>{selected.applicantEmail}</a>
              </div>
              <button onClick={() => setSelectedId(null)} aria-label="Close" className="rounded-lg p-1.5" style={{ color: "var(--ink-soft)" }}>
                <X className="h-5 w-5" />
              </button>
            </div>

            <p className="mt-3 text-sm" style={{ color: "var(--ink-soft)" }}>
              Applied to <span style={{ color: "var(--ink)", fontWeight: 500 }}>{selected.listingTitle}</span>
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <Fact icon={GraduationCap} label="Medical school" value={selected.school} />
              <Fact icon={MapPin} label="Country" value={selected.country} />
              <Fact label="Grad year" value={selected.graduationYear} />
              <Fact icon={Plane} label="Visa" value={selected.visaStatus} />
              <Fact label="Step 1" value={selected.step1} />
              <Fact label="Step 2 CK" value={selected.step2} />
              <Fact label="ECFMG" value={selected.ecfmgStatus} />
            </div>

            {selected.message && (
              <div className="mt-4 rounded-xl p-3 text-sm" style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}>
                “{selected.message}”
              </div>
            )}

            {canManage && (
              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Move to stage</p>
                <div className="flex flex-wrap gap-1.5">
                  {MOVE_TARGETS.map((t) => {
                    const col = COLUMNS.find((c) => c.key === t)!;
                    const active = selected.status === t;
                    return (
                      <button
                        key={t}
                        disabled={busy || active}
                        onClick={() => moveStatus(selected.id, t)}
                        className="rounded-lg px-2.5 py-1.5 text-xs font-medium disabled:opacity-100"
                        style={{
                          border: `1px solid ${active ? col.tone : "var(--line)"}`,
                          background: active ? col.tone : "var(--paper)",
                          color: active ? "#fff" : "var(--ink-soft)",
                          cursor: active ? "default" : "pointer",
                        }}
                      >
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-6">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>Coordinator notes</p>
              <div className="space-y-2">
                {selected.notes.length === 0 && <p className="text-sm" style={{ color: "var(--text-muted)" }}>No notes yet.</p>}
                {selected.notes.map((nte) => (
                  <div key={nte.id} className="rounded-xl p-3" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
                    <p className="text-sm" style={{ color: "var(--ink)" }}>{nte.body}</p>
                    <p className="mt-1 text-[11px]" style={{ color: "var(--text-muted)" }}>
                      {nte.authorName} · {nte.createdAt.slice(0, 10)}
                    </p>
                  </div>
                ))}
              </div>
              {canManage && (
                <div className="mt-3 flex gap-2">
                  <input
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") addNote(selected.id); }}
                    placeholder="Add a private note…"
                    className="flex-1 rounded-lg px-3 py-2 text-sm outline-none"
                    style={inputStyle}
                  />
                  <button
                    onClick={() => addNote(selected.id)}
                    disabled={busy || !noteDraft.trim()}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
                    style={{ background: "var(--teal)" }}
                  >
                    Add
                  </button>
                </div>
              )}
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Fact({ icon: Icon, label, value }: { icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; label: string; value: string | null }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-[11px] uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
        {Icon && <Icon className="h-3 w-3" />} {label}
      </p>
      <p className="mt-0.5" style={{ color: "var(--ink)" }}>{value ?? "—"}</p>
    </div>
  );
}
