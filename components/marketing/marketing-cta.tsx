import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";

type MarketingCtaProps = {
  applyLabel: string;
  applyHref: string;
  whatsappLabel: string;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
  title?: string;
  description?: string;
};

function buildWhatsAppHref(phone?: string | null, message?: string | null): string {
  return buildWhatsAppUrl(
    phone ?? siteConfig.contact.whatsapp,
    message ?? siteConfig.contact.whatsappMessage,
  );
}

export function MarketingCta({
  applyLabel,
  applyHref,
  whatsappLabel,
  whatsappPhone,
  whatsappMessage,
  title,
  description,
}: MarketingCtaProps) {
  return (
    <section className="rounded-2xl border bg-primary/5 p-6 md:p-8">
      {title ? <h2 className="text-xl font-bold sm:text-2xl">{title}</h2> : null}
      {description ? (
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {description}
        </p>
      ) : null}
      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <Button asChild size="lg">
          <Link href={applyHref}>
            {applyLabel}
            <DirectionalArrow />
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <a
            href={buildWhatsAppHref(whatsappPhone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <WhatsAppIcon className="size-4" />
            {whatsappLabel}
          </a>
        </Button>
      </div>
    </section>
  );
}
