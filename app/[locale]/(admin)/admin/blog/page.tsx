import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
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
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { adminBlogRepository } from "@/server/repositories/admin-blog-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type BlogAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(t("title"));
}

function formatCategoryLabel(
  category: { nameEn: string } | null,
  subCategory: { nameEn: string } | null,
): string {
  if (category && subCategory) {
    return `${category.nameEn} › ${subCategory.nameEn}`;
  }

  return category?.nameEn ?? subCategory?.nameEn ?? "—";
}

export default async function AdminBlogPage({ searchParams }: BlogAdminPageProps) {
  await enforcePermissionAccess("content:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.blog");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const status =
    params.status === "published" || params.status === "draft"
      ? params.status
      : "all";

  const result = await adminBlogRepository.listPaginated({
    page,
    pageSize: adminDefaultPageSize,
    q,
    status,
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
            <Link href="/admin/blog/new">
              <Plus className="size-4" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form action="/admin/blog" method="get" className="flex flex-wrap gap-3 rounded-xl border p-4">
        <Input name="q" defaultValue={q ?? ""} placeholder="Search title or slug" className="max-w-sm" />
        <select name="status" defaultValue={status} className="h-10 rounded-md border px-3 text-sm">
          <option value="all">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <div className="overflow-hidden rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead>Updated</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                      {formatCategoryLabel(post.category, post.subCategory)}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={post.isPublished ? "default" : "secondary"}>
                          {post.isPublished ? "Published" : "Draft"}
                        </Badge>
                        {post.isFeatured ? <Badge variant="outline">Featured</Badge> : null}
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
                        isPublished={post.isPublished}
                        labels={{
                          edit: "Edit blog post",
                          publish: "Publish blog post",
                          unpublish: "Move to draft",
                          delete: "Delete blog post",
                          deleteConfirm: "Delete this blog post?",
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
            searchParams={{ ...(q ? { q } : {}), ...(status !== "all" ? { status } : {}) }}
          />
        </>
      )}
    </div>
  );
}
