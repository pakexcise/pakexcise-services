import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { redirect } from "next/navigation";

import { isApprovedActiveAgent } from "@/features/agents/lib/is-approved-agent";
import { formatPkr } from "@/features/invoices/lib/format-pkr";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/utils";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { agentRepository } from "@/server/repositories/agent-repository";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.commissions");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentCommissionsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const user = await getCurrentUser();

  if (!user || !isApprovedActiveAgent(user) || !user.agentProfile) {
    redirect("/agent/dashboard");
  }

  const t = await getTranslations("agent.commissions");

  const commissions = await agentRepository.listCommissionsForAgent(
    user.agentProfile.id,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
        <p className="mt-2 text-sm">
          {t("commissionRate")}: {user.agentProfile.commissionRate.toString()}%
        </p>
      </div>

      <div className="rounded-xl border">
        {commissions.length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">{t("empty")}</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("columns.label")}</TableHead>
                <TableHead>{t("columns.amount")}</TableHead>
                <TableHead>{t("columns.payoutStatus")}</TableHead>
                <TableHead>{t("columns.application")}</TableHead>
                <TableHead>{t("columns.date")}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => (
                <TableRow key={commission.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{commission.label}</p>
                      {commission.description ? (
                        <p className="text-xs text-muted-foreground">
                          {commission.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    {formatPkr(commission.amount.toString(), locale === "ur" ? "ur" : "en")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {t(`payoutStatus.${commission.payoutStatus}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {commission.application?.trackingId ?? "—"}
                  </TableCell>
                  <TableCell>
                    {formatDate(commission.createdAt, locale)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      <p className="text-xs text-muted-foreground">{t("payoutPlaceholder")}</p>
    </div>
  );
}
