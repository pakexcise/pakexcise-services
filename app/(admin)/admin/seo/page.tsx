import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SeoHealthPanel } from "@/features/seo/admin/components/seo-health-panel";
import { PurgeGuideSeoButton } from "@/features/seo/admin/components/purge-guide-seo-button";
import { resolveSeoLinkedEntity } from "@/features/seo/admin/lib/seo-linked-entity";
import { getSeoHealthSnapshot } from "@/features/seo/admin/lib/seo-health";
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
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type MissingFilter = "title" | "description" | "h1" | "keywords";

type SeoAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string; missing?: string }>;
};

function truncate(value: string | null | undefined, max = 80): string {
  const text = value?.trim() ?? "";
  if (!text) return "—";
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function parseMissing(value: string | undefined): MissingFilter | undefined {
  if (
    value === "title" ||
    value === "description" ||
    value === "h1" ||
    value === "keywords"
  ) {
    return value;
  }
  return undefined;
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.seo");
  return adminMetadata(t("title"));
}

export default async function AdminSeoPage({ searchParams }: SeoAdminPageProps) {
  await enforcePlatformManageAccess();

  const locale = "en";
  const t = await getTranslations("admin.resources.seo");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const missing = parseMissing(params.missing);

  const [result, health, obsoleteGuideCount] = await Promise.all([
    adminSeoRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
      missing,
    }),
    getSeoHealthSnapshot(),
    adminSeoRepository.countObsoleteGuideRecords(),
  ]);

  const missingFilters: Array<{ value: "" | MissingFilter; label: string }> = [
    { value: "", label: t("filters.all") },
    { value: "title", label: t("filters.missingTitle") },
    { value: "description", label: t("filters.missingDescription") },
    { value: "h1", label: t("filters.missingH1") },
    { value: "keywords", label: t("filters.missingKeywords") },
  ];

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (missing) exportParams.set("missing", missing);
  const exportHref = exportParams.toString()
    ? `/api/admin/seo/export?${exportParams.toString()}`
    : "/api/admin/seo/export";
  const fullListHref = (() => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (missing) params.set("missing", missing);
    const query = params.toString();
    return query ? `/admin/seo/full?${query}` : "/admin/seo/full";
  })();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />

      <SeoHealthPanel
        health={health}
        labels={{
          title: t("health.title"),
          description: t("health.description"),
          appEnv: t("health.appEnv"),
          indexing: t("health.indexing"),
          indexingOn: t("health.indexingOn"),
          indexingOff: t("health.indexingOff"),
          canonicalBase: t("health.canonicalBase"),
          sitemap: t("health.sitemap"),
          sitemapOn: t("health.sitemapOn"),
          sitemapOff: t("health.sitemapOff"),
          robots: t("health.robots"),
          llms: t("health.llms"),
          googleVerification: t("health.googleVerification"),
          bingVerification: t("health.bingVerification"),
          ga4: t("health.ga4"),
          gtm: t("health.gtm"),
          configured: t("health.configured"),
          missing: t("health.missing"),
          seoRecords: t("health.seoRecords"),
          missingTitles: t("health.missingTitles"),
          missingDescriptions: t("health.missingDescriptions"),
          missingH1s: t("health.missingH1s"),
        }}
      />

      <PurgeGuideSeoButton
        count={obsoleteGuideCount}
        labels={{
          title: t("purgeGuides.title"),
          description: t("purgeGuides.description"),
          action: t("purgeGuides.action"),
          pending: t("purgeGuides.pending"),
        }}
      />

      <section className="rounded-xl border p-4">
        <h2 className="text-sm font-semibold">{t("legalPagesLinkTitle")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("legalPagesLinkDescription")}
        </p>
        <div className="mt-4">
          <Button size="sm" variant="outline" asChild>
            <Link href="/admin/legal-pages">{t("manageLegalPages")}</Link>
          </Button>
        </div>
      </section>

      <form
        action="/admin/seo"
        method="get"
        className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:flex-wrap sm:items-end"
      >
        <div className="min-w-[12rem] flex-1 space-y-1">
          <label htmlFor="seo-q" className="text-xs font-medium text-muted-foreground">
            {t("searchLabel")}
          </label>
          <Input
            id="seo-q"
            name="q"
            defaultValue={q ?? ""}
            placeholder={t("searchPlaceholder")}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="seo-missing"
            className="text-xs font-medium text-muted-foreground"
          >
            {t("filters.label")}
          </label>
          <select
            id="seo-missing"
            name="missing"
            defaultValue={missing ?? ""}
            className="flex h-9 w-full min-w-[12rem] rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
          >
            {missingFilters.map((option) => (
              <option key={option.value || "all"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit">{t("filter")}</Button>
        <Button type="button" variant="outline" asChild>
          <Link href={fullListHref as Route}>{t("viewFullList")}</Link>
        </Button>
        <Button type="button" variant="outline" asChild>
          <a href={exportHref}>{t("downloadCsv")}</a>
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.pageKey")}</TableHead>
                <TableHead>{t("columns.metaTitle")}</TableHead>
                <TableHead className="hidden lg:table-cell">
                  {t("columns.metaDescription")}
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  {t("columns.h1")}
                </TableHead>
                <TableHead className="hidden xl:table-cell">
                  {t("columns.focusKeywords")}
                </TableHead>
                <TableHead>{t("columns.linkedEntity")}</TableHead>
                <TableHead>{t("columns.updated")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item) => {
                const linked = resolveSeoLinkedEntity(item);
                const keywords =
                  item.focusKeywords?.trim() ||
                  item.blogPost?.focusKeywords?.trim() ||
                  "";
                const gaps = [
                  !item.metaTitleEn?.trim() ? t("gaps.title") : null,
                  !item.metaDescriptionEn?.trim() ? t("gaps.description") : null,
                  !item.h1En?.trim() ? t("gaps.h1") : null,
                  !keywords ? t("gaps.keywords") : null,
                ].filter(Boolean);

                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-[10rem] font-mono text-xs">
                      <div className="truncate" title={item.pageKey}>
                        {item.pageKey}
                      </div>
                      {gaps.length > 0 ? (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {gaps.map((gap) => (
                            <Badge key={gap} variant="secondary" className="text-[10px]">
                              {gap}
                            </Badge>
                          ))}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="max-w-[14rem]">
                      <div className="truncate" title={item.metaTitleEn ?? undefined}>
                        {truncate(item.metaTitleEn, 60)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[16rem] lg:table-cell">
                      <div
                        className="truncate text-muted-foreground"
                        title={item.metaDescriptionEn ?? undefined}
                      >
                        {truncate(item.metaDescriptionEn, 70)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] md:table-cell">
                      <div className="truncate" title={item.h1En ?? undefined}>
                        {truncate(item.h1En, 50)}
                      </div>
                    </TableCell>
                    <TableCell className="hidden max-w-[12rem] xl:table-cell">
                      <div className="truncate text-muted-foreground" title={keywords || undefined}>
                        {truncate(keywords || null, 40)}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {linked.label}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(item.updatedAt, locale)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/admin/seo/${item.id}/edit` as Route}>
                          {t("edit")}
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/seo"
            searchParams={{
              ...(q ? { q } : {}),
              ...(missing ? { missing } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
