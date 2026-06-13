import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AgentPayoutMethodManager } from "@/components/agent/agent-payout-method-manager";
import { AgentProfileForm } from "@/components/agent/AgentProfileForm";
import {
  isAgentPayoutMethodConfigured,
  toAgentPayoutMethodFormValues,
} from "@/features/agents/lib/payout-method";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("agent.profile");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function AgentProfilePage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("agent.profile");
  const tApproval = await getTranslations("agent.approvalStatus");
  const user = await getCurrentUser();

  if (!user || user.role !== "AGENT" || !user.agentProfile) {
    notFound();
  }

  const profile = user.agentProfile;
  const payoutMethod = toAgentPayoutMethodFormValues(profile);
  const hasPayoutMethod = isAgentPayoutMethodConfigured(profile);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="rounded-xl border p-5">
        <AgentProfileForm
          initialName={user.name ?? ""}
          initialPhone={user.phone ?? ""}
          email={user.email}
          commissionRate={profile.commissionRate.toString()}
          commissionMode={profile.commissionMode}
          commissionFixedAmount={profile.commissionFixedAmount?.toString() ?? null}
          statusLabel={tApproval(profile.approvalStatus)}
          labels={{
            name: t("name"),
            phone: t("phone"),
            email: t("email"),
            emailReadOnly: t("emailReadOnly"),
            commissionRate: t("commissionRate"),
            commissionMode: t("commissionMode"),
            commissionModeManual: t("commissionModeManual"),
            commissionModePercentage: t("commissionModePercentage"),
            commissionModeFixed: t("commissionModeFixed"),
            fixedAmount: t("fixedAmount"),
            approvalStatus: t("approvalStatus"),
            save: t("save"),
            saving: t("saving"),
            saved: t("saved"),
            error: t("error"),
          }}
        />
      </div>

      <AgentPayoutMethodManager
        initialValues={payoutMethod}
        hasMethod={hasPayoutMethod}
        labels={{
          title: t("payoutMethod.title"),
          description: t("payoutMethod.description"),
          emptyTitle: t("payoutMethod.emptyTitle"),
          emptyDescription: t("payoutMethod.emptyDescription"),
          addMethod: t("payoutMethod.addMethod"),
          editMethod: t("payoutMethod.editMethod"),
          deleteMethod: t("payoutMethod.deleteMethod"),
          deleteConfirm: t("payoutMethod.deleteConfirm"),
          deleteConfirmButton: t("payoutMethod.deleteConfirmButton"),
          deleteDismiss: t("payoutMethod.deleteDismiss"),
          deleting: t("payoutMethod.deleting"),
          deleted: t("payoutMethod.deleted"),
          methodType: t("payoutMethod.methodType"),
          accountTitle: t("payoutMethod.accountTitle"),
          accountNumber: t("payoutMethod.accountNumber"),
          iban: t("payoutMethod.iban"),
          bankName: t("payoutMethod.bankName"),
          walletNumber: t("payoutMethod.walletNumber"),
          notes: t("payoutMethod.notes"),
          save: t("payoutMethod.save"),
          saving: t("payoutMethod.saving"),
          saved: t("payoutMethod.saved"),
          error: t("payoutMethod.error"),
          cancel: t("payoutMethod.cancel"),
          configured: t("payoutMethod.configured"),
          method_BANK_TRANSFER: t("payoutMethod.types.BANK_TRANSFER"),
          method_JAZZCASH: t("payoutMethod.types.JAZZCASH"),
          method_EASYPAISA: t("payoutMethod.types.EASYPAISA"),
          method_NAYAPAY: t("payoutMethod.types.NAYAPAY"),
          method_SADAPAY: t("payoutMethod.types.SADAPAY"),
          method_OTHER: t("payoutMethod.types.OTHER"),
        }}
      />
    </div>
  );
}
