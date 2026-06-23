import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import { adminMetadata } from "@/features/admin/lib/metadata";
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
import { Link } from "@/i18n/navigation";
import { formatDate } from "@/lib/utils";
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
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

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.seo");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;

  const result = await adminSeoRepository.listPaginated({
    page,
    pageSize: adminDefaultPageSize,
    q,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />

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
