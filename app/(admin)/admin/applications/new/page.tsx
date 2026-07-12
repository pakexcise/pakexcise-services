import type { ApplicationStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { getAdminApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ApplicationEditorForm } from "@/features/applications/admin/components/application-editor-form";
import { emptyApplicationEditorValues } from "@/features/applications/admin/lib/form-defaults";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { agentRepository } from "@/server/repositories/agent-repository";
import { customerRepository } from "@/server/repositories/customer-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireSuperAdmin } from "@/server/permissions/guards";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.applications");
  return adminMetadata(t("createTitle"));
}

export default async function NewApplicationPage() {
  await enforcePermissionAccess("application:read")();
  await requireSuperAdmin();

  const locale = "en";
    const t = await getTranslations("admin.applications");
  const tAdmin = await getTranslations("admin");

  const [customers, services, agents] = await Promise.all([
    customerRepository.listForSelect(),
    adminServiceRepository.listForSelect(),
    agentRepository.listUsersForSelect(),
  ]);

  const statusLabels = Object.fromEntries(
    (
      [
        "DRAFT",
        "SUBMITTED",
        "REVIEW",
        "DOCS_REQUIRED",
        "INVOICE_SENT",
        "PAYMENT_UPLOADED",
        "PAYMENT_VERIFIED",
        "IN_PROGRESS",
        "AT_OFFICE",
        "COMPLETED",
        "REJECTED",
        "CANCELLED",
      ] as ApplicationStatus[]
    ).map((status) => [
      status,
      tAdmin(getAdminApplicationStatusLabelKey(status)),
    ]),
  ) as Record<ApplicationStatus, string>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("createTitle")}
        description={t("createDescription")}
      />
      <ApplicationEditorForm
        mode="create"
        initialValues={emptyApplicationEditorValues()}
        customers={customers}
        services={services}
        agents={agents}
        locale={locale}
        labels={{
          sectionAssignment: t("form.sectionAssignment"),
          sectionStatus: t("form.sectionStatus"),
          sectionNotes: t("form.sectionNotes"),
          customer: t("form.customer"),
          selectCustomer: t("form.selectCustomer"),
          service: t("form.service"),
          selectService: t("form.selectService"),
          agent: t("form.agent"),
          noAgent: t("form.noAgent"),
          status: t("form.status"),
          preferredLocale: t("form.preferredLocale"),
          adminNotes: t("form.adminNotes"),
          statusChangeNote: t("form.statusChangeNote"),
          statusChangeNoteHelp: t("form.statusChangeNoteHelp"),
          statusChangeNoteRequired: t("form.statusChangeNoteRequired"),
          trackingId: t("form.trackingId"),
          save: t("form.save"),
          saving: t("form.saving"),
          saveFailed: t("form.saveFailed"),
          statusLabels,
        }}
      />
    </div>
  );
}
