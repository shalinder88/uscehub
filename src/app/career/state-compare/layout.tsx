import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "State Financial Comparison for Physicians — USCEHub",
  description: "Compare all 50 states by physician salary, state income tax, cost of living, malpractice environment, and estimated take-home pay.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
