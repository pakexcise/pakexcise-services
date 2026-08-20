import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import {
  buildServiceWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/build-service-message";
type Locale = "en";


import Link from "next/link";
type RegionHelpSectionProps = {
  regionName: string;
  whatsappPhone: string;
  whatsappDefaultMessage: string;
  locale: Locale;
  placement?: string;
  labels: {
    title: string;
    description: string;
    whatsappCta: string;
    browseServicesCta: string;
  };
};

export function RegionHelpSection({
  regionName,
  whatsappPhone,
  whatsappDefaultMessage,
  locale,
  placement = "region_help_whatsapp",
  labels,
}: RegionHelpSectionProps) {
  const whatsappMessage = buildServiceWhatsAppMessage({
    serviceName: `services in ${regionName}`,
    regionLabel: regionName,
    defaultMessage: whatsappDefaultMessage,
    locale,
  });

  return (
    <section className="space-y-4 rounded-2xl border bg-primary/5 p-6 md:p-8">
      <div className="space-y-2">
        <h2 className="text-xl font-bold sm:text-2xl">{labels.title}</h2>
        <p className="max-w-2xl text-sm text-muted-foreground sm:text-base">
          {labels.description}
        </p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          asChild
          className="bg-[#128C7E] text-white hover:bg-[#0f7a6c]"
          size="lg"
        >
          <a
            href={buildWhatsAppUrl(whatsappPhone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="click_whatsapp"
            data-analytics-placement={placement}
          >
            <WhatsAppIcon className="size-4" />
            {labels.whatsappCta}
          </a>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/services">
            {labels.browseServicesCta}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </section>
  );
}
