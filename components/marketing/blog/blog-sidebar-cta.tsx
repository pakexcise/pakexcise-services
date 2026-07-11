import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { Link } from "@/i18n/navigation";
import { buildWhatsAppUrl } from "@/lib/whatsapp/build-service-message";
import { cn } from "@/lib/utils";

type BlogSidebarCtaProps = {
  title: string;
  description: string;
  servicesLabel: string;
  whatsappLabel: string;
  whatsappPhone?: string | null;
  whatsappMessage?: string | null;
  className?: string;
};

export function BlogSidebarCta({
  title,
  description,
  servicesLabel,
  whatsappLabel,
  whatsappPhone,
  whatsappMessage,
  className,
}: BlogSidebarCtaProps) {
  const whatsappHref = buildWhatsAppUrl(
    whatsappPhone ?? siteConfig.contact.whatsapp,
    whatsappMessage ?? siteConfig.contact.whatsappMessage,
  );

  return (
    <aside className={cn("rounded-2xl border bg-card p-5 shadow-sm", className)}>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      <div className="mt-4 space-y-2">
        <Button asChild className="w-full">
          <Link href="/services">{servicesLabel}</Link>
        </Button>
        <Button asChild variant="outline" className="w-full">
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="click_whatsapp"
            data-analytics-placement="blog_sidebar"
          >
            <WhatsAppIcon className="size-4" />
            {whatsappLabel}
          </a>
        </Button>
      </div>
    </aside>
  );
}
