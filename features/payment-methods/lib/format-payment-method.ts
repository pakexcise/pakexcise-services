import type { PaymentMethodType } from "@prisma/client";

export type PaymentMethodDisplayFields = {
  type: PaymentMethodType;
  nameEn: string;
  accountTitleEn?: string | null;
  accountNumber?: string | null;
  iban?: string | null;
  bankNameEn?: string | null;
  instructionsEn?: string | null;
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

function pickEn(value: string | null | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

export function getPaymentMethodName(
  method: Pick<PaymentMethodDisplayFields, "nameEn">,
): string {
  return pickEn(method.nameEn) ?? method.nameEn;
}

export function formatPaymentMethodDetails(
  method: PaymentMethodDisplayFields,
  labels: PaymentMethodDisplayLabels,
): string[] {
  const lines: string[] = [];
  lines.push(getPaymentMethodName(method));

  const bankName = pickEn(method.bankNameEn);
  if (bankName) {
    lines.push(`${labels.bankName}: ${bankName}`);
  }

  const accountTitle = pickEn(method.accountTitleEn);
  if (accountTitle) {
    lines.push(`${labels.accountTitle}: ${accountTitle}`);
  }

  if (method.accountNumber?.trim()) {
    lines.push(`${labels.accountNumber}: ${method.accountNumber.trim()}`);
  }

  if (method.iban?.trim()) {
    lines.push(`${labels.iban}: ${method.iban.trim()}`);
  }

  const instructions = pickEn(method.instructionsEn);
  if (instructions) {
    lines.push(`${labels.instructions}: ${instructions}`);
  }

  return lines;
}

export function formatPaymentMethodsSummary(
  methods: PaymentMethodDisplayFields[],
): string {
  return methods.map((method) => getPaymentMethodName(method)).join(", ");
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
    accountTitleEn: method.accountTitleEn?.trim() || null,
    accountNumber: method.accountNumber?.trim() || null,
    iban: method.iban?.trim() || null,
    bankNameEn: method.bankNameEn?.trim() || null,
    instructionsEn: method.instructionsEn?.trim() || null,
    qrCodeR2Key: method.qrCodeR2Key ?? null,
    qrCodeMimeType: method.qrCodeMimeType ?? null,
    displayOrder,
  };
}
