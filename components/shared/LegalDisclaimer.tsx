import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";

type LegalDisclaimerProps = {
  bannerText?: string | null;
};

export async function LegalDisclaimer({ bannerText }: LegalDisclaimerProps) {
  const t = await getTranslations("disclaimer");
  const text = bannerText?.trim() || t("banner");

  return (
    <div
      role="note"
      className="hidden border-b border-secondary/30 bg-secondary/15 px-3 py-2 text-secondary-foreground xl:block"
    >
      <div className="container-site flex items-start justify-center gap-2 text-center text-xs leading-snug sm:text-sm">
        <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
        <p className="max-w-4xl">{text}</p>
      </div>
    </div>
  );
}
