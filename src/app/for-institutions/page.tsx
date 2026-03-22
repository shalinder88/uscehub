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
  Stethoscope,
  ClipboardList,
  CalendarCheck,
  UserCheck,
  AlertTriangle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "For Institutions & Physicians — USCEHub",
  description:
    "List your clinical observership, externship, or research programs — or accept observers in your private practice. Join the largest IMG opportunities database.",
};

const institutionBenefits = [
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

const institutionIncluded = [
  "Unlimited listing creation",
  "Application management tools",
  "Institutional profile page",
  "Trust badge verification",
  "Analytics dashboard",
  "Priority support",
  "Featured listing options",
  "Community review management",
];

const physicianBenefits = [
  {
    icon: Stethoscope,
    title: "Set Your Own Terms — Free or Fee-Based",
    description:
      "You decide whether to charge a fee or offer free observership slots. There are no platform fees for listing.",
  },
  {
    icon: CalendarCheck,
    title: "Choose Your Own Schedule",
    description:
      "Accept observers when it works for you. Set your own availability, duration, and capacity.",
  },
  {
    icon: UserCheck,
    title: "Help IMGs Gain US Clinical Experience",
    description:
      "International medical graduates need US clinical exposure to be competitive for residency. Your practice can make a real difference.",
  },
  {
    icon: Globe,
    title: "No Visa Sponsorship Required",
    description:
      "Observers typically come on B1/B2 visitor visas. You do not need to sponsor any visa or handle immigration paperwork.",
  },
];

const physicianSteps = [
  { step: "1", title: "Register", description: "Create your free account on USCEHub as a poster." },
  { step: "2", title: "Create Listing", description: "Add your practice or clinic as an observership opportunity." },
  { step: "3", title: "Set Terms", description: "Define fee or free, duration, specialty, and any requirements." },
  { step: "4", title: "Review Applicants", description: "Receive and review applications from qualified IMG candidates." },
  { step: "5", title: "Accept Observers", description: "Choose observers that fit your practice and schedule." },
];

const listingTypes = [
  "Clinical Observership",
  "Clinical Externship / Hands-On",
  "Research Position",
  "Private Practice / Clinic Observership",
  "Preceptorship",
  "Elective Rotation",
];

export default function ForInstitutionsPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-3xl font-bold text-white sm:text-4xl">
              For Institutions &amp; Physicians
            </h1>
            <p className="mt-4 text-base leading-relaxed text-slate-300">
              Whether you run a hospital program or a private practice, list your
              clinical opportunities on USCEHub. Reach thousands of qualified
              international medical graduates looking for observerships,
              externships, and research positions.
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

      {/* ============================================================ */}
      {/* Section A: For Hospitals & Institutions                       */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            For Hospitals &amp; Institutions
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            List your observership, externship, or research programs — completely free
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {institutionBenefits.map((benefit) => {
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

      {/* Institution included */}
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
            {institutionIncluded.map((item) => (
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

      {/* ============================================================ */}
      {/* Section B: For Physicians & Clinics                           */}
      {/* ============================================================ */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600">
            <Stethoscope className="h-6 w-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            For Physicians &amp; Clinics
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Accept observers in your private practice or clinic
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {physicianBenefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-xl border border-slate-200 p-6"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-700" />
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

        {/* How It Works */}
        <div className="mt-16">
          <h3 className="text-center text-xl font-bold text-slate-900">
            How It Works
          </h3>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {physicianSteps.map((s) => (
              <div key={s.step} className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                  {s.step}
                </div>
                <h4 className="mt-3 text-sm font-semibold text-slate-900">
                  {s.title}
                </h4>
                <p className="mt-1 text-xs leading-relaxed text-slate-500">
                  {s.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* You set the rules */}
        <div className="mt-12 rounded-xl border border-slate-200 bg-slate-50 p-6 text-center">
          <ClipboardList className="mx-auto h-6 w-6 text-slate-700" />
          <h3 className="mt-3 text-base font-semibold text-slate-900">
            You Set the Rules
          </h3>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-relaxed text-slate-600">
            Fee or free. Duration. Specialty. Insurance requirements. You decide
            every detail of how your observership program runs.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Important Disclaimer
              </h4>
              <p className="mt-1 text-xs leading-relaxed text-amber-800">
                Physicians listing on USCEHub are independently responsible for
                compliance with institutional policies, state regulations, and
                malpractice coverage. USCEHub does not provide visa sponsorship,
                insurance, or credentialing services. Observers on B1/B2 visas
                may observe only — no patient contact.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* Listing Types                                                 */}
      {/* ============================================================ */}
      <div className="border-y border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900">
              Listing Types
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Choose the type that fits your program or practice
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {listingTypes.map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-600" />
                <span className="text-sm text-slate-700">{item}</span>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/register">
              <Button size="lg">
                Start Listing Today
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
