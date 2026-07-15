"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
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

export type ReviewServiceOption = {
  id: string;
  nameEn: string;
};

type TurnstileApi = {
  render: (
    element: HTMLElement,
    options: {
      sitekey: string;
      theme: "auto";
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId: string) => void;
  remove: (widgetId: string) => void;
};

export function CustomerReviewForm({
  applications,
  services,
  defaultName,
  turnstileSiteKey,
  labels,
}: {
  applications: EligibleReviewApplication[];
  services: ReviewServiceOption[];
  defaultName: string;
  turnstileSiteKey: string;
  labels: {
    title: string;
    description: string;
    application: string;
    applicationOptional: string;
    service: string;
    name: string;
    content: string;
    rating: string;
    consent: string;
    antiSpamUnavailable: string;
    submit: string;
    submitting: string;
    success: string;
  };
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [applicationId, setApplicationId] = useState("");
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [authorNameEn, setAuthorNameEn] = useState(defaultName);
  const [contentEn, setContentEn] = useState("");
  const [rating, setRating] = useState(5);
  const [consent, setConsent] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [website, setWebsite] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now());
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const turnstileContainerRef = useRef<HTMLDivElement>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const resetTurnstile = useCallback(() => {
    setTurnstileToken("");
    const api = (window as typeof window & { turnstile?: TurnstileApi }).turnstile;
    if (api && turnstileWidgetIdRef.current) {
      api.reset(turnstileWidgetIdRef.current);
    }
  }, []);

  const renderTurnstile = useCallback(() => {
    const api = (window as typeof window & { turnstile?: TurnstileApi }).turnstile;
    if (
      !api ||
      !turnstileSiteKey ||
      !turnstileContainerRef.current ||
      turnstileWidgetIdRef.current
    ) {
      return;
    }

    turnstileWidgetIdRef.current = api.render(turnstileContainerRef.current, {
      sitekey: turnstileSiteKey,
      theme: "auto",
      callback: setTurnstileToken,
      "expired-callback": () => setTurnstileToken(""),
      "error-callback": () => setTurnstileToken(""),
    });
  }, [turnstileSiteKey]);

  useEffect(() => {
    renderTurnstile();
    return () => {
      const api = (window as typeof window & { turnstile?: TurnstileApi }).turnstile;
      if (api && turnstileWidgetIdRef.current) {
        api.remove(turnstileWidgetIdRef.current);
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [renderTurnstile]);

  function onApplicationChange(nextApplicationId: string) {
    setApplicationId(nextApplicationId);
    const application = applications.find((item) => item.id === nextApplicationId);
    if (application) {
      setServiceId(application.service.id);
    }
  }

  function onSubmit() {
    setError(null);
    setSuccess(null);
    startTransition(async () => {
      const result = await submitCustomerReviewAction({
        applicationId: applicationId || undefined,
        serviceId,
        authorNameEn,
        contentEn,
        rating,
        turnstileToken,
        website,
        formStartedAt,
        customerConsent: consent ? true : false,
      });
      if (!result.success) {
        setError(result.error);
        resetTurnstile();
        return;
      }
      setSuccess(labels.success);
      setContentEn("");
      setConsent(false);
      setFormStartedAt(Date.now());
      resetTurnstile();
      router.refresh();
    });
  }

  return (
    <section className="space-y-4 rounded-2xl border bg-card p-5 shadow-sm md:p-6">
      {turnstileSiteKey ? (
        <Script
          src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
          strategy="afterInteractive"
          onLoad={renderTurnstile}
        />
      ) : null}
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
        {applications.length > 0 ? (
          <div className="space-y-2">
          <Label htmlFor="review-application">{labels.application}</Label>
          <select
            id="review-application"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={applicationId}
            onChange={(event) => onApplicationChange(event.target.value)}
          >
            <option value="">{labels.applicationOptional}</option>
            {applications.map((application) => (
              <option key={application.id} value={application.id}>
                {application.trackingId} · {application.service.nameEn}
              </option>
            ))}
          </select>
          </div>
        ) : null}
        <div className="space-y-2">
          <Label htmlFor="review-service">{labels.service}</Label>
          <select
            id="review-service"
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            value={serviceId}
            disabled={Boolean(applicationId)}
            onChange={(event) => setServiceId(event.target.value)}
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.nameEn}
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

      <div className="absolute -left-[10000px] top-auto size-px overflow-hidden" aria-hidden="true">
        <Label htmlFor="review-website">Website</Label>
        <Input
          id="review-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(event) => setWebsite(event.target.value)}
        />
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

      {turnstileSiteKey ? (
        <div ref={turnstileContainerRef} />
      ) : (
        <p className="text-sm text-destructive">{labels.antiSpamUnavailable}</p>
      )}

      <Button
        type="button"
        onClick={onSubmit}
        disabled={
          isPending ||
          !consent ||
          !serviceId ||
          !turnstileSiteKey ||
          !turnstileToken
        }
      >
        {isPending ? labels.submitting : labels.submit}
      </Button>
    </section>
  );
}
