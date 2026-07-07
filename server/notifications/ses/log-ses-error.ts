import "server-only";

type SesErrorShape = {
  name?: string;
  message?: string;
  Code?: string;
  $metadata?: {
    httpStatusCode?: number;
  };
};

export function isSesSandboxRecipientError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("not verified") ||
    message.includes("sandbox") ||
    message.includes("message rejected")
  );
}

export function summarizeSesError(error: unknown): string {
  if (!(error instanceof Error)) {
    return "unknown_error";
  }

  const shaped = error as Error & SesErrorShape;
  const code = shaped.Code ?? shaped.name ?? "SesError";
  const message = shaped.message?.trim() || "Email delivery failed";

  if (
    message.toLowerCase().includes("not verified") ||
    message.toLowerCase().includes("sandbox")
  ) {
    return `${code}: recipient_or_sender_not_verified`;
  }

  if (
    message.toLowerCase().includes("invalidclienttokenid") ||
    message.toLowerCase().includes("signature")
  ) {
    return `${code}: invalid_aws_credentials`;
  }

  if (message.toLowerCase().includes("access denied")) {
    return `${code}: ses_permission_denied`;
  }

  return `${code}: ${message.slice(0, 180)}`;
}

export function logSesDeliveryFailure(error: unknown): void {
  console.error("[email:ses] delivery failed", {
    reason: summarizeSesError(error),
  });
}
