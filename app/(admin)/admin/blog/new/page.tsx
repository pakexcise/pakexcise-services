import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { BlogEditorForm } from "@/features/blog/admin/components/blog-editor-form";
import { createEmptyBlogValues } from "@/features/blog/lib/editor-defaults";
import { loadBlogCategoryOptions } from "@/features/cms/lib/load-blog-category-options";
import { loadCmsEditorOptions } from "@/features/cms/lib/load-editor-options";
import { adminMetadata } from "@/features/admin/lib/metadata";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(`${t("create")} | ${t("title")}`);
}

export default async function AdminBlogNewPage() {
  const locale = "en";
    const t = await getTranslations("admin.resources.blog");
  const [options, categoryOptions] = await Promise.all([
    loadCmsEditorOptions(),
    loadBlogCategoryOptions(locale),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("create")} description={t("description")} />
      <BlogEditorForm
        mode="create"
        initialValues={createEmptyBlogValues()}
        services={options.services}
        faqs={options.faqs}
        categoryParents={categoryOptions.parents}
        categoryChildrenByParent={categoryOptions.childrenByParent}
      />
    </div>
  );
}
