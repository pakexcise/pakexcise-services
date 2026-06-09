import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { RedirectEditorForm } from "@/features/redirects/admin/components/redirect-editor-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.redirects");
  return adminMetadata(`${t("create")} | ${t("title")}`);
}

export default async function AdminRedirectNewPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
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
