import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminPageHeader } from "@/features/admin/components/admin-page-header";
import { ChecklistItemsPanel } from "@/features/services/admin/components/checklist-items-panel";
import { adminMetadata } from "@/features/admin/lib/metadata";
import { checklistItemRepository } from "@/server/repositories/checklist-item-repository";
import { enforcePermissionAccess } from "@/server/permissions/permission-access";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("admin.checklistItems");
  return adminMetadata(t("title"));
}

export default async function AdminChecklistItemsPage() {
  await enforcePermissionAccess("service:manage")();

  const locale = "en";
    const t = await getTranslations("admin.checklistItems");
  const items = await checklistItemRepository.listAdmin();

  return (
    <div className="space-y-6">
      <AdminPageHeader title={t("title")} description={t("description")} />
      <ChecklistItemsPanel items={items} labels={t.raw("panel") as Record<string, string>} />
    </div>
  );
}
