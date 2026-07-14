"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { submitCustomerReviewAction } from "@/features/reviews/customer/actions/submit-review-action";

export type EligibleReviewApplication = {
  id: string;
  trackingId: string;
  service: {
    id: string;
    nameEn: string;
    slug: string;
  };
};

export function CustomerReviewForm({
  applications,
  defaultName,
  isAuthenticated,
  labels,
}: {
  applications: EligibleReviewApplication[];
  defaultName: string;
  isAuthenticated: boolean;
  labels: {
    title: string;
    description: string;
    loginPrompt: string;
    loginCta: string;
    noEligible: string;
    application: string;
    name: string;
    content: string;
    rating: string;
    consent: string;
    submit: string;
    submitting: string;
    success: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [applicationId, setApplicationId] = useState(applications[0]?.id ?? "");
  const [authorNameEn, setAuthorNameEn] = useState(defaultName);
  const [contentEn, setContentEn] = useState("");
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isAuthenticated) {
    return (
      <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-bold">{labels.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{labels.loginPrompt}</p>
        <Button asChild className="mt-4">
          <Link href="/login?next=/reviews">{labels.loginCta}</Link>
        </Button>
      </section>
    );
  }

  if (applications.length === 0) {
    return (
      <section className="rounded-2xl border bg-card p-5 shadow-sm md:p-6">
        <h2 className="text-xl font-bold">{labels.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{labels.noEligible}</p>
      </section>
    );
  }

  function onSubmit() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await submitCustomerReviewAction({
        applicationId,
        authorNameEn,
        contentEn,
        rating,
        customerConsent: consent ? true : false,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(labels.success);
      setContentEn("");
      setConsent(false);
      router.refresh();
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      <div>
        <h2 className="text-xl font-bold">{labels.title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{labels.description}</p>
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm text-primary">
          {success}
        </p>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="review-application">{labels.application}</Label>
          <select
            id="review-application"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={applicationId}
            onChange={(event) => setApplicationId(event.target.value)}
          >
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.trackingId} · {application.service.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-name">{labels.name}</Label>
          <Input
            id="review-name"
            value={authorNameEn}
            onChange={(event) => setAuthorNameEn(event.target.value)}
            maxLength={100}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="review-content">{labels.content}</Label>
          <textarea
            id="review-content"
            value={contentEn}
            onChange={(event) => setContentEn(event.target.value)}
            maxLength={1200}
            rows={5}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="review-rating">{labels.rating}</Label>
          <div className="flex items-center gap-2">
            <Input
              id="review-rating"
              type="number"
              min={1}
              max={5}
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
            />
            <Star className="size-4 fill-secondary text-secondary" aria-hidden="true" />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm leading-relaxed">
        <input
          type="checkbox"
          className="mt-1"
          checked={consent}
          onChange={(event) => setConsent(event.target.checked)}
        />
        <span>{labels.consent}</span>
      </label>

      <Button type="button" onClick={onSubmit} disabled={isPending || !consent}>
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </section>
  );
}
