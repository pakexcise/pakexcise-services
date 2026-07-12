import { ArrowRight, Briefcase, Sparkles } from "lucide-react";

import { CustomerAccountAvatar } from "@/components/customer/customer-account-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
type AgentDashboardHeroProps = {
  name: string;
  contactLine: string;
  commissionRate?: string;
  labels: {
    eyebrow: string;
    title: string;
    welcome: string;
    subtitle: string;
    accountLabel: string;
    commissionRateLabel: string;
    newApplicationCta: string;
    applicationsCta: string;
  };
};

export function AgentDashboardHero({
  name,
  contactLine,
  commissionRate,
  labels,
}: AgentDashboardHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-card shadow-sm">
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/12 via-transparent to-secondary/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-16 end-0 size-48 rounded-full bg-secondary/15 blur-3xl"
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
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {contactLine ? (
                <p className="text-xs text-muted-foreground">
                  {labels.accountLabel}: {contactLine}
                </p>
              ) : null}
              {commissionRate ? (
                <Badge variant="secondary" className="gap-1">
                  <Briefcase className="size-3" aria-hidden="true" />
                  {labels.commissionRateLabel}: {commissionRate}%
                </Badge>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-col gap-2 sm:w-auto sm:flex-row lg:flex-col xl:flex-row">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/agent/applications/new">
              {labels.newApplicationCta}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
            <Link href="/agent/applications">{labels.applicationsCta}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
