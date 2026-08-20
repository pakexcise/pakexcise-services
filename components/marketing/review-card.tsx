import { Quote } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { RatingStars } from "@/components/shared/rating-stars";
import { formatRelativeTime } from "@/lib/format-relative-time";

type ReviewCardProps = {
  review: {
    authorNameEn: string;
    contentEn: string;
    rating: number;
    moderatedAt?: Date | string | null;
    submittedAt?: Date | string | null;
    source?: string | null;
    service?: {
      nameEn?: string | null;
    } | null;
  };
  /** Fallback badge when the review has no linked service (e.g. Google). */
  fallbackLabel: string;
};

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function ReviewCard({ review, fallbackLabel }: ReviewCardProps) {
  const authorName = review.authorNameEn?.trim();
  const content = review.contentEn?.trim();

  if (!authorName || !content || review.rating <= 0) {
    return null;
  }

  const rating = Math.max(1, Math.min(5, review.rating));
  const serviceLabel = review.service?.nameEn?.trim() || fallbackLabel;
  const publishedAt = review.moderatedAt ?? review.submittedAt ?? null;
  const relativePublished = formatRelativeTime(publishedAt);
  const absolutePublished =
    publishedAt != null
      ? new Date(publishedAt).toLocaleString("en-PK", {
          dateStyle: "medium",
          timeStyle: "short",
        })
      : null;

  return (
    <Card className="group relative h-full overflow-hidden border-border/70 bg-card shadow-sm transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-lg">
      <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-primary via-primary/70 to-secondary" />
      <CardHeader className="space-y-5 pt-6">
        <div className="flex items-start justify-between gap-4">
          <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Quote className="size-5" aria-hidden="true" />
          </span>
          <span
            className="max-w-[12rem] truncate rounded-full bg-primary/8 px-2.5 py-1 text-xs font-medium text-primary"
            title={serviceLabel}
          >
            {serviceLabel}
          </span>
        </div>
        <RatingStars rating={rating} showValue />
      </CardHeader>
      <CardContent className="flex h-[calc(100%-8rem)] flex-col justify-between gap-6">
        <blockquote className="text-[15px] leading-7 text-foreground/80">
          “{content}”
        </blockquote>
        <div className="flex items-center gap-3 border-t pt-4">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
            {initials(authorName)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold">{authorName}</p>
            {relativePublished ? (
              <time
                className="mt-0.5 block text-xs text-muted-foreground"
                dateTime={
                  publishedAt instanceof Date
                    ? publishedAt.toISOString()
                    : new Date(publishedAt!).toISOString()
                }
                title={absolutePublished ?? undefined}
              >
                {relativePublished}
              </time>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
