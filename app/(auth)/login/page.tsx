import type { Metadata } from "next";
import { Suspense } from "react";
import { getTranslations } from "@/lib/i18n/t";

import { AuthModeTabs } from "@/features/auth/components/auth-mode-tabs";
import { AuthShell } from "@/features/auth/components/auth-shell";
import { LoginForm } from "@/features/auth/components/login-form";
import { getLoginFormLabels } from "@/features/auth/lib/auth-form-labels";
import { getEnabledSocialProviders } from "@/features/auth/lib/social-providers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("auth.login");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function LoginPage() {
  const t = await getTranslations("auth.login");
  const tDisclaimer = await getTranslations("disclaimer");
  const labels = await getLoginFormLabels();
  const socialProviders = getEnabledSocialProviders();

  return (
    <AuthShell
      title={t("title")}
      description={t("description")}
      disclaimer={tDisclaimer("banner")}
    >
      <div className="space-y-5">
        <Suspense
          fallback={
            <p className="text-sm text-muted-foreground">{t("title")}</p>
          }
        >
          <AuthModeTabs
            mode="login"
            loginLabel={t("loginLink")}
            signupLabel={t("signupLink")}
          />
          <LoginForm labels={labels} socialProviders={socialProviders} unified />
        </Suspense>
      </div>
    </AuthShell>
  );
}
