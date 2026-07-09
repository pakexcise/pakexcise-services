import { CalendarDays, Clock3, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

type BlogPostMetaBarProps = {
  locale: string;
  category?: string | null;
  author?: string | null;
  publishedAt?: Date | null;
  updatedAt?: Date;
  readingTimeMinutes?: number | null;
  readingTimeLabel: string;
  updatedLabel: string;
};

export function BlogPostMetaBar({
  locale,
  category,
  author,
  publishedAt,
  updatedAt,
  readingTimeMinutes,
  readingTimeLabel,
  updatedLabel,
}: BlogPostMetaBarProps) {
  const showUpdated =
    updatedAt &&
    publishedAt &&
    updatedAt.getTime() - publishedAt.getTime() > 60_000;

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
      {category ? (
        <Badge variant="secondary" className="rounded-full px-3 py-1">
          {category}
        </Badge>
      ) : null}

      {author ? (
        <span className="inline-flex items-center gap-1.5">
          <UserRound className="size-4 shrink-0" aria-hidden="true" />
          {author}
        </span>
      ) : null}

      {publishedAt ? (
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="size-4 shrink-0" aria-hidden="true" />
          <time dateTime={publishedAt.toISOString()}>
            {formatDate(publishedAt, locale)}
          </time>
        </span>
      ) : null}

      {showUpdated ? (
        <span>
          {updatedLabel}: {formatDate(updatedAt, locale)}
        </span>
      ) : null}

      {readingTimeMinutes ? (
        <span className="inline-flex items-center gap-1.5">
          <Clock3 className="size-4 shrink-0" aria-hidden="true" />
          {readingTimeMinutes} {readingTimeLabel}
        </span>
      ) : null}
    </div>
  );
}
