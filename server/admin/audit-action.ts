import "server-only";

import type { AuditAction } from "@prisma/client";

import { getRequestMeta } from "@/server/auth/session";
import {
  type AuditPayload,
  writeAuditLog,
} from "@/server/security/audit";

export type AuditAdminActionInput = {
  actorId: string;
  action: AuditAction;
  entityType: string;
  entityId?: string | null;
  before?: AuditPayload | null;
  after?: AuditPayload | null;
};

export async function auditAdminAction(
  input: AuditAdminActionInput,
): Promise<void> {
  const meta = await getRequestMeta();

  await writeAuditLog({
    actorId: input.actorId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? null,
    before: input.before ?? null,
    after: input.after ?? null,
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}
