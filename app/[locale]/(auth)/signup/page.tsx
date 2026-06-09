import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getEnabledSocialProviders } from "@/features/auth/lib/social-providers";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signup");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function SignupPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("auth.signup");
  const tSocial = await getTranslations("auth.social");
  const tDisclaimer = await getTranslations("disclaimer");
  const socialProviders = getEnabledSocialProviders();

  const labels = {
    name: t("name"),
    email: t("email"),
    phone: t("phone"),
    phoneHint: t("phoneHint"),
    otp: t("otp"),
    otpHint: t("otpHint"),
    sendOtp: t("sendOtp"),
    sendingOtp: t("sendingOtp"),
    verifyOtp: t("verifyOtp"),
    verifyingOtp: t("verifyingOtp"),
    resendOtp: t("resendOtp"),
    changeEmail: t("changeEmail"),
    changePhone: t("changePhone"),
    otpSentEmail: t("otpSentEmail"),
    otpSentEmailSandbox: t("otpSentEmailSandbox"),
    otpSentEmailDevConsole: t("otpSentEmailDevConsole"),
    otpSentPhone: t("otpSentPhone"),
    whatsappUnavailable: t("whatsappUnavailable"),
    whatsappNotConfigured: t("whatsappNotConfigured"),
    whatsappRecipientNotAllowed: t("whatsappRecipientNotAllowed"),
    whatsappTokenExpired: t("whatsappTokenExpired"),
    sendFailed: t("sendFailed"),
    verifyFailed: t("verifyFailed"),
    invalidEmail: t("invalidEmail"),
    invalidPhone: t("invalidPhone"),
    nameRequired: t("nameRequired"),
    methodEmail: t("methodEmail"),
    methodPhone: t("methodPhone"),
    hasAccount: t("hasAccount"),
    loginLink: t("loginLink"),
    orContinueWith: t("orContinueWith"),
    google: tSocial("google"),
    facebook: tSocial("facebook"),
    socialFailed: tSocial("failed"),
    socialNotConfigured: tSocial("notConfigured"),
  };

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      disclaimer={tDisclaimer("banner")}
    >
      <SignupForm labels={labels} socialProviders={socialProviders} />
    </AuthShell>
  );
}
