"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Scale,
  MapPin,
  Phone,
  Star,
  Filter,
  Search,
  Shield,
  CheckCircle2,
} from "lucide-react";

interface Lawyer {
  id: number;
  name: string;
  firm: string;
  city: string;
  state: string;
  specialties: string[];
  freeConsultation: boolean;
  featured: boolean;
  phone: string;
  website: string;
}

const SAMPLE_LAWYERS: Lawyer[] = [
  {
    id: 1,
    name: "Dr. Rajesh Khanna, Esq.",
    firm: "Khanna Immigration Law",
    city: "Houston",
    state: "TX",
    specialties: ["J-1 Waiver", "H-1B", "EB-2 NIW", "Green Card"],
    freeConsultation: true,
    featured: true,
    phone: "(555) 100-0001",
    website: "https://example.com",
  },
  {
    id: 2,
    name: "Maria Santos, Esq.",
    firm: "Santos & Associates Immigration Law",
    city: "New York",
    state: "NY",
    specialties: ["J-1 Waiver", "EB-1", "EB-2 NIW", "Citizenship"],
    freeConsultation: true,
    featured: true,
    phone: "(555) 100-0002",
    website: "https://example.com",
  },
  {
    id: 3,
    name: "David Chen, Esq.",
    firm: "Pacific Immigration Partners",
    city: "Los Angeles",
    state: "CA",
    specialties: ["H-1B", "EB-2 NIW", "Green Card"],
    freeConsultation: false,
    featured: false,
    phone: "(555) 100-0003",
    website: "https://example.com",
  },
  {
    id: 4,
    name: "Sarah Williams, Esq.",
    firm: "Heartland Immigration Law",
    city: "Columbus",
    state: "OH",
    specialties: ["J-1 Waiver", "H-1B", "Green Card"],
    freeConsultation: true,
    featured: false,
    phone: "(555) 100-0004",
    website: "https://example.com",
  },
  {
    id: 5,
    name: "Ahmed Hassan, Esq.",
    firm: "Hassan Legal Group",
    city: "Chicago",
    state: "IL",
    specialties: ["J-1 Waiver", "H-1B", "EB-1", "Citizenship"],
    freeConsultation: true,
    featured: true,
    phone: "(555) 100-0005",
    website: "https://example.com",
  },
  {
    id: 6,
    name: "Priya Patel, Esq.",
    firm: "Patel Immigration Counsel",
    city: "Detroit",
    state: "MI",
    specialties: ["J-1 Waiver", "H-1B", "EB-2 NIW"],
    freeConsultation: false,
    featured: false,
    phone: "(555) 100-0006",
    website: "https://example.com",
  },
  {
    id: 7,
    name: "James O'Brien, Esq.",
    firm: "O'Brien & Associates",
    city: "Philadelphia",
    state: "PA",
    specialties: ["J-1 Waiver", "Green Card", "Citizenship"],
    freeConsultation: true,
    featured: false,
    phone: "(555) 100-0007",
    website: "https://example.com",
  },
];

const ALL_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const SPECIALTY_OPTIONS = [
  "J-1 Waiver",
  "H-1B",
  "EB-1",
  "EB-2 NIW",
  "Green Card",
  "Citizenship",
];

export default function LawyersPage() {
  const [stateFilter, setStateFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [freeConsultation, setFreeConsultation] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLawyers = useMemo(() => {
    return SAMPLE_LAWYERS.filter((lawyer) => {
      if (stateFilter && lawyer.state !== stateFilter) return false;
      if (specialtyFilter && !lawyer.specialties.includes(specialtyFilter))
        return false;
      if (freeConsultation && !lawyer.freeConsultation) return false;
      if (
        searchQuery &&
        !lawyer.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !lawyer.firm.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !lawyer.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [stateFilter, specialtyFilter, freeConsultation, searchQuery]);

  // Featured first, then alphabetical
  const sortedLawyers = [...filteredLawyers].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <>
      <head>
        <title>Immigration Lawyer Directory — USCEHub</title>
        <meta
          name="description"
          content="Find immigration lawyers specializing in J-1 waivers, H-1B visas, EB-1, EB-2 NIW, and citizenship for physicians. Verified attorney directory."
        />
        <link
          rel="canonical"
          href="https://uscehub.com/career/lawyers"
        />
      </head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Immigration Lawyer Directory
          </h1>
          <p className="text-muted max-w-2xl">
            Find immigration attorneys who specialize in physician immigration,
            including J-1 waivers, H-1B sponsorship, and green card
            applications.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-4 mb-8">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-muted">
              Lawyer listings are for informational purposes only. USCEHub does
              not endorse any attorney. Always conduct your own due diligence
              before retaining legal counsel.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="rounded-xl border border-border bg-surface p-4 mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted">
            <Filter className="h-4 w-4" />
            <span>Filter Lawyers</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search by name, firm, city..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* State */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All States</option>
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Specialty */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Specialties</option>
              {SPECIALTY_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Free Consultation */}
            <label className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={freeConsultation}
                onChange={(e) => setFreeConsultation(e.target.checked)}
                className="rounded border-border accent-accent"
              />
              <span className="text-sm text-foreground">Free Consult</span>
            </label>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted">
          Showing {sortedLawyers.length} of {SAMPLE_LAWYERS.length} attorneys
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
          {sortedLawyers.map((lawyer) => (
            <div
              key={lawyer.id}
              className="rounded-xl border border-border bg-surface p-6 hover-glow relative"
            >
              {lawyer.featured && (
                <div className="absolute top-4 right-4">
                  <span className="flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-medium bg-warning/10 text-warning">
                    <Star className="h-3 w-3" />
                    Featured
                  </span>
                </div>
              )}
              <h3 className="text-base font-semibold text-foreground mb-1 pr-20">
                {lawyer.name}
              </h3>
              <p className="text-sm text-muted mb-2">{lawyer.firm}</p>
              <div className="flex items-center gap-1.5 text-sm text-muted mb-3">
                <MapPin className="h-3.5 w-3.5" />
                {lawyer.city}, {lawyer.state}
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {lawyer.specialties.map((s) => (
                  <span
                    key={s}
                    className="rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent"
                  >
                    {s}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {lawyer.freeConsultation && (
                  <span className="flex items-center gap-1 text-xs text-success">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Free Consultation
                  </span>
                )}
                <span className="flex items-center gap-1 text-xs text-muted">
                  <Phone className="h-3.5 w-3.5" />
                  {lawyer.phone}
                </span>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <a
                  href={lawyer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg bg-accent/10 px-4 py-2 text-sm font-medium text-accent hover:bg-accent/20 transition-colors"
                >
                  Contact Attorney
                </a>
              </div>
            </div>
          ))}

          {sortedLawyers.length === 0 && (
            <div className="md:col-span-2 rounded-xl border border-border bg-surface p-12 text-center">
              <Search className="h-8 w-8 text-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                No lawyers match your filters
              </h3>
              <p className="text-sm text-muted">
                Try adjusting your search criteria or removing filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
