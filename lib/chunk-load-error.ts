const CHUNK_ERROR_PATTERNS = [
  "chunkloaderror",
  "loading chunk",
  "failed to fetch dynamically imported module",
] as const;

export const CHUNK_RELOAD_SESSION_KEY = "pakexcise-chunk-reload";

export function isChunkLoadErrorMessage(message: string): boolean {
  const normalized = message.trim().toLowerCase();
  return CHUNK_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern));
}

export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return isChunkLoadErrorMessage(String(error));
  }

  return (
    isChunkLoadErrorMessage(error.message) ||
    error.name.toLowerCase() === "chunkloaderror"
  );
}

export function shouldAutoReloadForChunkError(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return sessionStorage.getItem(CHUNK_RELOAD_SESSION_KEY) !== "1";
  } catch {
    return true;
  }
}

export function markChunkReloadAttempted(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.setItem(CHUNK_RELOAD_SESSION_KEY, "1");
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function clearChunkReloadAttempt(): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    sessionStorage.removeItem(CHUNK_RELOAD_SESSION_KEY);
  } catch {
    // Ignore storage failures in private browsing.
  }
}

export function reloadPageForChunkError(): void {
  if (typeof window === "undefined" || !shouldAutoReloadForChunkError()) {
    return;
  }

  markChunkReloadAttempted();
  window.location.reload();
}
