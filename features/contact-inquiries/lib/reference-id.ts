import "server-only";

import { allocateContactInquiryReferenceId } from "@/server/id/sequential-reference-id";

export async function generateContactInquiryReferenceId(): Promise<string> {
  return allocateContactInquiryReferenceId();
}
