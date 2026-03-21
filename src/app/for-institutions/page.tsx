import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Building2,
  Users,
  Star,
  ShieldCheck,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Institutions — USCEHub",
  description: "List your clinical observership, externship, or research programs on the largest IMG opportunities database.",
};

const benefits = [
  {
    icon: Users,
    title: "Reach Qualified Candidates",
    description:
      "Access a targeted pool of qualified international medical graduates actively seeking clinical opportunities in the United States.",
  },
  {
    icon: ShieldCheck,
    title: "Verified Listings",
    description:
      "Earn trust badges through our verification process, including NPI verification and institutional email confirmation.",
  },
  {
    icon: Star,
    title: "Build Reputation",
    description:
      "Collect verified reviews from past participants to build your program's reputation and attract top talent.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description:
      "Track views, applications, and engagement metrics for your listings through a comprehensive poster dashboard.",
  },
  {
    icon: Globe,
    title: "Global Visibility",
    description:
      "Your program is visible to IMGs worldwide who are searching for U.S. clinical experience opportunities.",
  },
  {
    icon: Building2,
    title: "Institutional Profile",
    description:
      "Create a detailed institutional profile that showcases your organization across all your listings.",
  },
];

const included = [
  "Unlimited listing creation",
  "Application management tools",
  "Institutional profile page",
  "Trust badge verification",
  "Analytics dashboard",
  "Priority support",
  "Featured listing options",
  "Community review management",
];

export default function ForInstitutionsPage() {
  return (
    <div className="bg-white">
      <div className="bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              List Your Programs on USCEHub
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Join the largest structured database of IMG clinical opportunities.
              Reach thousands of qualified international medical graduates
              looking for observerships, externships, and research positions.
            </p>
            <div className="mt-8 flex items-center justify-center gap-3">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-white text-slate-900 hover:bg-slate-100"
                >
                  Get Started Free
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/how-it-works">
                <Button
                  variant="outline"
                  size="lg"
                  className="border-slate-600 bg-transparent text-white hover:bg-slate-700 hover:text-white"
                >
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Why List on USCEHub?
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Everything you need to find the right candidates
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-xl border border-slate-200 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-900">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  {benefit.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <div className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              What&apos;s Included
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Everything you need, completely free for institutions
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register">
              <Button size="lg">
                Create Your Account
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
