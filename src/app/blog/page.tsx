import type { Metadata } from "next";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/blog-data";
import { Clock, ArrowRight, Tag } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog — USCEHub",
  description:
    "Guides, analysis, and verified data for International Medical Graduates — USCE strategies, residency application tips, J-1 waiver intelligence, and career advice.",
  alternates: {
    canonical: "https://uscehub.com/blog",
  },
  openGraph: {
    title: "Blog — USCEHub",
    description:
      "Guides and verified data for IMGs — USCE, residency, J-1 waivers, and career intelligence.",
    url: "https://uscehub.com/blog",
  },
};

const categoryLabels: Record<string, { label: string; color: string }> = {
  usce: { label: "USCE", color: "bg-blue-500/10 text-blue-400" },
  residency: { label: "Residency", color: "bg-purple-500/10 text-purple-400" },
  career: { label: "Career", color: "bg-green-500/10 text-green-400" },
  immigration: { label: "Immigration", color: "bg-orange-500/10 text-orange-400" },
  guides: { label: "Guide", color: "bg-cyan-500/10 text-cyan-400" },
};

export default function BlogPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "USCEHub Blog",
    description:
      "Guides and verified data for International Medical Graduates pursuing US clinical experience, residency, and attending careers.",
    url: "https://uscehub.com/blog",
    publisher: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
            Blog
          </h1>
          <p className="mt-3 text-lg text-slate-600 dark:text-slate-400 max-w-2xl">
            Verified guides, data analysis, and actionable advice for
            International Medical Graduates at every stage of the journey.
          </p>
        </div>

        {/* Posts */}
        <div className="space-y-6">
          {BLOG_POSTS.map((post) => {
            const cat = categoryLabels[post.category] || {
              label: post.category,
              color: "bg-slate-500/10 text-slate-400",
            };
            return (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="block rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 p-6 sm:p-8 transition-all hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-sm"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cat.color}`}
                  >
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
                    <Clock className="h-3 w-3" />
                    {post.readTime}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-600">
                    {post.publishedAt}
                  </span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                  {post.title}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                  {post.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {post.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400"
                      >
                        <Tag className="h-2.5 w-2.5" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400">
                    Read <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
