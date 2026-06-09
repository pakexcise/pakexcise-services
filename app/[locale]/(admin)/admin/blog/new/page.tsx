import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import {
  BlogEditorForm,
  createEmptyBlogValues,
} from "@/features/blog/admin/components/blog-editor-form";
import { loadCmsEditorOptions } from "@/features/cms/lib/load-editor-options";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(`${t("create")} | ${t("title")}`);
}

export default async function AdminBlogNewPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.blog");
  const options = await loadCmsEditorOptions();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("create")} description={t("description")} />
      <BlogEditorForm
        mode="create"
        initialValues={createEmptyBlogValues()}
        services={options.services}
        faqs={options.faqs}
      />
    </div>
  );
}
