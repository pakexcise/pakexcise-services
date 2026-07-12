import { Skeleton } from "@/components/ui/skeleton";

export default function ApplyLoadingPage() {
  return (
    <div className="container-site space-y-8 py-8 md:py-12">
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3 max-w-md" />
        <Skeleton className="h-4 w-full max-w-xl" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-16 w-full rounded-lg" />
        ))}
      </div>
      <div className="space-y-4 rounded-xl border p-6">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full sm:w-1/2" />
        <Skeleton className="ml-auto h-10 w-32" />
      </div>
    </div>
  );
}
