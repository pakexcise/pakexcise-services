import { LoadingStatus } from "@/components/marketing/loading-status";
import { PageHeroSkeleton } from "@/components/marketing/page-hero-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default function MarketingLoading() {
  return (
    <div className="container-site space-y-8 py-10 md:py-12">
      <LoadingStatus />
      <PageHeroSkeleton />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
      </div>
    </div>
  );
}
