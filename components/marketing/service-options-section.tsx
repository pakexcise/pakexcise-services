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
import {
  buildServiceWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/build-service-message";
import { cn } from "@/lib/utils";

import type { Route } from "next";
import Link from "next/link";

type Locale = "en";

export type ServiceOptionsLabels = {
  sectionTitle: string;
  sectionDescription: string;
  whatsappTitle: string;
  whatsappDescription: string;
  whatsappCta: string;
  guestTitle: string;
  guestDescription: string;
  guestCta: string;
  accountTitle: string;
  accountDescription: string;
  accountCta: string;
  accountSubServiceCta: string;
  fastestBadge: string;
  trackingBadge: string;
};

type ServiceOptionsSectionProps = {
  serviceSlug: string;
  serviceName: string;
  regionLabel?: string | null;
  whatsappPhone: string;
  whatsappDefaultMessage: string;
  locale: Locale;
  labels: ServiceOptionsLabels;
  hasSubServices?: boolean;
  className?: string;
};

export function ServiceOptionsSection({
  serviceSlug,
  serviceName,
  regionLabel,
  whatsappPhone,
  whatsappDefaultMessage,
  locale,
  labels,
  hasSubServices = false,
  className,
}: ServiceOptionsSectionProps) {
  const whatsappMessage = buildServiceWhatsAppMessage({
    serviceName,
    regionLabel,
    defaultMessage: whatsappDefaultMessage,
    locale,
  });
  const whatsappUrl = buildWhatsAppUrl(whatsappPhone, whatsappMessage);
  const guestHref = `/request/${serviceSlug}`;
  const accountHref = hasSubServices
    ? `/services/${serviceSlug}#sub-services`
    : `/apply/${serviceSlug}`;

  return (
    <section className={cn("space-y-4", className)}>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">{labels.sectionTitle}</h2>
        <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
          {labels.sectionDescription}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#25D366]/30 bg-[#25D366]/5 shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center justify-between gap-2">
              <WhatsAppIcon className="size-5 text-[#25D366]" />
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-950 dark:bg-emerald-950 dark:text-emerald-100">
                {labels.fastestBadge}
              </span>
            </div>
            <CardTitle className="text-lg">{labels.whatsappTitle}</CardTitle>
            <CardDescription>{labels.whatsappDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              asChild
              className="w-full bg-[#128C7E] text-white hover:bg-[#0f7a6c]"
            >
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="service_options_whatsapp"
              >
                <WhatsAppIcon className="size-4" />
                {labels.whatsappCta}
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <ClipboardList className="size-5 text-primary" aria-hidden="true" />
            <CardTitle className="text-lg">{labels.guestTitle}</CardTitle>
            <CardDescription>{labels.guestDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link href={guestHref as Route}>{labels.guestCta}</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-secondary/40 bg-secondary/5 shadow-sm">
          <CardHeader className="space-y-2 pb-3">
            <div className="flex items-center justify-between gap-2">
              <LogIn className="size-5 text-primary" aria-hidden="true" />
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                {labels.trackingBadge}
              </span>
            </div>
            <CardTitle className="text-lg">{labels.accountTitle}</CardTitle>
            <CardDescription>{labels.accountDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href={accountHref as Route}>
                {hasSubServices ? labels.accountSubServiceCta : labels.accountCta}
                <DirectionalArrow />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
