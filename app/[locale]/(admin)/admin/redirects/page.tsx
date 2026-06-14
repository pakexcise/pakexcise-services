import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
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
import { adminRedirectRepository } from "@/server/repositories/admin-redirect-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type RedirectsAdminPageProps = {
  searchParams: Promise<{ page?: string; q?: string; active?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.redirects");
  return adminMetadata(t("title"));
}

export default async function AdminRedirectsPage({
  searchParams,
}: RedirectsAdminPageProps) {
  await enforcePlatformManageAccess();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.resources.redirects");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const q = params.q?.trim() || undefined;
  const active =
    params.active === "true" || params.active === "false" ? params.active : "all";

  const result = await adminRedirectRepository.listPaginated({
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
            <Link href="/admin/redirects/new">
              <Plus className="size-4" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form
        action="/admin/redirects"
        method="get"
        className="flex flex-wrap gap-3 rounded-xl border p-4"
      >
        <Input name="q" defaultValue={q ?? ""} placeholder="Search slugs" className="max-w-sm" />
        <select name="active" defaultValue={active} className="h-10 rounded-md border px-3 text-sm">
          <option value="all">All</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
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
                <TableHead>Old slug</TableHead>
                <TableHead>New slug</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.items.map((redirect) => (
                <TableRow key={redirect.id}>
                  <TableCell className="font-mono text-xs">{redirect.oldSlug}</TableCell>
                  <TableCell className="font-mono text-xs">{redirect.newSlug}</TableCell>
                  <TableCell>{redirect.statusCode}</TableCell>
                  <TableCell>
                    <Badge variant={redirect.isActive ? "default" : "secondary"}>
                      {redirect.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(redirect.updatedAt, locale)}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" asChild>
                      <Link href={`/admin/redirects/${redirect.id}/edit`}>Edit</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/redirects"
            searchParams={{
              ...(q ? { q } : {}),
              ...(active !== "all" ? { active } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
