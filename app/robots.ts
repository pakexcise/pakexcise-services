import type { MetadataRoute } from "next";

import { shouldAllowSearchIndexing } from "@/config/env.server";
import { seoAbsoluteUrl } from "@/lib/seo-url";

/** Private / transactional paths that must never be crawled. */
const PRIVATE_DISALLOW_PATHS = [
  "/admin/",
  "/customer/",
  "/agent/",
  "/support/",
  "/api/",
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/choose-role",
  "/apply/",
  "/request/",
] as const;

export default function robots(): MetadataRoute.Robots {
  if (!shouldAllowSearchIndexing()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [...PRIVATE_DISALLOW_PATHS],
      },
    ],
    sitemap: seoAbsoluteUrl("/sitemap.xml"),
    host: seoAbsoluteUrl("/").replace(/\/$/, ""),
  };
}
