import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Search,
  FileText,
  CheckCircle,
  Building2,
  ClipboardList,
  Users,
  Star,
  Shield,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works",
  description:
    "Learn how USCEHub works for IMG applicants and institutions. Browse opportunities, apply to programs, and manage listings — all in one free platform.",
  alternates: {
    canonical: "https://uscehub.com/how-it-works",
  },
};

const applicantSteps = [
  {
    icon: Search,
    title: "Create Your Profile",
    description:
      "Sign up and build your applicant profile. Include your medical school, graduation year, USMLE scores, ECFMG status, and areas of interest. A complete profile increases your chances of being accepted.",
  },
  {
    icon: FileText,
    title: "Browse and Filter Listings",
    description:
      "Search through our comprehensive database of clinical opportunities. Filter by type (observership, externship, research), specialty, state, cost, and more. Save listings for later and compare programs side by side.",
  },
  {
    icon: CheckCircle,
    title: "Apply and Track",
    description:
      "Submit your applications directly through the platform or follow the institution's preferred application method. Track all your applications from your dashboard and receive updates on your application status.",
  },
  {
    icon: Star,
    title: "Complete and Review",
    description:
      "After completing your rotation, share your experience by leaving a verified review. Your feedback helps future applicants make informed decisions and rewards quality programs.",
  },
];

const institutionSteps = [
  {
    icon: Building2,
    title: "Register Your Institution",
    description:
      "Create an organizational profile with your institution's details, including name, type, location, and contact information. Verify your credentials to earn trust badges that increase visibility and applicant confidence.",
  },
  {
    icon: ClipboardList,
    title: "Create Detailed Listings",
    description:
      "Post comprehensive program listings that include specialty, duration, cost, eligibility requirements, and what participants can expect. Detailed listings attract more qualified applicants.",
  },
  {
    icon: Users,
    title: "Manage Applications",
    description:
      "Receive and review applications through the platform. Access applicant profiles, review their qualifications, and communicate directly through our secure messaging system.",
  },
  {
    icon: Shield,
    title: "Build Your Reputation",
    description:
      "Earn positive reviews from participants, maintain your verification status, and build a strong presence on the platform. Top-rated programs are featured prominently in search results.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="bg-white">
      <div className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-slate-900">How It Works</h1>
          <p className="mt-2 text-base text-slate-500">
            A detailed guide for applicants and institutions
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              For Applicants
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Your path to clinical experience in the United States
            </p>
          </div>

          <div className="space-y-6">
            {applicantSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex gap-5 rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/browse">
              <Button size="lg">
                Browse Opportunities
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>

        <div className="my-16 border-t border-slate-200" />

        <section>
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              For Institutions
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Reach qualified international medical graduates
            </p>
          </div>

          <div className="space-y-6">
            {institutionSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="flex gap-5 rounded-xl border border-slate-200 p-6"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-slate-600" />
                      <h3 className="text-base font-semibold text-slate-900">
                        {step.title}
                      </h3>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-slate-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <Link href="/for-institutions">
              <Button size="lg">
                Get Started
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
