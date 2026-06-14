import { Info } from "lucide-react";

import { cn } from "@/lib/utils";

type AdminScopeNoticeProps = {
  message: string;
  className?: string;
};

export function AdminScopeNotice({ message, className }: AdminScopeNoticeProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-2.5 text-sm text-muted-foreground",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden="true" />
      <p>{message}</p>
    </div>
  );
}
