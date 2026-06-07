import { MessageCircle } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";

type MarketingCtaProps = {
  applyLabel: string;
  applyHref: string;
  whatsappLabel: string;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
  title?: string;
  description?: string;
};

function buildWhatsAppUrl(phone?: string | null, message?: string | null): string {
  const phoneNumber = phone ?? siteConfig.contact.whatsapp;
  const text = encodeURIComponent(
    message ?? siteConfig.contact.whatsappMessage,
  );

  return `https://wa.me/${phoneNumber}?text=${text}`;
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
            href={buildWhatsAppUrl(whatsappPhone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="size-4" aria-hidden="true" />
            {whatsappLabel}
          </a>
        </Button>
      </div>
    </section>
  );
}
