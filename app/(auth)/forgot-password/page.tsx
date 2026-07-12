import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.forgotPassword");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ForgotPasswordPage() {
  const locale = "en";
    const t = await getTranslations("auth.forgotPassword");
  const tDisclaimer = await getTranslations("disclaimer");

  const labels = {
    email: t("email"),
    submit: t("submit"),
    submitting: t("submitting"),
    success: t("success"),
    requestFailed: t("requestFailed"),
    backToLogin: t("backToLogin"),
  };

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      disclaimer={tDisclaimer("banner")}
    >
      <ForgotPasswordForm labels={labels} />
    </AuthShell>
  );
}
