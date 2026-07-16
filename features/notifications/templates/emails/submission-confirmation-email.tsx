import { Button, Section, Text } from "@react-email/components";

import type { EmailBranding } from "@/features/notifications/lib/email-branding";
import {
  BrandedEmailLayout,
  emailStyles,
} from "@/features/notifications/templates/emails/branded-email-layout";
import en from "@/messages/en";

const copy = en.emailTemplates.submission;

type SubmissionConfirmationEmailProps = {
  branding: EmailBranding;
  customerName: string;
  referenceId: string;
  submissionLabel: string;
};

export function SubmissionConfirmationEmail({
  branding,
  customerName,
  referenceId,
  submissionLabel,
}: SubmissionConfirmationEmailProps) {
  return (
    <BrandedEmailLayout
      branding={branding}
      preview={`We received your ${submissionLabel.toLowerCase()} — ${referenceId}`}
      eyebrow={copy.eyebrow}
      title={copy.title}
    >
      <Text style={emailStyles.paragraph}>
        {copy.greeting} {customerName},
      </Text>
      <Text style={emailStyles.paragraph}>
        {copy.instruction.replace("request", submissionLabel.toLowerCase())}
      </Text>
      <Section style={emailStyles.infoBox}>
        <Text style={referenceLabel}>{copy.referenceLabel}</Text>
        <Text style={{ ...referenceValue, color: branding.primaryColor }}>
          {referenceId}
        </Text>
      </Section>
      <Section style={emailStyles.buttonSection}>
        <Button
          href={branding.siteUrl}
          style={{ ...emailStyles.button, backgroundColor: branding.primaryColor }}
        >
          {copy.visitSite} {branding.siteName}
        </Button>
      </Section>
      <Text style={emailStyles.muted}>
        {copy.keepReference}
      </Text>
    </BrandedEmailLayout>
  );
}

const referenceLabel = {
  color: "#6b7280",
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.06em",
  margin: "0 0 6px",
  textTransform: "uppercase" as const,
};

const referenceValue = {
  fontSize: "22px",
  fontWeight: "800",
  letterSpacing: "0.04em",
  margin: "0",
};
