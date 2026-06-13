"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { updateAdminNotesAction } from "@/features/applications/actions";
import { broadcastApplicationUpdate } from "@/features/realtime/broadcast-application-update";

type AdminNotesFormProps = {
  applicationId: string;
  initialNotes: string;
  labels: {
    save: string;
    saving: string;
    saved: string;
    error: string;
    placeholder: string;
  };
};

export function AdminNotesForm({
  applicationId,
  initialNotes,
  labels,
}: AdminNotesFormProps) {
  const router = useRouter();
  const [notes, setNotes] = useState(initialNotes);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setError(null);

    startTransition(async () => {
      const result = await updateAdminNotesAction({
        applicationId,
        notes,
      });

      if (!result.success) {
        setError(result.error ?? labels.error);
        return;
      }

      setMessage(labels.saved);
      broadcastApplicationUpdate();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder={labels.placeholder}
        rows={6}
        disabled={isPending}
      />

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {message ? (
        <p className="text-sm text-primary" role="status">
          {message}
        </p>
      ) : null}

      <Button type="submit" size="sm" disabled={isPending}>
        {isPending ? labels.saving : labels.save}
      </Button>
    </form>
  );
}
