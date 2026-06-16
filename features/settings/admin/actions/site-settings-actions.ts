"use server";

import { revalidatePath, revalidateTag } from "next/cache";

import { CONTACT_PAGE_SETTINGS_CACHE_TAG } from "@/features/contact-page/lib/defaults";
import { businessSettingsSnapshot } from "@/features/settings/admin/lib/snapshots";
import { combineBusinessHours } from "@/features/settings/lib/defaults";
import { PUBLIC_SETTINGS_CACHE_TAG } from "@/features/settings/lib/keys";
import {
  loadAdminSettingsSnapshot,
  saveSettingsGroup,
} from "@/server/repositories/admin-settings-repository";
import { updateGlobalSiteSettingsSchema } from "@/lib/validations/global-site-settings";
import {
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { requireSuperAdmin } from "@/server/permissions/guards";

function revalidateAfterGlobalSiteSettingsUpdate() {
  revalidateTag(PUBLIC_SETTINGS_CACHE_TAG, "max");
  revalidateTag(CONTACT_PAGE_SETTINGS_CACHE_TAG, "max");
  revalidatePath("/admin/site-settings");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/about");
  revalidatePath("/contact");
  revalidatePath("/track");
  revalidatePath("/services", "layout");
  revalidatePath("/regions", "layout");
  revalidatePath("/sitemap.xml");
}

export async function updateGlobalSiteSettingsAction(
  input: unknown,
): Promise<ActionResult<{ ok: true }>> {
  const user = await requireSuperAdmin();
  const parsed = parseInput(updateGlobalSiteSettingsSchema, input);

  if (!parsed.success) {
    return parsed;
  }

  const before = await loadAdminSettingsSnapshot();
  const data = parsed.data;
  const combinedHours = combineBusinessHours(
    data.business.supportDaysEn,
    data.business.supportHoursEn,
    data.business.supportDaysUr,
    data.business.supportHoursUr,
  );

  const updatedBusiness = {
    ...before.business,
    businessEmail: data.business.businessEmail.trim(),
    phoneDisplayNumber: data.business.phoneDisplayNumber.trim(),
    whatsappLinkNumber: data.business.whatsappLinkNumber.trim(),
    whatsappDefaultMessageEn: data.business.whatsappDefaultMessageEn.trim(),
    whatsappDefaultMessageUr: data.business.whatsappDefaultMessageUr.trim(),
    supportDaysEn: data.business.supportDaysEn.trim(),
    supportDaysUr: data.business.supportDaysUr.trim(),
    supportHoursEn: data.business.supportHoursEn.trim(),
    supportHoursUr: data.business.supportHoursUr.trim(),
    whatsappChannelUrl: data.business.whatsappChannelUrl.trim(),
    footerDescriptionEn: data.business.footerDescriptionEn.trim(),
    footerDescriptionUr: data.business.footerDescriptionUr.trim(),
    disclaimerEn: data.business.disclaimerEn.trim(),
    disclaimerUr: data.business.disclaimerUr.trim(),
    ...combinedHours,
  };

  await Promise.all([
    saveSettingsGroup("business", updatedBusiness),
    saveSettingsGroup("publicUi", data.publicUi),
    saveSettingsGroup("forms", data.forms),
    saveSettingsGroup("branding", data.branding),
  ]);

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "settings",
    entityId: "global-site",
    before: businessSettingsSnapshot(before.business),
    after: businessSettingsSnapshot(updatedBusiness),
  });

  revalidateAfterGlobalSiteSettingsUpdate();

  return successResult({ ok: true });
}
