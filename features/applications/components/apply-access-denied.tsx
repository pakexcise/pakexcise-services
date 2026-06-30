import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import type { ApplyAccessResult } from "@/server/permissions/apply-access";

type ApplyAccessDeniedProps = {
  access: Extract<ApplyAccessResult, { allowed: false }>;
  serviceHref: string;
  dashboardHref: string;
  labels: {
    forbiddenTitle: string;
    forbiddenDescription: string;
    agentNotApprovedTitle: string;
    agentNotApprovedDescription: string;
    goToDashboard: string;
    viewService: string;
    staffAccountHint: string;
  };
};

export function ApplyAccessDenied({
  access,
  serviceHref,
  dashboardHref,
  labels,
}: ApplyAccessDeniedProps) {
  const isAgentPending = access.reason === "AGENT_NOT_APPROVED";

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
        <AlertCircle className="size-6" aria-hidden="true" />
      </div>

      <div className="space-y-2">
        <h2 className="text-bidi-auto text-xl font-semibold">
          {isAgentPending ? labels.agentNotApprovedTitle : labels.forbiddenTitle}
        </h2>
        <p className="text-bidi-auto text-sm leading-relaxed text-muted-foreground">
          {isAgentPending
            ? labels.agentNotApprovedDescription
            : labels.forbiddenDescription}
        </p>
        {!isAgentPending && access.reason === "FORBIDDEN" ? (
          <p className="text-bidi-auto text-sm leading-relaxed text-muted-foreground">
            {labels.staffAccountHint}
          </p>
        ) : null}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild variant="outline">
          <Link href={serviceHref}>{labels.viewService}</Link>
        </Button>
        <Button asChild>
          <Link href={dashboardHref}>{labels.goToDashboard}</Link>
        </Button>
      </div>
    </div>
  );
}
