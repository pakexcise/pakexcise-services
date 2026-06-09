import "server-only";

import { notFound } from "next/navigation";

import { getFeatureFlagSettings } from "@/features/settings/lib/public-settings-cache";
import type { FeatureFlagSettings } from "@/features/settings/types";

export async function getFeatureFlags(): Promise<FeatureFlagSettings> {
  return getFeatureFlagSettings();
}

export async function requireAgentModuleEnabled(): Promise<void> {
  const flags = await getFeatureFlags();

  if (!flags.agentModuleEnabled) {
    notFound();
  }
}

export async function requireBlogEnabled(): Promise<void> {
  const flags = await getFeatureFlags();

  if (!flags.blogEnabled) {
    notFound();
  }
}

export async function requireGuidesEnabled(): Promise<void> {
  const flags = await getFeatureFlags();

  if (!flags.guidesEnabled) {
    notFound();
  }
}
