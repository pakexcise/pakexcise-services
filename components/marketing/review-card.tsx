import { Star } from "lucide-react";

import { Card, CardContent, CardHeader } from "@/components/ui/card";type ReviewCardProps = {
  review: {
    authorNameEn: string;
    authorRoleEn?: string | null;
    contentEn: string;
    rating: number;
  };
  locale: string;
};

export function ReviewCard({ review, locale }: ReviewCardProps) {
  const authorName = review.authorNameEn ?? "";
  const authorRole = review.authorRoleEn ?? "";
  const content = review.contentEn ?? "";

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
