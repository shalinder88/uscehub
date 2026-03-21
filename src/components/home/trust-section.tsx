import { ShieldCheck, BadgeCheck, Star, Users } from "lucide-react";

const signals = [
  {
    icon: BadgeCheck,
    title: "NPI-Verified Posters",
    description: "Institutions verify their NPI credentials",
  },
  {
    icon: ShieldCheck,
    title: "Admin-Reviewed",
    description: "Every listing is reviewed by our team",
  },
  {
    icon: Star,
    title: "Community Reviews",
    description: "Real feedback from past participants",
  },
  {
    icon: Users,
    title: "Moderated Platform",
    description: "Active moderation for quality assurance",
  },
];

export function TrustSection() {
  return (
    <section className="border-y border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
          {signals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div key={signal.title} className="text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900">
                  {signal.title}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  {signal.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
