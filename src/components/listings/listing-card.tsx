import Link from "next/link";
import { MapPin, Clock, DollarSign, Star, Award, FileText, Globe } from "lucide-react";
import { CardRoot } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LISTING_TYPE_LABELS, truncate } from "@/lib/utils";

interface ListingCardProps {
  listing: {
    id: string;
    title: string;
    listingType: string;
    city: string;
    state: string;
    specialty: string;
    duration: string;
    cost: string;
    shortDescription: string;
    certificateOffered: boolean;
    lorPossible: boolean;
    visaSupport: boolean;
    linkVerified?: boolean;
    reviews?: { overallRating: number }[];
  };
}

function getTypeVariant(type: string) {
  const map: Record<string, "observership" | "externship" | "research" | "postdoc" | "elective" | "volunteer"> = {
    OBSERVERSHIP: "observership",
    EXTERNSHIP: "externship",
    RESEARCH: "research",
    POSTDOC: "postdoc",
    ELECTIVE: "elective",
    VOLUNTEER: "volunteer",
  };
  return map[type] || "default";
}

export function ListingCard({ listing }: ListingCardProps) {
  const avgRating =
    listing.reviews && listing.reviews.length > 0
      ? listing.reviews.reduce((sum, r) => sum + r.overallRating, 0) /
        listing.reviews.length
      : null;

  return (
    <Link href={`/listing/${listing.id}`}>
      <CardRoot className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge variant={getTypeVariant(listing.listingType)}>
              {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
            </Badge>
            {avgRating !== null && (
              <div className="flex items-center gap-1 text-sm text-slate-600">
                <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                <span>{avgRating.toFixed(1)}</span>
                <span className="text-slate-400">
                  ({listing.reviews!.length})
                </span>
              </div>
            )}
          </div>

          <h3 className="mb-2 text-base font-semibold text-slate-900 group-hover:text-slate-700">
            {listing.title}
          </h3>

          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {listing.city}, {listing.state}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>{listing.duration}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <DollarSign className="h-3.5 w-3.5 shrink-0" />
              <span>{listing.cost}</span>
            </div>
          </div>

          <p className="mb-3 line-clamp-2 text-sm leading-relaxed text-slate-500">
            {truncate(listing.shortDescription, 120)}
          </p>

          <div className="flex flex-wrap gap-1.5">
            <Badge variant="default" className="text-xs">
              {listing.specialty}
            </Badge>
            {listing.certificateOffered && (
              <Badge variant="success" className="text-xs">
                <Award className="mr-1 h-3 w-3" />
                Certificate
              </Badge>
            )}
            {listing.lorPossible && (
              <Badge variant="info" className="text-xs">
                <FileText className="mr-1 h-3 w-3" />
                LOR
              </Badge>
            )}
            {listing.visaSupport && (
              <Badge variant="warning" className="text-xs">
                <Globe className="mr-1 h-3 w-3" />
                Visa
              </Badge>
            )}
            {listing.linkVerified && (
              <Badge variant="success" className="text-xs">
                <svg className="mr-1 h-3 w-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/></svg>
                Verified
              </Badge>
            )}
          </div>
        </div>
      </CardRoot>
    </Link>
  );
}
