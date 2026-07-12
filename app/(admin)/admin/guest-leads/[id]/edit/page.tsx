import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { SupportRequestEditorForm } from "@/features/guest-leads/admin/components/support-request-editor-form";
import { leadToEditorValues } from "@/features/guest-leads/admin/lib/form-defaults";
import { Button } from "@/components/ui/button";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { guestLeadRepository } from "@/server/repositories/guest-lead-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireSuperAdmin } from "@/server/permissions/guards";

type EditSupportRequestPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditSupportRequestPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin.guestLeads");
  const lead = await guestLeadRepository.findAdminById(id);
  return adminMetadata(
    lead ? `${t("editTitle")} — ${lead.referenceId}` : t("editTitle"),
  );
}

export default async function EditSupportRequestPage({
  params,
}: EditSupportRequestPageProps) {
  await enforcePermissionAccess("application:read")();
  await requireSuperAdmin();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.guestLeads");

  const [lead, services] = await Promise.all([
    guestLeadRepository.findAdminById(id),
    adminServiceRepository.listOptions(),
  ]);

  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription", { reference: lead.referenceId })}
        actions={
          <Button asChild variant="outline">
            <Link href={`/admin/guest-leads/${lead.id}`}>
              {t("backToDetail")}
            </Link>
          </Button>
        }
      />
      <SupportRequestEditorForm
        mode="edit"
        leadId={lead.id}
        initialValues={leadToEditorValues(lead)}
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
