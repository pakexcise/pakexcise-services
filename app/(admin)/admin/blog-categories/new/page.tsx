import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { BlogAdminTabs } from "@/features/blog/admin/components/blog-admin-tabs";
import { BlogCategoryEditorForm } from "@/features/blog-categories/admin/components/category-editor-form";
import { emptyBlogCategoryEditorValues } from "@/features/blog-categories/admin/lib/form-defaults";
import { adminBlogCategoryRepository } from "@/server/repositories/admin-blog-category-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.blogCategories");
  return adminMetadata(t("createTitle"));
}

export default async function NewBlogCategoryPage() {
  await enforcePermissionAccess("content:manage")();

  const locale = "en";
    const t = await getTranslations("admin.blogCategories");
  const tForm = await getTranslations("admin.blogCategories.form");

  const [nextOrder, parents] = await Promise.all([
    adminBlogCategoryRepository.getNextDisplayOrder(null),
    adminBlogCategoryRepository.listParentsForSelect(),
  ]);

  return (
    <div className="space-y-6">
      <BlogAdminTabs
        labels={{
          posts: t("tabs.posts"),
          categories: t("tabs.categories"),
        }}
      />

      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />

      <BlogCategoryEditorForm
        mode="create"
        initialValues={emptyBlogCategoryEditorValues(nextOrder)}
        parentOptions={parents.map((parent) => ({
          id: parent.id,
          label: parent.nameEn,
        }))}
        labels={{
          slug: tForm("slug"),
          nameEn: tForm("nameEn"),
          parent: tForm("parent"),
          noParent: tForm("noParent"),
          isActive: tForm("isActive"),
          displayOrder: tForm("displayOrder"),
          save: tForm("save"),
          saving: tForm("saving"),
          saveFailed: tForm("saveFailed"),
          cancel: tForm("cancel"),
        }}
      />
    </div>
  );
}
