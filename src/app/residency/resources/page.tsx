import type { Metadata } from "next";
import { ExternalLink, CheckCircle } from "lucide-react";
import {
  TEACHING_RESOURCES,
  RESOURCE_CATEGORIES,
} from "@/lib/residency-data";

export const metadata: Metadata = {
  title: "Teaching Resources",
  description:
    "Curated teaching resources for residents — pocketbook medicine, POCUS, procedures, evidence-based medicine, ICU references, and communication tools.",
  alternates: {
    canonical: "https://uscehub.com/residency/resources",
  },
  openGraph: {
    title: "Teaching Resources — USCEHub",
    description:
      "20+ curated teaching resources for residents across 6 categories.",
    url: "https://uscehub.com/residency/resources",
  },
};

export default function ResourcesPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            Teaching Resources
          </h1>
          <p className="mt-2 text-lg text-muted max-w-3xl">
            Curated references, tools, and educational content organized by
            category. Every resource is reviewed for clinical accuracy and
            educational value.
          </p>
        </div>

        {/* Categories */}
        {RESOURCE_CATEGORIES.map((category) => {
          const resources = TEACHING_RESOURCES.filter(
            (r) => r.category === category
          );
          if (resources.length === 0) return null;

          return (
            <section key={category} className="mb-12">
              <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                <span className="inline-block h-1 w-6 rounded-full bg-accent" />
                {category}
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {resources.map((resource) => (
                  <a
                    key={resource.id}
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-xl border border-border bg-surface p-6 hover-glow group flex flex-col"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                        {resource.name}
                      </h3>
                      <ExternalLink className="h-4 w-4 shrink-0 text-muted group-hover:text-accent transition-colors mt-0.5" />
                    </div>

                    <p className="text-sm text-muted flex-1">
                      {resource.description}
                    </p>

                    <div className="mt-4 flex items-center gap-2 flex-wrap">
                      <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent">
                        {resource.category}
                      </span>
                      {resource.free ? (
                        <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-success/10 text-success">
                          <CheckCircle className="h-3 w-3" />
                          Free
                        </span>
                      ) : (
                        <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-warning/10 text-warning">
                          Paid
                        </span>
                      )}
                    </div>
                  </a>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
