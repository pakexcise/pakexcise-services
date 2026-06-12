import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AuthModeTabs } from "@/features/auth/components/auth-mode-tabs";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { SignupForm } from "@/features/auth/components/signup-form";
import { getSignupFormLabels } from "@/features/auth/lib/auth-form-labels";
import {
  parseAuthIntent,
} from "@/features/auth/lib/auth-url";
import { getEnabledSocialProviders } from "@/features/auth/lib/social-providers";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type SignupPageProps = {
  searchParams: Promise<{ intent?: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.signup");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const params = await searchParams;
  const intent = parseAuthIntent(params.intent);

  const t = await getTranslations("auth.signup");
  const tDisclaimer = await getTranslations("disclaimer");
  const labels = await getSignupFormLabels();
  const socialProviders = getEnabledSocialProviders();

  const description =
    intent === "agent" ? t("agentDescription") : t("description");

  return (
    <AuthShell
      title={t("title")}
      description={description}
      disclaimer={tDisclaimer("banner")}
    >
      <div className="space-y-5">
        <AuthModeTabs
          mode="signup"
          loginLabel={t("loginLink")}
          signupLabel={t("signupLink")}
        />
        <SignupForm labels={labels} socialProviders={socialProviders} unified />
      </div>
    </AuthShell>
  );
}
