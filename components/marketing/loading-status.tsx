import { getTranslations } from "next-intl/server";

export async function LoadingStatus() {
  const t = await getTranslations("common");

  return (
    <p role="status" aria-live="polite" className="sr-only">
      {t("loading")}
    </p>
  );
}
