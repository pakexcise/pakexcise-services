import { WhatsAppIcon } from "@/components/shared/whatsapp-icon";

import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type HomeHeroSectionProps = {
  badge: string;
  title: string;
  subtitle: string;
  browseCta: string;
  whatsappCta: string;
  requestCta: string;
  whatsappHref: string;
  trustBadges: string[];
  processCards: Array<{ title: string; description: string }>;
  processTitle: string;
  className?: string;
};

export function HomeHeroSection({
  badge,
  title,
  subtitle,
  browseCta,
  whatsappCta,
  requestCta,
  whatsappHref,
  trustBadges,
  processCards,
  processTitle,
  className,
}: HomeHeroSectionProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden border-b bg-linear-to-br from-primary/10 via-background to-secondary/10",
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(33,89,186,0.12),transparent_45%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-20 top-10 size-72 rounded-full bg-secondary/25 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-16 size-64 rounded-full bg-primary/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-site relative grid gap-10 py-14 sm:py-16 md:py-24 lg:grid-cols-[minmax(0,1.12fr)_minmax(0,0.88fr)] lg:items-center lg:gap-14">
        <div className="space-y-7">
          <div className="inline-flex items-center rounded-full border border-primary/25 bg-background/80 px-3.5 py-1.5 text-xs font-semibold text-primary shadow-sm backdrop-blur-sm">
            {badge}
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-[1.12]">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              {subtitle}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {trustBadges.slice(0, 4).map((item) => (
              <span
                key={item}
                className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-medium text-foreground/85"
              >
                {item}
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button
              asChild
              size="lg"
              className="h-12 bg-[#25D366] px-6 text-base text-white shadow-md shadow-[#25D366]/25 hover:bg-[#20bd5a]"
            >
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                data-analytics-event="click_whatsapp"
                data-analytics-placement="home_hero_whatsapp"
              >
                <WhatsAppIcon className="size-4" />
                {whatsappCta}
              </a>
            </Button>
            <Button asChild size="lg" variant="default" className="h-12 px-6 text-base">
              <Link href="/services">
                {browseCta}
                <DirectionalArrow />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-6 text-base">
              <Link href="/contact#contact-form">{requestCta}</Link>
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-primary/15 bg-card/80 p-5 shadow-lg shadow-primary/5 backdrop-blur-sm sm:p-6">
          <p className="mb-4 text-sm font-semibold text-foreground">
            {processTitle}
          </p>
          <ol className="space-y-4">
            {processCards.map((card, index) => (
              <li key={card.title} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {index + 1}
                </span>
                <div className="space-y-1 pt-0.5">
                  <p className="text-sm font-semibold text-foreground">{card.title}</p>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {card.description}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
