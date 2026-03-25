import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { US_STATES, SPECIALTIES } from "@/lib/utils";
import { getAllWaiverStateSlugs } from "@/lib/waiver-data";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://uscehub.com";
  const now = new Date();

  // ============================================
  // Phase 1: USCE / Medical Graduate
  // ============================================
  const uscePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/browse`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/observerships`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/recommend`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/tools/cost-calculator`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/img-resources`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/community`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/community/suggest-program`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/for-institutions`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // State landing pages (51 — all 50 states + DC)
  const statePages: MetadataRoute.Sitemap = Object.values(US_STATES).map((name) => ({
    url: `${baseUrl}/observerships/${name.toLowerCase().replace(/\s+/g, "-")}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Specialty landing pages
  const specialtyPages: MetadataRoute.Sitemap = SPECIALTIES.map((s) => ({
    url: `${baseUrl}/observerships/specialty/${s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Dynamic listing pages
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    select: { id: true, updatedAt: true },
  });

  const listingPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/listing/${listing.id}`,
    lastModified: listing.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ============================================
  // Phase 2: Residency
  // ============================================
  const residencyPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/residency`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/residency/resources`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/residency/fellowship`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/residency/boards`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/residency/survival`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/residency/community`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // ============================================
  // Phase 3: Career / Attending
  // ============================================
  const careerPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/career`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/career/waiver`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/career/jobs`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/career/lawyers`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/career/offers`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/career/citizenship`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/career/community`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  // Waiver state pages (50 states)
  const waiverStateSlugs = getAllWaiverStateSlugs();
  const waiverStatePages: MetadataRoute.Sitemap = waiverStateSlugs.map(({ state: slug }) => ({
    url: `${baseUrl}/career/waiver/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // ============================================
  // Common pages
  // ============================================
  const commonPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/how-it-works`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/disclaimer`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
  ];

  return [
    ...uscePages,
    ...statePages,
    ...specialtyPages,
    ...listingPages,
    ...residencyPages,
    ...careerPages,
    ...waiverStatePages,
    ...commonPages,
  ];
}
