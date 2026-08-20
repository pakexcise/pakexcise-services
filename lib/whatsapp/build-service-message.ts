
type Locale = "en";

type BuildServiceWhatsAppMessageInput = {
  serviceName: string;
  regionLabel?: string | null;
  defaultMessage: string;
  locale: Locale;
};

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const normalized = normalizePhoneForWhatsApp(phoneNumber);
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function normalizePhoneForWhatsApp(phoneNumber: string): string {
  const digits = phoneNumber.replace(/\D/g, "");

  if (digits.startsWith("92") && digits.length >= 12) {
    return digits;
  }

  if (digits.startsWith("0") && digits.length === 11) {
    return `92${digits.slice(1)}`;
  }

  if (digits.startsWith("3") && digits.length === 10) {
    return `92${digits}`;
  }

  return digits;
}

export function buildServiceWhatsAppMessage({
  serviceName,
  regionLabel,
  defaultMessage,
  pagePath,
}: BuildServiceWhatsAppMessageInput & { pagePath?: string }): string {
  const intro =
    `Hello, I would like help with "${serviceName}" through PakExcise private facilitation.`;

  const lines = [intro];

  if (regionLabel?.trim()) {
    lines.push(`Province/Region: ${regionLabel.trim()}`);
  }

  if (pagePath?.trim()) {
    lines.push(`Ref: ${pagePath.trim()}`);
  }

  if (defaultMessage.trim()) {
    lines.push("", defaultMessage.trim());
  }

  return lines.join("\n");
}

export function buildContactInquiryWhatsAppMessage(input: {
  fullName: string;
  phone: string;
  serviceInterest?: string;
  regionName?: string;
  cityName?: string;
  message?: string;
}): string {
  const lines = [
    "Hello PakExcise, I just submitted a contact request on your website.",
    `Name: ${input.fullName.trim()}`,
    `Phone: ${input.phone.trim()}`,
  ];

  if (input.serviceInterest?.trim()) {
    lines.push(`Service: ${input.serviceInterest.trim()}`);
  }

  if (input.regionName?.trim()) {
    lines.push(`Province/Region: ${input.regionName.trim()}`);
  }

  if (input.cityName?.trim()) {
    lines.push(`City: ${input.cityName.trim()}`);
  }

  if (input.message?.trim()) {
    lines.push("", input.message.trim());
  }

  lines.push("", "Ref: /contact");

  return lines.join("\n");
}
