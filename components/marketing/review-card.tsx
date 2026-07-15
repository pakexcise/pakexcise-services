import { Quote } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RatingStars } from "@/components/shared/rating-stars";

type ReviewCardProps = {
  review: {
    authorNameEn: string;
    authorRoleEn?: string | null;
    contentEn: string;
    rating: number;
  };
  feedbackLabel: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ReviewCard({ review, feedbackLabel }: ReviewCardProps) {
  const authorName = review.authorNameEn;
  const authorRole = review.authorRoleEn ?? "";
  const rating = Math.max(1, Math.min(5, review.rating));

  return (
    <Card className="group relative h-full overflow-hidden border-border/70 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary/70 to-secondary" />
      <CardHeader className="space-y-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Quote className="size-5" aria-hidden="true" />
          </span>
          <span className="rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary">
            {feedbackLabel}
          </span>
        </div>
        <RatingStars rating={rating} showValue />
      </CardHeader>
      <CardContent className="flex h-[calc(100%-8rem)] flex-col justify-between gap-6">
        <blockquote className="text-[15px] leading-7 text-foreground/80">
          “{review.contentEn}”
        </blockquote>
        <div className="flex items-center gap-3 border-t pt-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials(authorName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{authorName}</p>
            {authorRole ? (
              <p className="truncate text-sm text-muted-foreground">{authorRole}</p>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
