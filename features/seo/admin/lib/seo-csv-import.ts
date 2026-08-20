import "server-only";

import { revalidatePath } from "next/cache";

import {
  classifySeoCategory,
  parseRobotsCsv,
  parseSeoCsvRows,
  resolveSeoCsvIdentity,
  type SeoCsvRow,
} from "@/features/seo/admin/lib/seo-csv";
import {
  emptySeoCsvPreviewStats,
  type SeoCsvCategory,
  type SeoCsvPreviewStats,
  type SeoCsvRowPreview,
} from "@/features/seo/admin/lib/seo-csv-shared";
import { publicPathFromSeoPageKey } from "@/features/seo/admin/lib/seo-page-paths";
import { upsertAutoRedirects } from "@/features/redirects/lib/upsert-auto-redirect";
import { prisma } from "@/server/db/client";
import {
  adminSeoRepository,
  type AdminSeoListItem,
} from "@/server/repositories/admin-seo-repository";

export type SeoCsvImportResult = SeoCsvPreviewStats & {
  applied: boolean;
};

type ExistingSeo = NonNullable<
  Awaited<ReturnType<typeof adminSeoRepository.findByIdForEdit>>
>;

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

function collectChangedFields(
  existing: ExistingSeo,
  row: SeoCsvRow,
): string[] {
  const robots = parseRobotsCsv(row.robots);
  const identity = resolveSeoCsvIdentity(existing as AdminSeoListItem);
  const changed: string[] = [];

  const seoPairs: Array<[string, string | null | undefined, string]> = [
    ["h1", existing.h1En, row.h1],
    ["meta_title", existing.metaTitleEn, row.meta_title],
    ["meta_description", existing.metaDescriptionEn, row.meta_description],
    ["focused_keywords", existing.focusKeywords, row.focused_keywords],
    ["og_title", existing.ogTitleEn, row.og_title],
    ["og_description", existing.ogDescriptionEn, row.og_description],
    ["canonical_url", existing.canonicalUrl, row.canonical_url],
  ];

  for (const [field, current, next] of seoPairs) {
    if (!valuesEqual(current, next)) changed.push(field);
  }

  const currentRobots = `${existing.robotsIndex ? "index" : "noindex"},${
    existing.robotsFollow ? "follow" : "nofollow"
  }`;
  const nextRobots = `${robots.robotsIndex ? "index" : "noindex"},${
    robots.robotsFollow ? "follow" : "nofollow"
  }`;
  if (currentRobots !== nextRobots) changed.push("robots");

  if (existing.service) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.service.slug,
      kind: "service",
    });
    const nextName = row.name.trim() || existing.service.nameEn;
    if (nextName !== existing.service.nameEn) changed.push("name");
    if (nextSlug !== existing.service.slug) {
      changed.push("slug");
      changed.push("path");
    }
  } else if (existing.city) {
    const regionSlug = existing.city.region?.slug ?? "";
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.city.slug,
      kind: "city",
      regionSlug,
    });
    const nextName = row.name.trim() || existing.city.nameEn;
    if (nextName !== existing.city.nameEn) changed.push("name");
    if (nextSlug !== existing.city.slug) {
      changed.push("slug");
      changed.push("path");
    }
  } else if (existing.region) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.region.slug,
      kind: "region",
    });
    const nextName = row.name.trim() || existing.region.nameEn;
    if (nextName !== existing.region.nameEn) changed.push("name");
    if (nextSlug !== existing.region.slug) {
      changed.push("slug");
      changed.push("path");
    }
  } else if (existing.blogPost) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.blogPost.slug,
      kind: "blog",
    });
    const nextName = row.name.trim() || existing.blogPost.titleEn;
    if (nextName !== existing.blogPost.titleEn) changed.push("name");
    if (nextSlug !== existing.blogPost.slug) {
      changed.push("slug");
      changed.push("path");
    }
  } else if (existing.legalPage) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.legalPage.slug,
      kind: "legal",
    });
    const nextName = row.name.trim() || existing.legalPage.titleEn;
    if (nextName !== existing.legalPage.titleEn) changed.push("name");
    if (nextSlug !== existing.legalPage.slug) {
      changed.push("slug");
      changed.push("path");
    }
  } else {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: identity.slug,
      kind: "static",
    });
    let nextPageKey = existing.pageKey;
    if (nextSlug === "home") nextPageKey = "home";
    else if (existing.pageKey.startsWith("page:")) nextPageKey = `page:${nextSlug}`;
    else if (!existing.pageKey.includes(":")) nextPageKey = nextSlug;

    if (nextPageKey !== existing.pageKey) {
      changed.push("slug");
      changed.push("path");
    }
    if (row.name.trim() && row.name.trim() !== identity.name) {
      // Static name is display-only unless path/slug changes.
    }
  }

  return Array.from(new Set(changed));
}

