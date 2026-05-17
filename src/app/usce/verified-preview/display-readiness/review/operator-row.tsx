"use client";

import { useState, useTransition } from "react";
import {
  DECISION_TYPES,
  DECISION_STATUSES,
  type DecisionType,
  type DecisionStatus,
  type OperatorDecision,
} from "@/lib/p102-operator-review-types";
import { saveOperatorDecisionAction, clearOperatorDecisionAction } from "./_actions";

interface OperatorRowProps {
  programName: string;
  institution: string;
  state: string;
  currentBadge: string;
  currentClassification: string;
  finalUrl: string;
  existingDecision: OperatorDecision | null;
}

const TYPE_LABELS: Record<DecisionType, string> = {
  UNDECIDED: "— pick —",
  OBSERVERSHIP: "Observership",
  VISITING_STUDENT_ELECTIVE: "Visiting student elective",
  VISITING_STUDENT_CLERKSHIP: "Visiting student clerkship",
  SUB_INTERNSHIP: "Sub-internship",
  EXTERNSHIP: "Externship",
  INTERNATIONAL_VISITING_STUDENT: "International visiting student",
  RESEARCH_POSTDOC: "Research / postdoc",
  MULTI_SITE: "Multi-site rotation",
  NOT_USCE: "Not USCE",
  OTHER: "Other",
};

const STATUS_LABELS: Record<DecisionStatus, string> = {
  UNDECIDED: "— pick —",
  VERIFIED_LIVE: "Verified live",
  LINK_DEAD: "Link dead",
  NOT_USCE: "Not USCE",
  HIDE: "Hide",
  KEEP_VERIFY: "Keep / verify",
  DEFER: "Defer",
};

const STATUS_BG: Record<DecisionStatus, string> = {
  UNDECIDED: "",
  VERIFIED_LIVE: "bg-emerald-50 dark:bg-emerald-900/30",
  LINK_DEAD: "bg-red-50 dark:bg-red-900/30",
  NOT_USCE: "bg-amber-50 dark:bg-amber-900/30",
  HIDE: "bg-stone-100 dark:bg-slate-800",
  KEEP_VERIFY: "bg-sky-50 dark:bg-sky-900/30",
  DEFER: "bg-yellow-50 dark:bg-yellow-900/30",
};

const BADGE_STYLE: Record<string, string> = {
  DIRECT: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100 border-emerald-300",
  REORIENTED: "bg-sky-100 text-sky-900 dark:bg-sky-900 dark:text-sky-100 border-sky-300",
  PROTECTED: "bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 border-amber-300",
  RESEARCH: "bg-violet-100 text-violet-900 dark:bg-violet-900 dark:text-violet-100 border-violet-300",
  HOLD: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100 border-yellow-300",
  HIDDEN: "bg-stone-200 text-stone-700 dark:bg-slate-700 dark:text-slate-200 border-stone-300",
};

export function OperatorRow({
  programName,
  institution,
  state,
  currentBadge,
  currentClassification,
  finalUrl,
  existingDecision,
}: OperatorRowProps) {
  const [decisionType, setDecisionType] = useState<DecisionType>(
    (existingDecision?.decisionType ?? "UNDECIDED") as DecisionType
  );
  const [decisionStatus, setDecisionStatus] = useState<DecisionStatus>(
    (existingDecision?.decisionStatus ?? "UNDECIDED") as DecisionStatus
  );
  const [note, setNote] = useState<string>(existingDecision?.note ?? "");
  const [saveMessage, setSaveMessage] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const lastDecidedAt = existingDecision?.decidedAt
    ? new Date(existingDecision.decidedAt).toLocaleString()
    : null;

  function handleSave() {
    setSaveMessage("");
    const fd = new FormData();
    fd.set("programName", programName);
    fd.set("decisionType", decisionType);
    fd.set("decisionStatus", decisionStatus);
    fd.set("note", note);
    startTransition(async () => {
      const res = await saveOperatorDecisionAction(null, fd);
      setSaveMessage(res.ok ? "saved" : `error: ${res.message}`);
    });
  }

  function handleClear() {
    setSaveMessage("");
    const fd = new FormData();
    fd.set("programName", programName);
    startTransition(async () => {
      await clearOperatorDecisionAction(fd);
      setDecisionType("UNDECIDED");
      setDecisionStatus("UNDECIDED");
      setNote("");
      setSaveMessage("cleared");
    });
  }

  return (
    <tr className={`align-top border-b border-stone-100 dark:border-slate-800 ${STATUS_BG[decisionStatus]}`}>
      <td className="py-3 pr-3 align-top text-sm">
        <div className="font-medium text-stone-900 dark:text-slate-100">{programName}</div>
        {institution !== programName && (
          <div className="text-xs text-stone-500 dark:text-slate-400">{institution}</div>
        )}
        <div className="mt-1 text-xs text-stone-500 dark:text-slate-400">{state}</div>
        <div className="mt-1 flex flex-wrap items-center gap-1">
          <span
            className={`inline-flex items-center rounded border px-1.5 py-0.5 text-xs font-semibold ${
              BADGE_STYLE[currentBadge] ?? ""
            }`}
          >
            {currentBadge}
          </span>
          <span className="text-xs text-stone-400 dark:text-slate-500">{currentClassification}</span>
        </div>
      </td>
      <td className="py-3 pr-3 align-top text-sm">
        <a
          href={finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="break-all text-sky-700 dark:text-sky-300 underline decoration-stone-300 dark:decoration-slate-600 hover:decoration-stone-500"
        >
          {finalUrl}
        </a>
      </td>
      <td className="py-3 pr-3 align-top text-sm">
        <select
          value={decisionType}
          onChange={(e) => setDecisionType(e.target.value as DecisionType)}
          className="w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-slate-100 px-2 py-1 text-sm"
        >
          {DECISION_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABELS[t]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-3 align-top text-sm">
        <select
          value={decisionStatus}
          onChange={(e) => setDecisionStatus(e.target.value as DecisionStatus)}
          className="w-full rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-slate-100 px-2 py-1 text-sm"
        >
          {DECISION_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </td>
      <td className="py-3 pr-3 align-top text-sm">
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Note (optional)"
          className="w-full min-w-[180px] rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-slate-100 px-2 py-1 text-sm"
        />
      </td>
      <td className="py-3 pr-3 align-top text-sm">
        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1 text-xs font-semibold hover:bg-slate-700 dark:hover:bg-white disabled:opacity-50"
          >
            {isPending ? "…" : "Save"}
          </button>
          {existingDecision && (
            <button
              type="button"
              onClick={handleClear}
              disabled={isPending}
              className="rounded border border-stone-300 dark:border-slate-600 text-stone-700 dark:text-slate-300 px-3 py-1 text-xs hover:bg-stone-100 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Clear
            </button>
          )}
          {saveMessage && (
            <span className="text-xs text-stone-500 dark:text-slate-400">{saveMessage}</span>
          )}
          {lastDecidedAt && !saveMessage && (
            <span className="text-xs text-stone-400 dark:text-slate-500">
              saved {lastDecidedAt}
            </span>
          )}
        </div>
      </td>
    </tr>
  );
}
