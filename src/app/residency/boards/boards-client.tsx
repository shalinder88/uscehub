"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  Clock,
  TrendingUp,
  FileText,
} from "lucide-react";
import { BOARD_EXAMS } from "@/lib/residency-data";

function BoardSection({
  exam,
  isOpen,
  onToggle,
}: {
  exam: (typeof BOARD_EXAMS)[number];
  isOpen: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface hover-glow">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between p-6 text-left"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 h-12 w-12 shrink-0">
            <span className="text-sm font-bold text-accent">
              {exam.abbreviation}
            </span>
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">
              {exam.abbreviation} — {exam.specialty}
            </h2>
            <p className="text-sm text-muted">{exam.name}</p>
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="px-6 pb-6 border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            {/* Exam Format */}
            <div className="flex gap-3">
              <FileText className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Exam Format
                </h3>
                <p className="text-sm text-muted">{exam.format}</p>
              </div>
            </div>

            {/* Study Timeline */}
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Study Timeline
                </h3>
                <p className="text-sm text-muted">{exam.timeline}</p>
              </div>
            </div>

            {/* Pass Rate */}
            <div className="flex gap-3">
              <TrendingUp className="h-5 w-5 text-success shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Pass Rate
                </h3>
                <p className="text-sm text-muted">{exam.passRate}</p>
              </div>
            </div>

            {/* Recommended Resources */}
            <div className="flex gap-3">
              <BookOpen className="h-5 w-5 text-cyan shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-1">
                  Recommended Resources
                </h3>
                <ul className="space-y-1">
                  {exam.resources.map((r) => (
                    <li
                      key={r}
                      className="text-sm text-muted flex items-start gap-2"
                    >
                      <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {r}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function BoardsAccordion() {
  const [openId, setOpenId] = useState<string>(BOARD_EXAMS[0].id);

  return (
    <div className="space-y-3">
      {BOARD_EXAMS.map((exam) => (
        <BoardSection
          key={exam.id}
          exam={exam}
          isOpen={openId === exam.id}
          onToggle={() => setOpenId(openId === exam.id ? "" : exam.id)}
        />
      ))}
    </div>
  );
}
