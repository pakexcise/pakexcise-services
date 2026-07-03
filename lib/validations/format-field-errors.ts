const FIELD_LABELS: Record<string, string> = {
  statusChangeNote: "Status change note",
  note: "Status note",
  userId: "Customer",
  serviceId: "Service",
  agentId: "Agent",
  status: "Status",
  locale: "Preferred language",
  adminNotes: "Internal notes",
  applicationId: "Application",
  toStatus: "Status",
};

export function formatFirstFieldError(
  fieldErrors: Record<string, string[] | undefined>,
  fallback = "Validation failed",
): string {
  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = messages?.[0]?.trim();

    if (!message) {
      continue;
    }

    if (message.length > 0 && !message.includes(field)) {
      const label = FIELD_LABELS[field] ?? field;
      return `${label}: ${message}`;
    }

    return message;
  }

  return fallback;
}
