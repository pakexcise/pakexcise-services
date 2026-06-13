import type { UserStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { CustomerFilters } from "@/features/admin/components/customer-filters";
import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { EmptyState } from "@/features/admin/components/empty-state";
import { PaginationControls } from "@/features/admin/components/pagination-controls";
import {
  formatAdminCustomerEmailDisplay,
  formatAdminCustomerPhoneDisplay,
} from "@/features/admin/lib/format-customer-identity";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminDefaultPageSize } from "@/config/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { customerRepository } from "@/server/repositories/customer-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

const validStatuses = new Set<string>([
  "ACTIVE",
  "DISABLED",
  "PENDING",
  "SUSPENDED",
]);

type AdminCustomersPageProps = {
  searchParams: Promise<{
    page?: string;
    status?: string;
    q?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin");
  return adminMetadata(t("nav.customers"));
}

export default async function AdminCustomersPage({
  searchParams,
}: AdminCustomersPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin");

  const params = await searchParams;
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const search = params.q?.trim() || undefined;
  const statusParam = params.status?.trim();
  const status =
    statusParam && validStatuses.has(statusParam)
      ? (statusParam as UserStatus)
      : undefined;

  const result = await customerRepository.listForAdmin({
    page,
    pageSize: adminDefaultPageSize,
    search,
    status,
  });

  const filterParams = {
    q: search,
    status: statusParam,
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("customers.title")}
        description={t("customers.description")}
      />

      <CustomerFilters currentSearch={search} currentStatus={status} />

      {result.items.length === 0 ? (
        <EmptyState
          title={t("customers.emptyTitle")}
          description={t("customers.emptyDescription")}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("customers.columns.name")}</TableHead>
                  <TableHead>{t("customers.columns.email")}</TableHead>
                  <TableHead>{t("customers.columns.phone")}</TableHead>
                  <TableHead>{t("customers.columns.status")}</TableHead>
                  <TableHead>{t("customers.columns.applications")}</TableHead>
                  <TableHead>{t("customers.columns.joined")}</TableHead>
                  <TableHead className="text-end">
                    {t("customers.columns.actions")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.items.map((customer) => {
                  const emailDisplay = formatAdminCustomerEmailDisplay({
                    email: customer.email,
                    phone: customer.phone,
                    phoneNumber: customer.phoneNumber,
                  });
                  const phoneDisplay = formatAdminCustomerPhoneDisplay({
                    phone: customer.phone,
                    phoneNumber: customer.phoneNumber,
                  });
                  const showEmailSeparately = !isTempPhoneEmail(customer.email);

                  return (
                    <TableRow key={customer.id}>
                      <TableCell className="font-medium">
                        {customer.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          <p>{emailDisplay}</p>
                          {showEmailSeparately && customer.emailVerified ? (
                            <Badge variant="outline" className="text-xs">
                              {t("customers.verifiedEmail")}
                            </Badge>
                          ) : null}
                          {!showEmailSeparately && customer.phoneNumberVerified ? (
                            <Badge variant="outline" className="text-xs">
                              {t("customers.verifiedPhone")}
                            </Badge>
                          ) : null}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {phoneDisplay ?? "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            customer.status === "ACTIVE" ? "default" : "secondary"
                          }
                        >
                          {t(`customers.status.${customer.status}`)}
                        </Badge>
                      </TableCell>
                      <TableCell>{customer._count.customerApplications}</TableCell>
                      <TableCell className="whitespace-nowrap text-sm">
                        {formatDate(customer.createdAt, locale)}
                      </TableCell>
                      <TableCell className="text-end">
                        <Button asChild variant="outline" size="sm">
                          <Link
                            href={`/admin/applications?q=${encodeURIComponent(
                              customer.email,
                            )}`}
                          >
                            {t("customers.viewApplications")}
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <PaginationControls
            page={result.page}
            totalPages={result.totalPages}
            basePath="/admin/customers"
            searchParams={filterParams}
          />
        </>
      )}
    </div>
  );
}
