import type { MetadataRoute } from "next";

import { shouldAllowSearchIndexing } from "@/config/env.server";
import { seoAbsoluteUrl } from "@/lib/seo-url";

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
        disallow: ["/admin/", "/customer/", "/agent/", "/api/"],
      },
    ],
    sitemap: seoAbsoluteUrl("/sitemap.xml"),
  };
}
