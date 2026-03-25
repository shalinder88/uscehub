import type { Metadata } from "next";
import { ResidencyNav } from "./residency-nav";

export const metadata: Metadata = {
  title: "Residency — USCEHub",
  description:
    "Residency resources for all residents — teaching materials, fellowship intelligence, board exam prep, survival guides, and community. Built by residents, for residents.",
  alternates: {
    canonical: "https://uscehub.com/residency",
  },
  openGraph: {
    title: "Residency — USCEHub",
    description:
      "Teaching materials, fellowship intelligence, board prep, and community — for ALL residents.",
    url: "https://uscehub.com/residency",
  },
};

export default function ResidencyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="min-h-screen bg-background">
      <ResidencyNav />
      {children}
    </section>
  );
}
