import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { BlogAdminTabs } from "@/features/blog/admin/components/blog-admin-tabs";
import { BlogCategoryRowActions } from "@/features/blog-categories/admin/components/category-list-actions";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminDefaultPageSize } from "@/config/admin";
import { Link } from "@/i18n/navigation";
import { adminBlogCategoryRepository } from "@/server/repositories/admin-blog-category-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type BlogCategoriesAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    active?: string;
    level?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.blogCategories");
  return adminMetadata(t("title"));
}

export default async function AdminBlogCategoriesPage({
  searchParams,
}: BlogCategoriesAdminPageProps) {
  await enforcePermissionAccess("content:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.blogCategories");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";
  const level =
    params.level === "parent" || params.level === "sub" ? params.level : "all";

  const result = await adminBlogCategoryRepository.listPaginated({
    page,
    pageSize: adminDefaultPageSize,
    q,
    active,
    level,
  });

  return (
    <div className="space-y-6">
      <BlogAdminTabs
        labels={{
          posts: t("tabs.posts"),
          categories: t("tabs.categories"),
        }}
      />

      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/blog-categories/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form
        action="/admin/blog-categories"
        method="get"
        className="flex flex-wrap gap-3 rounded-xl border p-4"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="max-w-xs"
        />
        <select
          name="level"
          defaultValue={level}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t("filters.allLevels")}</option>
          <option value="parent">{t("filters.parentsOnly")}</option>
          <option value="sub">{t("filters.subOnly")}</option>
        </select>
        <select
          name="active"
          defaultValue={active}
          className="flex h-10 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t("filters.all")}</option>
          <option value="true">{t("status.active")}</option>
          <option value="false">{t("status.inactive")}</option>
        </select>
        <Button type="submit" variant="secondary">
          {t("filters.apply")}
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.order")}</TableHead>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.slug")}</TableHead>
                  <TableHead>{t("columns.type")}</TableHead>
                  <TableHead>{t("columns.parent")}</TableHead>
                  <TableHead>{t("columns.posts")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead className="text-end">{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((category) => {
                  const postCount =
                    adminBlogCategoryRepository.getAssignedPostCount(category);
                  const name = locale === "ur" ? category.nameUr : category.nameEn;
                  const parentName = category.parent
                    ? locale === "ur"
                      ? category.parent.nameUr
                      : category.parent.nameEn
                    : "—";

                  return (
                    <TableRow key={category.id}>
                      <TableCell>{category.displayOrder}</TableCell>
                      <TableCell className="max-w-[240px] font-medium">{name}</TableCell>
                      <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                      <TableCell>
                        <Badge variant={category.parentId ? "outline" : "secondary"}>
                          {category.parentId
                            ? t("types.subCategory")
                            : t("types.category")}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] text-sm">{parentName}</TableCell>
                      <TableCell>{postCount}</TableCell>
                      <TableCell>
                        {category.isActive ? t("status.active") : t("status.inactive")}
                      </TableCell>
                      <TableCell className="text-end">
                        <BlogCategoryRowActions
                          id={category.id}
                          isActive={category.isActive}
                          postCount={postCount}
                          childCount={category._count.children}
                          labels={{
                            edit: t("actions.edit"),
                            activate: t("actions.activate"),
                            deactivate: t("actions.deactivate"),
                            delete: t("actions.delete"),
                            deleteConfirm: t("actions.confirmDelete"),
                            deleteBlocked: t("actions.deleteBlocked"),
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/blog-categories"
            searchParams={{
              ...(q ? { q } : {}),
              ...(active !== "all" ? { active } : {}),
              ...(level !== "all" ? { level } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
