import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  createEmptyGuideValues,
  GuideEditorForm,
} from "@/features/guides/admin/components/guide-editor-form";
import { loadCmsEditorOptions } from "@/features/cms/lib/load-editor-options";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.guides");
  return adminMetadata(`${t("create")} | ${t("title")}`);
}

export default async function AdminGuideNewPage() {
  await enforcePlatformManageAccess();

  const locale = "en";
    const t = await getTranslations("admin.resources.guides");
  const options = await loadCmsEditorOptions();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("create")} description={t("description")} />
      <GuideEditorForm
        mode="create"
        initialValues={createEmptyGuideValues()}
        services={options.services}
        faqs={options.faqs}
      />
    </div>
  );
}
