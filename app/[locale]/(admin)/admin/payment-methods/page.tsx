import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { PaymentMethodsPanel } from "@/features/payment-methods/admin/components/payment-methods-panel";
import { getPaymentMethodPanelLabels } from "@/features/payment-methods/admin/lib/labels";
import { adminPaymentMethodRepository } from "@/server/repositories/admin-payment-method-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.paymentMethods");
  return adminMetadata(t("title"));
}

export default async function AdminPaymentMethodsPage() {
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.paymentMethods");

  const [methods, nextDisplayOrder, labels] = await Promise.all([
    adminPaymentMethodRepository.listAll(),
    adminPaymentMethodRepository.getNextDisplayOrder(),
    getPaymentMethodPanelLabels(),
  ]);

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <PaymentMethodsPanel
        methods={methods}
        labels={labels}
        nextDisplayOrder={nextDisplayOrder}
      />
    </div>
  );
}
