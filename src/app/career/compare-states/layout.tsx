import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Compare States for Physician Relocation — Side by Side — USCEHub",
  description: "Compare 2-3 states side by side for physician relocation. Salary, tax, cost of living, malpractice, Conrad 30 availability, and licensing requirements.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
