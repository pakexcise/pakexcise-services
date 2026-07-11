import "server-only";

import { auditAdminAction } from "@/server/admin/audit-action";
import { prisma } from "@/server/db/client";

import { normalizeRedirectKey } from "@/features/redirects/lib/path-redirects";

export type AutoRedirectInput =
  | { kind: "service"; oldSlug: string; newSlug: string; actorId: string }
  | { kind: "blog"; oldSlug: string; newSlug: string; actorId: string }
  | { kind: "guide"; oldSlug: string; newSlug: string; actorId: string }
  | { kind: "region"; oldSlug: string; newSlug: string; actorId: string }
  | {
      kind: "city";
      regionSlug: string;
      oldSlug: string;
      newSlug: string;
      actorId: string;
    }
  | { kind: "legal"; oldSlug: string; newSlug: string; actorId: string }
  | { kind: "path"; oldPath: string; newPath: string; actorId: string };

function pairsForInput(input: AutoRedirectInput): Array<{
  oldSlug: string;
  newSlug: string;
}> {
  switch (input.kind) {
    case "service":
      return [
        { oldSlug: input.oldSlug, newSlug: input.newSlug },
        {
          oldSlug: `/services/${input.oldSlug}`,
          newSlug: `/services/${input.newSlug}`,
        },
        {
          oldSlug: `/apply/${input.oldSlug}`,
          newSlug: `/apply/${input.newSlug}`,
        },
        {
          oldSlug: `/request/${input.oldSlug}`,
          newSlug: `/request/${input.newSlug}`,
        },
      ];
    case "blog":
      return [
        {
          oldSlug: `blog:${input.oldSlug}`,
          newSlug: `blog:${input.newSlug}`,
        },
        {
          oldSlug: `/blog/${input.oldSlug}`,
          newSlug: `/blog/${input.newSlug}`,
        },
      ];
    case "guide":
      return [
        {
          oldSlug: `guide:${input.oldSlug}`,
          newSlug: `guide:${input.newSlug}`,
        },
        {
          oldSlug: `/guides/${input.oldSlug}`,
          newSlug: `/guides/${input.newSlug}`,
        },
      ];
    case "region":
      return [
        {
          oldSlug: `/regions/${input.oldSlug}`,
          newSlug: `/regions/${input.newSlug}`,
        },
      ];
    case "city":
      return [
        {
          oldSlug: `/regions/${input.regionSlug}/${input.oldSlug}`,
          newSlug: `/regions/${input.regionSlug}/${input.newSlug}`,
        },
      ];
    case "legal":
      return [
        {
          oldSlug: `/${input.oldSlug.replace(/^\/+/, "")}`,
          newSlug: `/${input.newSlug.replace(/^\/+/, "")}`,
        },
      ];
    case "path":
      return [
        {
          oldSlug: normalizeRedirectKey(input.oldPath),
          newSlug: normalizeRedirectKey(input.newPath),
        },
      ];
    default: {
      const _exhaustive: never = input;
      return _exhaustive;
    }
  }
}

async function upsertRedirectRow(input: {
  oldSlug: string;
  newSlug: string;
  actorId: string;
}) {
  const oldSlug = normalizeRedirectKey(input.oldSlug);
  const newSlug = normalizeRedirectKey(input.newSlug);

  if (!oldSlug || !newSlug || oldSlug === newSlug) {
    return;
  }

  await prisma.redirect.upsert({
    where: { oldSlug },
    update: {
      newSlug,
      statusCode: 301,
      isActive: true,
    },
    create: {
      oldSlug,
      newSlug,
      statusCode: 301,
      isActive: true,
    },
  });

  // Keep chains fresh: anything that pointed at the old key now points at the new key.
  await prisma.redirect.updateMany({
    where: {
      newSlug: oldSlug,
      NOT: { oldSlug },
    },
    data: {
      newSlug,
      isActive: true,
      statusCode: 301,
    },
  });

  await auditAdminAction({
    actorId: input.actorId,
    action: "CREATE",
    entityType: "redirect",
    entityId: oldSlug,
    after: { oldSlug, newSlug, statusCode: 301, auto: true },
  });
}

/** Create/refresh 301 redirects when a public slug/path changes. */
export async function upsertAutoRedirects(
  input: AutoRedirectInput,
): Promise<void> {
  const pairs = pairsForInput(input);

  for (const pair of pairs) {
    await upsertRedirectRow({
      ...pair,
      actorId: input.actorId,
    });
  }
}
