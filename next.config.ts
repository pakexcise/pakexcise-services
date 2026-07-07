import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { execSync } from "node:child_process";
import { withSentryConfig } from "@sentry/nextjs";
import createNextIntlPlugin from "next-intl/plugin";

import { REGION_SLUG_ALIASES } from "./config/region-slugs";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  generateBuildId: async () => {
    const fromEnv = process.env.BUILD_ID?.trim();
    if (fromEnv) {
      return fromEnv;
    }

    try {
      return execSync("git rev-parse --short HEAD", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
    } catch {
      return `build-${Date.now()}`;
    }
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-dropdown-menu"],
  },
  async redirects() {
    const regionRedirects = Object.entries(REGION_SLUG_ALIASES).flatMap(
      ([legacySlug, canonicalSlug]) => [
        {
          source: `/regions/${legacySlug}`,
          destination: `/regions/${canonicalSlug}`,
          permanent: true,
        },
        {
          source: `/regions/${legacySlug}/:city`,
          destination: `/regions/${canonicalSlug}/:city`,
          permanent: true,
        },
      ],
    );

    return regionRedirects;
  },
};

const config = withBundleAnalyzer(withNextIntl(nextConfig));

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  telemetry: false,
});
