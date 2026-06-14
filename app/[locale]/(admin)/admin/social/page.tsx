import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SocialLinksPanel } from "@/features/social/admin/components/social-links-panel";
import { getSocialPanelLabels } from "@/features/social/admin/lib/labels";
import { adminSocialRepository } from "@/server/repositories/admin-social-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.social");
  return adminMetadata(t("title"));
}

export default async function AdminSocialPage() {
  await enforcePermissionAccess("social:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.social");

  const [links, nextDisplayOrder, labels] = await Promise.all([
    adminSocialRepository.listAll(),
    adminSocialRepository.getNextDisplayOrder(),
    getSocialPanelLabels(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <SocialLinksPanel
        links={links}
        labels={labels}
        nextDisplayOrder={nextDisplayOrder}
      />
    </div>
  );
}
