import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Physician Salary Benchmarks 2026 — By Specialty and State — USCEHub",
  description: "Verified physician compensation data from Medscape, MGMA, and Doximity. Salary by specialty, wRVU benchmarks, geographic variation, academic vs private practice.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
