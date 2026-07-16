import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

import type { EmailBranding } from "@/features/notifications/lib/email-branding";
import en from "@/messages/en";

const copy = en.emailTemplates.footer;

type BrandedEmailLayoutProps = {
  branding: EmailBranding;
  preview: string;
  eyebrow?: string;
  title: string;
  children: ReactNode;
};

export function BrandedEmailLayout({
  branding,
  preview,
  eyebrow,
  title,
  children,
}: BrandedEmailLayoutProps) {
  return (
    <Html dir="ltr" lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={shell}>
          <Section
            style={{
              ...brandBar,
              backgroundColor: branding.primaryColor,
              borderBottomColor: branding.secondaryColor,
            }}
          />
          <Section style={header}>
            <Img
              src={branding.logoUrl}
              width="200"
              height="64"
              alt={branding.siteName}
              style={logo}
            />
          </Section>
          <Section style={content}>
            {eyebrow ? (
              <Text style={{ ...eyebrowStyle, color: branding.primaryColor }}>
                {eyebrow}
              </Text>
            ) : null}
            <Heading style={titleStyle}>{title}</Heading>
            {children}
          </Section>
          <Section style={footerSection}>
            <Hr style={divider} />
            <Text style={footerText}>{branding.disclaimer}</Text>
            <Text style={footerMeta}>
              {copy.help}{" "}
              <Link
                href={`mailto:${branding.supportEmail}`}
                style={{ color: branding.primaryColor }}
              >
                {branding.supportEmail}
              </Link>
              {" · "}
              <Link href={branding.siteUrl} style={{ color: branding.primaryColor }}>
                {branding.siteName}
              </Link>
            </Text>
            <Text style={footerFinePrint}>
              {copy.automatedNotice}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export const emailStyles = {
  paragraph: {
    color: "#374151",
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 14px",
  },
  muted: {
    color: "#6b7280",
    fontSize: "13px",
    lineHeight: "20px",
    margin: "0 0 14px",
  },
  button: {
    borderRadius: "8px",
    color: "#ffffff",
    display: "inline-block",
    fontSize: "15px",
    fontWeight: "700",
    padding: "13px 22px",
    textDecoration: "none",
  },
  buttonSection: {
    margin: "26px 0 10px",
  },
  infoBox: {
    backgroundColor: "#f8fafc",
    border: "1px solid #e5e7eb",
    borderRadius: "10px",
    margin: "20px 0",
    padding: "18px",
  },
} as const;

const main = {
  backgroundColor: "#eef3f8",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif',
  margin: "0",
  padding: "32px 12px",
};

const shell = {
  backgroundColor: "#ffffff",
  border: "1px solid #dfe7f0",
  borderRadius: "14px",
  boxShadow: "0 8px 30px rgba(31, 65, 114, 0.08)",
  margin: "0 auto",
  maxWidth: "600px",
  overflow: "hidden",
};

const brandBar = {
  borderBottomStyle: "solid" as const,
  borderBottomWidth: "5px",
  height: "6px",
  lineHeight: "6px",
};

const header = {
  padding: "26px 34px 20px",
};

const logo = {
  display: "block",
  height: "64px",
  maxWidth: "200px",
  width: "auto",
};

const content = {
  padding: "4px 34px 20px",
};

const eyebrowStyle = {
  fontSize: "12px",
  fontWeight: "700",
  letterSpacing: "0.08em",
  margin: "0 0 8px",
  textTransform: "uppercase" as const,
};

const titleStyle = {
  color: "#111827",
  fontSize: "26px",
  fontWeight: "750",
  letterSpacing: "-0.02em",
  lineHeight: "34px",
  margin: "0 0 18px",
};

const footerSection = {
  backgroundColor: "#f8fafc",
  padding: "0 34px 24px",
};

const divider = {
  borderColor: "#e5e7eb",
  margin: "0 0 20px",
};

const footerText = {
  color: "#4b5563",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
};

const footerMeta = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
  margin: "0 0 8px",
};

const footerFinePrint = {
  color: "#9ca3af",
  fontSize: "11px",
  lineHeight: "17px",
  margin: "0",
};
