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
    const text = bannerText?.trim() || "PakExcise.com is a private facilitation service and is not affiliated with any government department.";

  return (
    <div
      role="note"
      className={cn(
        "px-3 py-2",
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
