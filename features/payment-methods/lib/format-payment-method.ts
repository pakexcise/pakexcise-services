import type { PaymentMethodType } from "@prisma/client";

export type PaymentMethodDisplayFields = {
  type: PaymentMethodType;
  nameEn: string;
  nameUr: string;
  accountTitleEn?: string | null;
  accountTitleUr?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  bankNameEn?: string | null;
  bankNameUr?: string | null;
  instructionsEn?: string | null;
  instructionsUr?: string | null;
  qrCodeR2Key?: string | null;
  qrCodeMimeType?: string | null;
};

export type PaymentMethodDisplayLabels = {
  accountTitle: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  instructions: string;
};

function pickLocalized(
  locale: "en" | "ur",
  en: string | null | undefined,
  ur: string | null | undefined,
): string | null {
  const value = locale === "ur" ? ur ?? en : en ?? ur;
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getPaymentMethodName(
  method: Pick<PaymentMethodDisplayFields, "nameEn" | "nameUr">,
  locale: "en" | "ur",
): string {
  return pickLocalized(locale, method.nameEn, method.nameUr) ?? method.nameEn;
}

export function formatPaymentMethodDetails(
  method: PaymentMethodDisplayFields,
  locale: "en" | "ur",
  labels: PaymentMethodDisplayLabels,
): string[] {
  const lines: string[] = [];
  const name = getPaymentMethodName(method, locale);
  lines.push(name);

  const bankName = pickLocalized(locale, method.bankNameEn, method.bankNameUr);
  if (bankName) {
    lines.push(`${labels.bankName}: ${bankName}`);
  }

  const accountTitle = pickLocalized(
    locale,
    method.accountTitleEn,
    method.accountTitleUr,
  );
  if (accountTitle) {
    lines.push(`${labels.accountTitle}: ${accountTitle}`);
  }

  if (method.accountNumber?.trim()) {
    lines.push(`${labels.accountNumber}: ${method.accountNumber.trim()}`);
  }

  if (method.iban?.trim()) {
    lines.push(`${labels.iban}: ${method.iban.trim()}`);
  }

  const instructions = pickLocalized(
    locale,
    method.instructionsEn,
    method.instructionsUr,
  );
  if (instructions) {
    lines.push(`${labels.instructions}: ${instructions}`);
  }

  return lines;
}

export function formatPaymentMethodsSummary(
  methods: PaymentMethodDisplayFields[],
  locale: "en" | "ur",
): string {
  return methods.map((method) => getPaymentMethodName(method, locale)).join(", ");
}

export function buildPaymentMethodSnapshot(
  method: PaymentMethodDisplayFields & { id: string; code: string },
  displayOrder: number,
) {
  return {
    paymentMethodId: method.id,
    code: method.code,
    type: method.type,
    nameEn: method.nameEn,
    nameUr: method.nameUr,
    accountTitleEn: method.accountTitleEn?.trim() || null,
    accountTitleUr: method.accountTitleUr?.trim() || null,
    accountNumber: method.accountNumber?.trim() || null,
    iban: method.iban?.trim() || null,
    bankNameEn: method.bankNameEn?.trim() || null,
    bankNameUr: method.bankNameUr?.trim() || null,
    instructionsEn: method.instructionsEn?.trim() || null,
    instructionsUr: method.instructionsUr?.trim() || null,
    qrCodeR2Key: method.qrCodeR2Key ?? null,
    qrCodeMimeType: method.qrCodeMimeType ?? null,
    displayOrder,
  };
}
