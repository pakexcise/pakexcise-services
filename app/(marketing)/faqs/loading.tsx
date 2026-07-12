import { FaqExplorerSkeleton } from "@/components/marketing/faq-explorer-skeleton";
import { LoadingStatus } from "@/components/marketing/loading-status";
import { PageHeroSkeleton } from "@/components/marketing/page-hero-skeleton";

export default async function FaqsLoadingPage() {
  return (
    <>
      <LoadingStatus />
      <PageHeroSkeleton />
      <div className="container-site py-10 md:py-12">
        <FaqExplorerSkeleton categoryCount={3} itemsPerCategory={3} />
      </div>
    </>
  );
}
