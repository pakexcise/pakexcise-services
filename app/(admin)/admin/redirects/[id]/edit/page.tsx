import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { RedirectEditorForm } from "@/features/redirects/admin/components/redirect-editor-form";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { adminRedirectRepository } from "@/server/repositories/admin-redirect-repository";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type EditRedirectPageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.resources.redirects");
  return adminMetadata(`Edit | ${t("title")}`);
}

export default async function AdminRedirectEditPage({ params }: EditRedirectPageProps) {
  await enforcePlatformManageAccess();

  const { id } = await params;
  const locale = "en";
    const t = await getTranslations("admin.resources.redirects");

  const redirect = await adminRedirectRepository.findById(id);
  if (!redirect) notFound();

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Edit redirect" description={t("description")} />
      <RedirectEditorForm
        mode="edit"
        redirectId={redirect.id}
        initialValues={{
          oldSlug: redirect.oldSlug,
          newSlug: redirect.newSlug,
          statusCode: redirect.statusCode,
          isActive: redirect.isActive,
        }}
      />
    </div>
  );
}
