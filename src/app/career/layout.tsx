import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Globe,
  Briefcase,
  FileText,
  Scale,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Visa & Jobs — Physician Immigration Intelligence — USCEHub",
    template: "%s — USCEHub",
  },
  description:
    "J-1 waiver intelligence, job search, immigration guidance, and contract comparison tools for international medical graduate physicians pursuing attending careers in the United States.",
  alternates: {
    canonical: "https://uscehub.com/career",
  },
  openGraph: {
    title: "Visa & Jobs — Physician Immigration Intelligence — USCEHub",
    description:
      "J-1 waiver intelligence, job search, immigration guidance, and contract tools for IMG physicians.",
    url: "https://uscehub.com/career",
  },
  robots: {
    index: false,
    follow: false,
  },
};

const sections = [
  { label: "J-1 Waiver", href: "/career/waiver", icon: MapPin },
  { label: "Visa & Immigration", href: "/career/visa", icon: Globe },
  { label: "Jobs", href: "/career/jobs", icon: Briefcase },
  { label: "Offers & Practice", href: "/career/practice", icon: FileText },
];

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav
        className="sticky top-16 z-30 border-b backdrop-blur-md"
        style={{ background: "var(--bg)", borderColor: "var(--line)" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 -mb-px">
            <Link
              href="/career"
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-alt"
            >
              Overview
            </Link>
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-accent hover:bg-accent/5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {section.label}
                </Link>
              );
            })}
            <span
              className="shrink-0 mx-1 h-5 w-px bg-border"
              aria-hidden="true"
            />
            <Link
              href="/career/attorneys"
              className="shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted/70 transition-colors hover:text-accent hover:bg-accent/5"
            >
              <Scale className="h-3.5 w-3.5" />
              Immigration Attorneys
            </Link>
            <Link
              href="/career/employers"
              className="shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted/70 transition-colors hover:text-accent hover:bg-accent/5"
            >
              <Building2 className="h-3.5 w-3.5" />
              For Employers
            </Link>
          </div>
        </div>
      </nav>
      {children}
    </section>
  );
}
