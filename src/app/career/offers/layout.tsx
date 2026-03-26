import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physician Offer Comparison Tool — Compare Up to 4 Job Offers — USCEHub",
  description: "Side-by-side comparison of physician job offers. Compare salary, RVUs, sign-on bonus, benefits, visa support, and identify contract red flags.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
