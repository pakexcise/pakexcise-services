"use client";

import { Briefcase, UserRound } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { selectAccountRole } from "@/features/auth/actions/select-role";
import { parseAuthIntent } from "@/features/auth/lib/auth-url";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ChooseRoleFormLabels = {
  customerTitle: string;
  customerDescription: string;
  agentTitle: string;
  agentDescription: string;
  agentNote: string;
  continueLabel: string;
  continuing: string;
  selectRole: string;
  failed: string;
};

type ChooseRoleFormProps = {
  labels: ChooseRoleFormLabels;
};

type RoleChoice = "CUSTOMER" | "AGENT";

export function ChooseRoleForm({ labels }: ChooseRoleFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const defaultRole: RoleChoice =
    parseAuthIntent(searchParams.get("intent")) === "agent" ? "AGENT" : "CUSTOMER";

  const [selectedRole, setSelectedRole] = useState<RoleChoice>(defaultRole);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await selectAccountRole({
        role: selectedRole,
        callbackUrl: callbackUrl ?? undefined,
      });

      if (!result.ok) {
        setError(labels.failed);
        return;
      }

      router.push(result.redirectTo);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setSelectedRole("CUSTOMER")}
          className={cn(
            "rounded-xl border p-4 text-start transition-colors",
            selectedRole === "CUSTOMER"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/40",
          )}
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <UserRound className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-3 block font-semibold">{labels.customerTitle}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {labels.customerDescription}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("AGENT")}
          className={cn(
            "rounded-xl border p-4 text-start transition-colors",
            selectedRole === "AGENT"
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-border hover:border-primary/40",
          )}
        >
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-secondary/20 text-secondary-foreground">
            <Briefcase className="size-5" aria-hidden="true" />
          </span>
          <span className="mt-3 block font-semibold">{labels.agentTitle}</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            {labels.agentDescription}
          </span>
        </button>
      </div>

      {selectedRole === "AGENT" ? (
        <p className="rounded-lg border border-secondary/30 bg-secondary/10 px-3 py-2 text-xs text-muted-foreground">
          {labels.agentNote}
        </p>
      ) : null}

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? labels.continuing : labels.continueLabel}
      </Button>
    </form>
  );
}
