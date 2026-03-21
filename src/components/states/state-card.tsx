import Link from "next/link";
import { MapPin } from "lucide-react";
import { CardRoot } from "@/components/ui/card";
import { US_STATES } from "@/lib/utils";

interface StateCardProps {
  stateCode: string;
  listingCount: number;
  topSpecialties: string[];
}

export function StateCard({ stateCode, listingCount, topSpecialties }: StateCardProps) {
  const stateName = US_STATES[stateCode] || stateCode;

  return (
    <Link href={`/browse?state=${stateCode}`}>
      <CardRoot className="group h-full transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
        <div className="p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-slate-400" />
              <h3 className="font-semibold text-slate-900 group-hover:text-slate-700">
                {stateName}
              </h3>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {listingCount} {listingCount === 1 ? "listing" : "listings"}
            </span>
          </div>
          {topSpecialties.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {topSpecialties.slice(0, 3).map((s) => (
                <span
                  key={s}
                  className="rounded-full bg-slate-50 px-2 py-0.5 text-xs text-slate-500"
                >
                  {s}
                </span>
              ))}
            </div>
          )}
        </div>
      </CardRoot>
    </Link>
  );
}
