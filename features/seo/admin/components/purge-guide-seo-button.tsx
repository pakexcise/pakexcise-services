"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { purgeObsoleteGuideSeoAction } from "@/features/seo/admin/actions/seo-meta-actions";
import { Button } from "@/components/ui/button";

type PurgeGuideSeoButtonProps = {
  count: number;
  labels: {
    title: string;
    description: string;
    action: string;
    pending: string;
  };
};

export function PurgeGuideSeoButton({
  count,
  labels,
}: PurgeGuideSeoButtonProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (count <= 0) return null;

  function handlePurge() {
    setError(null);
    startTransition(async () => {
      const result = await purgeObsoleteGuideSeoAction();
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <section className="rounded-xl border border-amber-500/40 bg-amber-500/5 p-4">
      <h2 className="text-sm font-semibold">{labels.title}</h2>
      <p className="mt-1 text-sm text-muted-foreground">
        {labels.description.replace("{count}", String(count))}
      </p>
      {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
      <div className="mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handlePurge}
        >
          {isPending ? labels.pending : labels.action}
        </Button>
      </div>
    </section>
  );
}
