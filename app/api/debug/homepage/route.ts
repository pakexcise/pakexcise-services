import { NextResponse } from "next/server";

import { getHomePageSettings, localizeHomePageSettings } from "@/features/home-page/lib/home-page-settings-cache";
import { getBusinessSettings, getFeatureFlagSettings } from "@/features/settings/lib/public-settings-cache";
import {
  blogPostRepository,
  documentRequirementRepository,
  faqRepository,
  getFeaturedServices,
  guideRepository,
  regionRepository,
} from "@/server/repositories";
import { serviceCategoryRepository } from "@/server/repositories/service-category-repository";

export const dynamic = "force-dynamic";

function errorMessage(error: unknown): string {
  if (error instanceof Error) {
    return `${error.name}: ${error.message}`;
  }

  return String(error);
}

/**
 * Temporary production diagnostic for homepage outage.
 * Protected by HOMEPAGE_DEBUG_SECRET (or NOTIFICATION_DISPATCH_SECRET).
 * Remove once the root cause is confirmed fixed.
 */
export async function GET(request: Request) {
  const expected =
    process.env.HOMEPAGE_DEBUG_SECRET?.trim() ||
    process.env.NOTIFICATION_DISPATCH_SECRET?.trim();
  const provided = new URL(request.url).searchParams.get("secret")?.trim();

  if (!expected || !provided || provided !== expected) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const steps: Array<{ step: string; ok: boolean; detail?: string; count?: number }> = [];

  async function run<T>(
    step: string,
    operation: () => Promise<T>,
    summarize?: (value: T) => number | undefined,
  ): Promise<T | null> {
    try {
      const value = await operation();
      steps.push({
        step,
        ok: true,
        count: summarize?.(value),
      });
      return value;
    } catch (error) {
      steps.push({
        step,
        ok: false,
        detail: errorMessage(error),
      });
      return null;
    }
  }

  const settings = await run("getHomePageSettings", () => getHomePageSettings());
  await run("localizeHomePageSettings", async () => {
    if (!settings) {
      throw new Error("settings unavailable");
    }
    return localizeHomePageSettings(settings, "en");
  });
  await run("getBusinessSettings", () => getBusinessSettings());
  await run("getFeatureFlagSettings", () => getFeatureFlagSettings());
  await run(
    "listPublicGrouped",
    () => serviceCategoryRepository.listPublicGrouped(),
    (value) => value.length,
  );
  await run(
    "getFeaturedServices",
    () => getFeaturedServices(settings?.limits.popularCount ?? 6),
    (value) => value.length,
  );
  await run(
    "listPublicWithServiceCounts",
    () => regionRepository.listPublicWithServiceCounts(),
    (value) => value.length,
  );
  await run(
    "listFeaturedGlobalPublic",
    () => faqRepository.listFeaturedGlobalPublic(settings?.limits.faqCount ?? 8),
    (value) => value.length,
  );
  await run(
    "listPublicPreview",
    () =>
      documentRequirementRepository.listPublicPreview(
        settings?.limits.documentCount ?? 8,
      ),
    (value) => value.length,
  );
  await run(
    "blog.listPublished",
    () => blogPostRepository.listPublished(settings?.limits.blogCount ?? 6),
    (value) => value.length,
  );
  await run(
    "guide.listPublished",
    () => guideRepository.listPublished(settings?.limits.guideCount ?? 6),
    (value) => value.length,
  );

  const failed = steps.filter((step) => !step.ok);

  return NextResponse.json({
    ok: failed.length === 0,
    failedCount: failed.length,
    steps,
  });
}
