import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import {
  SupportRequestEditorForm,
} from "@/features/guest-leads/admin/components/support-request-editor-form";
import { emptySupportRequestEditorValues } from "@/features/guest-leads/admin/lib/form-defaults";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireSuperAdmin } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.guestLeads");
  return adminMetadata(t("createTitle"));
}

export default async function NewSupportRequestPage() {
  await enforcePermissionAccess("application:read")();
  await requireSuperAdmin();

  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.guestLeads");

  const services = await adminServiceRepository.listOptions();

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <SupportRequestEditorForm
        mode="create"
        initialValues={emptySupportRequestEditorValues()}
        services={services}
        labels={{
          sectionCustomer: t("form.sectionCustomer"),
          sectionService: t("form.sectionService"),
          sectionDetails: t("form.sectionDetails"),
          sectionNotes: t("form.sectionNotes"),
          service: t("form.service"),
          customService: t("form.selectService"),
          source: t("form.source"),
          status: t("form.status"),
          fullName: t("form.fullName"),
          phone: t("form.phone"),
          email: t("form.email"),
          regionEn: t("form.regionEn"),
          regionUr: t("form.regionUr"),
          city: t("form.city"),
          vehicleInfo: t("form.vehicleInfo"),
          licenseInfo: t("form.licenseInfo"),
          message: t("form.message"),
          adminNotes: t("form.adminNotes"),
          locale: t("form.locale"),
          save: t("form.save"),
          saving: t("form.saving"),
          saveFailed: t("form.saveFailed"),
          sourceGuestForm: t("source.GUEST_FORM"),
          sourceWhatsapp: t("source.WHATSAPP"),
          statusNew: t("status.NEW"),
          statusContacted: t("status.CONTACTED"),
          statusInProgress: t("status.IN_PROGRESS"),
          statusConverted: t("status.CONVERTED"),
          statusClosed: t("status.CLOSED"),
          statusSpam: t("status.SPAM"),
        }}
      />
    </div>
  );
}
