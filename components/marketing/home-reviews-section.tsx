import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";

import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { ReviewCard } from "@/components/marketing/review-card";
import { Button } from "@/components/ui/button";

type HomeReview = {
  id: string;
  authorNameEn: string;
  authorRoleEn: string | null;
  contentEn: string;
  rating: number;
};

export function HomeReviewsSection({
  reviews,
  title,
  description,
  feedbackLabel,
  countLabel,
  viewAllLabel,
}: {
  reviews: HomeReview[];
  title: string;
  description: string;
  feedbackLabel: string;
  countLabel: string;
  viewAllLabel: string;
}) {
  if (reviews.length === 0) return null;

  const average =
    reviews.reduce((total, review) => total + review.rating, 0) / reviews.length;

  return (
    <HomeSectionShell tone="muted">
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-sm font-semibold text-foreground">
          <Star className="size-4 fill-secondary text-secondary" aria-hidden="true" />
          {average.toFixed(1)} · {countLabel}
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard key={review.id} review={review} feedbackLabel={feedbackLabel} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Button asChild size="lg">
          <Link href="/reviews">
            {viewAllLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
      </div>
    </HomeSectionShell>
  );
}
