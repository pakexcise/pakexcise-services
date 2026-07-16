import { Button, Section, Text } from "@react-email/components";

import type { EmailBranding } from "@/features/notifications/lib/email-branding";
import {
  BrandedEmailLayout,
  emailStyles,
} from "@/features/notifications/templates/emails/branded-email-layout";
import en from "@/messages/en";

const copy = en.emailTemplates.passwordReset;

type PasswordResetEmailProps = {
  branding: EmailBranding;
  name?: string | null;
  resetUrl: string;
};

export function PasswordResetEmail({
  branding,
  name,
  resetUrl,
}: PasswordResetEmailProps) {
  return (
    <BrandedEmailLayout
      branding={branding}
      preview={`Reset your ${branding.siteName} password`}
      eyebrow={copy.eyebrow}
      title={copy.title}
    >
      <Text style={emailStyles.paragraph}>
        {copy.greeting}
        {name?.trim() ? ` ${name.trim()}` : ""},
      </Text>
      <Text style={emailStyles.paragraph}>
        {copy.instruction}
      </Text>
      <Section style={emailStyles.buttonSection}>
        <Button
          href={resetUrl}
          style={{ ...emailStyles.button, backgroundColor: branding.primaryColor }}
        >
          {copy.button}
        </Button>
      </Section>
      <Text style={emailStyles.muted}>
        {copy.ignoreNotice}
      </Text>
    </BrandedEmailLayout>
  );
}
