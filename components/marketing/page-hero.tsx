import { Breadcrumbs, type BreadcrumbItem } from "@/components/marketing/breadcrumbs";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  title: string;
  description?: string | null;
  breadcrumbs?: BreadcrumbItem[];
  className?: string;
};

export function PageHero({
  title,
  description,
  breadcrumbs,
  className,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "border-b bg-gradient-to-b from-primary/5 to-background dark:from-primary/10 dark:to-background",
        className,
      )}
    >
      <div className="container-site space-y-5 py-10 md:space-y-6 md:py-12">
        {breadcrumbs ? <Breadcrumbs items={breadcrumbs} /> : null}
        <div className="space-y-3 md:space-y-4">
          <h1 className="text-bidi-auto text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          {description ? (
            <p className="text-bidi-auto max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
