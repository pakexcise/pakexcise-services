import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Suspense } from "react";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.resetPassword");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function ResetPasswordPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("auth.resetPassword");
  const tDisclaimer = await getTranslations("disclaimer");

  const labels = {
    newPassword: t("newPassword"),
    confirmPassword: t("confirmPassword"),
    submit: t("submit"),
    submitting: t("submitting"),
    success: t("success"),
    resetFailed: t("resetFailed"),
    passwordMismatch: t("passwordMismatch"),
    passwordHint: t("passwordHint"),
    invalidToken: t("invalidToken"),
    backToLogin: t("backToLogin"),
    requestNewLink: t("requestNewLink"),
  };

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      disclaimer={tDisclaimer("banner")}
    >
      <Suspense fallback={<p className="text-sm text-muted-foreground">{t("loading")}</p>}>
        <ResetPasswordForm labels={labels} />
      </Suspense>
    </AuthShell>
  );
}
