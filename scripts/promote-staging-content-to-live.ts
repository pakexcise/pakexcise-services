/**
 * Promote marketing/CMS content from staging DB → live DB.
 *
 * Never touches: users, applications, invoices, payments, documents,
 * audit logs, analytics, guest leads, or env-specific settings.
 *
 * Uploaded blog/branding image *files* are NOT in the database. On the VPS,
 * always run via scripts/run-promote-staging-content.sh so storage/blog-uploads
 * (and related dirs) are rsynced from staging → live after DB promote.
 *
 * Usage (on live VPS — preferred):
 *   bash scripts/run-promote-staging-content.sh --dry-run
 *   bash scripts/run-promote-staging-content.sh
 *
 * Or DB-only:
 *   SOURCE_DATABASE_URL="..." pnpm db:promote-staging-content -- --dry-run
 *   SOURCE_DATABASE_URL="..." pnpm db:promote-staging-content
 */
import { Prisma, PrismaClient } from "@prisma/client";

import { CONTACT_PAGE_SETTINGS_KEY } from "../features/contact-page/lib/defaults";
import { HOME_PAGE_SETTINGS_KEY } from "../features/home-page/lib/defaults";
import { SETTINGS_KEYS } from "../features/settings/lib/keys";

const STAGING_HOST = "https://staging.pakexcise.com";
const LIVE_HOST = "https://pakexcise.com";

const SETTINGS_ALLOWLIST = new Set<string>([
  HOME_PAGE_SETTINGS_KEY,
  CONTACT_PAGE_SETTINGS_KEY,
  SETTINGS_KEYS.publicUi,
  SETTINGS_KEYS.forms,
  SETTINGS_KEYS.branding,
  SETTINGS_KEYS.business,
  SETTINGS_KEYS.seo,
]);

type Counters = {
  created: number;
  updated: number;
  deleted: number;
  skipped: number;
  warned: number;
};

function emptyCounters(): Counters {
  return { created: 0, updated: 0, deleted: 0, skipped: 0, warned: 0 };
}

function parseArgs(argv: string[]) {
  return {
    dryRun: argv.includes("--dry-run"),
  };
}

