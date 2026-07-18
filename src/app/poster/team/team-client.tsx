"use client";

import { useState } from "react";
import { UserPlus, Trash2, ShieldCheck } from "lucide-react";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  title: string | null;
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: "Owner",
  COORDINATOR: "Coordinator",
  VIEWER: "Viewer",
};

export function TeamManager({ members: initial, isOwner }: { members: TeamMember[]; isOwner: boolean }) {
  const [members, setMembers] = useState(initial);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("COORDINATOR");
  const [msg, setMsg] = useState<{ kind: "error" | "ok"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const inputStyle = { background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink)" } as const;

  async function addMember() {
    const e = email.trim();
    if (!e) return;
    setBusy(true);
    setMsg(null);
    try {
      const res = await fetch("/api/organization/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: e, role }),
      });
      const data = await res.json();
      if (res.ok) {
        setMembers((prev) => [...prev, { id: data.id, name: data.name, email: data.email, role: data.role, title: data.title }]);
        setEmail("");
        setMsg({ kind: "ok", text: `${data.name} added as ${ROLE_BADGE[data.role]}.` });
      } else {
        setMsg({ kind: "error", text: data.error ?? "Failed to add member." });
      }
    } finally {
      setBusy(false);
    }
  }

  async function changeRole(id: string, newRole: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/organization/team", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: id, role: newRole }),
      });
      if (res.ok) setMembers((prev) => prev.map((m) => (m.id === id ? { ...m, role: newRole } : m)));
    } finally {
      setBusy(false);
    }
  }

  async function remove(id: string) {
    setBusy(true);
    try {
      const res = await fetch("/api/organization/team", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ membershipId: id }),
      });
      if (res.ok) setMembers((prev) => prev.filter((m) => m.id !== id));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {isOwner && (
        <div className="rounded-2xl p-5" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
          <p className="mb-3 flex items-center gap-2 text-sm font-semibold" style={{ color: "var(--ink)" }}>
            <UserPlus className="h-4 w-4" style={{ color: "var(--teal)" }} /> Add a coordinator
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") addMember(); }}
              placeholder="colleague@institution.org"
              className="flex-1 min-w-[220px] rounded-lg px-3 py-2 text-sm outline-none"
              style={inputStyle}
            />
            <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg px-3 py-2 text-sm outline-none" style={inputStyle}>
              <option value="COORDINATOR">Coordinator</option>
              <option value="VIEWER">Viewer</option>
            </select>
            <button onClick={addMember} disabled={busy || !email.trim()} className="rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" style={{ background: "var(--teal)" }}>
              Add
            </button>
          </div>
          {msg && (
            <p className="mt-2 text-xs" style={{ color: msg.kind === "error" ? "#b91c1c" : "var(--teal-deep)" }}>
              {msg.text}
            </p>
          )}
          <p className="mt-2 text-xs" style={{ color: "var(--text-muted)" }}>
            The person must have a free USCEHub account first. Email invitations for new users are coming soon.
          </p>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl" style={{ background: "var(--paper)", border: "1px solid var(--line)" }}>
        {members.map((m) => (
          <div key={m.id} className="flex items-center justify-between gap-3 p-4" style={{ borderTop: "1px solid var(--line)" }}>
            <div className="min-w-0">
              <p className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--ink)" }}>
                {m.name}
                {m.role === "OWNER" && <ShieldCheck className="h-3.5 w-3.5" style={{ color: "var(--teal)" }} />}
              </p>
              <p className="truncate text-xs" style={{ color: "var(--text-muted)" }}>{m.title ?? m.email}</p>
            </div>
            <div className="flex items-center gap-2">
              {isOwner && m.role !== "OWNER" ? (
                <>
                  <select
                    value={m.role}
                    onChange={(e) => changeRole(m.id, e.target.value)}
                    disabled={busy}
                    className="rounded-lg px-2 py-1 text-xs outline-none"
                    style={{ background: "var(--paper)", border: "1px solid var(--line)", color: "var(--ink-soft)" }}
                  >
                    <option value="COORDINATOR">Coordinator</option>
                    <option value="VIEWER">Viewer</option>
                  </select>
                  <button onClick={() => remove(m.id)} disabled={busy} aria-label="Remove" className="rounded-lg p-1.5" style={{ color: "#b91c1c" }}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <span className="rounded-full px-2.5 py-0.5 text-xs font-medium" style={{ background: "var(--teal-soft)", color: "var(--teal-deep)" }}>
                  {ROLE_BADGE[m.role] ?? m.role}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
