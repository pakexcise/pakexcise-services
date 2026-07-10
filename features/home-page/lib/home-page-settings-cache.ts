import "server-only";

import { unstable_cache } from "next/cache";

import {
  HOME_PAGE_SETTINGS_CACHE_TAG,
  HOME_PAGE_SETTINGS_KEY,
  defaultVehicleVisualSettings,
  mergeHomePageSettings,
} from "@/features/home-page/lib/defaults";
import type {
  HomeContentBlock,
  HomePageSettings,
  HomeSectionKey,
  LocalizedHomeContent,
  LocalizedTextPair,
} from "@/features/home-page/types";
import { pickLocalized } from "@/lib/i18n/content";
import type { Locale } from "@/i18n/config";
import { settingsRepository } from "@/server/repositories/settings-repository";

async function loadHomePageSettings(): Promise<HomePageSettings> {
  const stored = await settingsRepository.getValue<Partial<HomePageSettings>>(
    HOME_PAGE_SETTINGS_KEY,
  );
  return mergeHomePageSettings(stored);
}

const getCachedHomePageSettings = unstable_cache(
  loadHomePageSettings,
  ["home-page-settings-snapshot"],
  {
    tags: [HOME_PAGE_SETTINGS_CACHE_TAG],
    revalidate: 300,
  },
);

export async function getHomePageSettings(): Promise<HomePageSettings> {
  return getCachedHomePageSettings();
}

function localizeBlock(block: HomeContentBlock, locale: Locale) {
  return {
    title: pickLocalized(locale, { en: block.titleEn, ur: block.titleUr }),
    description: pickLocalized(locale, {
      en: block.descriptionEn,
      ur: block.descriptionUr,
    }),
  };
}

function localizePair(pair: LocalizedTextPair, locale: Locale) {
  return pickLocalized(locale, { en: pair.en, ur: pair.ur });
}

export function localizeHomePageSettings(
  settings: HomePageSettings,
  locale: Locale,
): LocalizedHomeContent {
  const sections = Object.fromEntries(
    (Object.keys(settings.sections) as HomeSectionKey[]).map((key) => {
      const section = settings.sections[key];
      return [
        key,
        {
          isActive: section.isActive,
          displayOrder: section.displayOrder,
          title: pickLocalized(locale, {
            en: section.titleEn,
            ur: section.titleUr,
          }),
          description: pickLocalized(locale, {
            en: section.descriptionEn,
            ur: section.descriptionUr,
          }),
        },
      ];
    }),
  ) as LocalizedHomeContent["sections"];

  const vehicleVisual = settings.vehicleVisual ?? defaultVehicleVisualSettings();
  const trustBadges = Array.isArray(settings.hero?.trustBadges)
    ? settings.hero.trustBadges
    : [];
  const processCards = Array.isArray(settings.hero?.processCards)
    ? settings.hero.processCards
    : [];
  const howItWorksSteps = Array.isArray(settings.howItWorksSteps)
    ? settings.howItWorksSteps
    : [];
  const whyChooseItems = Array.isArray(settings.whyChooseItems)
    ? settings.whyChooseItems
    : [];
  const featurePoints = Array.isArray(vehicleVisual.featurePoints)
    ? vehicleVisual.featurePoints
    : [];
  const trustCards = Array.isArray(settings.about?.trustCards)
    ? settings.about.trustCards
    : [];

  return {
    hero: {
      badge: pickLocalized(locale, {
        en: settings.hero.badgeEn,
        ur: settings.hero.badgeUr,
      }),
      title: pickLocalized(locale, {
        en: settings.hero.titleEn,
        ur: settings.hero.titleUr,
      }),
      description: pickLocalized(locale, {
        en: settings.hero.descriptionEn,
        ur: settings.hero.descriptionUr,
      }),
      browseCta: pickLocalized(locale, {
        en: settings.hero.browseCtaEn,
        ur: settings.hero.browseCtaUr,
      }),
      whatsappCta: pickLocalized(locale, {
        en: settings.hero.whatsappCtaEn,
        ur: settings.hero.whatsappCtaUr,
      }),
      requestCta: pickLocalized(locale, {
        en: settings.hero.requestCtaEn,
        ur: settings.hero.requestCtaUr,
      }),
      trustBadges: trustBadges.map((badge) => localizePair(badge, locale)),
      processCards: processCards.map((card) => localizeBlock(card, locale)),
    },
    sections,
    optionsNote: pickLocalized(locale, {
      en: settings.optionsNoteEn,
      ur: settings.optionsNoteUr,
    }),
    howItWorksSteps: howItWorksSteps.map((step) => localizeBlock(step, locale)),
    whyChooseItems: whyChooseItems.map((item) => localizeBlock(item, locale)),
    vehicleVisual: {
      imagePath:
        vehicleVisual.imagePath?.trim() ||
        defaultVehicleVisualSettings().imagePath,
      imageAlt: pickLocalized(locale, {
        en: vehicleVisual.imageAltEn,
        ur: vehicleVisual.imageAltUr,
      }),
      featurePoints: featurePoints.map((item) => localizeBlock(item, locale)),
      browseCta: pickLocalized(locale, {
        en: vehicleVisual.browseCtaEn,
        ur: vehicleVisual.browseCtaUr,
      }),
      whatsappCta: pickLocalized(locale, {
        en: vehicleVisual.whatsappCtaEn,
        ur: vehicleVisual.whatsappCtaUr,
      }),
      requestCta: pickLocalized(locale, {
        en: vehicleVisual.requestCtaEn,
        ur: vehicleVisual.requestCtaUr,
      }),
    },
    about: {
      title: pickLocalized(locale, {
        en: settings.about.titleEn,
        ur: settings.about.titleUr,
      }),
      description: pickLocalized(locale, {
        en: settings.about.descriptionEn,
        ur: settings.about.descriptionUr,
      }),
      additional: pickLocalized(locale, {
        en: settings.about.additionalEn,
        ur: settings.about.additionalUr,
      }),
      cta: pickLocalized(locale, {
        en: settings.about.ctaEn,
        ur: settings.about.ctaUr,
      }),
      trustCards: trustCards.map((card) => localizeBlock(card, locale)),
    },
    footerDescription: pickLocalized(locale, {
      en: settings.footerDescriptionEn,
      ur: settings.footerDescriptionUr,
    }),
  };
}

export function getOrderedActiveHomeSections(
  settings: HomePageSettings,
): Array<{ key: HomeSectionKey; displayOrder: number }> {
  return (Object.keys(settings.sections) as HomeSectionKey[])
    .filter((key) => settings.sections[key].isActive)
    .map((key) => ({
      key,
      displayOrder: settings.sections[key].displayOrder,
    }))
    .sort((a, b) => a.displayOrder - b.displayOrder);
}
