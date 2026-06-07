import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/utils";

const staticPaths = [
  "/",
  "/services",
  "/regions",
  "/guides",
  "/faqs",
  "/track",
  "/about",
  "/contact",
  "/privacy",
  "/terms",
  "/disclaimer",
  "/refund",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return staticPaths.map((path) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: path === "/" ? "daily" : "weekly",
    priority: path === "/" ? 1 : 0.7,
  }));
}
