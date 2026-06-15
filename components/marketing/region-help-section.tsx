import { MessageCircle } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  buildServiceWhatsAppMessage,
  buildWhatsAppUrl,
} from "@/lib/whatsapp/build-service-message";
import type { Locale } from "@/i18n/config";

type RegionHelpSectionProps = {
  regionName: string;
  whatsappPhone: string;
  whatsappDefaultMessage: string;
  locale: Locale;
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
          className="bg-[#25D366] text-white hover:bg-[#20bd5a]"
          size="lg"
        >
          <a
            href={buildWhatsAppUrl(whatsappPhone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="click_whatsapp"
            data-analytics-placement="region_help_whatsapp"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
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
