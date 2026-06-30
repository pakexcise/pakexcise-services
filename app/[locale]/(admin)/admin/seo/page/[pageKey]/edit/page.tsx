import { redirect } from "@/i18n/navigation";
import {
  LEGACY_LEGAL_PAGE_KEY_MAP,
  type CanonicalLegalPageSlug,
} from "@/features/legal-pages/lib/constants";
import { legalPageKeys, type LegalPageKey } from "@/lib/validations/admin-page-content";
import { adminLegalPageRepository } from "@/server/repositories/admin-legal-page-repository";
import { enforcePlatformManageAccess } from "@/server/permissions/platform-access";
import { getCurrentLocale } from "@/server/i18n/get-locale";

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
  const locale = await getCurrentLocale();
  await enforcePlatformManageAccess();

  const { pageKey } = await params;

  if (!legalPageKeys.includes(pageKey as LegalPageKey)) {
    redirect({ href: "/admin/legal-pages", locale });
  }

  const slug = resolveLegacySlug(pageKey) ?? pageKey;
  const page = await adminLegalPageRepository.findBySlug(slug);

  if (page) {
    redirect({ href: `/admin/legal-pages/${page.id}/edit`, locale });
  }

  redirect({ href: "/admin/legal-pages", locale });
}
