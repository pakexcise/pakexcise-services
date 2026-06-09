import "server-only";

export type VirusScanQueueInput = {
  documentId: string;
  applicationId: string;
  r2Key: string;
  mimeType: string;
  fileSize: number;
};

/**
 * Placeholder hook for async virus/MIME scanning.
 * Wire to Upstash queue or worker when scanning is available.
 */
export async function enqueueVirusScan(
  input: VirusScanQueueInput,
): Promise<void> {
  if (process.env.NODE_ENV === "development") {
    console.info("[virus-scan:queued]", {
      documentId: input.documentId,
      applicationId: input.applicationId,
      mimeType: input.mimeType,
      fileSize: input.fileSize,
    });
  }
}
