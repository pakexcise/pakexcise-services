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
  disclaimer: string;
  facilitationFee: string;
  governmentFees: string;
};

export const invoicePdfLabels: Record<InvoiceLocale, InvoicePdfLabels> = {
  en: {
    title: "PakExcise.com Invoice",
    invoiceNumber: "Invoice number",
    trackingId: "Tracking ID",
    service: "Service",
    customer: "Customer",
    issueDate: "Issue date",
    dueDate: "Due date",
    lineItems: "Line items",
    description: "Description",
    amount: "Amount",
    serviceFee: "PakExcise facilitation service fee",
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
    disclaimer:
      "PakExcise.com is a private facilitation service and is not affiliated with any government department. Government taxes and official fees are separate from the PakExcise facilitation service fee.",
    facilitationFee: "Facilitation service fee",
    governmentFees: "Government / official fees",
  },
  ur: {
    title: "PakExcise.com انوائس",
    invoiceNumber: "انوائس نمبر",
    trackingId: "ٹریکنگ ID",
    service: "خدمت",
    customer: "کسٹمر",
    issueDate: "جاری تاریخ",
    dueDate: "آخری تاریخ",
    lineItems: "لائن آئٹمز",
    description: "تفصیل",
    amount: "رقم",
    serviceFee: "PakExcise سہولت سروس فیس",
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
    disclaimer:
      "PakExcise.com ایک نجی سہولت سروس ہے اور کسی سرکاری محکمے سے وابستہ نہیں۔ سرکاری ٹیکس اور آفیشل فیس PakExcise سہولت سروس فیس سے الگ ہیں۔",
    facilitationFee: "سہولت سروس فیس",
    governmentFees: "سرکاری / آفیشل فیس",
  },
};
