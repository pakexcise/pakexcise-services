import { AlertTriangle } from "lucide-react";

import {
  disclaimerBannerIconClassName,
  disclaimerBoxClassName,
} from "@/lib/styles/disclaimer-banner";
import { cn } from "@/lib/utils";

type DisclaimerBoxProps = {
  text: string;
  className?: string;
};

export function DisclaimerBox({ text, className }: DisclaimerBoxProps) {
  return (
    <div role="note" className={cn("flex gap-3", disclaimerBoxClassName, className)}>
      <AlertTriangle
        className={cn("mt-0.5 size-4", disclaimerBannerIconClassName)}
        aria-hidden="true"
      />
      <p>{text}</p>
    </div>
  );
}
