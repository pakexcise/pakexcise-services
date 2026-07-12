"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import {
  CONTACT_PAGE_SETTINGS_CACHE_TAG,
  CONTACT_PAGE_SETTINGS_KEY} from "@/features/contact-page/lib/defaults";
import { upsertStaticPageSeo } from "@/features/cms/lib/upsert-seo";
import {
  parseInput,
  successResult,
  type ActionResult} from "@/lib/validations/common";
import { updateContactPageSettingsSchema } from "@/lib/validations/contact-page-settings";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requirePermission } from "@/server/permissions/guards";
import { settingsRepository } from "@/server/repositories/settings-repository";
import { getContactPageSettings } from "@/features/contact-page/lib/contact-page-settings-cache";

const ADMIN_CONTACT_PAGE_PATH = "/admin/contact-page";

function revalidateAfterContactPageUpdate() {
  revalidateTag(CONTACT_PAGE_SETTINGS_CACHE_TAG, "max");
  revalidatePath(ADMIN_CONTACT_PAGE_PATH);
  revalidatePath("/contact");
  revalidatePath("/sitemap.xml");
}

export async function updateContactPageSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requirePermission("settings:manage");
  const parsed = parseInput(updateContactPageSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await getContactPageSettings();

  await settingsRepository.setValue(CONTACT_PAGE_SETTINGS_KEY, parsed.data);

  await upsertStaticPageSeo("contact", {
    metaTitleEn: parsed.data.seo.metaTitleEn,
    metaDescriptionEn: parsed.data.seo.metaDescriptionEn,
    h1En: parsed.data.heroTitleEn,
    canonicalUrl: null,
    ogTitleEn: parsed.data.seo.metaTitleEn,
    ogDescriptionEn: parsed.data.seo.metaDescriptionEn,
    ogImage: null,
    twitterCard: "summary_large_image",
    robotsIndex: true,
    robotsFollow: true,
    faqSchemaJson: null,
    breadcrumbJson: null});

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "contact-page",
    before: { isPageActive: before.isPageActive, heroTitleEn: before.heroTitleEn },
    after: {
      isPageActive: parsed.data.isPageActive,
      heroTitleEn: parsed.data.heroTitleEn}});

  revalidateAfterContactPageUpdate();
  return successResult({ ok: true });
}
