"use client";

import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type AdminErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[admin-error]", error);
  }, [error]);

  return (
    <div className="mx-auto flex max-w-lg flex-col items-start gap-4 rounded-xl border bg-card p-6">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Admin page failed to load</h1>
        <p className="text-sm text-muted-foreground">
          Something went wrong while loading this admin view. You can retry, or
          open the dashboard again.
        </p>
        {error.digest ? (
          <p className="font-mono text-xs text-muted-foreground">
            Digest: {error.digest}
          </p>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={reset}>
          Try again
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href="/admin/dashboard">Go to dashboard</a>
        </Button>
      </div>
    </div>
  );
}
