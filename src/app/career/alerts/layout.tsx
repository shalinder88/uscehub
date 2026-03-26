import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Immigration Policy Alerts for Physicians — USCEHub",
  description: "Real-time policy alerts on H-1B fees, Conrad 30 reauthorization, USCIS processing changes, and visa bulletin updates for physicians.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
