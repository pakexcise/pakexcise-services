import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.dashboard");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentDashboardPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("agent.dashboard");
  const user = await getCurrentUser();

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">{t("title")}</h1>
      <p className="text-muted-foreground">
        {t("welcome", { name: user?.name ?? user?.email ?? "" })}
      </p>
      <p className="text-sm text-muted-foreground">{t("description")}</p>
    </div>
  );
}
