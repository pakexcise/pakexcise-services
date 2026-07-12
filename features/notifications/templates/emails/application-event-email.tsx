import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";

type ApplicationEventEmailProps = {
  title: string;
  body: string;
  ctaLabel: string;
  ctaUrl: string;
  locale: "en";
};

export function ApplicationEventEmail({
  title,
  body,
  ctaLabel,
  ctaUrl,
  locale,
}: ApplicationEventEmailProps) {
  const direction = "ltr";
  const paragraphs = body.split("\n").filter(Boolean);

  return (
    <Html dir={direction} lang={locale}>
      <Head />
      <Preview>{title}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>PakExcise.com</Heading>
          <Text style={subheading}>{title}</Text>
          {paragraphs.map((paragraph) => (
            <Text key={paragraph} style={paragraphStyle}>
              {paragraph}
            </Text>
          ))}
          <Section style={buttonSection}>
            <Button href={ctaUrl} style={button}>
              {ctaLabel}
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            {"Private facilitation service. Not affiliated with any government body."}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "24px",
  maxWidth: "560px",
  borderRadius: "8px",
};

const heading = {
  color: "#2159BA",
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 8px",
};

const subheading = {
  color: "#111827",
  fontSize: "18px",
  fontWeight: "600",
  margin: "0 0 16px",
};

const paragraphStyle = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "24px",
  margin: "0 0 12px",
};

const buttonSection = {
  margin: "24px 0",
};

const button = {
  backgroundColor: "#2159BA",
  borderRadius: "6px",
  color: "#ffffff",
  fontSize: "15px",
  fontWeight: "600",
  textDecoration: "none",
  padding: "12px 20px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "18px",
};
