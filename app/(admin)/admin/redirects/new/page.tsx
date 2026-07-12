import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { RedirectEditorForm } from "@/features/redirects/admin/components/redirect-editor-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.redirects");
  return adminMetadata(`${t("create")} | ${t("title")}`);
}

export default async function AdminRedirectNewPage() {
  await enforcePlatformManageAccess();

  const locale = "en";
    const t = await getTranslations("admin.resources.redirects");

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("create")} description={t("description")} />
      <RedirectEditorForm
        mode="create"
        initialValues={{
          oldSlug: "",
          newSlug: "",
          statusCode: 301,
          isActive: true,
        }}
      />
    </div>
  );
}
