import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Scale,
  GitCompare,
  Flag,
  Users,
  DollarSign,
  MessageSquare,
  ArrowLeftRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: {
    default: "Career & Immigration — USCEHub",
    template: "%s — USCEHub",
  },
  description:
    "J-1 waiver intelligence, job search, immigration guidance, and contract comparison tools for international medical graduate physicians pursuing attending careers in the United States.",
  alternates: {
    canonical: "https://uscehub.com/career",
  },
  openGraph: {
    title: "Career & Immigration — USCEHub",
    description:
      "J-1 waiver intelligence, job search, immigration guidance, and contract tools for IMG physicians.",
    url: "https://uscehub.com/career",
  },
};

const tabs = [
  { label: "Waiver Jobs", href: "/career/jobs", icon: Briefcase },
  { label: "State Intel", href: "/career/waiver", icon: MapPin },
  { label: "Lawyers", href: "/career/lawyers", icon: Scale },
  { label: "Offer Compare", href: "/career/offers", icon: GitCompare },
  { label: "Compare States", href: "/career/compare-states", icon: ArrowLeftRight },
  { label: "Citizenship", href: "/career/citizenship", icon: Flag },
  { label: "Salary", href: "/career/salary", icon: DollarSign },
  { label: "Interview Prep", href: "/career/interview", icon: MessageSquare },
  { label: "Community", href: "/career/community", icon: Users },
];

export default function CareerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <nav className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-3 -mb-px">
            <Link
              href="/career"
              className="shrink-0 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-foreground hover:bg-surface-alt"
            >
              Overview
            </Link>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className="shrink-0 flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium text-muted transition-colors hover:text-accent hover:bg-accent/5"
                >
                  <Icon className="h-3.5 w-3.5" />
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
      {children}
    </section>
  );
}
