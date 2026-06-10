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
    password: t("password"),
    confirmPassword: t("confirmPassword"),
    passwordHint: t("passwordHint"),
    passwordMismatch: t("passwordMismatch"),
    invalidPassword: t("invalidPassword"),
    showPassword: t("showPassword"),
    createAccount: t("createAccount"),
    creatingAccount: t("creatingAccount"),
    signupVerifyHint: t("signupVerifyHint"),
    phone: t("phone"),
    phoneHint: t("phoneHint"),
    cnic: t("cnic"),
    cnicHint: t("cnicHint"),
    cnicVerificationNote: t("cnicVerificationNote"),
    cnicExists: t("cnicExists"),
    invalidCnic: t("invalidCnic"),
    otp: t("otp"),
    otpHint: t("otpHint"),
    verifyOtp: t("verifyOtp"),
    verifyingOtp: t("verifyingOtp"),
    resendOtp: t("resendOtp"),
    changeEmail: t("changeEmail"),
    changePhone: t("changePhone"),
    otpSentEmail: t("otpSentEmail"),
    accountNotFound: t("accountNotFound"),
    accountExists: t("accountExists"),
    signupPrompt: t("signupPrompt"),
    loginPrompt: t("loginPrompt"),
    signupLink: t("signupLink"),
    otpSentEmailSandbox: t("otpSentEmailSandbox"),
    otpSentEmailDevConsole: t("otpSentEmailDevConsole"),
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
    socialFailed: tSocial("failed"),
    authError: tSocial("failed"),
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
