export type InvoiceLocale = "en";

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
};