function stripUrl(raw: string | undefined): string {
  if (!raw) return "";
  return raw.trim().replace(/^["']|["']$/g, "");
}

function rewriteStagingUrls<T>(value: T): T {
  if (value === null || value === undefined) return value;
  if (typeof value === "string") {
    return value.split(STAGING_HOST).join(LIVE_HOST) as T;
  }
  if (Array.isArray(value)) {
    return value.map((item) => rewriteStagingUrls(item)) as T;
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      out[key] = rewriteStagingUrls(nested);
    }
    return out as T;
  }
  return value;
}

function maskDbUrl(url: string): string {
  try {
    const u = new URL(url);
    if (u.password) u.password = "***";
    return u.toString();
  } catch {
    return "(invalid url)";
  }
}

function logSection(title: string) {
  console.log(`\n==> ${title}`);
}

function summarize(label: string, c: Counters) {
  console.log(
    `  ${label}: +${c.created} ~${c.updated} -${c.deleted} skip=${c.skipped} warn=${c.warned}`,
  );
}

async function main() {
  const { dryRun } = parseArgs(process.argv.slice(2));
  const sourceUrl = stripUrl(process.env.SOURCE_DATABASE_URL);
  const targetUrl = stripUrl(process.env.DATABASE_URL);

  if (!sourceUrl) {
    throw new Error(
      "SOURCE_DATABASE_URL is required (staging Neon URL). Example:\n" +
        '  SOURCE_DATABASE_URL="$(grep ^DATABASE_URL= /var/www/pakexcise-staging/.env.production | cut -d= -f2- | tr -d \'"\')" pnpm db:promote-staging-content',
    );
  }
  if (!targetUrl) {
    throw new Error("DATABASE_URL is required (live Neon URL). Run from /var/www/pakexcise-live with .env loaded.");
  }
  if (sourceUrl === targetUrl) {
    throw new Error("SOURCE_DATABASE_URL and DATABASE_URL must be different databases.");
  }

  console.log(dryRun ? "DRY RUN — no writes will be applied." : "APPLY — writing to live DB.");
  console.log(`Source (staging): ${maskDbUrl(sourceUrl)}`);
  console.log(`Target (live):    ${maskDbUrl(targetUrl)}`);

  const source = new PrismaClient({
    datasources: { db: { url: sourceUrl } },
  });
  const target = new PrismaClient({
    datasources: { db: { url: targetUrl } },
  });

  const regionIdMap = new Map<string, string>();
  const serviceIdMap = new Map<string, string>();
  const serviceCategoryIdMap = new Map<string, string>();
  const cityIdMap = new Map<string, string>();
  const checklistIdMap = new Map<string, string>();
  const blogCategoryIdMap = new Map<string, string>();
  const blogPostIdMap = new Map<string, string>();
  const guideIdMap = new Map<string, string>();
  const legalPageIdMap = new Map<string, string>();
  const faqCategoryIdMap = new Map<string, string>();
  const faqIdMap = new Map<string, string>();

  try {
    // --- Regions ---
    logSection("Regions");
    {
      const c = emptyCounters();
      const rows = await source.region.findMany();
      for (const row of rows) {
        const existing = await target.region.findUnique({ where: { slug: row.slug } });
        const data = {
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          descriptionEn: row.descriptionEn,
          descriptionUr: row.descriptionUr,
          isActive: row.isActive,
          showInFooter: row.showInFooter,
          footerDisplayOrder: row.footerDisplayOrder,
          displayOrder: row.displayOrder,
          deletedAt: row.deletedAt,
        };
        if (existing) {
          regionIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.region.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else {
          if (dryRun) {
            regionIdMap.set(row.id, `dry-${row.id}`);
          } else {
            const created = await target.region.create({
              data: { slug: row.slug, ...data },
            });
            regionIdMap.set(row.id, created.id);
          }
          c.created += 1;
        }
      }
      summarize("regions", c);
    }

    // --- Cities ---
    logSection("Cities");
    {
      const c = emptyCounters();
      const rows = await source.city.findMany();
      for (const row of rows) {
        const liveRegionId = regionIdMap.get(row.regionId);
        if (!liveRegionId) {
          c.warned += 1;
          console.warn(`  skip city ${row.slug}: missing region`);
          continue;
        }
        const existing = await target.city.findFirst({
          where: { regionId: liveRegionId, slug: row.slug },
        });
        const data = {
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          descriptionEn: row.descriptionEn,
          descriptionUr: row.descriptionUr,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
          deletedAt: row.deletedAt,
        };
        if (existing) {
          cityIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.city.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          cityIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.city.create({
            data: { slug: row.slug, regionId: liveRegionId, ...data },
          });
          cityIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      summarize("cities", c);
    }

    // --- Service categories ---
    logSection("Service categories");
    {
      const c = emptyCounters();
      const rows = await source.serviceCategory.findMany();
      for (const row of rows) {
        const existing = await target.serviceCategory.findUnique({
          where: { slug: row.slug },
        });
        const data = {
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          descriptionEn: row.descriptionEn,
          descriptionUr: row.descriptionUr,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          serviceCategoryIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.serviceCategory.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          serviceCategoryIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.serviceCategory.create({
            data: { slug: row.slug, ...data },
          });
          serviceCategoryIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      summarize("service_categories", c);
    }

    // --- Services (parents first) ---
    logSection("Services");
    {
      const c = emptyCounters();
      const rows = await source.service.findMany({
        orderBy: [{ parentServiceId: "asc" }, { displayOrder: "asc" }],
      });
      // Two passes: create/update without parent, then set parent
      const ordered = [
        ...rows.filter((r) => !r.parentServiceId),
        ...rows.filter((r) => r.parentServiceId),
      ];
      for (const row of ordered) {
        const existing = await target.service.findUnique({ where: { slug: row.slug } });
        const data = {
          regionId: row.regionId ? (regionIdMap.get(row.regionId) ?? null) : null,
          categoryId: row.categoryId
            ? (serviceCategoryIdMap.get(row.categoryId) ?? null)
            : null,
          parentServiceId: row.parentServiceId
            ? (serviceIdMap.get(row.parentServiceId) ?? null)
            : null,
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          shortDescriptionEn: row.shortDescriptionEn,
          shortDescriptionUr: row.shortDescriptionUr,
          contentEn: row.contentEn,
          contentUr: row.contentUr,
          ctaTextEn: row.ctaTextEn,
          ctaTextUr: row.ctaTextUr,
          processingNotesEn: row.processingNotesEn,
          processingNotesUr: row.processingNotesUr,
          internalNotes: row.internalNotes,
          referenceLinksJson: row.referenceLinksJson ?? Prisma.JsonNull,
          requiresProof: row.requiresProof,
          isActive: row.isActive,
          isFeatured: row.isFeatured,
          featuredDisplayOrder: row.featuredDisplayOrder,
          showInFooter: row.showInFooter,
          footerDisplayOrder: row.footerDisplayOrder,
          displayOrder: row.displayOrder,
          deletedAt: row.deletedAt,
        };
        if (existing) {
          serviceIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.service.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          serviceIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.service.create({
            data: { slug: row.slug, ...data },
          });
          serviceIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }

      // Never delete live services that have applications
      const liveServices = await target.service.findMany({
        select: { id: true, slug: true, _count: { select: { applications: true } } },
      });
      const stagingSlugs = new Set(rows.map((r) => r.slug));
      for (const live of liveServices) {
        if (stagingSlugs.has(live.slug)) continue;
        if (live._count.applications > 0) {
          c.warned += 1;
          console.warn(
            `  keep live service "${live.slug}" (${live._count.applications} applications) — not in staging`,
          );
          continue;
        }
        c.skipped += 1;
        console.warn(
          `  leave orphan live service "${live.slug}" (no apps, not in staging) — not auto-deleted`,
        );
      }
      summarize("services", c);
    }

    // --- Service regions ---
    logSection("Service regions");
    {
      const c = emptyCounters();
      const rows = await source.serviceRegion.findMany();
      for (const row of rows) {
        const serviceId = serviceIdMap.get(row.serviceId);
        const regionId = regionIdMap.get(row.regionId);
        if (!serviceId || !regionId) {
          c.warned += 1;
          continue;
        }
        const existing = await target.serviceRegion.findUnique({
          where: { serviceId_regionId: { serviceId, regionId } },
        });
        const data = {
          supportNotesEn: row.supportNotesEn,
          supportNotesUr: row.supportNotesUr,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          if (!dryRun) {
            await target.serviceRegion.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.serviceRegion.create({
            data: { serviceId, regionId, ...data },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("service_regions", c);
    }

    // --- Checklist items ---
    logSection("Checklist items");
    {
      const c = emptyCounters();
      const rows = await source.checklistItem.findMany();
      for (const row of rows) {
        const existing = await target.checklistItem.findUnique({
          where: { slug: row.slug },
        });
        const data = {
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          descriptionEn: row.descriptionEn,
          descriptionUr: row.descriptionUr,
          itemType: row.itemType,
          defaultMaxSizeBytes: row.defaultMaxSizeBytes,
          defaultAcceptedMimeTypes: row.defaultAcceptedMimeTypes ?? Prisma.JsonNull,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          checklistIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.checklistItem.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          checklistIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.checklistItem.create({
            data: { slug: row.slug, ...data },
          });
          checklistIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      summarize("checklist_items", c);
    }

    // --- Document requirements (upsert by service + docType + region; never delete — Documents FK) ---
    logSection("Document requirements");
    {
      const c = emptyCounters();
      const docs = await source.documentRequirement.findMany();
      for (const row of docs) {
        const liveServiceId = serviceIdMap.get(row.serviceId);
        if (!liveServiceId || liveServiceId.startsWith("dry-")) {
          c.warned += 1;
          continue;
        }
        const regionId = row.regionId ? (regionIdMap.get(row.regionId) ?? null) : null;
        const existing = await target.documentRequirement.findFirst({
          where: {
            serviceId: liveServiceId,
            docType: row.docType,
            regionId,
          },
        });
        const data = {
          checklistItemId: row.checklistItemId
            ? (checklistIdMap.get(row.checklistItemId) ?? null)
            : null,
          kind: row.kind,
          labelEn: row.labelEn,
          labelUr: row.labelUr,
          instructionsEn: row.instructionsEn,
          instructionsUr: row.instructionsUr,
          isRequired: row.isRequired,
          maxSizeBytes: row.maxSizeBytes,
          acceptedMimeTypes: row.acceptedMimeTypes ?? Prisma.JsonNull,
          displayOrder: row.displayOrder,
          isActive: row.isActive,
        };
        if (existing) {
          if (!dryRun) {
            await target.documentRequirement.update({
              where: { id: existing.id },
              data,
            });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.documentRequirement.create({
            data: {
              serviceId: liveServiceId,
              regionId,
              docType: row.docType,
              ...data,
            },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("document_requirements", c);
    }

    // --- Form fields (replace per service) ---
    logSection("Service form fields");
    {
      const c = emptyCounters();
      const stagingServices = await source.service.findMany({ select: { id: true } });
      for (const svc of stagingServices) {
        const liveServiceId = serviceIdMap.get(svc.id);
        if (!liveServiceId || liveServiceId.startsWith("dry-")) continue;
        const fields = await source.serviceFormField.findMany({
          where: { serviceId: svc.id },
        });
        if (!dryRun) {
          // Only delete fields not referenced by application values when possible;
          // prefer upsert by fieldKey to preserve FKs on ApplicationFieldValue.
          for (const row of fields) {
            const existing = await target.serviceFormField.findUnique({
              where: {
                serviceId_fieldKey: {
                  serviceId: liveServiceId,
                  fieldKey: row.fieldKey,
                },
              },
            });
            const data = {
              regionId: row.regionId ? (regionIdMap.get(row.regionId) ?? null) : null,
              labelEn: row.labelEn,
              labelUr: row.labelUr,
              placeholderEn: row.placeholderEn,
              placeholderUr: row.placeholderUr,
              helpTextEn: row.helpTextEn,
              helpTextUr: row.helpTextUr,
              fieldType: row.fieldType,
              isRequired: row.isRequired,
              isEncrypted: row.isEncrypted,
              optionsJson: row.optionsJson ?? Prisma.JsonNull,
              validationJson: row.validationJson ?? Prisma.JsonNull,
              conditionalJson: row.conditionalJson ?? Prisma.JsonNull,
              displayOrder: row.displayOrder,
              isActive: row.isActive,
            };
            if (existing) {
              await target.serviceFormField.update({
                where: { id: existing.id },
                data,
              });
              c.updated += 1;
            } else {
              await target.serviceFormField.create({
                data: {
                  serviceId: liveServiceId,
                  fieldKey: row.fieldKey,
                  ...data,
                },
              });
              c.created += 1;
            }
          }
        } else {
          c.updated += fields.length;
        }
      }
      summarize("service_form_fields", c);
    }

    // --- Region plate formats ---
    logSection("Region plate formats");
    {
      const c = emptyCounters();
      const sections = await source.regionPlateFormatSection.findMany();
      for (const row of sections) {
        const regionId = regionIdMap.get(row.regionId);
        if (!regionId || regionId.startsWith("dry-")) {
          c.warned += 1;
          continue;
        }
        const data = {
          sectionTitleEn: row.sectionTitleEn,
          sectionTitleUr: row.sectionTitleUr,
          sectionDescEn: row.sectionDescEn,
          sectionDescUr: row.sectionDescUr,
          faqJson: row.faqJson ?? Prisma.JsonNull,
          isActive: row.isActive,
          showOnRegionPage: row.showOnRegionPage,
        };
        const existing = await target.regionPlateFormatSection.findUnique({
          where: { regionId },
        });
        if (existing) {
          if (!dryRun) {
            await target.regionPlateFormatSection.update({
              where: { id: existing.id },
              data,
            });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.regionPlateFormatSection.create({
            data: { regionId, ...data },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }

      const formats = await source.regionNumberPlateFormat.findMany({
        where: { deletedAt: null },
      });
      for (const row of formats) {
        const regionId = regionIdMap.get(row.regionId);
        if (!regionId || regionId.startsWith("dry-")) {
          c.warned += 1;
          continue;
        }
        // Match by region + vehicleType + titleEn
        const existing = await target.regionNumberPlateFormat.findFirst({
          where: {
            regionId,
            vehicleType: row.vehicleType,
            titleEn: row.titleEn,
            deletedAt: null,
          },
        });
        const data = {
          titleUr: row.titleUr,
          formatsJson: row.formatsJson ?? Prisma.JsonNull,
          descriptionEn: row.descriptionEn,
          descriptionUr: row.descriptionUr,
          relatedServiceSlugs: row.relatedServiceSlugs ?? Prisma.JsonNull,
          imageR2Key: row.imageR2Key,
          imageMimeType: row.imageMimeType,
          imageAltEn: row.imageAltEn,
          imageAltUr: row.imageAltUr,
          imageCaptionEn: row.imageCaptionEn,
          imageCaptionUr: row.imageCaptionUr,
          isActive: row.isActive,
          isFeatured: row.isFeatured,
          showOnRegionPage: row.showOnRegionPage,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          if (!dryRun) {
            await target.regionNumberPlateFormat.update({
              where: { id: existing.id },
              data,
            });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.regionNumberPlateFormat.create({
            data: {
              regionId,
              vehicleType: row.vehicleType,
              titleEn: row.titleEn,
              ...data,
            },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("plate_formats", c);
    }

    // --- Blog categories (parents first) ---
    logSection("Blog categories");
    {
      const c = emptyCounters();
      const rows = await source.blogCategory.findMany();
      const ordered = [
        ...rows.filter((r) => !r.parentId),
        ...rows.filter((r) => r.parentId),
      ];
      for (const row of ordered) {
        const existing = await target.blogCategory.findUnique({
          where: { slug: row.slug },
        });
        const data = {
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          parentId: row.parentId ? (blogCategoryIdMap.get(row.parentId) ?? null) : null,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          blogCategoryIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.blogCategory.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          blogCategoryIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.blogCategory.create({
            data: { slug: row.slug, ...data },
          });
          blogCategoryIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      summarize("blog_categories", c);
    }

    // --- Blog posts ---
    logSection("Blog posts");
    {
      const c = emptyCounters();
      const rows = await source.blogPost.findMany();
      const stagingSlugs = new Set(rows.map((r) => r.slug));

      for (const row of rows) {
        const remapIds = (ids: string[]) =>
          ids
            .map((id) => serviceIdMap.get(id))
            .filter((id): id is string => typeof id === "string" && !id.startsWith("dry-"));

        const existing = await target.blogPost.findUnique({ where: { slug: row.slug } });
        const data = {
          titleEn: row.titleEn,
          titleUr: row.titleUr,
          excerptEn: row.excerptEn,
          excerptUr: row.excerptUr,
          contentEn: row.contentEn,
          contentUr: row.contentUr,
          categoryEn: row.categoryEn,
          categoryUr: row.categoryUr,
          categoryId: row.categoryId
            ? (blogCategoryIdMap.get(row.categoryId) ?? null)
            : null,
          subCategoryId: row.subCategoryId
            ? (blogCategoryIdMap.get(row.subCategoryId) ?? null)
            : null,
          tags: row.tags,
          authorNameEn: row.authorNameEn,
          authorNameUr: row.authorNameUr,
          readingTimeMinutes: row.readingTimeMinutes,
          featuredImagePath: row.featuredImagePath,
          featuredImageTitleEn: row.featuredImageTitleEn,
          featuredImageTitleUr: row.featuredImageTitleUr,
          featuredImageAltEn: row.featuredImageAltEn,
          featuredImageAltUr: row.featuredImageAltUr,
          featuredImageCaptionEn: row.featuredImageCaptionEn,
          featuredImageCaptionUr: row.featuredImageCaptionUr,
          focusKeywords: row.focusKeywords,
          isFeatured: row.isFeatured,
          showTableOfContents: row.showTableOfContents,
          contentFaqs: row.contentFaqs ?? Prisma.JsonNull,
          ctaTitleEn: row.ctaTitleEn,
          ctaTitleUr: row.ctaTitleUr,
          ctaDescriptionEn: row.ctaDescriptionEn,
          ctaDescriptionUr: row.ctaDescriptionUr,
          ctaWhatsappLabelEn: row.ctaWhatsappLabelEn,
          ctaWhatsappLabelUr: row.ctaWhatsappLabelUr,
          ctaRequestLabelEn: row.ctaRequestLabelEn,
          ctaRequestLabelUr: row.ctaRequestLabelUr,
          ctaAccountLabelEn: row.ctaAccountLabelEn,
          ctaAccountLabelUr: row.ctaAccountLabelUr,
          relatedServiceIds: remapIds(row.relatedServiceIds),
          // FAQ ids remapped in a second pass after FAQs sync
          attachedFaqIds: row.attachedFaqIds,
          isPublished: row.isPublished,
          publishedAt: row.publishedAt,
        };

        if (existing) {
          blogPostIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.blogPost.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          blogPostIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.blogPost.create({
            data: { slug: row.slug, ...data },
          });
          blogPostIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }

      const livePosts = await target.blogPost.findMany({ select: { id: true, slug: true } });
      for (const live of livePosts) {
        if (stagingSlugs.has(live.slug)) continue;
        if (!dryRun) {
          await target.seoMeta.deleteMany({ where: { blogPostId: live.id } });
          await target.blogPost.delete({ where: { id: live.id } });
        }
        c.deleted += 1;
      }
      summarize("blog_posts", c);
    }

    // --- Guides ---
    logSection("Guides");
    {
      const c = emptyCounters();
      const rows = await source.guide.findMany();
      const stagingSlugs = new Set(rows.map((r) => r.slug));
      for (const row of rows) {
        const existing = await target.guide.findUnique({ where: { slug: row.slug } });
        const data = {
          titleEn: row.titleEn,
          titleUr: row.titleUr,
          excerptEn: row.excerptEn,
          excerptUr: row.excerptUr,
          contentEn: row.contentEn,
          contentUr: row.contentUr,
          relatedServiceIds: row.relatedServiceIds
            .map((id) => serviceIdMap.get(id))
            .filter((id): id is string => typeof id === "string" && !id.startsWith("dry-")),
          attachedFaqIds: row.attachedFaqIds,
          isPublished: row.isPublished,
          publishedAt: row.publishedAt,
        };
        if (existing) {
          guideIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.guide.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          guideIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.guide.create({
            data: { slug: row.slug, ...data },
          });
          guideIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      const liveGuides = await target.guide.findMany({ select: { id: true, slug: true } });
      for (const live of liveGuides) {
        if (stagingSlugs.has(live.slug)) continue;
        if (!dryRun) {
          await target.seoMeta.deleteMany({ where: { guideId: live.id } });
          await target.guide.delete({ where: { id: live.id } });
        }
        c.deleted += 1;
      }
      summarize("guides", c);
    }

    // --- Legal pages ---
    logSection("Legal pages");
    {
      const c = emptyCounters();
      const rows = await source.legalPage.findMany();
      for (const row of rows) {
        const existing = await target.legalPage.findUnique({ where: { slug: row.slug } });
        const data = {
          titleEn: row.titleEn,
          titleUr: row.titleUr,
          excerptEn: row.excerptEn,
          excerptUr: row.excerptUr,
          contentEn: row.contentEn,
          contentUr: row.contentUr,
          isPublished: row.isPublished,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
          publishedAt: row.publishedAt,
        };
        if (existing) {
          legalPageIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.legalPage.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          legalPageIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.legalPage.create({
            data: { slug: row.slug, ...data },
          });
          legalPageIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      summarize("legal_pages", c);
    }

    // --- FAQ categories + FAQs ---
    logSection("FAQs");
    {
      const c = emptyCounters();
      const categories = await source.faqCategory.findMany();
      for (const row of categories) {
        const existing = await target.faqCategory.findUnique({
          where: { slug: row.slug },
        });
        const data = {
          nameEn: row.nameEn,
          nameUr: row.nameUr,
          descriptionEn: row.descriptionEn,
          descriptionUr: row.descriptionUr,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          faqCategoryIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.faqCategory.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (dryRun) {
          faqCategoryIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.faqCategory.create({
            data: { slug: row.slug, ...data },
          });
          faqCategoryIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }

      const faqs = await source.fAQ.findMany();
      for (const row of faqs) {
        const categoryId = faqCategoryIdMap.get(row.categoryId);
        if (!categoryId || categoryId.startsWith("dry-")) {
          c.warned += 1;
          continue;
        }
        const existing = await target.fAQ.findFirst({
          where: { categoryId, questionEn: row.questionEn },
        });
        const data = {
          serviceId: row.serviceId ? (serviceIdMap.get(row.serviceId) ?? null) : null,
          regionId: row.regionId ? (regionIdMap.get(row.regionId) ?? null) : null,
          questionUr: row.questionUr,
          answerEn: row.answerEn,
          answerUr: row.answerUr,
          seoKeywordsEn: row.seoKeywordsEn,
          seoKeywordsUr: row.seoKeywordsUr,
          isActive: row.isActive,
          isFeatured: row.isFeatured,
          displayOrder: row.displayOrder,
          featuredDisplayOrder: row.featuredDisplayOrder,
        };
        if (existing) {
          faqIdMap.set(row.id, existing.id);
          if (!dryRun) {
            await target.fAQ.update({
              where: { id: existing.id },
              data: { ...data, questionEn: row.questionEn },
            });
          }
          c.updated += 1;
        } else if (dryRun) {
          faqIdMap.set(row.id, `dry-${row.id}`);
          c.created += 1;
        } else {
          const created = await target.fAQ.create({
            data: {
              categoryId,
              questionEn: row.questionEn,
              ...data,
            },
          });
          faqIdMap.set(row.id, created.id);
          c.created += 1;
        }
      }
      summarize("faqs", c);
    }

    // Remap attachedFaqIds on blog/guides now that FAQ map exists
    if (!dryRun) {
      logSection("Remap attached FAQ ids");
      const stagingPosts = await source.blogPost.findMany({
        select: { id: true, attachedFaqIds: true },
      });
      for (const row of stagingPosts) {
        const liveId = blogPostIdMap.get(row.id);
        if (!liveId) continue;
        const attachedFaqIds = row.attachedFaqIds
          .map((id) => faqIdMap.get(id))
          .filter((id): id is string => Boolean(id));
        await target.blogPost.update({
          where: { id: liveId },
          data: { attachedFaqIds },
        });
      }
      const stagingGuides = await source.guide.findMany({
        select: { id: true, attachedFaqIds: true },
      });
      for (const row of stagingGuides) {
        const liveId = guideIdMap.get(row.id);
        if (!liveId) continue;
        const attachedFaqIds = row.attachedFaqIds
          .map((id) => faqIdMap.get(id))
          .filter((id): id is string => Boolean(id));
        await target.guide.update({
          where: { id: liveId },
          data: { attachedFaqIds },
        });
      }
      console.log("  attached FAQ ids remapped");
    }

    // --- Social links (replace by platform) ---
    logSection("Social links");
    {
      const c = emptyCounters();
      const rows = await source.socialLink.findMany();
      for (const row of rows) {
        const existing = await target.socialLink.findFirst({
          where: { platform: row.platform },
          orderBy: { displayOrder: "asc" },
        });
        const data = {
          labelEn: row.labelEn,
          labelUr: row.labelUr,
          url: rewriteStagingUrls(row.url),
          iconName: row.iconName,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          if (!dryRun) {
            await target.socialLink.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.socialLink.create({
            data: { platform: row.platform, ...data },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("social_links", c);
    }

    // --- Reviews (upsert by author + content fingerprint) ---
    logSection("Reviews");
    {
      const c = emptyCounters();
      const rows = await source.review.findMany();
      for (const row of rows) {
        const existing = await target.review.findFirst({
          where: {
            authorNameEn: row.authorNameEn,
            contentEn: row.contentEn,
          },
        });
        const data = {
          authorNameUr: row.authorNameUr,
          authorRoleEn: row.authorRoleEn,
          authorRoleUr: row.authorRoleUr,
          contentUr: row.contentUr,
          rating: row.rating,
          isActive: row.isActive,
          displayOrder: row.displayOrder,
        };
        if (existing) {
          if (!dryRun) {
            await target.review.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.review.create({
            data: {
              authorNameEn: row.authorNameEn,
              contentEn: row.contentEn,
              ...data,
            },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("reviews", c);
    }

    // --- Redirects (merge upsert by oldSlug) ---
    logSection("Redirects");
    {
      const c = emptyCounters();
      const rows = await source.redirect.findMany();
      for (const row of rows) {
        const existing = await target.redirect.findUnique({
          where: { oldSlug: row.oldSlug },
        });
        const data = {
          newSlug: row.newSlug,
          statusCode: row.statusCode,
          isActive: row.isActive,
        };
        if (existing) {
          if (!dryRun) {
            await target.redirect.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.redirect.create({
            data: { oldSlug: row.oldSlug, ...data },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("redirects", c);
    }

    // --- SEO meta ---
    logSection("SEO meta");
    {
      const c = emptyCounters();
      const rows = await source.seoMeta.findMany();
      for (const row of rows) {
        const seoFields = rewriteStagingUrls({
          metaTitleEn: row.metaTitleEn,
          metaTitleUr: row.metaTitleUr,
          metaDescriptionEn: row.metaDescriptionEn,
          metaDescriptionUr: row.metaDescriptionUr,
          h1En: row.h1En,
          h1Ur: row.h1Ur,
          canonicalUrl: row.canonicalUrl,
          ogTitleEn: row.ogTitleEn,
          ogTitleUr: row.ogTitleUr,
          ogDescriptionEn: row.ogDescriptionEn,
          ogDescriptionUr: row.ogDescriptionUr,
          ogImage: row.ogImage,
          twitterCard: row.twitterCard,
          robotsIndex: row.robotsIndex,
          robotsFollow: row.robotsFollow,
          faqSchemaJson: row.faqSchemaJson,
          breadcrumbJson: row.breadcrumbJson,
        });

        const serviceId = row.serviceId
          ? (serviceIdMap.get(row.serviceId) ?? null)
          : null;
        const regionId = row.regionId ? (regionIdMap.get(row.regionId) ?? null) : null;
        const cityId = row.cityId ? (cityIdMap.get(row.cityId) ?? null) : null;
        const blogPostId = row.blogPostId
          ? (blogPostIdMap.get(row.blogPostId) ?? null)
          : null;
        const guideId = row.guideId ? (guideIdMap.get(row.guideId) ?? null) : null;
        const legalPageId = row.legalPageId
          ? (legalPageIdMap.get(row.legalPageId) ?? null)
          : null;

        // Skip entity SEO if FK could not be remapped
        if (row.serviceId && !serviceId) {
          c.warned += 1;
          continue;
        }
        if (row.blogPostId && !blogPostId) {
          c.warned += 1;
          continue;
        }
        if (row.guideId && !guideId) {
          c.warned += 1;
          continue;
        }
        if (row.legalPageId && !legalPageId) {
          c.warned += 1;
          continue;
        }
        if (row.regionId && !regionId) {
          c.warned += 1;
          continue;
        }
        if (row.cityId && !cityId) {
          c.warned += 1;
          continue;
        }

        const existing = await target.seoMeta.findUnique({
          where: { pageKey: row.pageKey },
        });
        const data = {
          ...seoFields,
          serviceId,
          regionId,
          cityId,
          blogPostId,
          guideId,
          legalPageId,
          faqSchemaJson: seoFields.faqSchemaJson ?? Prisma.JsonNull,
          breadcrumbJson: seoFields.breadcrumbJson ?? Prisma.JsonNull,
        };

        if (existing) {
          if (!dryRun) {
            await target.seoMeta.update({ where: { id: existing.id }, data });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.seoMeta.create({
            data: { pageKey: row.pageKey, ...data },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      summarize("seo_meta", c);
    }

    // --- Settings allowlist ---
    logSection("Settings (allowlist only)");
    {
      const c = emptyCounters();
      const rows = await source.setting.findMany({
        where: { key: { in: [...SETTINGS_ALLOWLIST] } },
      });
      for (const row of rows) {
        const value = rewriteStagingUrls(row.value);
        const existing = await target.setting.findUnique({ where: { key: row.key } });
        if (existing) {
          if (!dryRun) {
            await target.setting.update({
              where: { id: existing.id },
              data: { value: value as Prisma.InputJsonValue },
            });
          }
          c.updated += 1;
        } else if (!dryRun) {
          await target.setting.create({
            data: { key: row.key, value: value as Prisma.InputJsonValue },
          });
          c.created += 1;
        } else {
          c.created += 1;
        }
      }
      const skipped = await source.setting.findMany({
        where: { key: { notIn: [...SETTINGS_ALLOWLIST] } },
        select: { key: true },
      });
      c.skipped = skipped.length;
      if (skipped.length) {
        console.log(
          `  preserved live settings (not copied): ${skipped.map((s) => s.key).join(", ")}`,
        );
      }
      summarize("settings", c);
    }

    console.log("\nPromote complete.");
    if (dryRun) {
      console.log("Re-run without --dry-run to apply changes.");
    } else {
      console.log("Next: rm -rf .next/cache && bash scripts/ensure-live-pm2.sh");
      console.log("Then hard-refresh https://pakexcise.com/blog");
    }
  } finally {
    await source.$disconnect();
    await target.$disconnect();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