async function detectSlugConflict(
  existing: ExistingSeo,
  row: SeoCsvRow,
): Promise<string | null> {
  const identity = resolveSeoCsvIdentity(existing as AdminSeoListItem);

  if (existing.serviceId && existing.service) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.service.slug,
      kind: "service",
    });
    if (nextSlug === existing.service.slug) return null;
    const conflict = await prisma.service.findFirst({
      where: {
        slug: nextSlug,
        deletedAt: null,
        id: { not: existing.serviceId },
      },
      select: { id: true },
    });
    return conflict ? `service slug already in use: ${nextSlug}` : null;
  }

  if (existing.cityId && existing.city) {
    const regionSlug = existing.city.region?.slug;
    if (!regionSlug) return "city is missing region slug";
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.city.slug,
      kind: "city",
      regionSlug,
    });
    if (nextSlug === existing.city.slug) return null;
    const conflict = await prisma.city.findFirst({
      where: {
        slug: nextSlug,
        deletedAt: null,
        id: { not: existing.cityId },
        region: { slug: regionSlug },
      },
      select: { id: true },
    });
    return conflict ? `city slug already in use: ${nextSlug}` : null;
  }

  if (existing.regionId && existing.region) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.region.slug,
      kind: "region",
    });
    if (nextSlug === existing.region.slug) return null;
    const conflict = await prisma.region.findFirst({
      where: {
        slug: nextSlug,
        deletedAt: null,
        id: { not: existing.regionId },
      },
      select: { id: true },
    });
    return conflict ? `region slug already in use: ${nextSlug}` : null;
  }

  if (existing.blogPostId && existing.blogPost) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.blogPost.slug,
      kind: "blog",
    });
    if (nextSlug === existing.blogPost.slug) return null;
    const conflict = await prisma.blogPost.findFirst({
      where: { slug: nextSlug, id: { not: existing.blogPostId } },
      select: { id: true },
    });
    return conflict ? `blog slug already in use: ${nextSlug}` : null;
  }

  if (existing.legalPageId && existing.legalPage) {
    const nextSlug = resolveNextSlug({
      row,
      currentSlug: existing.legalPage.slug,
      kind: "legal",
    });
    if (nextSlug === existing.legalPage.slug) return null;
    const conflict = await prisma.legalPage.findFirst({
      where: { slug: nextSlug, id: { not: existing.legalPageId } },
      select: { id: true },
    });
    return conflict ? `legal page slug already in use: ${nextSlug}` : null;
  }

  const nextSlug = resolveNextSlug({
    row,
    currentSlug: identity.slug,
    kind: "static",
  });
  let nextPageKey = existing.pageKey;
  if (nextSlug === "home") nextPageKey = "home";
  else if (existing.pageKey.startsWith("page:")) nextPageKey = `page:${nextSlug}`;
  else if (!existing.pageKey.includes(":")) nextPageKey = nextSlug;

  if (nextPageKey === existing.pageKey) return null;
  const conflict = await prisma.seoMeta.findFirst({
    where: { pageKey: nextPageKey, id: { not: existing.id } },
    select: { id: true },
  });
  return conflict ? `page key already in use: ${nextPageKey}` : null;
}

function summarizePreview(rows: SeoCsvRowPreview[]): SeoCsvPreviewStats {
  const stats = emptySeoCsvPreviewStats();
  stats.total = rows.length;
  stats.rows = rows;

  for (const row of rows) {
    stats.changedFields += row.changedFields.length;
    switch (row.status) {
      case "ready":
        stats.ready += 1;
        break;
      case "unchanged":
        stats.skipped += 1;
        break;
      case "conflict":
        stats.conflicts += 1;
        break;
      case "missing":
        stats.missing += 1;
        break;
      case "duplicate":
        stats.duplicates += 1;
        break;
      case "invalid":
        stats.invalid += 1;
        break;
      default:
        break;
    }
  }

  return stats;
}

