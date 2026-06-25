import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type PageHeroSkeletonProps = {
  className?: string;
  showBreadcrumbs?: boolean;
  descriptionLines?: 1 | 2;
};

export function PageHeroSkeleton({
  className,
  showBreadcrumbs = true,
  descriptionLines = 2,
}: PageHeroSkeletonProps) {
  return (
    <section
      aria-hidden="true"
      className={cn(
        "border-b bg-gradient-to-b from-primary/5 to-background dark:from-primary/10 dark:to-background",
        className,
      )}
    >
      <div className="container-site space-y-5 py-10 md:space-y-6 md:py-12">
        {showBreadcrumbs ? (
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-4 w-14 rounded-md" />
            <Skeleton className="size-3 rounded-full" />
            <Skeleton className="h-4 w-28 max-w-[45vw] rounded-md" />
          </div>
        ) : null}

        <div className="space-y-3 md:space-y-4">
          <Skeleton className="h-9 w-full max-w-xl rounded-lg sm:h-10" />
          {descriptionLines >= 1 ? (
            <Skeleton className="h-4 w-full max-w-3xl rounded-md" />
          ) : null}
          {descriptionLines >= 2 ? (
            <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
          ) : null}
        </div>
      </div>
    </section>
  );
}
