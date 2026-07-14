import Link from "next/link";
import { ArrowRight, MessageCircle, Star } from "lucide-react";

import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { ReviewCard } from "@/components/marketing/review-card";
import { Button } from "@/components/ui/button";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import type { PublicReview } from "@/server/repositories/review-repository";

export function PublicReviewsSection({
  reviews,
  title,
  description,
  feedbackLabel,
  googleLabel,
  customerLabel,
  countLabel,
  averageRating,
  viewAllLabel,
  whatsappLabel,
  whatsappHref,
  googleReviewHref,
  googleReviewLabel,
  tone = "muted",
}: {
  reviews: PublicReview[];
  title: string;
  description: string;
  feedbackLabel: string;
  googleLabel: string;
  customerLabel: string;
  countLabel: string;
  averageRating: number;
  viewAllLabel: string;
  whatsappLabel: string;
  whatsappHref?: string;
  googleReviewHref?: string;
  googleReviewLabel?: string;
  tone?: "default" | "muted" | "accent";
}) {
  if (reviews.length === 0) {
    return null;
  }

  return (
    <HomeSectionShell tone={tone}>
      <div className="mx-auto max-w-3xl text-center">
        <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full border border-secondary/40 bg-secondary/10 px-3 py-1.5 text-sm font-semibold text-foreground">
          <Star className="size-4 fill-secondary text-secondary" aria-hidden="true" />
          {averageRating.toFixed(1)} · {countLabel}
        </div>
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h2>
        <p className="mt-3 text-muted-foreground">{description}</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {reviews.slice(0, 3).map((review) => (
          <ReviewCard
            key={review.id}
            review={review}
            feedbackLabel={
              review.source === "GOOGLE" ? googleLabel : customerLabel || feedbackLabel
            }
          />
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/reviews">
            {viewAllLabel}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Button>
        {whatsappHref ? (
          <Button asChild size="lg" variant="outline" className="border-[#25D366]/40 text-[#128C7E]">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="click_whatsapp"
              data-analytics-placement="reviews_whatsapp"
            >
              <WhatsAppIcon className="size-4" />
              {whatsappLabel}
            </a>
          </Button>
        ) : null}
        {googleReviewHref && googleReviewLabel ? (
          <Button asChild size="lg" variant="secondary">
            <a href={googleReviewHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="size-4" aria-hidden="true" />
              {googleReviewLabel}
            </a>
          </Button>
        ) : null}
      </div>
    </HomeSectionShell>
  );
}
