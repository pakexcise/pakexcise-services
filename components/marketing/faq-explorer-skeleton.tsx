import { Skeleton } from "@/components/ui/skeleton";

type FaqExplorerSkeletonProps = {
  categoryCount?: number;
  itemsPerCategory?: number;
};

function FaqAccordionItemSkeleton() {
  return (
    <div className="rounded-xl border border-border/80 bg-card p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-full max-w-2xl rounded-md" />
          <Skeleton className="h-4 w-4/5 max-w-xl rounded-md" />
        </div>
        <Skeleton className="size-5 shrink-0 rounded-md" />
      </div>
    </div>
  );
}

export function FaqExplorerSkeleton({
  categoryCount = 2,
  itemsPerCategory = 3,
}: FaqExplorerSkeletonProps) {
  return (
    <div aria-hidden="true" className="space-y-6">
      <div className="space-y-4 rounded-2xl border bg-card/60 p-4 md:p-5">
        <Skeleton className="h-10 w-full rounded-md" />

        <div className="flex gap-2 overflow-hidden pb-1">
          <Skeleton className="h-9 w-28 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-32 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-36 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-24 shrink-0 rounded-full" />
          <Skeleton className="h-9 w-32 shrink-0 rounded-full" />
        </div>

        <Skeleton className="h-4 w-40 max-w-[60vw] rounded-md" />
      </div>

      <div className="space-y-10">
        {Array.from({ length: categoryCount }).map((_, categoryIndex) => (
          <section key={categoryIndex} className="space-y-4">
            <Skeleton className="h-7 w-56 max-w-[70vw] rounded-md md:h-8" />
            <div className="space-y-3">
              {Array.from({ length: itemsPerCategory }).map((__, itemIndex) => (
                <FaqAccordionItemSkeleton key={itemIndex} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
