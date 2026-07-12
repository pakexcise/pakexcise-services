import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { CustomerProfileForm } from "@/components/customer/CustomerProfileForm";
import { isTempPhoneEmail } from "@/features/auth/lib/user-identity";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/server/auth/current-user";
export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customer.profile");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CustomerProfilePage() {
  const locale = "en";
    const t = await getTranslations("customer.profile");
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  const hasRealEmail = user.email && !isTempPhoneEmail(user.email);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <div className="rounded-xl border bg-card p-5 shadow-sm md:p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("personalSection")}</h2>
          <CustomerProfileForm
            initialName={user.name ?? ""}
            initialPhone={user.phone ?? ""}
            email={hasRealEmail ? user.email : ""}
            labels={{
              name: t("name"),
              phone: t("phone"),
              email: t("email"),
              emailReadOnly: t("emailReadOnly"),
              save: t("save"),
              saving: t("saving"),
              saved: t("saved"),
              error: t("error"),
            }}
          />
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{t("securitySection")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("securityDescription")}
            </p>
            {hasRealEmail ? (
              <Button asChild className="mt-4 w-full" variant="outline">
                <Link href="/forgot-password">{t("setPasswordCta")}</Link>
              </Button>
            ) : (
              <p className="mt-4 text-sm text-muted-foreground">
                {t("phoneOnlySecurity")}
              </p>
            )}
          </div>

          <div className="rounded-xl border bg-muted/30 p-5">
            <h3 className="text-sm font-semibold">{t("signInMethodsTitle")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {hasRealEmail ? <li>{t("methodEmail")}</li> : null}
              {user.phone ? <li>{t("methodPhone")}</li> : null}
              <li>{t("methodOtp")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
