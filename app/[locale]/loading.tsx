import { Loader2 } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function LoadingPage() {
  const t = await getTranslations("common");

  return (
    <div className="container-site flex min-h-[40vh] flex-col items-center justify-center py-16">
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-hidden="true"
      />
      <p className="mt-4 text-sm text-muted-foreground">{t("loading")}</p>
    </div>
  );
}
