import { FileText } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

type ApplyPageShellProps = {
  serviceName: string;
  regionLabel: string;
  children: ReactNode;
};

export function ApplyPageShell({
  serviceName,
  regionLabel,
  children,
}: ApplyPageShellProps) {
  return (
    <div className="container-site py-8 md:py-12">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start gap-3 rounded-xl border bg-muted/30 p-4 sm:p-5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{regionLabel}</p>
            <h2 className="text-lg font-semibold leading-snug sm:text-xl">{serviceName}</h2>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardContent className="p-5 sm:p-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
