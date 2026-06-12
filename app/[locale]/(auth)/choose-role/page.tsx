import type { Route } from "next";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChooseRoleForm } from "@/features/auth/components/choose-role-form";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { buildSignupUrl } from "@/features/auth/lib/auth-url";
import {
  needsRoleChoice,
  resolvePostLoginPath,
} from "@/features/auth/lib/redirect";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type ChooseRolePageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.chooseRole");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ChooseRolePage({
  searchParams,
}: ChooseRolePageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const { callbackUrl } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect(buildSignupUrl({ callbackUrl }) as Route);
  }

  if (!needsRoleChoice(user)) {
    redirect(resolvePostLoginPath(user.role, callbackUrl) as Route);
  }

  const t = await getTranslations("auth.chooseRole");
  const tDisclaimer = await getTranslations("disclaimer");

  const labels = {
    customerTitle: t("customerTitle"),
    customerDescription: t("customerDescription"),
    agentTitle: t("agentTitle"),
    agentDescription: t("agentDescription"),
    agentNote: t("agentNote"),
    continueLabel: t("continueLabel"),
    continuing: t("continuing"),
    selectRole: t("selectRole"),
    failed: t("failed"),
  };

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      disclaimer={tDisclaimer("banner")}
    >
      <ChooseRoleForm labels={labels} />
    </AuthShell>
  );
}
