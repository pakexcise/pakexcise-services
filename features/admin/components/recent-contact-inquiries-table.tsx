import { copy, createT } from "@/messages";
import { getTranslations } from "@/lib/i18n/t";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import type { ContactInquiryListItem } from "@/server/repositories/contact-inquiry-repository";

import { Badge } from "@/components/ui/badge";

import Link from "next/link";
type RecentContactInquiriesTableProps = {
  inquiries: ContactInquiryListItem[];
  title: string;
  emptyMessage: string;
  viewLabel: string;
};

function statusVariant(
  status: ContactInquiryListItem["status"],
): "default" | "secondary" | "outline" {
  switch (status) {
    case "NEW":
      return "default";
    case "SPAM":
    case "CLOSED":
      return "secondary";
    default:
      return "outline";
  }
}

export async function RecentContactInquiriesTable({
  inquiries,
  title,
  emptyMessage,
  viewLabel,
}: RecentContactInquiriesTableProps) {
  const locale = "en";
  const t = createT(copy.admin.contactInquiries);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle className="min-w-0">{title}</CardTitle>
        <Button asChild variant="outline" size="sm" className="shrink-0 self-start sm:self-auto">
          <Link href="/admin/contact-inquiries">{viewLabel}</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {inquiries.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.reference")}</TableHead>
                <TableHead>{t("columns.name")}</TableHead>
                <TableHead>{t("columns.service")}</TableHead>
                <TableHead>{t("columns.status")}</TableHead>
                <TableHead>{t("columns.created")}</TableHead>
                <TableHead className="text-right">{t("view")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inquiries.map((inquiry) => (
                <TableRow key={inquiry.id}>
                  <TableCell className="font-mono text-xs">
                    {inquiry.referenceId}
                  </TableCell>
                  <TableCell>{inquiry.fullName}</TableCell>
                  <TableCell className="max-w-[160px] truncate">
                    {inquiry.serviceInterest}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant(inquiry.status)}>
                      {t(`status.${inquiry.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(inquiry.createdAt, locale)}</TableCell>
                  <TableCell className="text-right">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/contact-inquiries/${inquiry.id}`}>
                        {t("view")}
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
