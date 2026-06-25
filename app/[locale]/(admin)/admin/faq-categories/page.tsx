import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
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
import { adminFaqCategoryRepository } from "@/server/repositories/admin-faq-category-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type FaqCategoriesAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    active?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqCategories");
  return adminMetadata(t("title"));
}

export default async function AdminFaqCategoriesPage({
  searchParams,
}: FaqCategoriesAdminPageProps) {
  await enforcePermissionAccess("faq:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.faqCategories");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";

  const result = await adminFaqCategoryRepository.listPaginated({
    page,
    pageSize: adminDefaultPageSize,
    q,
    active,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/faq-categories/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form
        action="/admin/faq-categories"
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
          <div className="rounded-xl border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.order")}</TableHead>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.slug")}</TableHead>
                  <TableHead>{t("columns.faqs")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead className="text-end">{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.displayOrder}</TableCell>
                    <TableCell>
                      {locale === "ur" ? category.nameUr : category.nameEn}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{category.slug}</TableCell>
                    <TableCell>{category._count.faqs}</TableCell>
                    <TableCell>
                      {category.isActive ? t("status.active") : t("status.inactive")}
                    </TableCell>
                    <TableCell className="text-end">
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/admin/faq-categories/${category.id}/edit`}>
                          {t("actions.edit")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/faq-categories"
            searchParams={{ q, active: active === "all" ? undefined : active }}
          />
        </>
      )}
    </div>
  );
}
