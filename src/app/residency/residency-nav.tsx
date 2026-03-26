"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  GraduationCap,
  ClipboardCheck,
  HeartPulse,
  DollarSign,
} from "lucide-react";

const tabs = [
  { label: "Fellowship Guide", href: "/residency/fellowship/guide", icon: GraduationCap },
  { label: "Boards", href: "/residency/boards", icon: ClipboardCheck },
  { label: "Survival", href: "/residency/survival", icon: HeartPulse },
  { label: "Salary & Contracts", href: "/residency/salary", icon: DollarSign },
] as const;

export function ResidencyNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Residency section navigation"
      className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none -mb-px">
          {tabs.map(({ label, href, icon: Icon }) => {
            const isActive =
              pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`
                  inline-flex items-center gap-2 whitespace-nowrap px-4 py-3 text-sm font-medium border-b-2 transition-colors
                  ${
                    isActive
                      ? "border-accent text-accent"
                      : "border-transparent text-muted hover:text-foreground hover:border-border"
                  }
                `}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
