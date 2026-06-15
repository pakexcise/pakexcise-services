import { BlogCardImage } from "@/components/marketing/blog-card-image";
import { DirectionalArrow } from "@/components/shared/directional-arrow";
import { HomeSectionShell } from "@/components/marketing/home-section-shell";
import { SectionHeader } from "@/components/marketing/section-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/navigation";
import { pickLocalized } from "@/lib/i18n/content";

type HomeGuidesSectionProps = {
  title: string;
  description: string;
  guides: Array<{
    slug: string;
    titleEn: string;
    titleUr: string;
    excerptEn?: string | null;
    excerptUr?: string | null;
    seoMeta?: { ogImage?: string | null } | null;
  }>;
  locale: string;
  readGuideLabel: string;
  viewAllLabel: string;
  emptyMessage: string;
  tone?: "default" | "muted" | "accent";
  className?: string;
};

export function HomeGuidesSection({
  title,
  description,
  guides,
  locale,
  readGuideLabel,
  viewAllLabel,
  emptyMessage,
  tone = "accent",
  className,
}: HomeGuidesSectionProps) {
  return (
    <HomeSectionShell tone={tone} className={className}>
      <SectionHeader
        title={title}
        description={description}
        action={
          <Button asChild variant="ghost" className="hidden sm:inline-flex">
            <Link href="/guides">
              {viewAllLabel}
              <DirectionalArrow />
            </Link>
          </Button>
        }
      />

      {guides.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {guides.map((guide) => {
            const guideTitle = pickLocalized(locale, {
              en: guide.titleEn,
              ur: guide.titleUr,
            });
            const excerpt = pickLocalized(locale, {
              en: guide.excerptEn,
              ur: guide.excerptUr,
            });

            return (
              <Card
                key={guide.slug}
                className="group h-full overflow-hidden border-border/70 p-0 transition-shadow hover:shadow-md"
              >
                <Link href={`/guides/${guide.slug}`} className="flex h-full flex-col">
                  <BlogCardImage post={guide} title={guideTitle} />
                  <CardContent className="flex flex-1 flex-col gap-3 p-5">
                    <h3 className="line-clamp-2 text-lg font-semibold leading-snug group-hover:text-primary">
                      {guideTitle}
                    </h3>
                    {excerpt ? (
                      <p className="line-clamp-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {excerpt}
                      </p>
                    ) : null}
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      {readGuideLabel}
                      <DirectionalArrow className="transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                    </span>
                  </CardContent>
                </Link>
              </Card>
            );
          })}
        </div>
      )}

      <div className="mt-6 flex justify-center sm:hidden">
        <Button asChild variant="outline">
          <Link href="/guides">
            {viewAllLabel}
            <DirectionalArrow />
          </Link>
        </Button>
      </div>
    </HomeSectionShell>
  );
}
