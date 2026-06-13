import "server-only";

export function buildFileContentVersion(
  fileName: string | null | undefined,
  updatedAt: Date | string,
): string {
  const timestamp =
    updatedAt instanceof Date ? updatedAt.getTime() : new Date(updatedAt).getTime();

  return `${fileName ?? "file"}-${timestamp}`;
}
