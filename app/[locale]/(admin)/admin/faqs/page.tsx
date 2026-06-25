import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import {
  FaqActiveToggle,
  FaqRowActions,
} from "@/features/faqs/admin/components/faq-list-actions";
import { getFaqListLabels } from "@/features/faqs/admin/lib/labels";
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
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type FaqsAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    categoryId?: string;
    serviceId?: string;
    active?: string;
    featured?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.faqs");
  return adminMetadata(t("title"));
}

export default async function AdminFaqsPage({
  searchParams,
}: FaqsAdminPageProps) {
  await enforcePermissionAccess("faq:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.faqs");
  const params = await searchParams;

  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const categoryId = params.categoryId || undefined;
  const serviceId = params.serviceId || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";
  const featured =
    params.featured === "true" || params.featured === "false"
      ? params.featured
      : "all";

  const [result, services, categories, listLabels] = await Promise.all([
    adminFaqRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      categoryId,
      serviceId,
      active,
      featured,
    }),
    adminServiceRepository.listForSelect(),
    adminFaqCategoryRepository.listForSelect(),
    getFaqListLabels(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/admin/faq-categories">{t("manageCategories")}</Link>
            </Button>
            <Button asChild>
              <Link href="/admin/faqs/new">
                <Plus className="size-4" aria-hidden="true" />
                {t("create")}
              </Link>
            </Button>
          </div>
        }
      />

      <form
        action="/admin/faqs"
        method="get"
        className="grid gap-3 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_160px_180px_140px_140px_auto]"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
        />
        <select
          name="categoryId"
          defaultValue={categoryId ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((item) => (
            <option key={item.id} value={item.id}>
              {locale === "ur" ? item.nameUr : item.nameEn}
            </option>
          ))}
        </select>
        <select
          name="serviceId"
          defaultValue={serviceId ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("allServices")}</option>
          {services.map((service) => (
            <option key={service.id} value={service.id}>
              {locale === "ur" ? service.nameUr : service.nameEn}
            </option>
          ))}
        </select>
        <select
          name="active"
          defaultValue={active}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t("allStatuses")}</option>
          <option value="true">{t("status.active")}</option>
          <option value="false">{t("status.inactive")}</option>
        </select>
        <select
          name="featured"
          defaultValue={featured}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="all">{t("allFeatured")}</option>
          <option value="true">{t("featured.yes")}</option>
          <option value="false">{t("featured.no")}</option>
        </select>
        <Button type="submit" variant="secondary">
          {t("filter")}
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <div className="space-y-4 rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.order")}</TableHead>
                <TableHead>{t("columns.question")}</TableHead>
                <TableHead>{t("columns.category")}</TableHead>
                <TableHead>{t("columns.service")}</TableHead>
                <TableHead>{t("columns.featured")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((faq) => (
                <TableRow key={faq.id}>
                  <TableCell>{faq.displayOrder}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {locale === "ur" ? faq.questionUr : faq.questionEn}
                  </TableCell>
                  <TableCell>
                    {faq.faqCategory
                      ? locale === "ur"
                        ? faq.faqCategory.nameUr
                        : faq.faqCategory.nameEn
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {faq.service
                      ? locale === "ur"
                        ? faq.service.nameUr
                        : faq.service.nameEn
                      : t("globalFaq")}
                  </TableCell>
                  <TableCell>
                    {faq.isFeatured ? t("featured.yes") : t("featured.no")}
                  </TableCell>
                  <TableCell>
                    <FaqActiveToggle faq={faq} labels={listLabels} />
                  </TableCell>
                  <TableCell className="text-right">
                    <FaqRowActions
                      faq={faq}
                      labels={listLabels}
                      siblings={result.items}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="px-4 pb-4">
            <PaginationControls
              page={result.page}
              totalPages={result.totalPages}
              basePath="/admin/faqs"
              searchParams={{
                q,
                categoryId,
                serviceId,
                active: active === "all" ? undefined : active,
                featured: featured === "all" ? undefined : featured,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
