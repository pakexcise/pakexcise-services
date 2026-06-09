import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import {
  BlogPublishToggle,
  BlogRowActions,
} from "@/features/blog/admin/components/blog-list-actions";
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

type BlogAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string; status?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.blog");
  return adminMetadata(t("title"));
}

export default async function AdminBlogPage({ searchParams }: BlogAdminPageProps) {
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>{post.titleEn}</TableCell>
                  <TableCell className="font-mono text-xs">{post.slug}</TableCell>
                  <TableCell>
                    <Badge variant={post.isPublished ? "default" : "secondary"}>
                      {post.isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(post.updatedAt, locale)}</TableCell>
                  <TableCell className="space-x-2">
                    <BlogPublishToggle id={post.id} isPublished={post.isPublished} />
                    <BlogRowActions id={post.id} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
