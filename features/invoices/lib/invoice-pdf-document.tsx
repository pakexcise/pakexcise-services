import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { formatPkr } from "@/features/invoices/lib/format-pkr";
import {
  invoicePdfLabels,
  type InvoiceLocale,
} from "@/features/invoices/lib/invoice-labels";
import {
  formatPaymentMethodDetails,
  type PaymentMethodDisplayFields,
} from "@/features/payment-methods/lib/format-payment-method";

export type InvoicePdfLineItem = {
  label: string;
  description?: string | null;
  amount: number;
  isOfficialFee: boolean;
};

export type InvoicePdfData = {
  locale: InvoiceLocale;
  invoiceNumber: string;
  trackingId: string;
  serviceName: string;
  customerName: string;
  issueDate: string;
  dueDate?: string | null;
  lineItems: InvoicePdfLineItem[];
  subtotal: number;
  taxTotal: number;
  total: number;
  paymentMethod?: string | null;
  paymentMethods?: PaymentMethodDisplayFields[];
  paymentInstructions?: string | null;
  officialFeeNote?: string | null;
  notes?: string | null;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    color: "#2159BA",
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 6,
    color: "#2159BA",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    paddingBottom: 4,
    marginBottom: 4,
    fontWeight: 700,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  colLabel: { width: "55%" },
  colAmount: { width: "45%", textAlign: "right" },
  totals: {
    marginTop: 10,
    alignItems: "flex-end",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: 220,
    marginBottom: 3,
  },
  totalLabel: { width: 120 },
  totalValue: { width: 100, textAlign: "right" },
  grandTotal: {
    fontWeight: 700,
    fontSize: 12,
    color: "#2159BA",
  },
  disclaimer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#FEF9C3",
    fontSize: 8,
    lineHeight: 1.4,
  },
  muted: {
    color: "#6B7280",
    fontSize: 9,
  },
});

export function InvoicePdfDocument({ data }: { data: InvoicePdfData }) {
  const labels = invoicePdfLabels[data.locale];
  const dir = data.locale === "ur" ? "rtl" : "ltr";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{labels.title}</Text>
          <Text style={styles.muted}>{labels.disclaimer}</Text>
        </View>

        <View style={styles.metaRow}>
          <View>
            <Text>
              {labels.invoiceNumber}: {data.invoiceNumber}
            </Text>
            <Text>
              {labels.trackingId}: {data.trackingId}
            </Text>
            <Text>
              {labels.issueDate}: {data.issueDate}
            </Text>
            {data.dueDate ? (
              <Text>
                {labels.dueDate}: {data.dueDate}
              </Text>
            ) : null}
          </View>
          <View>
            <Text>
              {labels.service}: {data.serviceName}
            </Text>
            <Text>
              {labels.customer}: {data.customerName}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{labels.lineItems}</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.colLabel}>{labels.description}</Text>
            <Text style={styles.colAmount}>{labels.amount}</Text>
          </View>
          {data.lineItems.map((item, index) => (
            <View key={`${item.label}-${index}`} style={styles.tableRow}>
              <View style={styles.colLabel}>
                <Text>
                  {item.label}
                  {item.isOfficialFee ? ` (${labels.governmentFees})` : ""}
                </Text>
                {item.description ? (
                  <Text style={styles.muted}>{item.description}</Text>
                ) : null}
              </View>
              <Text style={styles.colAmount}>
                {formatPkr(item.amount, data.locale)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{labels.subtotal}</Text>
            <Text style={styles.totalValue}>
              {formatPkr(data.subtotal, data.locale)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>{labels.tax}</Text>
            <Text style={styles.totalValue}>
              {formatPkr(data.taxTotal, data.locale)}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={[styles.totalLabel, styles.grandTotal]}>
              {labels.total}
            </Text>
            <Text style={[styles.totalValue, styles.grandTotal]}>
              {formatPkr(data.total, data.locale)}
            </Text>
          </View>
        </View>

        {data.paymentMethods && data.paymentMethods.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.paymentMethod}</Text>
            {data.paymentMethods.map((method, index) => {
              const lines = formatPaymentMethodDetails(method, data.locale, {
                accountTitle: labels.accountTitle,
                accountNumber: labels.accountNumber,
                iban: labels.iban,
                bankName: labels.bankName,
                instructions: labels.instructions,
              });

              return (
                <View key={`payment-method-${index}`} style={{ marginBottom: 8 }}>
                  {lines.map((line, lineIndex) => (
                    <Text key={`payment-method-${index}-${lineIndex}`}>{line}</Text>
                  ))}
                </View>
              );
            })}
          </View>
        ) : data.paymentMethod ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.paymentMethod}</Text>
            <Text>{data.paymentMethod}</Text>
          </View>
        ) : null}

        {data.paymentInstructions ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.paymentInstructions}</Text>
            <Text>{data.paymentInstructions}</Text>
          </View>
        ) : null}

        {data.officialFeeNote ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.officialFeeNote}</Text>
            <Text>{data.officialFeeNote}</Text>
          </View>
        ) : null}

        {data.notes ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{labels.notes}</Text>
            <Text>{data.notes}</Text>
          </View>
        ) : null}

        <Text style={styles.disclaimer}>{labels.disclaimer}</Text>
        <Text
          style={{
            ...styles.muted,
            marginTop: 8,
            textAlign: dir === "rtl" ? "right" : "left",
          }}
        >
          PakExcise.com — Private facilitation service
        </Text>
      </Page>
    </Document>
  );
}
