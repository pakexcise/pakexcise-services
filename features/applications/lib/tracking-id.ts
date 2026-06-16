import "server-only";

import { allocateApplicationTrackingId } from "@/server/id/sequential-reference-id";

export async function generateTrackingId(): Promise<string> {
  return allocateApplicationTrackingId();
}
