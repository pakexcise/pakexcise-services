import "server-only";

import type { AuditAction, Prisma } from "@prisma/client";

import { sanitizeAuditPayload } from "@/lib/security/redact";
import { prisma } from "@/server/db/client";
import { hashIpAddress } from "@/server/security/hash";

export type AuditPayload = Record<string, unknown>;

export type WriteAuditLogInput = {
  actorId?: string | null;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  before?: AuditPayload | null;
  after?: AuditPayload | null;
  ipAddress?: string | null;
  userAgent?: string | null;
};

export async function writeAuditLog(input: WriteAuditLogInput): Promise<void> {
  const metadata = JSON.parse(
    JSON.stringify({
      before: sanitizeAuditPayload(input.before ?? null),
      after: sanitizeAuditPayload(input.after ?? null),
    }),
  ) as Prisma.InputJsonValue;

  const ipHash = input.ipAddress ? hashIpAddress(input.ipAddress) : null;

  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? null,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      metadata,
      ipHash,
      userAgent: input.userAgent ?? null,
    },
  });
}
