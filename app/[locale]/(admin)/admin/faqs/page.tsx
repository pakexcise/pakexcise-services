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
import { adminFaqRepository } from "@/server/repositories/admin-faq-repository";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type FaqsAdminPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    category?: string;
    serviceId?: string;
    active?: string;
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
  const category = params.category?.trim() || undefined;
  const serviceId = params.serviceId || undefined;
  const active =
    params.active === "true" || params.active === "false"
      ? params.active
      : "all";

  const [result, services, categories, listLabels] = await Promise.all([
    adminFaqRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      category,
      serviceId,
      active,
    }),
    adminServiceRepository.listForSelect(),
    adminFaqRepository.listCategories(),
    getFaqListLabels(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/faqs/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form
        action="/admin/faqs"
        method="get"
        className="grid gap-3 rounded-xl border p-4 md:grid-cols-[minmax(0,1fr)_160px_200px_160px_auto]"
      >
        <Input
          name="q"
          defaultValue={q ?? ""}
          placeholder={t("searchPlaceholder")}
        />
        <select
          name="category"
          defaultValue={category ?? ""}
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
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
                  <TableCell className="font-mono text-xs">{faq.category}</TableCell>
                  <TableCell>
                    {faq.service
                      ? locale === "ur"
                        ? faq.service.nameUr
                        : faq.service.nameEn
                      : t("globalFaq")}
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
                category,
                serviceId,
                active: active === "all" ? undefined : active,
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
