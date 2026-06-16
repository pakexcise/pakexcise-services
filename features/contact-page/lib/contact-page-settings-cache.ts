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
import { pickLocalized } from "@/lib/i18n/content";
import type { Locale } from "@/i18n/config";
import { settingsRepository } from "@/server/repositories/settings-repository";

async function loadContactPageSettings(): Promise<ContactPageSettings> {
  const [stored, business] = await Promise.all([
    settingsRepository.getValue<Partial<ContactPageSettings>>(
      CONTACT_PAGE_SETTINGS_KEY,
    ),
    getBusinessSettings(),
  ]);
  const merged = mergeContactPageSettings(stored);
  return overlayGlobalContactOnContactPage(merged, business);
}

const getCachedContactPageSettings = unstable_cache(
  loadContactPageSettings,
  ["contact-page-settings-snapshot"],
  {
    tags: [CONTACT_PAGE_SETTINGS_CACHE_TAG],
    revalidate: 300,
  },
);

export async function getContactPageSettings(): Promise<ContactPageSettings> {
  return getCachedContactPageSettings();
}

export function localizeContactPageSettings(
  settings: ContactPageSettings,
  locale: Locale,
) {
  return {
    heroTitle: pickLocalized(locale, {
      en: settings.heroTitleEn,
      ur: settings.heroTitleUr,
    }),
    heroDescription: pickLocalized(locale, {
      en: settings.heroDescriptionEn,
      ur: settings.heroDescriptionUr,
    }),
    supportHours: pickLocalized(locale, {
      en: settings.supportHoursEn,
      ur: settings.supportHoursUr,
    }),
    supportDays: pickLocalized(locale, {
      en: settings.supportDaysEn,
      ur: settings.supportDaysUr,
    }),
    formHeading: pickLocalized(locale, {
      en: settings.formHeadingEn,
      ur: settings.formHeadingUr,
    }),
    formDescription: pickLocalized(locale, {
      en: settings.formDescriptionEn,
      ur: settings.formDescriptionUr,
    }),
    socialHeading: pickLocalized(locale, {
      en: settings.socialHeadingEn,
      ur: settings.socialHeadingUr,
    }),
    socialDescription: pickLocalized(locale, {
      en: settings.socialDescriptionEn,
      ur: settings.socialDescriptionUr,
    }),
    ctaTitle: pickLocalized(locale, {
      en: settings.ctaTitleEn,
      ur: settings.ctaTitleUr,
    }),
    ctaDescription: pickLocalized(locale, {
      en: settings.ctaDescriptionEn,
      ur: settings.ctaDescriptionUr,
    }),
    ctaViewServicesLabel: pickLocalized(locale, {
      en: settings.ctaViewServicesLabelEn,
      ur: settings.ctaViewServicesLabelUr,
    }),
    ctaWhatsappLabel: pickLocalized(locale, {
      en: settings.ctaWhatsappLabelEn,
      ur: settings.ctaWhatsappLabelUr,
    }),
    serviceInterestOptions: settings.serviceInterestOptions.map((option) => ({
      value: option.value,
      label: pickLocalized(locale, {
        en: option.labelEn,
        ur: option.labelUr,
      }),
    })),
    whatsappCard: {
      title: pickLocalized(locale, {
        en: settings.whatsappCard.titleEn,
        ur: settings.whatsappCard.titleUr,
      }),
      description: pickLocalized(locale, {
        en: settings.whatsappCard.descriptionEn,
        ur: settings.whatsappCard.descriptionUr,
      }),
      buttonLabel: pickLocalized(locale, {
        en: settings.whatsappCard.buttonLabelEn,
        ur: settings.whatsappCard.buttonLabelUr,
      }),
      isActive: settings.whatsappCard.isActive,
    },
    callCard: {
      title: pickLocalized(locale, {
        en: settings.callCard.titleEn,
        ur: settings.callCard.titleUr,
      }),
      description: pickLocalized(locale, {
        en: settings.callCard.descriptionEn,
        ur: settings.callCard.descriptionUr,
      }),
      buttonLabel: pickLocalized(locale, {
        en: settings.callCard.buttonLabelEn,
        ur: settings.callCard.buttonLabelUr,
      }),
      isActive: settings.callCard.isActive,
    },
    emailCard: {
      title: pickLocalized(locale, {
        en: settings.emailCard.titleEn,
        ur: settings.emailCard.titleUr,
      }),
      description: pickLocalized(locale, {
        en: settings.emailCard.descriptionEn,
        ur: settings.emailCard.descriptionUr,
      }),
      buttonLabel: pickLocalized(locale, {
        en: settings.emailCard.buttonLabelEn,
        ur: settings.emailCard.buttonLabelUr,
      }),
      isActive: settings.emailCard.isActive,
    },
    whatsappChannelCard: {
      title: pickLocalized(locale, {
        en: settings.whatsappChannelCard.titleEn,
        ur: settings.whatsappChannelCard.titleUr,
      }),
      description: pickLocalized(locale, {
        en: settings.whatsappChannelCard.descriptionEn,
        ur: settings.whatsappChannelCard.descriptionUr,
      }),
      buttonLabel: pickLocalized(locale, {
        en: settings.whatsappChannelCard.buttonLabelEn,
        ur: settings.whatsappChannelCard.buttonLabelUr,
      }),
      isActive: settings.whatsappChannelCard.isActive,
    },
    supportHoursCard: {
      title: pickLocalized(locale, {
        en: settings.supportHoursCard.titleEn,
        ur: settings.supportHoursCard.titleUr,
      }),
      isActive: settings.supportHoursCard.isActive,
    },
  };
}
