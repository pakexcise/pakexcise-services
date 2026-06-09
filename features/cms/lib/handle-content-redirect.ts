import "server-only";

import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";

export async function handleContentSlugRedirect(input: {
  prefix: "blog" | "guide";
  oldSlug: string;
  newSlug: string;
  actorId: string;
}) {
  if (input.oldSlug === input.newSlug) {
    return;
  }

  const oldKey = `${input.prefix}:${input.oldSlug}`;
  const newKey = `${input.prefix}:${input.newSlug}`;

  await prisma.redirect.upsert({
    where: { oldSlug: oldKey },
    update: {
      newSlug: newKey,
      statusCode: 301,
      isActive: true,
    },
    create: {
      oldSlug: oldKey,
      newSlug: newKey,
      statusCode: 301,
      isActive: true,
    },
  });

  await auditAdminAction({
    actorId: input.actorId,
    action: "CREATE",
    entityType: "redirect",
    entityId: oldKey,
    after: { oldSlug: oldKey, newSlug: newKey, statusCode: 301 },
  });
}
