import "server-only";

export type BrevoEmailConfig = {
  apiKey: string;
  fromEmail: string;
  fromName: string;
  replyToEmail: string;
};

const DEFAULT_FROM_EMAIL = "noreply@pakexcise.com";
const DEFAULT_FROM_NAME = "PakExcise.com";
const DEFAULT_REPLY_TO_EMAIL = "info@pakexcise.com";

export function isBrevoConfigured(): boolean {
  return Boolean(process.env.BREVO_API_KEY?.trim());
}

export function getBrevoEmailConfig(): BrevoEmailConfig | null {
  const apiKey = process.env.BREVO_API_KEY?.trim();

  if (!apiKey) {
    return null;
  }

  return {
    apiKey,
    fromEmail: process.env.BREVO_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL,
    fromName: process.env.BREVO_FROM_NAME?.trim() || DEFAULT_FROM_NAME,
    replyToEmail:
      process.env.BREVO_REPLY_TO_EMAIL?.trim() || DEFAULT_REPLY_TO_EMAIL,
  };
}
