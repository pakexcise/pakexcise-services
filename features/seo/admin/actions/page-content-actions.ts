"use server";

import { revalidatePath } from "next/cache";

import { normalizeLocalizedContent } from "@/features/cms/lib/normalize-content-input";
import { upsertStaticPageSeo } from "@/features/cms/lib/upsert-seo";
import { pageContentSchema } from "@/lib/validations/admin-page-content";
import {
  errorResult,
  parseInput,
  successResult,
  type ActionResult,
} from "@/lib/validations/common";
import { auditAdminAction } from "@/server/admin/audit-action";
import { adminPageContentRepository } from "@/server/repositories/admin-page-content-repository";
import { requirePermission } from "@/server/permissions/guards";

const LEGAL_PATHS: Record<string, string> = {
  privacy: "/privacy",
  terms: "/terms",
  disclaimer: "/disclaimer",
  refund: "/refund",
};

export async function updatePageContentAction(
  input: unknown,
): Promise<ActionResult<{ pageKey: string }>> {
  const user = await requirePermission("content:manage");
  const parsed = parseInput(pageContentSchema, input);
  if (!parsed.success) return parsed;

  const data = parsed.data;
  const before = await adminPageContentRepository.getByPageKey(data.pageKey);
  const content = normalizeLocalizedContent(data);

  await adminPageContentRepository.upsert(data.pageKey, content);
  await upsertStaticPageSeo(data.pageKey, data.seo);

  await auditAdminAction({
    actorId: user.id,
    action: before ? "UPDATE" : "CREATE",
    entityType: "page_content",
    entityId: data.pageKey,
    before: before ? { pageKey: data.pageKey, titleEn: before.titleEn } : null,
    after: { pageKey: data.pageKey, titleEn: content.titleEn },
  });

  revalidatePath("/admin/seo");
  revalidatePath(LEGAL_PATHS[data.pageKey] ?? `/${data.pageKey}`);
  revalidatePath("/sitemap.xml");
  return successResult({ pageKey: data.pageKey });
}
