export function isStaleServerActionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    (message.includes("server action") &&
      (message.includes("was not found") ||
        message.includes("failed to find"))) ||
    message.includes("older or newer deployment")
  );
}

export function resolveAuthSubmitError(
  error: unknown,
  fallback: string,
  staleActionMessage: string,
): string {
  if (isStaleServerActionError(error)) {
    return staleActionMessage;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}
