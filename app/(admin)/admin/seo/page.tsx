import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SeoHealthPanel } from "@/features/seo/admin/components/seo-health-panel";
import { getSeoHealthSnapshot } from "@/features/seo/admin/lib/seo-health";
import { adminDefaultPageSize } from "@/config/admin";
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

type SeoAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string }>;
};

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

  const [result, health] = await Promise.all([
    adminSeoRepository.listPaginated({
      page,
      pageSize: adminDefaultPageSize,
      q,
    }),
    getSeoHealthSnapshot(),
  ]);

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

      <form action="/admin/seo" method="get" className="flex gap-3 rounded-xl border p-4">
        <Input name="q" defaultValue={q ?? ""} placeholder="Search page key or title" className="max-w-sm" />
        <Button type="submit">Filter</Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} />
      ) : (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page key</TableHead>
                <TableHead>Meta title</TableHead>
                <TableHead>Linked entity</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.pageKey}</TableCell>
                  <TableCell>{item.metaTitleEn ?? "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {item.service?.slug
                      ? `service:${item.service.slug}`
                      : item.blogPost?.slug
                        ? `blog:${item.blogPost.slug}`
                        : item.guide?.slug
                          ? `guide:${item.guide.slug}`
                          : item.region?.slug
                            ? `region:${item.region.slug}`
                            : "static"}
                  </TableCell>
                  <TableCell>{formatDate(item.updatedAt, locale)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/seo"
            searchParams={{ ...(q ? { q } : {}) }}
          />
        </>
      )}
    </div>
  );
}
