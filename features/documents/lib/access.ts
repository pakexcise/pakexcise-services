import "server-only";

import type { Application, ApplicationStatus, Document } from "@prisma/client";

import { COMPLETION_PROOF_DOC_TYPE } from "@/config/uploads";
import type { CurrentUser } from "@/server/auth/current-user";
import { canAccessApplication } from "@/server/permissions/guards";
import { roleHasPermission } from "@/server/permissions/roles";

export type DocumentAccessPurpose = "upload" | "view" | "proof" | "verify" | "delete";

const uploadAllowedStatuses: ApplicationStatus[] = [
  "DRAFT",
  "DOCS_REQUIRED",
  "PAYMENT_UPLOADED",
];

export function canUploadToApplication(
  user: CurrentUser,
  application: Pick<Application, "userId" | "agentId" | "status">,
): boolean {
  if (!uploadAllowedStatuses.includes(application.status)) {
    return false;
  }

  if (user.role === "CUSTOMER") {
    return application.userId === user.id;
  }

  if (user.role === "AGENT") {
    return (
      application.agentId === user.id &&
      user.agentProfile?.approvalStatus === "APPROVED" &&
      user.agentProfile.isActive
    );
  }

  if (roleHasPermission(user.role, "documents:verify")) {
    return true;
  }

  return false;
}

export function canViewDocument(
  user: CurrentUser,
  application: Pick<Application, "userId" | "agentId" | "status">,
  document: Pick<Document, "type">,
  purpose: "view" | "proof",
): boolean {
  if (purpose === "proof") {
    if (document.type !== COMPLETION_PROOF_DOC_TYPE) {
      return false;
    }

    if (application.status !== "COMPLETED") {
      return false;
    }

    if (user.role === "CUSTOMER") {
      return application.userId === user.id;
    }

    if (user.role === "AGENT") {
      return application.agentId === user.id;
    }
  }

  if (roleHasPermission(user.role, "documents:read")) {
    return true;
  }

  return canAccessApplication(user, application);
}

export function canVerifyDocument(user: CurrentUser): boolean {
  return roleHasPermission(user.role, "documents:verify");
}

export function canDeleteDocument(
  user: CurrentUser,
  application: Pick<Application, "userId" | "agentId" | "status">,
  document: Pick<Document, "status">,
): boolean {
  if (roleHasPermission(user.role, "documents:verify")) {
    return true;
  }

  if (document.status !== "PENDING") {
    return false;
  }

  return canUploadToApplication(user, application);
}
