import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conrad 30 Slot Tracker — Real-Time Waiver Availability — USCEHub",
  description: "Track Conrad 30 J-1 waiver slot availability across all 50 states. See which states have filled, remaining slots, and application deadlines.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
