import { MessageCircle } from "lucide-react";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HomeFinalCtaSectionProps = {
  title: string;
  description: string;
  browseLabel: string;
  whatsappLabel: string;
  requestLabel: string;
  accountLabel: string;
  whatsappHref: string;
  className?: string;
};

export function HomeFinalCtaSection({
  title,
  description,
  browseLabel,
  whatsappLabel,
  requestLabel,
  accountLabel,
  whatsappHref,
  className,
}: HomeFinalCtaSectionProps) {
  return (
    <section
      className={cn(
        "rounded-2xl border border-primary/15 bg-linear-to-br from-primary/8 via-background to-secondary/10 p-6 md:p-10",
        className,
      )}
    >
      <div className="mx-auto max-w-3xl space-y-6 text-center">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
          {description}
        </p>
        <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
          <Button
            asChild
            size="lg"
            className="h-12 bg-[#25D366] px-6 text-white shadow-md shadow-[#25D366]/20 hover:bg-[#20bd5a]"
          >
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              data-analytics-event="click_whatsapp"
              data-analytics-placement="home_final_cta_whatsapp"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              {whatsappLabel}
            </a>
          </Button>
          <Button asChild size="lg" className="h-12 px-6">
            <Link href="/services">
              {browseLabel}
              <DirectionalArrow />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-12 px-6">
            <Link href="/contact#contact-form">{requestLabel}</Link>
          </Button>
          <Button asChild variant="secondary" size="lg" className="h-12 px-6">
            <Link href="/services">{accountLabel}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
