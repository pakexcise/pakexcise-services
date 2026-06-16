import type { ApplicationStatus } from "@prisma/client";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { getAdminApplicationStatusLabelKey } from "@/features/admin/lib/application-status";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ApplicationEditorForm } from "@/features/applications/admin/components/application-editor-form";
import { applicationToEditorValues } from "@/features/applications/admin/lib/form-defaults";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { agentRepository } from "@/server/repositories/agent-repository";
import { applicationRepository } from "@/server/repositories/application-repository";
import { customerRepository } from "@/server/repositories/customer-repository";
import { getCurrentLocale } from "@/server/i18n/get-locale";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireSuperAdmin } from "@/server/permissions/guards";

type EditApplicationPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditApplicationPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin.applications");
  const application = await applicationRepository.findAdminById(id);
  return adminMetadata(
    application
      ? `${t("editTitle")} — ${application.trackingId}`
      : t("editTitle"),
  );
}

export default async function EditApplicationPage({
  params,
}: EditApplicationPageProps) {
  await enforcePermissionAccess("application:read")();
  await requireSuperAdmin();

  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.applications");
  const tAdmin = await getTranslations("admin");

  const [application, customers, services, agents] = await Promise.all([
    applicationRepository.findAdminById(id),
    customerRepository.listForSelect(),
    adminServiceRepository.listForSelect(),
    agentRepository.listUsersForSelect(),
  ]);

  if (!application) {
    notFound();
  }

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
        title={t("editTitle")}
        description={t("editDescription", {
          reference: application.trackingId,
        })}
        actions={
          <Button asChild variant="outline">
            <Link href={`/admin/applications/${application.id}`}>
              {t("backToDetail")}
            </Link>
          </Button>
        }
      />
      <ApplicationEditorForm
        mode="edit"
        applicationId={application.id}
        trackingId={application.trackingId}
        initialValues={applicationToEditorValues(application)}
        initialStatus={application.status}
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
