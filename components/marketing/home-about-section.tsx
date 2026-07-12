import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import Link from "next/link";
type HomeAboutSectionProps = {
  title: string;
  description: string;
  additional: string;
  cta: string;
  trustCards: Array<{ title: string; description: string }>;
  tone?: "default" | "muted" | "accent";
  className?: string;
};

export function HomeAboutSection({
  title,
  description,
  additional,
  cta,
  trustCards,
  tone = "muted",
  className,
}: HomeAboutSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <div className="grid gap-8 md:grid-cols-2 lg:gap-12">
        <div className="space-y-5">
          <SectionHeader title={title} description={description} />
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {additional}
          </p>
          <Button asChild>
            <Link href="/about">
              {cta}
              <DirectionalArrow />
            </Link>
          </Button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {trustCards.map((card) => (
            <div
              key={card.title}
              className="rounded-xl border border-border/70 bg-background/80 p-4"
            >
              <h3 className="text-sm font-semibold">{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </HomeSectionShell>
  );
}
