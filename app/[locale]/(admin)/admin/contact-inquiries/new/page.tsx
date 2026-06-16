import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactInquiryEditorForm } from "@/features/contact-inquiries/admin/components/contact-inquiry-editor-form";
import { emptyContactInquiryEditorValues } from "@/features/contact-inquiries/admin/lib/form-defaults";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireSuperAdmin } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.contactInquiries");
  return adminMetadata(t("createTitle"));
}

export default async function NewContactInquiryPage() {
  await enforcePermissionAccess("application:read")();
  await requireSuperAdmin();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.contactInquiries");

  const services = await adminServiceRepository.listOptions();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <ContactInquiryEditorForm
        mode="create"
        initialValues={emptyContactInquiryEditorValues()}
        services={services}
        locale={locale}
        labels={{
          sectionCustomer: t("form.sectionCustomer"),
          sectionInquiry: t("form.sectionInquiry"),
          sectionNotes: t("form.sectionNotes"),
          service: t("form.service"),
          customService: t("form.selectService"),
          otherService: t("filters.otherService"),
          status: t("form.status"),
          fullName: t("form.fullName"),
          phone: t("form.phone"),
          email: t("form.email"),
          region: t("form.region"),
          city: t("form.city"),
          message: t("form.message"),
          adminNotes: t("form.adminNotes"),
          preferredLocale: t("form.preferredLocale"),
          save: t("form.save"),
          saving: t("form.saving"),
          saveFailed: t("form.saveFailed"),
          statusNew: t("status.NEW"),
          statusContacted: t("status.CONTACTED"),
          statusClosed: t("status.CLOSED"),
          statusSpam: t("status.SPAM"),
        }}
      />
    </div>
  );
}
