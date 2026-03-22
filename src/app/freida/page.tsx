import type { Metadata } from "next";
import { FreidaContent } from "./freida-content";

export const metadata: Metadata = {
  title: "FREIDA & Residency Programs",
  description:
    "Comprehensive guide to FREIDA, residency program data, IMG-friendly programs, match statistics, and community insights for International Medical Graduates.",
  alternates: {
    canonical: "https://uscehub.com/freida",
  },
};

export default function FreidaPage() {
  return <FreidaContent />;
}
