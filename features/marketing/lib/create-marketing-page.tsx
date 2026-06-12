import { createContentPage } from "@/features/marketing/lib/content-page";

type MarketingPageConfig = {
  pageKey: string;
  path: string;
  breadcrumbLabel: { en: string; ur: string };
  showSocialLinks?: boolean;
  showCta?: boolean;
  applyHref?: string;
};

export function createMarketingPage(config: MarketingPageConfig) {
  return createContentPage({
    ...config,
    showDisclaimer: true,
    showCta: config.showCta ?? true,
  });
}
