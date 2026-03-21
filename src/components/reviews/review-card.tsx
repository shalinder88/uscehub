import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Star } from "lucide-react";

interface ReviewCardProps {
  overallRating: number;
  wasReal: boolean;
  worthCost: boolean;
  wouldRecommend: boolean;
  actualExposure: number;
  comment: string | null;
  anonymous: boolean;
  createdAt: string;
  user: {
    id: string;
    name: string;
  };
}

export function ReviewCard({
  overallRating,
  wasReal,
  worthCost,
  wouldRecommend,
  actualExposure,
  comment,
  anonymous,
  createdAt,
  user,
}: ReviewCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < overallRating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-200"
                }`}
              />
            ))}
            <span className="ml-1.5 text-sm font-medium text-slate-700">
              {overallRating}/5
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            {anonymous ? "Anonymous" : user.name}
          </p>
        </div>
        <span className="text-xs text-slate-400">{formatDate(createdAt)}</span>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Badge variant={wasReal ? "success" : "warning"}>
          {wasReal ? "Real Experience" : "Not Real"}
        </Badge>
        <Badge variant={worthCost ? "success" : "warning"}>
          {worthCost ? "Worth the Cost" : "Not Worth Cost"}
        </Badge>
        <Badge variant={wouldRecommend ? "success" : "warning"}>
          {wouldRecommend ? "Would Recommend" : "Would Not Recommend"}
        </Badge>
        <Badge variant="info">Exposure: {actualExposure}/5</Badge>
      </div>

      {comment && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {comment}
        </p>
      )}
    </div>
  );
}
