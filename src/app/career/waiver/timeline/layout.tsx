import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "J-1 Waiver Timeline Calculator — USCEHub",
  description: "Calculate your personal J-1 waiver timeline. Enter your dates to see when to apply, expected processing times, and H-1B transition deadlines.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
