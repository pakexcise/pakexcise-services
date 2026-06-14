import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";

import {
  disclaimerBannerClassName,
  disclaimerBannerIconClassName,
} from "@/lib/styles/disclaimer-banner";
import { cn } from "@/lib/utils";

type LegalDisclaimerProps = {
  bannerText?: string | null;
  embedded?: boolean;
};

export async function LegalDisclaimer({
  bannerText,
  embedded = false,
}: LegalDisclaimerProps) {
  const t = await getTranslations("disclaimer");
  const text = bannerText?.trim() || t("banner");

  return (
    <div
      role="note"
      className={cn(
        "hidden px-3 py-2 xl:block",
        embedded ? "border-b border-border/60" : "border-b",
        disclaimerBannerClassName,
      )}
    >
      <div className="container-site flex items-start justify-center gap-2 text-center text-xs leading-snug sm:text-sm">
        <AlertTriangle
          className={cn("mt-0.5 size-4", disclaimerBannerIconClassName)}
          aria-hidden="true"
        />
        <p className="max-w-4xl">{text}</p>
      </div>
    </div>
  );
}
