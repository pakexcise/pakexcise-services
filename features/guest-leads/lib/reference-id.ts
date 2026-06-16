import "server-only";

import { allocateServiceRequestReferenceId } from "@/server/id/sequential-reference-id";

export async function generateGuestLeadReferenceId(): Promise<string> {
  return allocateServiceRequestReferenceId();
}
