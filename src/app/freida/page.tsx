import type { Metadata } from "next";
import { FreidaContent } from "./freida-content";

export const metadata: Metadata = {
  title: "FREIDA & Residency Programs — USCEHub",
  description:
    "Comprehensive guide to FREIDA, residency program data, IMG-friendly programs, match statistics, and community insights from Reddit and USMLE forums.",
};

export default function FreidaPage() {
  return <FreidaContent />;
}
