import { Skeleton } from "@/components/ui/skeleton";

export default function AgentLoading() {
  return (
    <div className="container-site space-y-6 py-8">
      <Skeleton className="h-10 w-full max-w-2xl" />
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}
