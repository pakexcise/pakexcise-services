import "server-only";

import { revalidatePath } from "next/cache";

import {
  parseRobotsCsv,
  parseSeoCsvRows,
  resolveSeoCsvIdentity,
  type SeoCsvRow,
} from "@/features/seo/admin/lib/seo-csv";
import { publicPathFromSeoPageKey } from "@/features/seo/admin/lib/seo-page-paths";
import { upsertAutoRedirects } from "@/features/redirects/lib/upsert-auto-redirect";
import { prisma } from "@/server/db/client";
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";

export type SeoCsvImportResult = {
  total: number;
  updated: number;
  unchanged: number;
  skipped: number;
  errors: string[];
};

function emptyToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function slugFromPath(
  path: string,
  kind: "service" | "region" | "city" | "blog" | "legal" | "static",
  regionSlug?: string,
): string | null {
  const cleaned = path.trim().replace(/\/+$/, "") || "/";
  const parts = cleaned.split("/").filter(Boolean);

  switch (kind) {
    case "service":
      return parts[0] === "services" && parts[1] ? parts[1]! : null;
    case "region":
      return parts[0] === "regions" && parts[1] && !parts[2] ? parts[1]! : null;
    case "city":
      if (parts[0] === "regions" && parts[1] && parts[2]) {
        if (regionSlug && parts[1] !== regionSlug) return null;
        return parts[2]!;
      }
      return null;
    case "blog":
      return parts[0] === "blog" && parts[1] ? parts[1]! : null;
    case "legal":
      return parts.length === 1 ? parts[0]! : null;
    case "static":
      if (parts.length === 0) return "home";
      if (parts.length === 1) return parts[0]!;
      return null;
    default:
      return null;
  }
}

function valuesEqual(
  left: string | null | undefined,
  right: string | null | undefined,
): boolean {
  return (left?.trim() ?? "") === (right?.trim() ?? "");
}

function resolveNextSlug(input: {
  row: SeoCsvRow;
  currentSlug: string;
  kind: "service" | "region" | "city" | "blog" | "legal" | "static";
  regionSlug?: string;
}): string {
  const explicit = input.row.slug.trim();
  if (explicit) {
    const leaf = explicit.replace(/^\/+/, "").split("/").pop() ?? explicit;
    return normalizeSlug(leaf);
  }

  const fromPath = slugFromPath(input.row.path, input.kind, input.regionSlug);
  if (fromPath) {
    return normalizeSlug(fromPath);
  }

  return input.currentSlug;
}

