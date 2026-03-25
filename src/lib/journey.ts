import { GraduationCap, Stethoscope, Briefcase } from "lucide-react";

export type JourneyPhase = "medical_graduate" | "resident" | "attending";

export const JOURNEY_STORAGE_KEY = "uscehub-journey";

export interface PhaseConfig {
  id: JourneyPhase;
  label: string;
  shortLabel: string;
  description: string;
  icon: typeof GraduationCap;
  accentColor: string;
  nav: NavItem[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: { label: string; href: string; description?: string }[];
}

export const PHASE_CONFIGS: Record<JourneyPhase, PhaseConfig> = {
  medical_graduate: {
    id: "medical_graduate",
    label: "Medical Graduate",
    shortLabel: "USCE",
    description: "USCE, observerships, externships, match prep",
    icon: GraduationCap,
    accentColor: "#818cf8",
    nav: [
      { label: "Browse", href: "/browse" },
      {
        label: "Tools",
        href: "#",
        children: [
          { label: "Program Finder", href: "/recommend", description: "Find programs that match your profile" },
          { label: "Cost Calculator", href: "/tools/cost-calculator", description: "Estimate total USCE costs" },
          { label: "Compare Programs", href: "/compare", description: "Side-by-side comparison" },
          { label: "Resources & Guides", href: "/resources", description: "Recommended tools for IMGs" },
        ],
      },
      { label: "IMG Resources", href: "/img-resources" },
      { label: "Community", href: "/community" },
      { label: "About", href: "/about" },
    ],
  },
  resident: {
    id: "resident",
    label: "Resident",
    shortLabel: "Residency",
    description: "Teaching, fellowship, boards, survival guides",
    icon: Stethoscope,
    accentColor: "#22d3ee",
    nav: [
      { label: "Resources", href: "/residency/resources" },
      { label: "Fellowship", href: "/residency/fellowship" },
      { label: "Boards", href: "/residency/boards" },
      { label: "Survival Guide", href: "/residency/survival" },
      { label: "Community", href: "/residency/community" },
      { label: "About", href: "/about" },
    ],
  },
  attending: {
    id: "attending",
    label: "Attending / Job Seeker",
    shortLabel: "Career",
    description: "J-1 waivers, jobs, immigration, career tools",
    icon: Briefcase,
    accentColor: "#4ade80",
    nav: [
      { label: "Waiver Jobs", href: "/career/jobs" },
      { label: "State Intel", href: "/career/waiver" },
      { label: "Lawyers", href: "/career/lawyers" },
      { label: "Offer Compare", href: "/career/offers" },
      { label: "Community", href: "/career/community" },
      { label: "About", href: "/about" },
    ],
  },
};

export const PHASE_ORDER: JourneyPhase[] = ["medical_graduate", "resident", "attending"];
