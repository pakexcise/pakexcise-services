export type ApplicationSubmissionSource = "WEB_FORM" | "AGENT" | "ADMIN";

type ResolveSubmissionSourceInput = {
  agentId?: string | null;
  draftJson?: unknown;
  initialStatusNote?: string | null;
};

function readDraftSubmissionSource(
  draftJson: unknown,
): ApplicationSubmissionSource | null {
  if (!draftJson || typeof draftJson !== "object") {
    return null;
  }

  const source = (draftJson as { submissionSource?: unknown }).submissionSource;

  if (source === "WEB_FORM" || source === "AGENT" || source === "ADMIN") {
    return source;
  }

  return null;
}

export function resolveApplicationSubmissionSource(
  input: ResolveSubmissionSourceInput,
): ApplicationSubmissionSource {
  const draftSource = readDraftSubmissionSource(input.draftJson);

  if (draftSource) {
    return draftSource;
  }

  const initialNote = input.initialStatusNote?.toLowerCase() ?? "";

  if (
    initialNote.includes("super admin") ||
    initialNote.includes("created by admin")
  ) {
    return "ADMIN";
  }

  if (input.agentId) {
    return "AGENT";
  }

  return "WEB_FORM";
}

export function getApplicationSubmissionSourceLabelKey(
  source: ApplicationSubmissionSource,
): `applications.submissionSource.${ApplicationSubmissionSource}` {
  return `applications.submissionSource.${source}`;
}
