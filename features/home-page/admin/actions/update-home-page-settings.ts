"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { upsertStaticPageSeo } from "@/features/cms/lib/upsert-seo";
import {
  HOME_PAGE_SETTINGS_CACHE_TAG,
  HOME_PAGE_SETTINGS_KEY,
} from "@/features/home-page/lib/defaults";
import { getHomePageSettings } from "@/features/home-page/lib/home-page-settings-cache";
import {
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { updateHomePageSettingsSchema } from "@/lib/validations/home-page-settings";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";
import { settingsRepository } from "@/server/repositories/settings-repository";

const ADMIN_HOME_PAGE_PATH = "/admin/home-page";

function revalidateAfterHomePageUpdate() {
  revalidateTag(HOME_PAGE_SETTINGS_CACHE_TAG, "max");
  revalidatePath(ADMIN_HOME_PAGE_PATH);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}

export async function updateHomePageSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updateHomePageSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await getHomePageSettings();

  await settingsRepository.setValue(HOME_PAGE_SETTINGS_KEY, parsed.data);

  await upsertStaticPageSeo("home", {
    metaTitleEn: parsed.data.seo.metaTitleEn,
    metaTitleUr: parsed.data.seo.metaTitleUr,
    metaDescriptionEn: parsed.data.seo.metaDescriptionEn,
    metaDescriptionUr: parsed.data.seo.metaDescriptionUr,
    h1En: parsed.data.seo.h1En,
    h1Ur: parsed.data.seo.h1Ur,
    canonicalUrl: null,
    ogTitleEn: parsed.data.seo.metaTitleEn,
    ogTitleUr: parsed.data.seo.metaTitleUr,
    ogDescriptionEn: parsed.data.seo.metaDescriptionEn,
    ogDescriptionUr: parsed.data.seo.metaDescriptionUr,
    ogImage: null,
    twitterCard: "summary_large_image",
    robotsIndex: true,
    robotsFollow: true,
    faqSchemaJson: null,
    breadcrumbJson: null,
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "home-page",
    before: { isPageActive: before.isPageActive, heroTitleEn: before.hero.titleEn },
    after: {
      isPageActive: parsed.data.isPageActive,
      heroTitleEn: parsed.data.hero.titleEn,
    },
  });

  revalidateAfterHomePageUpdate();
  return successResult({ ok: true });
}
