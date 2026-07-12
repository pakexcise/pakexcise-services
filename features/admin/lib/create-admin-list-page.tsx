import { copy, createT } from "@/messages";
import type { Metadata } from "next";
import { getTranslations } from "@/lib/i18n/t";

import { AdminResourceListPage } from "@/features/admin/components/admin-resource-list-page";
import { adminMetadata } from "@/features/admin/lib/metadata";


type AdminListPageConfig = {
  navKey: string;
  titleKey: string;
  descriptionKey: string;
  emptyTitleKey: string;
  emptyDescriptionKey: string;
  createLabelKey?: string;
};

export function createAdminListPage(config: AdminListPageConfig) {
  async function generateMetadata(): Promise<Metadata> {
    const t = createT(copy.admin);
    return adminMetadata(t(`nav.${config.navKey}`));
  }

  async function AdminListPage() {
    const locale = "en";
    const t = createT(copy.admin);

    return (
      <AdminResourceListPage
        title={t(config.titleKey)}
        description={t(config.descriptionKey)}
        emptyTitle={t(config.emptyTitleKey)}
        emptyDescription={t(config.emptyDescriptionKey)}
        createLabel={
          config.createLabelKey ? t(config.createLabelKey) : undefined
        }
      />
    );
  }

  return { generateMetadata, default: AdminListPage };
}
