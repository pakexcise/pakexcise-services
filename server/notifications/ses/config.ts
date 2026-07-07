import "server-only";

export type SesEmailConfig = {
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  fromEmail: string;
  replyToEmail: string;
};

const DEFAULT_REGION = "us-east-1";
const DEFAULT_FROM_EMAIL = "noreply@pakexcise.com";
const DEFAULT_REPLY_TO_EMAIL = "info@pakexcise.com";

export function isSesConfigured(): boolean {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  return Boolean(accessKeyId && secretAccessKey);
}

export function getSesEmailConfig(): SesEmailConfig | null {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();

  if (!accessKeyId || !secretAccessKey) {
    return null;
  }

  const region =
    process.env.AWS_SES_REGION?.trim() ||
    process.env.AWS_REGION?.trim() ||
    DEFAULT_REGION;

  return {
    region,
    accessKeyId,
    secretAccessKey,
    fromEmail: process.env.SES_FROM_EMAIL?.trim() || DEFAULT_FROM_EMAIL,
    replyToEmail:
      process.env.SES_REPLY_TO_EMAIL?.trim() || DEFAULT_REPLY_TO_EMAIL,
  };
}

export function formatSesFromAddress(email: string): string {
  return `PakExcise.com <${email}>`;
}
