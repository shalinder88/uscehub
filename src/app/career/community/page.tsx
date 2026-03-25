import type { Metadata } from "next";
import Link from "next/link";
import {
  Users,
  MessageSquare,
  Star,
  FileText,
  Bell,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Attending Community — Discussions & Reviews",
  description:
    "Join the USCEHub attending physician community. Share experiences, review employers, get contract help, and connect with fellow international medical graduates navigating their careers.",
  alternates: {
    canonical: "https://uscehub.com/career/community",
  },
  openGraph: {
    title: "Attending Community — USCEHub",
    description:
      "Connect with fellow IMG attendings. Discussions, employer reviews, and contract help.",
    url: "https://uscehub.com/career/community",
  },
};

const sections = [
  {
    title: "Discussions",
    description:
      "Open forum for attending physicians to discuss career topics, share advice on waiver experiences, negotiate strategies, relocation tips, and more. Ask questions and learn from physicians who have been through the process.",
    icon: MessageSquare,
    color: "text-accent",
    bg: "bg-accent/10",
    features: [
      "Waiver experience threads",
      "Salary negotiation tips",
      "State-specific discussion boards",
      "Immigration timeline tracking",
    ],
  },
  {
    title: "Job Reviews",
    description:
      "Anonymous reviews of employers, hospitals, and clinics from physicians who have worked there. Read about work-life balance, compensation accuracy, management culture, and whether employers honor their immigration commitments.",
    icon: Star,
    color: "text-warning",
    bg: "bg-warning/10",
    features: [
      "Anonymous employer reviews",
      "Compensation verification",
      "Immigration support ratings",
      "Work-life balance scores",
    ],
  },
  {
    title: "Contract Help",
    description:
      "Get peer feedback on contract terms before you sign. Share contract details (anonymized) and get input from experienced physicians on red flags, negotiation points, and standard market terms.",
    icon: FileText,
    color: "text-success",
    bg: "bg-success/10",
    features: [
      "Contract review requests",
      "Red flag identification",
      "Negotiation strategies",
      "Template comparison",
    ],
  },
];

export default function CommunityPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Attending Community — USCEHub",
    description:
      "Community forum for IMG attending physicians to discuss careers, review employers, and get contract help.",
    url: "https://uscehub.com/career/community",
    provider: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium bg-accent/10 text-accent mb-4">
            <Users className="h-4 w-4" />
            Coming Soon
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Attending Physician Community
          </h1>
          <p className="text-muted max-w-2xl mx-auto">
            A dedicated space for IMG attending physicians to share experiences,
            review employers, and help each other navigate careers and
            immigration.
          </p>
        </div>

        {/* Section Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.title}
                className="rounded-xl border border-border bg-surface p-6 hover-glow"
              >
                <div className={`${section.bg} ${section.color} rounded-lg p-3 inline-flex mb-4`}>
                  <Icon className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-bold text-foreground mb-2">
                  {section.title}
                </h2>
                <p className="text-sm text-muted mb-4 leading-relaxed">
                  {section.description}
                </p>
                <ul className="space-y-2">
                  {section.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-center gap-2 text-xs text-muted"
                    >
                      <div className="rounded-full bg-accent/20 p-0.5">
                        <div className="h-1 w-1 rounded-full bg-accent" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-border bg-surface-alt p-8 sm:p-12 text-center">
          <Bell className="h-10 w-10 text-accent mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Be the First to Know
          </h2>
          <p className="text-muted max-w-lg mx-auto mb-6">
            The attending community is currently under development. Sign up to
            be notified when we launch and get early access to discussions, job
            reviews, and contract help.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-8 py-3 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Sign Up for Early Access
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
