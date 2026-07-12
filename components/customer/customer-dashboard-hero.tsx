import { ArrowRight, Sparkles } from "lucide-react";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
type CustomerDashboardHeroProps = {
  name: string;
  contactLine: string;
  labels: {
    eyebrow: string;
    title: string;
    welcome: string;
    subtitle: string;
    servicesCta: string;
    trackCta: string;
    accountLabel: string;
  };
};

export function CustomerDashboardHero({
  name,
  contactLine,
  labels,
}: CustomerDashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-secondary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-16 end-0 size-48 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative flex flex-col gap-6 p-6 md:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <CustomerAccountAvatar name={name} className="size-12 text-base" />
          <div className="min-w-0 space-y-2">
            <p className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-4" aria-hidden="true" />
              {labels.eyebrow}
            </p>
            <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
              {labels.title}
            </h1>
            <p className="text-base font-medium text-foreground">
              {labels.welcome}
            </p>
            <p className="max-w-2xl text-sm text-muted-foreground md:text-base">
              {labels.subtitle}
            </p>
            {contactLine ? (
              <p className="text-xs text-muted-foreground">
                {labels.accountLabel}: {contactLine}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/services">
              {labels.servicesCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/track">{labels.trackCta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
