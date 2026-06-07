"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type TrackFormProps = {
  placeholder: string;
  submitLabel: string;
  helpText: string;
  loginLabel: string;
};

export function TrackForm({
  placeholder,
  submitLabel,
  helpText,
  loginLabel,
}: TrackFormProps) {
  const [trackingId, setTrackingId] = useState("");

  return (
    <div className="mx-auto max-w-xl space-y-4 rounded-xl border bg-card p-6">
      <form
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <label className="block space-y-2">
          <span className="text-sm font-medium">{placeholder}</span>
          <input
            type="text"
            value={trackingId}
            onChange={(event) => setTrackingId(event.target.value)}
            placeholder={placeholder}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            autoComplete="off"
          />
        </label>
        <Button type="submit" className="w-full sm:w-auto" disabled={!trackingId.trim()}>
          {submitLabel}
        </Button>
      </form>
      <p className="text-sm text-muted-foreground">{helpText}</p>
      <Button asChild variant="outline" size="sm">
        <Link href="/login">{loginLabel}</Link>
      </Button>
    </div>
  );
}
