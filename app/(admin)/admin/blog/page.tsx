import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { BlogRowActions } from "@/features/blog/admin/components/blog-list-actions";
import { BlogAdminTabs } from "@/features/blog/admin/components/blog-admin-tabs";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
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
import { formatDate } from "@/lib/utils";
import { adminBlogRepository } from "@/server/repositories/admin-blog-repository";
import { adminBlogCategoryRepository } from "@/server/repositories/admin-blog-category-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type BlogAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    categoryId?: string;
    subCategoryId?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(t("title"));
}

function formatCategoryLabel(
  locale: string,
  category: { nameEn: string } | null,
  subCategory: { nameEn: string } | null,
): string {
  const categoryLabel = category
    ? category.nameEn
    : null;
  const subCategoryLabel = subCategory
    ? subCategory.nameEn
    : null;

  if (categoryLabel && subCategoryLabel) {
    return `${categoryLabel} › ${subCategoryLabel}`;
  }

  return categoryLabel ?? subCategoryLabel ?? "—";
}

export default async function AdminBlogPage({ searchParams }: BlogAdminPageProps) {
  await enforcePermissionAccess("content:manage")();

  const locale = "en";
    const t = await getTranslations("admin.resources.blog");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const status =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";
  const categoryId = params.categoryId?.trim() || undefined;
  const subCategoryId = params.subCategoryId?.trim() || undefined;

  const [result, categories] = await Promise.all([
    adminBlogRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      status,
      categoryId,
      subCategoryId,
    }),
    adminBlogCategoryRepository.listForFilter(),
  ]);

  const parentCategories = categories.filter((category) => !category.parentId);
  const subCategories = categoryId
    ? categories.filter((category) => category.parentId === categoryId)
    : [];

  const paginationSearchParams = {
    ...(q ? { q } : {}),
    ...(status !== "all" ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(subCategoryId ? { subCategoryId } : {}),
  };

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
            <Link href="/admin/blog/new">
              <Plus className="size-4" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form action="/admin/blog" method="get" className="flex flex-wrap gap-3 rounded-xl border p-4">
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
          className="max-w-sm"
        />
        <select
          name="categoryId"
          defaultValue={categoryId ?? ""}
          className="h-10 max-w-[220px] rounded-md border px-3 text-sm"
        >
          <option value="">{t("filters.allCategories")}</option>
          {parentCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </select>
        <select
          name="subCategoryId"
          defaultValue={subCategoryId ?? ""}
          disabled={!categoryId || subCategories.length === 0}
          className="h-10 max-w-[220px] rounded-md border px-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="">{t("filters.allSubCategories")}</option>
          {subCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.nameEn}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={status} className="h-10 rounded-md border px-3 text-sm">
          <option value="all">{t("filters.allStatuses")}</option>
          <option value="published">{t("status.published")}</option>
          <option value="draft">{t("status.draft")}</option>
        </select>
        <Button type="submit">{t("filters.apply")}</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.title")}</TableHead>
                  <TableHead>{t("columns.category")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.published")}</TableHead>
                  <TableHead>{t("columns.updated")}</TableHead>
                  <TableHead className="text-right">{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="max-w-[320px]">
                      <div className="space-y-1">
                        <p className="line-clamp-2 font-medium text-foreground">{post.titleEn}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[220px] text-sm">
                      {formatCategoryLabel(locale, post.category, post.subCategory)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                          {post.isPublished ? t("status.published") : t("status.draft")}
                        </Badge>
                        {post.isFeatured ? (
                          <Badge variant="outline">{t("status.featured")}</Badge>
                        ) : null}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {post.publishedAt ? formatDate(post.publishedAt, locale) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(post.updatedAt, locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <BlogRowActions
                        id={post.id}
                        slug={post.slug}
                        isPublished={post.isPublished}
                        labels={{
                          edit: t("actions.edit"),
                          preview: t("actions.preview"),
                          previewDisabled: t("actions.previewDisabled"),
                          publish: t("actions.publish"),
                          unpublish: t("actions.unpublish"),
                          delete: t("actions.delete"),
                          deleteConfirm: t("actions.deleteConfirm"),
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/blog"
            searchParams={paginationSearchParams}
          />
        </>
      )}
    </div>
  );
}
