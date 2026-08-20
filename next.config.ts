import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";
import { execSync } from "node:child_process";
import { withSentryConfig } from "@sentry/nextjs";

import { REGION_SLUG_ALIASES } from "./config/region-slugs";
import { buildLegacyServiceNextRedirects } from "./config/legacy-url-redirects";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  // Keep metadata in the initial HTML for crawlers and share unfurlers.
  htmlLimitedBots:
    /Googlebot|Google-InspectionTool|bingbot|BingPreview|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|facebookexternalhit|facebookcatalog|Twitterbot|LinkedInBot|Slackbot|Discordbot|WhatsApp|TelegramBot|SkypeUriPreview|Applebot|SemrushBot|AhrefsBot|DotBot|MJ12bot|GPTBot|ClaudeBot|Claude-User|anthropic|CCBot|Bytespider|PetalBot|curl|Wget|python-requests|Go-http-client|axios|node-fetch|undici/i,
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
    /** Keep logo/srcset candidates close to real display sizes (avoids w=3840 downloads). */
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24,
  },
  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-dialog",
      "@radix-ui/react-accordion",
      "@radix-ui/react-tabs",
      "@radix-ui/react-select",
      "@radix-ui/react-popover",
      "@radix-ui/react-tooltip",
      "@radix-ui/react-slot",
      "date-fns",
    ],
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

    const legalRedirects = [
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      {
        source: "/terms",
        destination: "/terms-and-conditions",
        permanent: true,
      },
      {
        source: "/refund",
        destination: "/refund-policy",
        permanent: true,
      },
    ];

    const legacyGuidesRedirects = [
      {
        source: "/guides",
        destination: "/blog",
        permanent: true,
      },
      {
        source: "/guides/:slug*",
        destination: "/blog",
        permanent: true,
      },
    ];

    const legacyLocaleRedirects = [
      {
        source: "/en",
        destination: "/",
        permanent: true,
      },
      {
        source: "/ur",
        destination: "/",
        permanent: true,
      },
      {
        source: "/en/:path*",
        destination: "/:path*",
        permanent: true,
      },
      {
        source: "/ur/:path*",
        destination: "/:path*",
        permanent: true,
      },
    ];

    return [
      ...legacyLocaleRedirects,
      ...legacyGuidesRedirects,
      ...legalRedirects,
      ...regionRedirects,
      ...buildLegacyServiceNextRedirects(),
    ];
  },
};

const config = withBundleAnalyzer(nextConfig);

export default withSentryConfig(config, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  silent: !process.env.CI,
  widenClientFileUpload: true,
  disableLogger: true,
  telemetry: false,
});
