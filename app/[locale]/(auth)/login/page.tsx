import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { getEnabledSocialProviders } from "@/features/auth/lib/social-providers";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("auth.login");
  const tSocial = await getTranslations("auth.social");
  const tDisclaimer = await getTranslations("disclaimer");
  const socialProviders = getEnabledSocialProviders();

  const labels = {
    email: t("email"),
    password: t("password"),
    passwordHint: t("passwordHint"),
    invalidPassword: t("invalidPassword"),
    showPassword: t("showPassword"),
    signIn: t("signIn"),
    signingIn: t("signingIn"),
    signInFailed: t("signInFailed"),
    phone: t("phone"),
    phoneOrCnic: t("phoneOrCnic"),
    phoneHint: t("phoneHint"),
    phoneLoginHint: t("phoneLoginHint"),
    otp: t("otp"),
    otpHint: t("otpHint"),
    verifyOtp: t("verifyOtp"),
    verifyingOtp: t("verifyingOtp"),
    resendOtp: t("resendOtp"),
    changeEmail: t("changeEmail"),
    otpSentEmail: t("otpSentEmail"),
    accountNotFound: t("accountNotFound"),
    accountExists: t("accountExists"),
    signupPrompt: t("signupPrompt"),
    loginPrompt: t("loginPrompt"),
    loginLink: t("loginLink"),
    otpSentEmailSandbox: t("otpSentEmailSandbox"),
    otpSentEmailDevConsole: t("otpSentEmailDevConsole"),
    sendFailed: t("sendFailed"),
    verifyFailed: t("verifyFailed"),
    invalidEmail: t("invalidEmail"),
    invalidPhone: t("invalidPhone"),
    invalidIdentifier: t("invalidIdentifier"),
    methodEmail: t("methodEmail"),
    methodPhone: t("methodPhone"),
    forgotPassword: t("forgotPassword"),
    authError: t("authError"),
    noAccount: t("noAccount"),
    signupLink: t("signupLink"),
    orContinueWith: t("orContinueWith"),
    google: tSocial("google"),
    socialFailed: tSocial("failed"),
    socialNotConfigured: tSocial("notConfigured"),
  };

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      disclaimer={tDisclaimer("banner")}
    >
      <LoginForm labels={labels} socialProviders={socialProviders} />
    </AuthShell>
  );
}
