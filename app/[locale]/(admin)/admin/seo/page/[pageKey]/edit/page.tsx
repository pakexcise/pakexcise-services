import { redirect } from "next/navigation";

import {
  LEGACY_LEGAL_PAGE_KEY_MAP,
  type CanonicalLegalPageSlug,
} from "@/features/legal-pages/lib/constants";
import { legalPageKeys, type LegalPageKey } from "@/lib/validations/admin-page-content";
import { adminLegalPageRepository } from "@/server/repositories/admin-legal-page-repository";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";

type LegacyLegalEditPageProps = {
  params: Promise<{ pageKey: string }>;
};

function resolveLegacySlug(pageKey: string): CanonicalLegalPageSlug | null {
  if (pageKey in LEGACY_LEGAL_PAGE_KEY_MAP) {
    return LEGACY_LEGAL_PAGE_KEY_MAP[pageKey] ?? null;
  }

  return null;
}

export default async function AdminLegacyLegalPageEditRedirect({
  params,
}: LegacyLegalEditPageProps) {
  await enforcePlatformManageAccess();

  const { pageKey } = await params;

  if (!legalPageKeys.includes(pageKey as LegalPageKey)) {
    redirect("/admin/legal-pages");
  }

  const slug = resolveLegacySlug(pageKey) ?? pageKey;
  const page = await adminLegalPageRepository.findBySlug(slug);

  if (page) {
    redirect(`/admin/legal-pages/${page.id}/edit`);
  }

  redirect("/admin/legal-pages");
}
