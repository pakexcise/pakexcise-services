import Link from "next/link";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { ContactInquiryEditorForm } from "@/features/contact-inquiries/admin/components/contact-inquiry-editor-form";
import { inquiryToEditorValues } from "@/features/contact-inquiries/admin/lib/form-defaults";
import { Button } from "@/components/ui/button";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { contactInquiryRepository } from "@/server/repositories/contact-inquiry-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";
import { requireSuperAdmin } from "@/server/permissions/guards";

type EditContactInquiryPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditContactInquiryPageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin.contactInquiries");
  const inquiry = await contactInquiryRepository.findAdminById(id);
  return adminMetadata(
    inquiry ? `${t("editTitle")} — ${inquiry.referenceId}` : t("editTitle"),
  );
}

export default async function EditContactInquiryPage({
  params,
}: EditContactInquiryPageProps) {
  await enforcePermissionAccess("application:read")();
  await requireSuperAdmin();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.contactInquiries");

  const [inquiry, services] = await Promise.all([
    contactInquiryRepository.findAdminById(id),
    adminServiceRepository.listOptions(),
  ]);

  if (!inquiry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={t("editTitle")}
        description={t("editDescription", { reference: inquiry.referenceId })}
        actions={
          <Button asChild variant="outline">
            <Link href={`/admin/contact-inquiries/${inquiry.id}`}>
              {t("backToDetail")}
            </Link>
          </Button>
        }
      />
      <ContactInquiryEditorForm
        mode="edit"
        inquiryId={inquiry.id}
        initialValues={inquiryToEditorValues(inquiry)}
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
