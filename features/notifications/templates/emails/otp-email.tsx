import { Section, Text } from "@react-email/components";

import type { EmailBranding } from "@/features/notifications/lib/email-branding";
import {
  BrandedEmailLayout,
  emailStyles,
} from "@/features/notifications/templates/emails/branded-email-layout";
import en from "@/messages/en";

const copy = en.emailTemplates.otp;

type OtpEmailProps = {
  branding: EmailBranding;
  otp: string;
  title: string;
};

export function OtpEmail({ branding, otp, title }: OtpEmailProps) {
  return (
    <BrandedEmailLayout
      branding={branding}
      preview={`${otp} is your ${branding.siteName} verification code`}
      eyebrow={copy.eyebrow}
      title={title}
    >
      <Text style={emailStyles.paragraph}>
        {copy.instruction}
      </Text>
      <Section
        style={{
          ...emailStyles.infoBox,
          borderColor: `${branding.primaryColor}33`,
          textAlign: "center",
        }}
      >
        <Text style={codeLabel}>{copy.codeLabel}</Text>
        <Text style={{ ...code, color: branding.primaryColor }}>{otp}</Text>
        <Text style={expiry}>{copy.expiry}</Text>
      </Section>
      <Text style={securityNotice}>
        {copy.securityNotice}
      </Text>
      <Text style={emailStyles.muted}>
        {copy.ignoreNotice}
      </Text>
    </BrandedEmailLayout>
  );
}

const codeLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const code = {
  fontFamily: '"SFMono-Regular",Consolas,"Liberation Mono",monospace',
  fontSize: "36px",
  fontWeight: "800",
  letterSpacing: "8px",
  lineHeight: "44px",
  margin: "0 0 8px",
};

const expiry = {
  color: "#6b7280",
  fontSize: "12px",
  margin: "0",
};

const securityNotice = {
  backgroundColor: "#fff8db",
  border: "1px solid #f4d76b",
  borderRadius: "8px",
  color: "#6b4f00",
  fontSize: "13px",
  lineHeight: "20px",
  margin: "18px 0",
  padding: "12px 14px",
};
