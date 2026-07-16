"use server";

import { revalidatePath } from "next/cache";

import { normalizeSeoInputForUpdate } from "@/features/seo/admin/lib/normalize-seo-update";
import { publicPathFromSeoPageKey } from "@/features/seo/admin/lib/seo-page-paths";
import { updateSeoMetaSchema } from "@/lib/validations/admin-seo";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";
import { adminSeoRepository } from "@/server/repositories/admin-seo-repository";
import { requirePermission } from "@/server/permissions/guards";

const ADMIN_PATH = "/admin/seo";

export async function updateSeoMetaAction(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const user = await requirePermission("platform:manage");
  const parsed = parseInput(updateSeoMetaSchema, input);
  if (!parsed.success) return parsed;

  const existing = await adminSeoRepository.findByIdForEdit(parsed.data.id);
  if (!existing) return errorResult("SEO record not found");

  const data = normalizeSeoInputForUpdate(parsed.data.seo);

  await prisma.$transaction(async (tx) => {
    await tx.seoMeta.update({
      where: { id: existing.id },
      data,
    });

    if (existing.blogPostId) {
      await tx.blogPost.update({
        where: { id: existing.blogPostId },
        data: { focusKeywords: data.focusKeywords },
      });
    }
  });

  await auditAdminAction({
    actorId: user.id,
    action: "UPDATE",
    entityType: "seo_meta",
    entityId: existing.id,
    before: {
      pageKey: existing.pageKey,
      metaTitleEn: existing.metaTitleEn,
      metaDescriptionEn: existing.metaDescriptionEn,
      h1En: existing.h1En,
      focusKeywords: existing.focusKeywords,
    },
    after: {
      pageKey: existing.pageKey,
      metaTitleEn: data.metaTitleEn,
      metaDescriptionEn: data.metaDescriptionEn,
      h1En: data.h1En,
      focusKeywords: data.focusKeywords,
    },
  });

  revalidatePath(ADMIN_PATH);
  revalidatePath(`${ADMIN_PATH}/${existing.id}/edit`);
  revalidatePath("/sitemap.xml");

  const publicPath = publicPathFromSeoPageKey(existing.pageKey);
  if (publicPath) {
    revalidatePath(publicPath);
  }

  return successResult({ id: existing.id });
}
