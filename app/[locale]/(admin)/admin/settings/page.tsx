import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminResourceListPage } from "@/features/admin/components/admin-resource-list-page";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { requireRole } from "@/server/permissions/guards";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.settings"));
}

export default async function AdminSettingsPage() {
  await requireRole("SUPER_ADMIN");

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  return (
    <AdminResourceListPage
      title={t("resources.settings.title")}
      description={t("resources.settings.description")}
      emptyTitle={t("resources.settings.emptyTitle")}
      emptyDescription={t("resources.settings.emptyDescription")}
    />
  );
}
