import "server-only";

import { unstable_cache } from "next/cache";

import {
  CONTACT_PAGE_SETTINGS_CACHE_TAG,
  CONTACT_PAGE_SETTINGS_KEY,
  mergeContactPageSettings,
} from "@/features/contact-page/lib/defaults";
import type { ContactPageSettings } from "@/features/contact-page/types";
import { overlayGlobalContactOnContactPage } from "@/features/settings/lib/global-site-content";
import { getBusinessSettings } from "@/features/settings/lib/public-settings-cache";
import { settingsRepository } from "@/server/repositories/settings-repository";

type Locale = "en";

async function loadContactPageSettings(): Promise<ContactPageSettings> {
  const [stored, business] = await Promise.all([
    settingsRepository.getValue<Partial<ContactPageSettings>>(
      CONTACT_PAGE_SETTINGS_KEY,
    ),
    getBusinessSettings()]);
  const merged = mergeContactPageSettings(stored);
  return overlayGlobalContactOnContactPage(merged, business);
}

const getCachedContactPageSettings = unstable_cache(
  loadContactPageSettings,
  ["contact-page-settings-snapshot"],
  {
    tags: [CONTACT_PAGE_SETTINGS_CACHE_TAG],
    revalidate: 300},
);

export async function getContactPageSettings(): Promise<ContactPageSettings> {
  return getCachedContactPageSettings();
}

export function localizeContactPageSettings(
  settings: ContactPageSettings,
  _locale: Locale,
) {
  return {
    heroTitle: settings.heroTitleEn ?? "",
    heroDescription: settings.heroDescriptionEn ?? "",
    supportHours: settings.supportHoursEn ?? "",
    supportDays: settings.supportDaysEn ?? "",
    formHeading: settings.formHeadingEn ?? "",
    formDescription: settings.formDescriptionEn ?? "",
    socialHeading: settings.socialHeadingEn ?? "",
    socialDescription: settings.socialDescriptionEn ?? "",
    ctaTitle: settings.ctaTitleEn ?? "",
    ctaDescription: settings.ctaDescriptionEn ?? "",
    ctaViewServicesLabel: settings.ctaViewServicesLabelEn ?? "",
    ctaWhatsappLabel: settings.ctaWhatsappLabelEn ?? "",
    serviceInterestOptions: settings.serviceInterestOptions.map((option) => ({
      value: option.value,
      label: option.labelEn ?? ""})),
    whatsappCard: {
      title: settings.whatsappCard.titleEn ?? "",
      description: settings.whatsappCard.descriptionEn ?? "",
      buttonLabel: settings.whatsappCard.buttonLabelEn ?? "",
      isActive: settings.whatsappCard.isActive},
    callCard: {
      title: settings.callCard.titleEn ?? "",
      description: settings.callCard.descriptionEn ?? "",
      buttonLabel: settings.callCard.buttonLabelEn ?? "",
      isActive: settings.callCard.isActive},
    emailCard: {
      title: settings.emailCard.titleEn ?? "",
      description: settings.emailCard.descriptionEn ?? "",
      buttonLabel: settings.emailCard.buttonLabelEn ?? "",
      isActive: settings.emailCard.isActive},
    whatsappChannelCard: {
      title: settings.whatsappChannelCard.titleEn ?? "",
      description: settings.whatsappChannelCard.descriptionEn ?? "",
      buttonLabel: settings.whatsappChannelCard.buttonLabelEn ?? "",
      isActive: settings.whatsappChannelCard.isActive},
    supportHoursCard: {
      title: settings.supportHoursCard.titleEn ?? "",
      isActive: settings.supportHoursCard.isActive}};
}
