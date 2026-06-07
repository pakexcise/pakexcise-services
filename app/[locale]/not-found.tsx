import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("common");

  return {
    title: t("notFoundTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function NotFoundPage() {
  const t = await getTranslations("common");

  return (
    <div className="container-site flex min-h-[50vh] flex-col items-center justify-center py-16 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="mt-2 text-3xl font-bold">{t("notFoundTitle")}</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        {t("notFoundDescription")}
      </p>
      <Button asChild className="mt-6">
        <Link href="/">{t("backHome")}</Link>
      </Button>
    </div>
  );
}
