import "server-only";

import { unstable_cache } from "next/cache";

import {
  HOME_PAGE_SETTINGS_CACHE_TAG,
  HOME_PAGE_SETTINGS_KEY,
  defaultVehicleVisualSettings,
  mergeHomePageSettings,
} from "@/features/home-page/lib/defaults";
import { resolveHomeVehicleVisualImagePath } from "@/features/home-page/lib/vehicle-visual";
import type {
  HomeContentBlock,
  HomePageSettings,
  HomeSectionKey,
  LocalizedHomeContent,
  LocalizedTextPair,
} from "@/features/home-page/types";
import { settingsRepository } from "@/server/repositories/settings-repository";

type Locale = "en";

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

function localizeBlock(block: HomeContentBlock, _locale: Locale) {
  return {
    title: block.titleEn ?? "",
    description: block.descriptionEn ?? "",
  };
}

function localizePair(pair: LocalizedTextPair, _locale: Locale) {
  return pair.en ?? "";
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
          title: section.titleEn ?? "",
          description: section.descriptionEn ?? "",
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
      badge: settings.hero.badgeEn ?? "",
      title: settings.hero.titleEn ?? "",
      description: settings.hero.descriptionEn ?? "",
      browseCta: settings.hero.browseCtaEn ?? "",
      whatsappCta: settings.hero.whatsappCtaEn ?? "",
      requestCta: settings.hero.requestCtaEn ?? "",
      trustBadges: trustBadges.map((badge) => localizePair(badge, locale)),
      processCards: processCards.map((card) => localizeBlock(card, locale)),
    },
    sections,
    optionsNote: settings.optionsNoteEn ?? "",
    howItWorksSteps: howItWorksSteps.map((step) => localizeBlock(step, locale)),
    whyChooseItems: whyChooseItems.map((item) => localizeBlock(item, locale)),
    vehicleVisual: {
      imagePath: resolveHomeVehicleVisualImagePath(vehicleVisual.imagePath),
      imageAlt: vehicleVisual.imageAltEn ?? "",
      featurePoints: featurePoints.map((item) => localizeBlock(item, locale)),
      browseCta: vehicleVisual.browseCtaEn ?? "",
      whatsappCta: vehicleVisual.whatsappCtaEn ?? "",
      requestCta: vehicleVisual.requestCtaEn ?? "",
    },
    about: {
      title: settings.about.titleEn ?? "",
      description: settings.about.descriptionEn ?? "",
      additional: settings.about.additionalEn ?? "",
      cta: settings.about.ctaEn ?? "",
      trustCards: trustCards.map((card) => localizeBlock(card, locale)),
    },
    footerDescription: settings.footerDescriptionEn ?? "",
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
