import Link from "next/link";
import type { Metadata } from "next";
import type { Route } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { resolveSeoLinkedEntity } from "@/features/seo/admin/lib/seo-linked-entity";
import { Button } from "@/components/ui/button";
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

type SeoFullListPageProps = {
  searchParams: Promise<{ q?: string; missing?: string }>;
};

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

function buildExportHref(q?: string, missing?: MissingFilter): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (missing) params.set("missing", missing);
  const query = params.toString();
  return query ? `/api/admin/seo/export?${query}` : "/api/admin/seo/export";
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.seo");
  return adminMetadata(t("fullListTitle"));
}

export default async function AdminSeoFullListPage({
  searchParams,
}: SeoFullListPageProps) {
  await enforcePlatformManageAccess();

  const locale = "en";
  const t = await getTranslations("admin.resources.seo");
  const params = await searchParams;
  const q = params.q?.trim() || undefined;
  const missing = parseMissing(params.missing);

  const rows = await adminSeoRepository.listAllDetailed({ q, missing });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("fullListTitle")}
        description={t("fullListDescription")}
      />

      <div className="flex flex-wrap gap-3">
        <Button size="sm" variant="outline" asChild>
          <Link href={"/admin/seo" as Route}>{t("backToSeo")}</Link>
        </Button>
        <Button size="sm" asChild>
          <a href={buildExportHref(q, missing)}>{t("downloadCsv")}</a>
        </Button>
      </div>

      <p className="text-sm text-muted-foreground">
        {t("fullListCount").replace("{count}", String(rows.length))}
      </p>

      {rows.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <div className="overflow-x-auto rounded-xl border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.pageKey")}</TableHead>
                <TableHead>{t("columns.metaTitle")}</TableHead>
                <TableHead>{t("columns.metaDescription")}</TableHead>
                <TableHead>{t("columns.h1")}</TableHead>
                <TableHead>{t("columns.focusKeywords")}</TableHead>
                <TableHead>{t("form.canonicalUrl")}</TableHead>
                <TableHead>{t("form.ogTitleEn")}</TableHead>
                <TableHead>{t("form.robotsIndex")}</TableHead>
                <TableHead>{t("columns.linkedEntity")}</TableHead>
                <TableHead>{t("columns.updated")}</TableHead>
                <TableHead className="text-right">{t("columns.actions")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((item) => {
                const linked = resolveSeoLinkedEntity(item);
                const keywords =
                  item.focusKeywords?.trim() ||
                  item.blogPost?.focusKeywords?.trim() ||
                  "—";

                return (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap font-mono text-xs">
                      {item.pageKey}
                    </TableCell>
                    <TableCell className="max-w-[16rem] text-sm">
                      {item.metaTitleEn?.trim() || "—"}
                    </TableCell>
                    <TableCell className="max-w-[20rem] text-sm text-muted-foreground">
                      {item.metaDescriptionEn?.trim() || "—"}
                    </TableCell>
                    <TableCell className="max-w-[14rem] text-sm">
                      {item.h1En?.trim() || "—"}
                    </TableCell>
                    <TableCell className="max-w-[12rem] text-sm">
                      {keywords}
                    </TableCell>
                    <TableCell className="max-w-[12rem] font-mono text-xs">
                      {item.canonicalUrl?.trim() || "—"}
                    </TableCell>
                    <TableCell className="max-w-[12rem] text-sm">
                      {item.ogTitleEn?.trim() || "—"}
                    </TableCell>
                    <TableCell className="text-sm">
                      {item.robotsIndex ? "index" : "noindex"}
                      {" / "}
                      {item.robotsFollow ? "follow" : "nofollow"}
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
        </div>
      )}
    </div>
  );
}
