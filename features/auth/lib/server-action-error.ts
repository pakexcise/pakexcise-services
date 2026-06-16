export function isStaleServerActionError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("server action") && message.includes("was not found")
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
