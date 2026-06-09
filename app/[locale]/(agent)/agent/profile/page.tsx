import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AgentProfileForm } from "@/components/agent/AgentProfileForm";
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

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="rounded-xl border p-5">
        <AgentProfileForm
          initialName={user.name ?? ""}
          initialPhone={user.phone ?? ""}
          email={user.email}
          commissionRate={user.agentProfile.commissionRate.toString()}
          statusLabel={tApproval(user.agentProfile.approvalStatus)}
          labels={{
            name: t("name"),
            phone: t("phone"),
            email: t("email"),
            emailReadOnly: t("emailReadOnly"),
            commissionRate: t("commissionRate"),
            approvalStatus: t("approvalStatus"),
            save: t("save"),
            saving: t("saving"),
            saved: t("saved"),
            error: t("error"),
          }}
        />
      </div>
    </div>
  );
}
