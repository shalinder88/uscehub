"use client";

import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface AccordionItem {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
}

export function AccordionSections({
  sections,
  defaultOpenIndex = 0,
}: {
  sections: AccordionItem[];
  defaultOpenIndex?: number;
}) {
  const [openSections, setOpenSections] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (sections[defaultOpenIndex]) {
      initial.add(sections[defaultOpenIndex].id);
    }
    return initial;
  });

  const toggle = (id: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const expandAll = () => {
    setOpenSections(new Set(sections.map((s) => s.id)));
  };

  const collapseAll = () => {
    setOpenSections(new Set());
  };

  return (
    <div>
      {/* Jump-to navigation */}
      <nav className="mb-8 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Jump to Section
          </h2>
          <div className="flex gap-2">
            <button
              onClick={expandAll}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Expand All
            </button>
            <button
              onClick={collapseAll}
              className="rounded-md border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              Collapse All
            </button>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          {sections.map((section) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              onClick={(e) => {
                e.preventDefault();
                if (!openSections.has(section.id)) {
                  toggle(section.id);
                }
                // Small delay to allow DOM to expand before scrolling
                setTimeout(() => {
                  document
                    .getElementById(section.id)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 100);
              }}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100"
            >
              {section.label}
            </a>
          ))}
        </div>
      </nav>

      {/* Accordion sections */}
      <div className="space-y-4">
        {sections.map((section) => {
          const isOpen = openSections.has(section.id);
          return (
            <AccordionPanel
              key={section.id}
              id={section.id}
              label={section.label}
              icon={section.icon}
              isOpen={isOpen}
              onToggle={() => toggle(section.id)}
            >
              {section.content}
            </AccordionPanel>
          );
        })}
      </div>
    </div>
  );
}

function AccordionPanel({
  id,
  label,
  icon,
  isOpen,
  onToggle,
  children,
}: {
  id: string;
  label: string;
  icon?: ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | undefined>(undefined);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [isOpen, children]);

  return (
    <div
      id={id}
      className="scroll-mt-20 rounded-xl border border-slate-200 bg-white"
    >
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
        aria-expanded={isOpen}
      >
        <span className="flex items-center gap-2 text-lg font-bold text-slate-900">
          {icon}
          {label}
        </span>
        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className="overflow-hidden transition-[max-height] duration-300 ease-in-out"
        style={{ maxHeight: isOpen ? (height ?? 10000) : 0 }}
      >
        <div ref={contentRef} className="px-5 pb-6">
          {children}
        </div>
      </div>
    </div>
  );
}
