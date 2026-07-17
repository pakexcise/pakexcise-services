import "server-only";

import { getAppEnv, shouldAllowSearchIndexing } from "@/config/env.server";
import { PRODUCTION_SITE_ORIGIN } from "@/config/env.shared";
import { activeSeoMetaWhere } from "@/features/seo/admin/lib/obsolete-seo";
import { getSeoSettings } from "@/features/settings/lib/public-settings-cache";
import { seoAbsoluteUrl } from "@/lib/seo-url";
import { prisma } from "@/server/db/prisma";

export type SeoHealthSnapshot = {
  appEnv: string;
  indexingAllowed: boolean;
  canonicalBaseUrl: string;
  sitemapEnabled: boolean;
  sitemapUrl: string;
  robotsUrl: string;
  llmsTxtUrl: string;
  googleVerificationConfigured: boolean;
  bingVerificationConfigured: boolean;
  ga4Configured: boolean;
  gtmConfigured: boolean;
  seoRecordCount: number;
  missingMetaTitleCount: number;
  missingMetaDescriptionCount: number;
  missingH1Count: number;
};

export async function getSeoHealthSnapshot(): Promise<SeoHealthSnapshot> {
  const seoSettings = await getSeoSettings();
  const activeWhere = activeSeoMetaWhere();
  const [
    seoRecordCount,
    missingMetaTitleCount,
    missingMetaDescriptionCount,
    missingH1Count,
  ] = await Promise.all([
    prisma.seoMeta.count({ where: activeWhere }),
    prisma.seoMeta.count({
      where: activeSeoMetaWhere({
        OR: [{ metaTitleEn: null }, { metaTitleEn: "" }],
      }),
    }),
    prisma.seoMeta.count({
      where: activeSeoMetaWhere({
        OR: [{ metaDescriptionEn: null }, { metaDescriptionEn: "" }],
      }),
    }),
    prisma.seoMeta.count({
      where: activeSeoMetaWhere({
        OR: [{ h1En: null }, { h1En: "" }],
      }),
    }),
  ]);

  return {
    appEnv: getAppEnv(),
    indexingAllowed: shouldAllowSearchIndexing(),
    canonicalBaseUrl: PRODUCTION_SITE_ORIGIN,
    sitemapEnabled: seoSettings.sitemapEnabled,
    sitemapUrl: seoAbsoluteUrl("/sitemap.xml"),
    robotsUrl: seoAbsoluteUrl("/robots.txt"),
    llmsTxtUrl: seoAbsoluteUrl("/llms.txt"),
    googleVerificationConfigured: Boolean(
      process.env.GOOGLE_SITE_VERIFICATION?.trim(),
    ),
    bingVerificationConfigured: Boolean(
      process.env.BING_SITE_VERIFICATION?.trim(),
    ),
    ga4Configured: Boolean(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim()),
    gtmConfigured: Boolean(process.env.NEXT_PUBLIC_GTM_ID?.trim()),
    seoRecordCount,
    missingMetaTitleCount,
    missingMetaDescriptionCount,
    missingH1Count,
  };
}
