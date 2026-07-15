import { Star } from "lucide-react";

import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  className,
  showValue = false,
}: {
  rating: number;
  className?: string;
  showValue?: boolean;
}) {
  const normalized = Math.min(5, Math.max(0, rating));

  return (
    <span className={cn("inline-flex items-center gap-1 text-secondary", className)}>
      {Array.from({ length: 5 }).map((_, index) => {
        const fillPercent = Math.min(100, Math.max(0, (normalized - index) * 100));

        return (
          <span key={index} className="relative inline-flex">
            <Star className="size-4 opacity-25" aria-hidden="true" />
            <span
              className="absolute inset-y-0 left-0 overflow-hidden"
              style={{ width: `${fillPercent}%` }}
            >
              <Star className="size-4 fill-current" aria-hidden="true" />
            </span>
          </span>
        );
      })}
      {showValue ? (
        <span className="ml-1 text-sm font-medium text-foreground">
          {normalized.toFixed(1)}
        </span>
      ) : null}
    </span>
  );
}
