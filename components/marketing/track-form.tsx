"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { TrackResult } from "@/components/marketing/TrackResult";
import { Button } from "@/components/ui/button";
import { trackApplicationAction } from "@/features/customer/actions/track-application";
import { resolvePostLoginPath } from "@/features/auth/lib/redirect";
import { siteConfig } from "@/config/site";
import { getUserRole } from "@/lib/auth-types";
import { useSession } from "@/lib/auth-client";

import type { Route } from "next";
import Link from "next/link";

type TrackFormProps = {
  placeholder: string;
  submitLabel: string;
  helpText: string;
  loginLabel: string;
  dashboardLabel: string;
  locale: "en";
  whatsappPhone?: string;
  whatsappDefaultMessage?: string;
  labels: {
    error: string;
    rateLimited: string;
    whatsapp: string;
    whatsappMessage: string;
    resultTitle: string;
    resultTrackingId: string;
    resultService: string;
    resultStatus: string;
    resultUpdated: string;
    resultPublicStatusDescription: string;
    resultLoginPrompt: string;
    resultLoginCta: string;
    resultDashboardPrompt: string;
    resultDashboardCta: string;
    publicStatus: Record<string, string>;
    statusLabels: Record<string, string>;
  };
  initialTrackingId?: string;
};

function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = phoneNumber.replace(/\D/g, "");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function TrackForm({
  placeholder,
  submitLabel,
  helpText,
  loginLabel,
  dashboardLabel,
  locale,
  whatsappPhone,
  whatsappDefaultMessage,
  labels,
  initialTrackingId = "",
}: TrackFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const isLoggedIn = Boolean(session?.user);
  const accountHref = isLoggedIn
    ? resolvePostLoginPath(getUserRole(session?.user))
    : "/login";
  const accountLabel = isLoggedIn ? dashboardLabel : loginLabel;
  const queryTrackingId = searchParams.get("trackingId")?.trim() ?? "";
  const [trackingId, setTrackingId] = useState(
    queryTrackingId || initialTrackingId,
  );
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Awaited<
    ReturnType<typeof trackApplicationAction>
  > | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleTrack(id: string) {
    const normalized = id.trim().toUpperCase();
    setError(null);
    setResult(null);

    startTransition(async () => {
      const response = await trackApplicationAction({ trackingId: normalized });
      setResult(response);

      if (!response.success) {
        setError(
          response.error?.includes("Too many")
            ? labels.rateLimited
            : (response.error ?? labels.error),
        );
      }
    });
  }

  useEffect(() => {
    const id = (queryTrackingId || initialTrackingId).trim();
    if (!id) {
      return;
    }

    const timer = window.setTimeout(() => {
      handleTrack(id.toUpperCase());
    }, 0);

    return () => window.clearTimeout(timer);
    // Auto-lookup once when a tracking ID is present in the URL.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryTrackingId, initialTrackingId]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!trackingId.trim()) {
      return;
    }

    const normalized = trackingId.trim().toUpperCase();
    setTrackingId(normalized);
    router.replace(`/track?trackingId=${encodeURIComponent(normalized)}`, {
      scroll: false,
    });
    handleTrack(normalized);
  }

  const whatsappMessage =
    result?.success && result.data
      ? `${labels.whatsappMessage} ${result.data.trackingId}`
      : labels.whatsappMessage;

  const whatsappHref = buildWhatsAppUrl(
    whatsappPhone ?? siteConfig.contact.whatsapp,
    whatsappMessage,
  );

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div className="space-y-4 rounded-xl border bg-card p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <label className="block space-y-2">
            <span className="text-sm font-medium">{placeholder}</span>
            <input
              type="text"
              value={trackingId}
              onChange={(event) => setTrackingId(event.target.value.toUpperCase())}
              placeholder={placeholder}
              className="flex h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-sm uppercase shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              autoComplete="off"
              spellCheck={false}
            />
          </label>
          <Button
            type="submit"
            className="w-full sm:w-auto"
            disabled={!trackingId.trim() || isPending}
          >
            {isPending ? "…" : submitLabel}
          </Button>
        </form>
        <p className="text-sm text-muted-foreground">{helpText}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={accountHref as Route}>{accountLabel}</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="click_whatsapp"
              data-analytics-placement="track_page"
            >
              <WhatsAppIcon className="size-4" />
              {labels.whatsapp}
            </a>
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {result?.success ? (
        <TrackResult
          trackingId={result.data.trackingId}
          status={result.data.status}
          serviceName={
            result.data.serviceNameEn
          }
          updatedAt={result.data.updatedAt}
          locale={locale}
          labels={{
            title: labels.resultTitle,
            trackingId: labels.resultTrackingId,
            service: labels.resultService,
            status: labels.resultStatus,
            updated: labels.resultUpdated,
            publicStatusDescription: labels.resultPublicStatusDescription,
            accountPrompt: isLoggedIn
              ? labels.resultDashboardPrompt
              : labels.resultLoginPrompt,
            accountCta: isLoggedIn
              ? labels.resultDashboardCta
              : labels.resultLoginCta,
          }}
          statusLabel={
            labels.statusLabels[result.data.status] ?? result.data.status
          }
          publicStatusMessage={
            labels.publicStatus[result.data.status] ??
            labels.resultPublicStatusDescription
          }
          accountHref={accountHref}
        />
      ) : null}
    </div>
  );
}
