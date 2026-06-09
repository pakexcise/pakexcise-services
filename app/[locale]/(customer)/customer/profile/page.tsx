import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { CustomerProfileForm } from "@/components/customer/CustomerProfileForm";
import { getCurrentUser } from "@/server/auth/current-user";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("customer.profile");
  return {
    title: t("metaTitle"),
    robots: { index: false, follow: false },
  };
}

export default async function CustomerProfilePage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);

  const t = await getTranslations("customer.profile");
  const user = await getCurrentUser();

  if (!user) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("description")}</p>
      </div>

      <div className="rounded-xl border p-5">
        <CustomerProfileForm
          initialName={user.name ?? ""}
          initialPhone={user.phone ?? ""}
          email={user.email}
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
    </div>
  );
}
