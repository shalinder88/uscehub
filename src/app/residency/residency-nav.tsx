"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  HeartPulse,
  Users,
} from "lucide-react";

const tabs = [
  { label: "Resources", href: "/residency/resources", icon: BookOpen },
  { label: "Fellowship", href: "/residency/fellowship", icon: GraduationCap },
  { label: "Boards", href: "/residency/boards", icon: ClipboardCheck },
  { label: "Survival", href: "/residency/survival", icon: HeartPulse },
  { label: "Community", href: "/residency/community", icon: Users },
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
