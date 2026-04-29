import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogPost, getAllBlogSlugs } from "@/lib/blog-data";
import { ArrowLeft, Clock, Tag } from "lucide-react";

export async function generateStaticParams() {
  return getAllBlogSlugs();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Not Found" };

  return {
    title: `${post.title} — USCEHub`,
    description: post.description,
    alternates: {
      canonical: `https://uscehub.com/blog/${slug}`,
    },
    openGraph: {
      title: post.title,
      description: post.description,
      url: `https://uscehub.com/blog/${slug}`,
      type: "article",
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
    publisher: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
    url: `https://uscehub.com/blog/${slug}`,
  };

  // Simple markdown-ish rendering for content
  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactElement[] = [];
    let inList = false;
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];
    let key = 0;

    const flushList = () => {
      if (listItems.length > 0) {
        elements.push(
          <ul key={key++} className="list-disc pl-6 space-y-1.5 text-slate-700 dark:text-slate-300 text-[15px] leading-relaxed">
            {listItems.map((item, i) => (
              <li key={i} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            ))}
          </ul>
        );
        listItems = [];
        inList = false;
      }
    };

    const flushTable = () => {
      if (tableRows.length > 1) {
        elements.push(
          <div key={key++} className="overflow-x-auto my-4">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="border-b border-slate-300 dark:border-slate-600">
                  {tableRows[0].map((cell, i) => (
                    <th key={i} className="px-3 py-2 font-semibold text-slate-900 dark:text-white">
                      {cell.trim()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.slice(2).map((row, i) => (
                  <tr key={i} className="border-b border-slate-200 dark:border-slate-700">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2 text-slate-600 dark:text-slate-400">
                        {cell.trim()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    const formatInline = (text: string): string => {
      return text
        .replace(/\*\*(.+?)\*\*/g, '<strong class="text-slate-900 dark:text-white">$1</strong>')
        .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" class="text-blue-600 dark:text-blue-400 hover:underline">$1</a>')
        .replace(/`(.+?)`/g, '<code class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-xs">$1</code>');
    };

    for (const line of lines) {
      const trimmed = line.trim();

      // Table row
      if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
        if (!inTable) {
          flushList();
          inTable = true;
        }
        const cells = trimmed.split("|").filter(Boolean);
        // Skip separator rows
        if (cells.every((c) => c.trim().match(/^[-:]+$/))) {
          tableRows.push(cells);
        } else {
          tableRows.push(cells);
        }
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Headings
      if (trimmed.startsWith("## ")) {
        flushList();
        elements.push(
          <h2 key={key++} className="text-2xl font-bold text-slate-900 dark:text-white mt-10 mb-4">
            {trimmed.slice(3)}
          </h2>
        );
      } else if (trimmed.startsWith("### ")) {
        flushList();
        elements.push(
          <h3 key={key++} className="text-lg font-semibold text-slate-900 dark:text-white mt-6 mb-2">
            {trimmed.slice(4)}
          </h3>
        );
      }
      // List items
      else if (trimmed.startsWith("- ") || trimmed.startsWith("→ ")) {
        inList = true;
        listItems.push(trimmed.slice(2));
      }
      // Checkbox items
      else if (trimmed.startsWith("- [ ] ")) {
        inList = true;
        listItems.push("☐ " + trimmed.slice(6));
      }
      // Empty line
      else if (trimmed === "") {
        flushList();
      }
      // Paragraph
      else if (trimmed.length > 0) {
        flushList();
        elements.push(
          <p
            key={key++}
            className="text-[15px] leading-relaxed text-slate-700 dark:text-slate-300 mb-4"
            dangerouslySetInnerHTML={{ __html: formatInline(trimmed) }}
          />
        );
      }
    }

    flushList();
    flushTable();

    return elements;
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Back link */}
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-500/10 text-blue-400">
              {post.category.charAt(0).toUpperCase() + post.category.slice(1)}
            </span>
            <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-500">
              <Clock className="h-3 w-3" />
              {post.readTime}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            {post.description}
          </p>

          <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 dark:text-slate-500">
            <span>By {post.author}</span>
            <span>Published {post.publishedAt}</span>
            {post.updatedAt !== post.publishedAt && (
              <span>Updated {post.updatedAt}</span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-1.5">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 text-[10px] text-slate-500 dark:text-slate-400"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="prose-custom">{renderContent(post.content)}</div>

        {/* Footer CTA */}
        <div className="mt-16 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 text-center">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            Find Your Clinical Experience
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Browse 156+ observership, externship, and research programs with
            an official source on file across 37 states.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Browse Programs
          </Link>
        </div>
      </article>
    </>
  );
}
