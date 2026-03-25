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
    color: "text-emerald-400",
    bg: "bg-emerald-950/30",
  },
  {
    key: "verifiedPoster" as const,
    label: "Verified Poster",
    icon: BadgeCheck,
    color: "text-blue-400",
    bg: "bg-blue-950/30",
  },
  {
    key: "institutionalEmail" as const,
    label: "Institutional Email",
    icon: Mail,
    color: "text-violet-400",
    bg: "bg-violet-950/30",
  },
  {
    key: "npiVerified" as const,
    label: "NPI Verified",
    icon: Star,
    color: "text-amber-400",
    bg: "bg-amber-950/30",
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
