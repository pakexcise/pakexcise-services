export type InvoiceLocale = "en" | "ur";

export type InvoicePdfLabels = {
  title: string;
  invoiceNumber: string;
  trackingId: string;
  service: string;
  customer: string;
  issueDate: string;
  dueDate: string;
  lineItems: string;
  description: string;
  amount: string;
  serviceFee: string;
  officialFees: string;
  subtotal: string;
  tax: string;
  total: string;
  paymentMethod: string;
  paymentMethods: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  bankName: string;
  instructions: string;
  paymentInstructions: string;
  officialFeeNote: string;
  notes: string;
  scanQr: string;
  disclaimer: string;
  exactPaymentTitle: string;
  exactPaymentNotice: string;
  facilitationFee: string;
  governmentFees: string;
};

export const invoicePdfLabels: Record<InvoiceLocale, InvoicePdfLabels> = {
  en: {
    title: "Invoice",
    invoiceNumber: "Invoice number",
    trackingId: "Tracking ID",
    service: "Service",
    customer: "Customer",
    issueDate: "Issue date",
    dueDate: "Due date",
    lineItems: "Fee breakdown",
    description: "Description",
    amount: "Amount",
    serviceFee: "Facilitation service fee",
    officialFees: "Government / official fees",
    subtotal: "Subtotal",
    tax: "Tax",
    total: "Total due",
    paymentMethod: "Payment method",
    paymentMethods: "Payment methods",
    accountTitle: "Account title",
    accountNumber: "Account number",
    iban: "IBAN",
    bankName: "Bank",
    instructions: "Instructions",
    paymentInstructions: "Additional payment instructions",
    officialFeeNote: "Official fee note",
    notes: "Notes",
    scanQr: "Scan this QR code to pay",
    disclaimer:
      "Private facilitation service — not affiliated with any government department. Government taxes and official fees are separate from the facilitation service fee.",
    exactPaymentTitle: "Important payment notice",
    exactPaymentNotice:
      "Payment must be the exact total amount shown above. Send the full payment in one transfer — partial payments are not accepted.",
    facilitationFee: "Facilitation service fee",
    governmentFees: "Government / official fees",
  },
  ur: {
    title: "انوائس",
    invoiceNumber: "انوائس نمبر",
    trackingId: "ٹریکنگ ID",
    service: "خدمت",
    customer: "کسٹمر",
    issueDate: "جاری تاریخ",
    dueDate: "آخری تاریخ",
    lineItems: "فیس کی تفصیل",
    description: "تفصیل",
    amount: "رقم",
    serviceFee: "سہولت سروس فیس",
    officialFees: "سرکاری / آفیشل فیس",
    subtotal: "ذیلی کل",
    tax: "ٹیکس",
    total: "کل واجب الادا",
    paymentMethod: "ادائیگی کا طریقہ",
    paymentMethods: "ادائیگی کے طریقے",
    accountTitle: "اکاؤنٹ کا نام",
    accountNumber: "اکاؤنٹ نمبر",
    iban: "IBAN",
    bankName: "بینک",
    instructions: "ہدایات",
    paymentInstructions: "اضافی ادائیگی کی ہدایات",
    officialFeeNote: "آفیشل فیس نوٹ",
    notes: "نوٹس",
    scanQr: "ادائیگی کے لیے اس QR کو اسکین کریں",
    disclaimer:
      "نجی سہولت سروس — کسی سرکاری محکمے سے وابستہ نہیں۔ سرکاری ٹیکس اور آفیشل فیس سہولت سروس فیس سے الگ ہیں۔",
    exactPaymentTitle: "اہم ادائیگی نوٹس",
    exactPaymentNotice:
      "ادائیگی اوپر دی گئی بالکل مکمل رقم ہونی چاہیے۔ پوری رقم ایک ہی ٹرانسفر میں بھیجیں — جزوی ادائیگی قبول نہیں ہے۔",
    facilitationFee: "سہولت سروس فیس",
    governmentFees: "سرکاری / آفیشل فیس",
  },
};
