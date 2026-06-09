import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customer.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CustomerDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("customer.dashboard");
  const user = await getCurrentUser();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-muted-foreground">
          {t("welcome", { name: user?.name ?? user?.email ?? "" })}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">{t("trackTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("trackDescription")}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link href="/track">{t("trackCta")}</Link>
          </Button>
        </div>
        <div className="rounded-xl border p-5">
          <h2 className="font-semibold">{t("servicesTitle")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("servicesDescription")}
          </p>
          <Button asChild className="mt-4">
            <Link href="/services">{t("servicesCta")}</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
