import { AlertTriangle } from "lucide-react";

import { cn } from "@/lib/utils";

type DisclaimerBoxProps = {
  text: string;
  className?: string;
};

export function DisclaimerBox({ text, className }: DisclaimerBoxProps) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-3 rounded-xl border border-secondary/30 bg-secondary/10 p-4 text-sm leading-relaxed",
        className,
      )}
    >
      <AlertTriangle
        className="mt-0.5 size-4 shrink-0 text-secondary-foreground"
        aria-hidden="true"
      />
      <p>{text}</p>
    </div>
  );
}
