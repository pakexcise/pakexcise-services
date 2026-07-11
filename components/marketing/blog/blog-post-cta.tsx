import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";

type BlogPostCtaProps = {
  title: string;
  description: string;
  whatsappLabel: string;
  requestLabel: string;
  accountLabel: string;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
};

function buildWhatsAppHref(phone?: string | null, message?: string | null): string {
  return buildWhatsAppUrl(
    phone ?? siteConfig.contact.whatsapp,
    message ?? siteConfig.contact.whatsappMessage,
  );
}

export function BlogPostCta({
  title,
  description,
  whatsappLabel,
  requestLabel,
  accountLabel,
  whatsappPhone,
  whatsappMessage,
}: BlogPostCtaProps) {
  return (
    <section className="rounded-2xl border bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 shadow-sm md:p-8">
      <h2 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        {description}
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <Button asChild size="lg">
          <a
            href={buildWhatsAppHref(whatsappPhone, whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="click_whatsapp"
            data-analytics-placement="blog_post_cta"
          >
            <WhatsAppIcon className="size-4" />
            {whatsappLabel}
          </a>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/contact#contact-form">
            {requestLabel}
            <DirectionalArrow />
          </Link>
        </Button>
        <Button asChild size="lg" variant="secondary">
          <Link href="/login">
            {accountLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </section>
  );
}
