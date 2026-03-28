import type { Metadata } from "next";
import { SponsorSearch } from "./sponsor-search";

export const metadata: Metadata = {
  title: "Which Hospitals Sponsor H-1B Physicians? — 1,087 Verified Employers — USCEHub",
  description:
    "Search 1,087 hospitals and health systems that sponsor H-1B visas for physicians. Real salary data from DOL public filings. Filter by specialty, state, and salary. Free — no paywall.",
  alternates: { canonical: "https://uscehub.com/career/sponsors" },
  openGraph: {
    title: "H-1B Physician Sponsor Database — USCEHub",
    description: "1,087 verified employers. Real salaries. Public DOL data. Free.",
    url: "https://uscehub.com/career/sponsors",
  },
};

export default function SponsorsPage() {
  return <SponsorSearch />;
}
