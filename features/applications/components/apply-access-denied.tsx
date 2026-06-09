import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";

type ApplyAccessDeniedProps = {
  title: string;
  description: string;
  loginLabel: string;
  dashboardLabel: string;
  loginHref: string;
  dashboardHref: string;
};

export function ApplyAccessDenied({
  title,
  description,
  loginLabel,
  dashboardLabel,
  loginHref,
  dashboardHref,
}: ApplyAccessDeniedProps) {
  return (
    <div className="mx-auto max-w-lg space-y-6 rounded-xl border bg-card p-8 text-center shadow-sm">
      <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </div>
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button asChild>
          <Link href={loginHref}>{loginLabel}</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href={dashboardHref}>{dashboardLabel}</Link>
        </Button>
      </div>
    </div>
  );
}
