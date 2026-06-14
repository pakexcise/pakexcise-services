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
import { adminStaffRepository } from "@/server/repositories/admin-staff-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

type AdminUsersPageProps = {
  searchParams: Promise<{
    page?: string;
    q?: string;
    status?: string;
    role?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.users");
  return adminMetadata(t("title"));
}

export default async function AdminUsersPage({
  searchParams,
}: AdminUsersPageProps) {
  await enforcePermissionAccess("users:manage")();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.users");
  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);

  const result = await adminStaffRepository.listForAdmin({
    page,
    pageSize: adminDefaultPageSize,
    search: params.q,
    status:
      params.status === "ACTIVE" ||
      params.status === "DISABLED" ||
      params.status === "SUSPENDED"
        ? params.status
        : undefined,
    role:
      params.role === "ADMIN" ||
      params.role === "SUPER_ADMIN" ||
      params.role === "SUPPORT"
        ? params.role
        : undefined,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("title")}
        description={t("description")}
        actions={
          <Button asChild>
            <Link href="/admin/users/new">
              <Plus className="size-4" aria-hidden="true" />
              {t("create")}
            </Link>
          </Button>
        }
      />

      <form className="flex flex-wrap gap-2">
        <Input
          name="q"
          defaultValue={params.q}
          placeholder={t("searchPlaceholder")}
          className="max-w-sm"
        />
        <Button type="submit" variant="secondary">
          {t("search")}
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("columns.name")}</TableHead>
                  <TableHead>{t("columns.email")}</TableHead>
                  <TableHead>{t("columns.role")}</TableHead>
                  <TableHead>{t("columns.status")}</TableHead>
                  <TableHead>{t("columns.created")}</TableHead>
                  <TableHead>{t("columns.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      {user.name ?? "—"}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          user.status === "ACTIVE" ? "default" : "secondary"
                        }
                      >
                        {user.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm">
                      {formatDate(user.createdAt, locale)}
                    </TableCell>
                    <TableCell>
                      {user.role === "SUPER_ADMIN" ? (
                        <span className="text-sm text-muted-foreground">
                          {t("protectedAccount")}
                        </span>
                      ) : (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/users/${user.id}/edit`}>
                            {t("edit")}
                          </Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/users"
            searchParams={{
              ...(params.q ? { q: params.q } : {}),
              ...(params.status ? { status: params.status } : {}),
              ...(params.role ? { role: params.role } : {}),
            }}
          />
        </>
      )}
    </div>
  );
}
