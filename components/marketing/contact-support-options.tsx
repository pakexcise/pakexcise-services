import { ClipboardList, LogIn } from "lucide-react";

import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

export type ContactSupportOptionsLabels = {
  sectionTitle: string;
  sectionDescription: string;
  whatsappTitle: string;
  whatsappDescription: string;
  whatsappCta: string;
  requestTitle: string;
  requestDescription: string;
  requestCta: string;
  accountTitle: string;
  accountDescription: string;
  accountCta: string;
  fastestBadge: string;
  trackingBadge: string;
};

type ContactSupportOptionsSectionProps = {
  whatsappPhone: string;
  whatsappMessage: string;
  labels: ContactSupportOptionsLabels;
  requestHref?: string;
  note?: string;
  className?: string;
};

export function ContactSupportOptionsSection({
  whatsappPhone,
  whatsappMessage,
  labels,
  requestHref = "#contact-form",
  note,
  className,
}: ContactSupportOptionsSectionProps) {
  const whatsappHref = buildWhatsAppUrl(whatsappPhone, whatsappMessage);

  return (
    <section className={cn("space-y-5", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {labels.sectionTitle}
        </h2>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          {labels.sectionDescription}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="flex flex-col border-[#25D366]/30 bg-[#25D366]/5 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex-1 space-y-3 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-[#25D366]/15">
                <WhatsAppIcon className="size-5 text-[#25D366]" />
              </div>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
                {labels.fastestBadge}
              </span>
            </div>
            <CardTitle className="text-lg leading-snug">{labels.whatsappTitle}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {labels.whatsappDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button
              asChild
              size="lg"
              className="w-full bg-[#128C7E] text-white hover:bg-[#0f7a6c]"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="contact_options_whatsapp"
              >
                <WhatsAppIcon className="size-4" />
                {labels.whatsappCta}
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-primary/20 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex-1 space-y-3 pb-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="size-5 text-primary" aria-hidden="true" />
            </div>
            <CardTitle className="text-lg leading-snug">{labels.requestTitle}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {labels.requestDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href={requestHref as Route}>{labels.requestCta}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="flex flex-col border-secondary/40 bg-secondary/5 shadow-sm transition-shadow hover:shadow-md">
          <CardHeader className="flex-1 space-y-3 pb-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <LogIn className="size-5 text-primary" aria-hidden="true" />
              </div>
              <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                {labels.trackingBadge}
              </span>
            </div>
            <CardTitle className="text-lg leading-snug">{labels.accountTitle}</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              {labels.accountDescription}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button asChild size="lg" className="w-full">
              <Link href="/services">
                {labels.accountCta}
                <DirectionalArrow />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
      {note ? (
        <p className="rounded-xl border border-dashed bg-muted/20 px-4 py-3 text-sm leading-relaxed text-muted-foreground">
          {note}
        </p>
      ) : null}
    </section>
  );
}
