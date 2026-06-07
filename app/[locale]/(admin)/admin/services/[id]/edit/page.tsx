import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { DocumentRequirementsPanel } from "@/features/services/admin/components/document-requirements-panel";
import { FormFieldsPanel } from "@/features/services/admin/components/form-fields-panel";
import { ServiceEditorForm } from "@/features/services/admin/components/service-editor-form";
import { serviceToEditorValues } from "@/features/services/admin/lib/form-defaults";
import {
  getDocumentPanelLabels,
  getFormFieldsPanelLabels,
  getServiceEditorLabels,
} from "@/features/services/admin/lib/labels";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { adminServiceRepository } from "@/server/repositories/admin-service-repository";
import { regionRepository } from "@/server/repositories";
import { getCurrentLocale } from "@/server/i18n/get-locale";

type EditServicePageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({
  params,
}: EditServicePageProps): Promise<Metadata> {
  const { id } = await params;
  const t = await getTranslations("admin.services");
  return adminMetadata(`${t("editTitle")} ${id.slice(0, 8)}`);
}

export default async function EditServicePage({ params }: EditServicePageProps) {
  const { id } = await params;
  const locale = await getCurrentLocale();
  setRequestLocale(locale);
  const t = await getTranslations("admin.services");

  const [service, regions, editorLabels, documentLabels, fieldLabels] =
    await Promise.all([
      adminServiceRepository.findById(id),
      regionRepository.listAdmin(),
      getServiceEditorLabels(),
      getDocumentPanelLabels(),
      getFormFieldsPanelLabels(),
    ]);

  if (!service) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title={t("editTitle")}
        description={service.nameEn}
        actions={
          <Button asChild variant="outline" size="sm">
            <Link href="/admin/services">{t("backToList")}</Link>
          </Button>
        }
      />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">{t("sections.core")}</h2>
        <ServiceEditorForm
          mode="edit"
          serviceId={service.id}
          initialValues={serviceToEditorValues(service)}
          regions={regions}
          labels={editorLabels}
        />
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-semibold">{t("sections.documents")}</h2>
        <DocumentRequirementsPanel
          serviceId={service.id}
          documents={service.documentReqs}
          labels={documentLabels}
        />
      </section>

      <section className="space-y-4 border-t pt-8">
        <h2 className="text-lg font-semibold">{t("sections.fields")}</h2>
        <FormFieldsPanel
          serviceId={service.id}
          fields={service.formFields}
          labels={fieldLabels}
        />
      </section>
    </div>
  );
}
