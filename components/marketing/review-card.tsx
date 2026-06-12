import { Star } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { pickLocalized } from "@/lib/i18n/content";

type ReviewCardProps = {
  review: {
    authorNameEn: string;
    authorNameUr?: string | null;
    authorRoleEn?: string | null;
    authorRoleUr?: string | null;
    contentEn: string;
    contentUr: string;
    rating: number;
  };
  locale: string;
};

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const authorName = pickLocalized(locale, {
    en: review.authorNameEn,
    ur: review.authorNameUr ?? review.authorNameEn,
  });
  const authorRole = pickLocalized(locale, {
    en: review.authorRoleEn,
    ur: review.authorRoleUr,
  });
  const content = pickLocalized(locale, {
    en: review.contentEn,
    ur: review.contentUr,
  });

  return (
    <Card className="h-full">
      <CardHeader className="space-y-2">
        <div className="flex items-center gap-1 text-secondary">
          {Array.from({ length: review.rating }).map((_, index) => (
            <Star key={index} className="size-4 fill-current" aria-hidden="true" />
          ))}
        </div>
        <div>
          <p className="font-semibold">{authorName}</p>
          {authorRole ? (
            <p className="text-sm text-muted-foreground">{authorRole}</p>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">{content}</p>
      </CardContent>
    </Card>
  );
}
