export function LoadingStatus() {
  return (
    <div
      className="container-site space-y-6 py-10"
      role="status"
      aria-live="polite"
      aria-label="Loading page"
    >
      <div className="h-8 w-2/3 max-w-md animate-pulse rounded-md bg-muted" />
      <div className="h-4 w-full max-w-2xl animate-pulse rounded-md bg-muted/80" />
      <div className="h-4 w-5/6 max-w-xl animate-pulse rounded-md bg-muted/70" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
        <div className="h-40 animate-pulse rounded-xl bg-muted/60" />
      </div>
    </div>
  );
}
