import "server-only";

import type { AuditAction } from "@prisma/client";

import { getRequestMeta } from "@/server/auth/session";
import { writeAuditLog } from "@/server/security/audit";

type DocumentAuditOperation =
  | "upload"
  | "view"
  | "approve"
  | "reject"
  | "delete";

const operationActionMap: Record<DocumentAuditOperation, AuditAction> = {
  upload: "CREATE",
  view: "EXPORT",
  approve: "UPDATE",
  reject: "UPDATE",
  delete: "DELETE",
};

export async function auditDocumentEvent(input: {
  actorId: string;
  documentId: string;
  applicationId: string;
  operation: DocumentAuditOperation;
  details?: Record<string, unknown>;
}): Promise<void> {
  const meta = await getRequestMeta();

  await writeAuditLog({
    actorId: input.actorId,
    action: operationActionMap[input.operation],
    entityType: "document",
    entityId: input.documentId,
    after: {
      operation: input.operation,
      applicationId: input.applicationId,
      ...input.details,
    },
    ipAddress: meta.ipAddress,
    userAgent: meta.userAgent,
  });
}
