/**
 * Recommended blog image specs for admin uploads.
 * Use these when creating featured images and in-content infographics.
 */
export const BLOG_IMAGE_SPEC = {
  /** Primary featured image on blog detail hero */
  featured: {
    width: 1600,
    height: 900,
    aspectRatio: "16:9",
    format: "WebP or JPEG",
    maxFileSizeMb: 500,
  },
  /** Open Graph / social share image */
  og: {
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
    format: "WebP or JPEG",
  },
  /** In-content infographic blocks */
  content: {
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
    format: "WebP or JPEG",
  },
  /** Maximum width rendered on site (prevents upscaling blur) */
  displayMaxWidth: 1200,
} as const;

export const BLOG_IMAGE_ADMIN_HINT =
  "Recommended: 1600×900 px (16:9), WebP or JPEG, under 500 KB. This image is also used for social sharing (OG). If empty, your site logo icon is used.";
