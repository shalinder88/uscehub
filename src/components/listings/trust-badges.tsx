import { ShieldCheck, BadgeCheck, Mail, Star } from "lucide-react";

interface TrustBadgesProps {
  adminReviewed?: boolean;
  verifiedPoster?: boolean;
  institutionalEmail?: boolean;
  npiVerified?: boolean;
}

const badges = [
  {
    key: "adminReviewed" as const,
    label: "Admin Reviewed",
    icon: ShieldCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
  },
  {
    key: "verifiedPoster" as const,
    label: "Verified Poster",
    icon: BadgeCheck,
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    key: "institutionalEmail" as const,
    label: "Institutional Email",
    icon: Mail,
    color: "text-violet-600",
    bg: "bg-violet-50",
  },
  {
    key: "npiVerified" as const,
    label: "NPI Verified",
    icon: Star,
    color: "text-amber-600",
    bg: "bg-amber-50",
  },
];

export function TrustBadges(props: TrustBadgesProps) {
  const activeBadges = badges.filter((b) => props[b.key]);

  if (activeBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {activeBadges.map((badge) => {
        const Icon = badge.icon;
        return (
          <div
            key={badge.key}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${badge.bg} ${badge.color}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {badge.label}
          </div>
        );
      })}
    </div>
  );
}
