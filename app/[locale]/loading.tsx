import { LoadingStatus } from "@/components/marketing/loading-status";
import { PageHeroSkeleton } from "@/components/marketing/page-hero-skeleton";
import { Skeleton } from "@/components/ui/skeleton";

export default async function LoadingPage() {
  return (
    <>
      <LoadingStatus />
      <PageHeroSkeleton showBreadcrumbs={false} descriptionLines={1} />
      <div className="container-site space-y-6 py-10 md:py-12">
        <div className="space-y-3">
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
          <Skeleton className="h-24 w-full rounded-xl" />
        </div>
      </div>
    </>
  );
}
