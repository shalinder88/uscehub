import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visa Bulletin Tracker for Physicians — EB-2, EB-1 Priority Dates — USCEHub",
  description: "Monthly visa bulletin tracking for physician immigration. EB-2 India, EB-1, EB-3 priority date movement, historical trends, and wait time estimates.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
