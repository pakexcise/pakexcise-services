import { AlertTriangle } from "lucide-react";
import { getTranslations } from "next-intl/server";

export async function LegalDisclaimer() {
  const t = await getTranslations("disclaimer");

  return (
    <div
      role="note"
      className="border-b border-secondary/30 bg-secondary/15 px-4 py-2 text-center text-sm text-secondary-foreground"
    >
      <div className="container-site flex items-center justify-center gap-2">
        <AlertTriangle className="size-4 shrink-0" aria-hidden="true" />
        <p>{t("banner")}</p>
      </div>
    </div>
  );
}
