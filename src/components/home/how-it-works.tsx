import { Search, FileText, CheckCircle, Building2, ClipboardList, Users } from "lucide-react";

const applicantSteps = [
  {
    icon: Search,
    title: "Search & Filter",
    description:
      "Browse hundreds of verified observership, externship, and research listings across the United States. Filter by specialty, state, cost, and more.",
  },
  {
    icon: FileText,
    title: "Apply Directly",
    description:
      "Submit your application through the platform or via the institution's preferred method. Track your applications from your dashboard.",
  },
  {
    icon: CheckCircle,
    title: "Start Your Rotation",
    description:
      "Once accepted, begin your clinical experience. After completing it, share your review to help future applicants.",
  },
];

const institutionSteps = [
  {
    icon: Building2,
    title: "Create Your Profile",
    description:
      "Register your hospital, clinic, or research center. Verify your institutional credentials for maximum visibility.",
  },
  {
    icon: ClipboardList,
    title: "Post Listings",
    description:
      "Create detailed listings for your programs. Specify eligibility, costs, duration, and what applicants can expect.",
  },
  {
    icon: Users,
    title: "Review Applicants",
    description:
      "Receive applications directly through the platform. Review candidate profiles and manage your selection process.",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="text-2xl font-bold text-slate-900">How It Works</h2>
          <p className="mt-2 text-sm text-slate-500">
            Simple steps for applicants and institutions
          </p>
        </div>

        <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
          <div>
            <h3 className="mb-6 text-center text-lg font-semibold text-slate-800">
              For Applicants
            </h3>
            <div className="space-y-6">
              {applicantSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">
                          {step.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="mb-6 text-center text-lg font-semibold text-slate-800">
              For Institutions
            </h3>
            <div className="space-y-6">
              {institutionSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.title} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-slate-600" />
                        <h4 className="font-semibold text-slate-900">
                          {step.title}
                        </h4>
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