export async function analyzeSeoCsvText(
  csvText: string,
  expectedCategory?: Exclude<SeoCsvCategory, "all">,
): Promise<SeoCsvPreviewStats> {
  const rows = parseSeoCsvRows(csvText);
  const seenIds = new Map<string, number>();
  const previews: SeoCsvRowPreview[] = [];

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]!;
    const rowNumber = index + 2;
    const label = row.slug || row.name || row.path || row.id || `row-${rowNumber}`;

    if (!row.id) {
      previews.push({
        rowNumber,
        id: "",
        label,
        status: "invalid",
        message: "Missing id",
        changedFields: [],
      });
      continue;
    }

    const firstSeen = seenIds.get(row.id);
    if (firstSeen) {
      previews.push({
        rowNumber,
        id: row.id,
        label,
        status: "duplicate",
        message: `Duplicate id (also on row ${firstSeen})`,
        changedFields: [],
      });
      continue;
    }
    seenIds.set(row.id, rowNumber);

    const existing = await adminSeoRepository.findByIdForEdit(row.id);
    if (!existing) {
      previews.push({
        rowNumber,
        id: row.id,
        label,
        status: "missing",
        message: "SEO record not found",
        changedFields: [],
      });
      continue;
    }

    if (existing.pageKey.startsWith("guide:")) {
      previews.push({
        rowNumber,
        id: row.id,
        label: existing.pageKey,
        status: "invalid",
        message: "Guide SEO records are obsolete",
        changedFields: [],
      });
      continue;
    }

    const actualCategory = classifySeoCategory(existing as AdminSeoListItem);
    if (expectedCategory && actualCategory !== expectedCategory) {
      previews.push({
        rowNumber,
        id: row.id,
        label: resolveSeoCsvIdentity(existing as AdminSeoListItem).slug || existing.pageKey,
        status: "invalid",
        message: `Wrong category: this row is ${actualCategory}, but you are importing ${expectedCategory}`,
        changedFields: [],
      });
      continue;
    }

    const identity = resolveSeoCsvIdentity(existing as AdminSeoListItem);
    const displayLabel = identity.slug || identity.name || existing.pageKey;
    const conflict = await detectSlugConflict(existing, row);
    if (conflict) {
      previews.push({
        rowNumber,
        id: row.id,
        label: displayLabel,
        status: "conflict",
        message: conflict,
        changedFields: [],
      });
      continue;
    }

    const changedFields = collectChangedFields(existing, row);
    if (changedFields.length === 0) {
      previews.push({
        rowNumber,
        id: row.id,
        label: displayLabel,
        status: "unchanged",
        message: "Unchanged",
        changedFields: [],
      });
      continue;
    }

    previews.push({
      rowNumber,
      id: row.id,
      label: displayLabel,
      status: "ready",
      message: `Ready · ${changedFields.join(", ")}`,
      changedFields,
    });
  }

  return summarizePreview(previews);
}

export async function importSeoCsvText(input: {
  csvText: string;
  actorId: string;
  expectedCategory?: Exclude<SeoCsvCategory, "all">;
}): Promise<SeoCsvImportResult> {
  const preview = await analyzeSeoCsvText(input.csvText, input.expectedCategory);
  if (preview.ready === 0) {
    return { ...preview, applied: false };
  }

  const rows = parseSeoCsvRows(input.csvText);
  const readyIds = new Set(
    preview.rows.filter((row) => row.status === "ready").map((row) => row.id),
  );

  const revalidatePaths = new Set<string>([
    "/admin/seo",
    "/admin/seo/full",
    "/sitemap.xml",
  ]);

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index]!;
    if (!row.id || !readyIds.has(row.id)) continue;

    const existing = await adminSeoRepository.findByIdForEdit(row.id);
    if (!existing || existing.pageKey.startsWith("guide:")) continue;

    const robots = parseRobotsCsv(row.robots);
    const identity = resolveSeoCsvIdentity(existing as AdminSeoListItem);
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

    let nextPageKey = existing.pageKey;

    if (existing.serviceId && existing.service) {
      const nextSlug = resolveNextSlug({
        row,
        currentSlug: existing.service.slug,
        kind: "service",
      });
      const nextName = row.name.trim() || existing.service.nameEn;

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
    } else if (existing.cityId && existing.city) {
      const regionSlug = existing.city.region?.slug;
      if (!regionSlug) continue;

      const nextSlug = resolveNextSlug({
        row,
        currentSlug: existing.city.slug,
        kind: "city",
        regionSlug,
      });
      const nextName = row.name.trim() || existing.city.nameEn;

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
    } else if (existing.regionId && existing.region) {
      const nextSlug = resolveNextSlug({
        row,
        currentSlug: existing.region.slug,
        kind: "region",
      });
      const nextName = row.name.trim() || existing.region.nameEn;

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
    } else if (existing.blogPostId && existing.blogPost) {
      const nextSlug = resolveNextSlug({
        row,
        currentSlug: existing.blogPost.slug,
        kind: "blog",
      });
      const nextName = row.name.trim() || existing.blogPost.titleEn;

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
    } else if (existing.legalPageId && existing.legalPage) {
      const nextSlug = resolveNextSlug({
        row,
        currentSlug: existing.legalPage.slug,
        kind: "legal",
      });
      const nextName = row.name.trim() || existing.legalPage.titleEn;
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
    } else {
      const currentPath =
        publicPathFromSeoPageKey(existing.pageKey) ??
        (existing.pageKey === "home" ? "/" : `/${existing.pageKey}`);
      const nextSlug = resolveNextSlug({
        row,
        currentSlug: identity.slug,
        kind: "static",
      });

      if (nextSlug === "home") nextPageKey = "home";
      else if (existing.pageKey.startsWith("page:")) nextPageKey = `page:${nextSlug}`;
      else if (!existing.pageKey.includes(":")) nextPageKey = nextSlug;

      if (nextPageKey !== existing.pageKey) {
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
      }
    }

    await prisma.seoMeta.update({
      where: { id: existing.id },
      data: {
        ...seoData,
        ...(nextPageKey !== existing.pageKey ? { pageKey: nextPageKey } : {}),
      },
    });

    const publicPath = publicPathFromSeoPageKey(nextPageKey);
    if (publicPath) revalidatePaths.add(publicPath);
  }

  for (const path of revalidatePaths) {
    revalidatePath(path);
  }

  return { ...preview, applied: true };
}