export async function importSeoCsvText(input: {
  csvText: string;
  actorId: string;
}): Promise<SeoCsvImportResult> {
  const rows = parseSeoCsvRows(input.csvText);
  const result: SeoCsvImportResult = {
    total: rows.length,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    errors: [],
  };

  const revalidatePaths = new Set<string>([
    "/admin/seo",
    "/admin/seo/full",
    "/sitemap.xml",
  ]);

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]!;
    const rowLabel = `row ${index + 2}`;

    if (!row.id) {
      result.skipped += 1;
      result.errors.push(`${rowLabel}: missing id`);
      continue;
    }

    const existing = await adminSeoRepository.findByIdForEdit(row.id);
    if (!existing) {
      result.skipped += 1;
      result.errors.push(`${rowLabel}: SEO record not found for id ${row.id}`);
      continue;
    }

    if (existing.pageKey.startsWith("guide:")) {
      result.skipped += 1;
      result.errors.push(`${rowLabel}: guide SEO records are obsolete`);
      continue;
    }

    try {
      const robots = parseRobotsCsv(row.robots);
      const identity = resolveSeoCsvIdentity(existing);
      const seoData = {
        h1En: emptyToNull(row.h1),
        metaTitleEn: emptyToNull(row.meta_title),
        metaDescriptionEn: emptyToNull(row.meta_description),
        focusKeywords: emptyToNull(row.focused_keywords),
        ogTitleEn: emptyToNull(row.og_title),
        ogDescriptionEn: emptyToNull(row.og_description),
        canonicalUrl: emptyToNull(row.canonical_url),
        robotsIndex: robots.robotsIndex,
        robotsFollow: robots.robotsFollow,
      };

      const seoChanged =
        !valuesEqual(existing.h1En, row.h1) ||
        !valuesEqual(existing.metaTitleEn, row.meta_title) ||
        !valuesEqual(existing.metaDescriptionEn, row.meta_description) ||
        !valuesEqual(existing.focusKeywords, row.focused_keywords) ||
        !valuesEqual(existing.ogTitleEn, row.og_title) ||
        !valuesEqual(existing.ogDescriptionEn, row.og_description) ||
        !valuesEqual(existing.canonicalUrl, row.canonical_url) ||
        existing.robotsIndex !== robots.robotsIndex ||
        existing.robotsFollow !== robots.robotsFollow;

      let entityChanged = false;
      let nextPageKey = existing.pageKey;

      if (existing.serviceId && existing.service) {
        const nextSlug = resolveNextSlug({
          row,
          currentSlug: existing.service.slug,
          kind: "service",
        });
        const nextName = row.name.trim() || existing.service.nameEn;

        if (
          nextSlug !== existing.service.slug ||
          nextName !== existing.service.nameEn
        ) {
          const conflict = await prisma.service.findFirst({
            where: {
              slug: nextSlug,
              deletedAt: null,
              id: { not: existing.serviceId },
            },
            select: { id: true },
          });
          if (conflict) {
            throw new Error(`service slug already in use: ${nextSlug}`);
          }

          await prisma.service.update({
            where: { id: existing.serviceId },
            data: { slug: nextSlug, nameEn: nextName },
          });

          if (nextSlug !== existing.service.slug) {
            nextPageKey = `service:${nextSlug}`;
            await upsertAutoRedirects({
              kind: "service",
              oldSlug: existing.service.slug,
              newSlug: nextSlug,
              actorId: input.actorId,
            });
            revalidatePaths.add(`/services/${existing.service.slug}`);
            revalidatePaths.add(`/services/${nextSlug}`);
          }

          entityChanged = true;
        }
      } else if (existing.cityId && existing.city) {
        const regionSlug = existing.city.region?.slug;
        if (!regionSlug) {
          throw new Error("city is missing region slug");
        }

        const nextSlug = resolveNextSlug({
          row,
          currentSlug: existing.city.slug,
          kind: "city",
          regionSlug,
        });
        const nextName = row.name.trim() || existing.city.nameEn;

        if (
          nextSlug !== existing.city.slug ||
          nextName !== existing.city.nameEn
        ) {
          const conflict = await prisma.city.findFirst({
            where: {
              slug: nextSlug,
              deletedAt: null,
              id: { not: existing.cityId },
              region: { slug: regionSlug },
            },
            select: { id: true },
          });
          if (conflict) {
            throw new Error(`city slug already in use: ${nextSlug}`);
          }

          await prisma.city.update({
            where: { id: existing.cityId },
            data: { slug: nextSlug, nameEn: nextName },
          });

          if (nextSlug !== existing.city.slug) {
            nextPageKey = `city:${regionSlug}:${nextSlug}`;
            await upsertAutoRedirects({
              kind: "city",
              regionSlug,
              oldSlug: existing.city.slug,
              newSlug: nextSlug,
              actorId: input.actorId,
            });
            revalidatePaths.add(`/regions/${regionSlug}/${existing.city.slug}`);
            revalidatePaths.add(`/regions/${regionSlug}/${nextSlug}`);
          }

          entityChanged = true;
        }
      } else if (existing.regionId && existing.region) {
        const nextSlug = resolveNextSlug({
          row,
          currentSlug: existing.region.slug,
          kind: "region",
        });
        const nextName = row.name.trim() || existing.region.nameEn;

        if (
          nextSlug !== existing.region.slug ||
          nextName !== existing.region.nameEn
        ) {
          const conflict = await prisma.region.findFirst({
            where: {
              slug: nextSlug,
              deletedAt: null,
              id: { not: existing.regionId },
            },
            select: { id: true },
          });
          if (conflict) {
            throw new Error(`region slug already in use: ${nextSlug}`);
          }

          await prisma.region.update({
            where: { id: existing.regionId },
            data: { slug: nextSlug, nameEn: nextName },
          });

          if (nextSlug !== existing.region.slug) {
            nextPageKey = `region:${nextSlug}`;
            await upsertAutoRedirects({
              kind: "region",
              oldSlug: existing.region.slug,
              newSlug: nextSlug,
              actorId: input.actorId,
            });
            revalidatePaths.add(`/regions/${existing.region.slug}`);
            revalidatePaths.add(`/regions/${nextSlug}`);
          }

          entityChanged = true;
        }
      } else if (existing.blogPostId && existing.blogPost) {
        const nextSlug = resolveNextSlug({
          row,
          currentSlug: existing.blogPost.slug,
          kind: "blog",
        });
        const nextName = row.name.trim() || existing.blogPost.titleEn;
        const keywordsChanged = !valuesEqual(
          existing.blogPost.focusKeywords,
          row.focused_keywords,
        );

        if (
          nextSlug !== existing.blogPost.slug ||
          nextName !== existing.blogPost.titleEn ||
          keywordsChanged
        ) {
          const conflict = await prisma.blogPost.findFirst({
            where: {
              slug: nextSlug,
              id: { not: existing.blogPostId },
            },
            select: { id: true },
          });
          if (conflict) {
            throw new Error(`blog slug already in use: ${nextSlug}`);
          }

          await prisma.blogPost.update({
            where: { id: existing.blogPostId },
            data: {
              slug: nextSlug,
              titleEn: nextName,
              focusKeywords: emptyToNull(row.focused_keywords),
            },
          });

          if (nextSlug !== existing.blogPost.slug) {
            nextPageKey = `blog:${nextSlug}`;
            await upsertAutoRedirects({
              kind: "blog",
              oldSlug: existing.blogPost.slug,
              newSlug: nextSlug,
              actorId: input.actorId,
            });
            revalidatePaths.add(`/blog/${existing.blogPost.slug}`);
            revalidatePaths.add(`/blog/${nextSlug}`);
          }

          entityChanged = true;
        }
      } else if (existing.legalPageId && existing.legalPage) {
        const nextSlug = resolveNextSlug({
          row,
          currentSlug: existing.legalPage.slug,
          kind: "legal",
        });
        const nextName = row.name.trim() || existing.legalPage.titleEn;

        if (
          nextSlug !== existing.legalPage.slug ||
          nextName !== existing.legalPage.titleEn
        ) {
          const conflict = await prisma.legalPage.findFirst({
            where: {
              slug: nextSlug,
              id: { not: existing.legalPageId },
            },
            select: { id: true },
          });
          if (conflict) {
            throw new Error(`legal page slug already in use: ${nextSlug}`);
          }

          const oldPath =
            publicPathFromSeoPageKey(`legal:${existing.legalPage.slug}`) ??
            `/${existing.legalPage.slug}`;
          const newPath =
            publicPathFromSeoPageKey(`legal:${nextSlug}`) ?? `/${nextSlug}`;

          await prisma.legalPage.update({
            where: { id: existing.legalPageId },
            data: { slug: nextSlug, titleEn: nextName },
          });

          if (nextSlug !== existing.legalPage.slug) {
            nextPageKey = `legal:${nextSlug}`;
            await upsertAutoRedirects({
              kind: "legal",
              oldSlug: oldPath,
              newSlug: newPath,
              actorId: input.actorId,
            });
            revalidatePaths.add(oldPath);
            revalidatePaths.add(newPath);
          }

          entityChanged = true;
        }
      } else {
        const currentPath =
          publicPathFromSeoPageKey(existing.pageKey) ??
          (existing.pageKey === "home" ? "/" : `/${existing.pageKey}`);
        const nextSlug = resolveNextSlug({
          row,
          currentSlug: identity.slug,
          kind: "static",
        });

        if (nextSlug === "home") {
          nextPageKey = "home";
        } else if (existing.pageKey.startsWith("page:")) {
          nextPageKey = `page:${nextSlug}`;
        } else if (!existing.pageKey.includes(":")) {
          nextPageKey = nextSlug;
        }

        if (nextPageKey !== existing.pageKey) {
          const conflict = await prisma.seoMeta.findFirst({
            where: {
              pageKey: nextPageKey,
              id: { not: existing.id },
            },
            select: { id: true },
          });
          if (conflict) {
            throw new Error(`page key already in use: ${nextPageKey}`);
          }

          const nextPath =
            publicPathFromSeoPageKey(nextPageKey) ?? `/${nextSlug}`;

          if (currentPath !== nextPath) {
            await upsertAutoRedirects({
              kind: "path",
              oldPath: currentPath,
              newPath: nextPath,
              actorId: input.actorId,
            });
          }

          revalidatePaths.add(currentPath);
          revalidatePaths.add(nextPath);
          entityChanged = true;
        }
      }

      if (seoChanged || nextPageKey !== existing.pageKey) {
        await prisma.seoMeta.update({
          where: { id: existing.id },
          data: {
            ...seoData,
            ...(nextPageKey !== existing.pageKey ? { pageKey: nextPageKey } : {}),
          },
        });
      }

      if (seoChanged || entityChanged) {
        result.updated += 1;
        const publicPath = publicPathFromSeoPageKey(nextPageKey);
        if (publicPath) revalidatePaths.add(publicPath);
      } else {
        result.unchanged += 1;
      }
    } catch (error) {
      result.skipped += 1;
      result.errors.push(
        `${rowLabel} (${row.id}): ${
          error instanceof Error ? error.message : "import failed"
        }`,
      );
    }
  }

  for (const path of revalidatePaths) {
    revalidatePath(path);
  }

  return result;
}
