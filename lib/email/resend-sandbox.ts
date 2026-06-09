export function getResendSandboxOwnerEmail(): string | null {
  const value = process.env.NEXT_PUBLIC_RESEND_SANDBOX_OWNER_EMAIL?.trim();
  return value ? value.toLowerCase() : null;
}

export function isResendSandboxRecipient(email: string): boolean {
  const owner = getResendSandboxOwnerEmail();
  if (!owner) {
    return false;
  }

  return email.trim().toLowerCase() !== owner;
}

export function formatResendSandboxMessage(
  template: string,
  ownerEmail: string,
  requestedEmail: string,
): string {
  return template
    .replaceAll("__OWNER_EMAIL__", ownerEmail)
    .replaceAll("__REQUESTED_EMAIL__", requestedEmail);
}
