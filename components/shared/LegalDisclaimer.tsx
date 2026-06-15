import { getTranslations } from "next-intl/server";

import { disclaimerBannerClassName } from "@/lib/styles/disclaimer-banner";
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
      <p className="container-site text-center text-xs leading-snug sm:text-sm">
        {text}
      </p>
    </div>
  );
}
