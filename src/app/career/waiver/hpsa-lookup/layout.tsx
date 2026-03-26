import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "HPSA Score Lookup Tool — Check Shortage Area Eligibility — USCEHub",
  description: "Look up Health Professional Shortage Area (HPSA) scores for any location. Verify J-1 waiver eligibility and NHSC loan repayment qualification.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
