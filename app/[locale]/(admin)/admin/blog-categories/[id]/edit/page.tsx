import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { BlogAdminTabs } from "@/features/blog/admin/components/blog-admin-tabs";
import { BlogCategoryDeleteButton } from "@/features/blog-categories/admin/components/category-delete-button";
import { BlogCategoryEditorForm } from "@/features/blog-categories/admin/components/category-editor-form";
import { blogCategoryDetailToEditorValues } from "@/features/blog-categories/admin/lib/form-defaults";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { adminBlogCategoryRepository } from "@/server/repositories/admin-blog-category-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type EditBlogCategoryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.blogCategories");
  return adminMetadata(t("editTitle"));
}

export default async function EditBlogCategoryPage({
  params,
}: EditBlogCategoryPageProps) {
  await enforcePermissionAccess("content:manage")();

  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.blogCategories");
  const tForm = await getTranslations("admin.blogCategories.form");

  const [category, parents] = await Promise.all([
    adminBlogCategoryRepository.findById(id),
    adminBlogCategoryRepository.listParentsForSelect(),
  ]);

  if (!category) {
    notFound();
  }

  const postCount = adminBlogCategoryRepository.getAssignedPostCount(category);

  return (
    <div className="space-y-6">
      <BlogAdminTabs
        labels={{
          posts: t("tabs.posts"),
          categories: t("tabs.categories"),
        }}
      />

      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription", {
          name: locale === "ur" ? category.nameUr : category.nameEn,
        })}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/blog-categories">{t("backToList")}</Link>
            </Button>
            <BlogCategoryDeleteButton
              categoryId={category.id}
              postCount={postCount}
              childCount={category._count.children}
              labels={{
                delete: t("actions.delete"),
                confirmDelete: t("actions.confirmDelete"),
                deleteBlocked: t("actions.deleteBlocked"),
              }}
            />
          </div>
        }
      />

      <BlogCategoryEditorForm
        mode="edit"
        categoryId={category.id}
        initialValues={blogCategoryDetailToEditorValues(category)}
        parentOptions={parents.map((parent) => ({
          id: parent.id,
          label: locale === "ur" ? parent.nameUr : parent.nameEn,
        }))}
        labels={{
          slug: tForm("slug"),
          nameEn: tForm("nameEn"),
          nameUr: tForm("nameUr"),
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
